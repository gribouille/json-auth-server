const S       = require('sanctuary')
const express = require('express')
const bcrypt  = require('bcrypt')
const jwt     = require('jsonwebtoken')
const utils   = require('./utils')

// Get token from JSON body.
const t1 = S.gets(S.is(String), ['body', 'token'])

// Get token from query.
const t2 = S.gets(S.is(String), ['query', 'token'])

const replaceString = S.curry3((what, replacement, string) => string.replace(what, replacement))

// Get token from authorization header.
const t3 = S.compose(
  S.map(replaceString('Bearer ', '')),
  S.gets(S.is(String), ['headers', 'authorization'])
)

// Get token from request.
const getToken = x => S.alt(t1(x), S.alt(t2(x), t3(x)))

// Handler to check the token.
const router = function createProtectedRouter() {
  return express.Router().use((req, res, next) => {
    const token = getToken(req)
    const config = utils.config(req)

    if (S.isNothing(token)) {
      return res.status(403).send({
        success: false,
        message: 'No token found!'
      })
    }
    const tok = S.fromMaybe('', token)
    jwt.verify(tok, config.token.signature, (err, decoded) => {
      if (err) {
        console.error(err)
        console.error(tok)
        return res.status(401).json({
          success: false,
          message: `Authentification failed: ${err.message}`
        })
      }

      req.decoded = decoded
      next()
    })
  })
}

const debug = function createUnsafeRouter() {
  return express.Router().use((req, res, next) => {
    req.decoded = {
      login: 'admin',
      superuser: true
    }
    next()
  })
}

/// Request -> Response
const auth = function createTokenFromUsernamePassword(req, res) {
  const login = req.body.login
  const password = req.body.password
  if (login == null || password == null) {
    return res.status(400).json({
      success: false,
      message: `Invalid body, required login and password fields!`
    })
  }
  const config = utils.config(req)
  const query = `SELECT id, username, "password", is_active, is_superuser
    FROM users WHERE username = $1`

  utils.client(req).query(query, [login]).then(
    val => {
      if (val.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `The user '${login}' is unknown!`
        })
      }
      const user = val.rows[0]
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: `The user '${login}' is disable!`
        })
      }
      return bcrypt.compare(password, user.password).then(
        valid => {
          if (!valid) {
            return res.status(401).json({
              success: false,
              message: `Invalid password for the user '${login}!'`
            })
          }
          const payload = {
            id: user.id,
            login: user.username,
            superuser: user.is_superuser
          }
          const options = {
            algorithm: config.token.algorithm,
            expiresIn: config.token.expiresIn,
            issuer: 'json-auth'
          }
          const token = jwt.sign(payload, config.token.signature, options)
          return res.json({
            success: true,
            message: `${login} found!`,
            data: token
          })
        }
      )
    }
  )
}

module.exports = {
  router,
  debug,
  auth
}
