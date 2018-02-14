const express    = require('express')
const bodyParser = require('body-parser')
const morgan     = require('morgan')
const pg         = require('pg')
const api        = require('./api')
const config     = require('./config')
const auth       = require('./auth')

const __author__ = 'Gribouille'
const __version__ = '0.1.0'
const port = process.env.JAS_PORT || 8080

// Global database callback
const client = new pg.Client(config.database)
client.on('error', (err) => {
  console.error(`Database error: ${err.stack}`)
})

// Configure app
const app = express()

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Hello route
app.get('/', (req, res) => {
  res.send(`Hello Auth Server
version: ${__version__}
author: ${__author__}`)
})

// Authentification route.
app.post('/auth', auth.auth)

// GraphQL API route.
const authRouter = auth.router()
authRouter.use('/', api)
app.use('/graphql', authRouter)

if (process.env.NODE_ENV === 'development') {
  const debugRouter = auth.debug()
  debugRouter.use('/', api)
  app.use('/debug', debugRouter)
}

// Entry point.
client.connect()
  .then(() => {
    console.log('Database connected')
    app.locals.client = client
    app.locals.config = config
    console.log(`Auth server on :${port}`);
    app.listen(port);
  })
  .catch( (err) => {
    console.error(`Failed to database connection: ${err}`)
    process.exit(1)
  })
