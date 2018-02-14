const S = require('sanctuary')

/// Request -> pg.Client
const client = S.props(['app', 'locals', 'client'])

/// Request -> Object
const config = S.props(['app', 'locals', 'config'])

module.exports = {
  client: client,
  config: config
}
