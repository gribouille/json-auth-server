const defaultOptions = {
  database: {
    host: 'localhost',     // prod: 'auth-postgres'
    database: 'auth-db',
    user: 'mydbuser',
    password: 'mydbpass',
    port: 5432
  },
  token: {
    signature: 'secret-key',
    algorithm: 'HS256',
    expiresIn: '7d'
  }
}

const getConfig = function createConfigFromEnv(defaults) {
  return {
    database: {
      host    : process.env.JAS_DB_HOST || defaults.database.host,
      database: process.env.JAS_DB_NAME || defaults.database.database,
      user    : process.env.JAS_DB_USER || defaults.database.user,
      password: process.env.JAS_DB_PASS || defaults.database.password,
      port    : process.env.JAS_DB_PORT || defaults.database.port
    },
    token: {
      signature: process.env.JAS_TOKEN_SIGN || defaults.token.signature,
      algorithm: process.env.JAS_TOKEN_ALGO || defaults.token.algorithm,
      expiresIn: process.env.JAS_TOKEN_EXP  || defaults.token.expiresIn
    }
  }
}

module.exports = getConfig(defaultOptions)
