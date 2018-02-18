# json-auth-server
:mushroom: JSON Web token server with GraphQL API (JAS).

## Usage

### Production 

_Requirements: docker and docker-compose._

Ready to use:
```
> docker-compose up
```

The JAS server is started by default on `http://172.25.0.4:8080`.

To generate a new token with the admin account:
```
> curl -X POST -H "Content-Type: application/json" \
  -d '{"login": "admin", "password": "admin"}' http://172.25.0.4:8080/auth

{
    "success": true,
    "message": "admin found!",
    "data": "..."
}
```

For example, to list the users:
```
> curl -X POST -H "Content-Type: application/json" \
  -H "authorization: Bearer ..." \
  -d '{ "query": "query { users { id username is_active date_joined } }" }' http://172.25.0.4:8080/graphql

{
    "data": {
        "users": [
            {
                "id": 1,
                "username": "admin",
                "is_active": true,
                "date_joined": "Tue Feb 13 2018 20:27:11 GMT+0000 (UTC)"
            }
        ]
    }
}
```

Note: to have a pretty json output, you can use `python -m json.tool`:

```
> curl ... | python -m json.tool
```

See the API documentation [here](https://gribouille.github.io/documentation/jas/latest/) to have the list of 
GraphQL queries and mutations to manage the users, groups and permissions.

A set of examples is available [here](./EXAMPLES.md).


### Development

_Requirement: docker, node-js and npm._

Create and initialize the PostgreSQL database with Docker:
```
> npm run db-start
> npm run db-init
```

Start the server:
```
> npm install
> npm run dev
```

By default, the server is started on `http://127.0.0.1:8080`.

You can use `graphiql` with the _debug API_ on `http://<localhost>:<port>/debug`
to test the API without the token.

### Settings

You can configure the server with these environment variables:

| Variable         | Description                                |
| ---------------- | ------------------------------------------ |
| `JAS_PORT`       | port of server                             |
| `JAS_DB_HOST`    | host name of postgres database             |
| `JAS_DB_NAME`    | name of postgres database                  |
| `JAS_DB_USER`    | user name of postgres database             |
| `JAS_DB_PASS`    | password of postgres database              |
| `JAS_DB_PORT`    | port number of postgres database           |
| `JAS_TOKEN_SIGN` | secret sentence to encrypt the token       |
| `JAS_TOKEN_ALGO` | algorithm for the token (default: `HS256`) |
| `JAS_TOKEN_EXP`  | expiration time of token (default: `7d`).  |

For more information about the JWT options, see 
[JsonWebToken for node.js](https://github.com/auth0/node-jsonwebtoken).


## Design

- JSON Web Token
- PostgreSQL database
- Bcrypt
- Docker
- Functional javascript (see references)


## TODO

- [ ] tests
- [ ] create init script to set the admin password
- [ ] SSH


## References

* [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
* [RFC 6750 - The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://tools.ietf.org/html/rfc6750#page-5)
* [Fantasy Land Specification](https://github.com/fantasyland/fantasy-land)
* [Refuge from unsafe JavaScript](https://github.com/sanctuary-js/sanctuary)
* [Run-time type system for JavaScript](https://github.com/sanctuary-js/sanctuary-def)
* [Standard library for Fantasy Land](https://github.com/sanctuary-js/sanctuary-type-classes)
* [bcrypt for NodeJs](https://github.com/kelektiv/node.bcrypt.js)
* [PostgreSQL client for node.js](https://github.com/brianc/node-postgres)
* [Bluebird promise library](http://bluebirdjs.com)
* [JsonWebToken implementation for node.js](https://github.com/auth0/node-jsonwebtoken)


## Contributing

Feedback and contributions are very welcome.


## License

This project is licensed under [Mozilla Public License Version 2.0](./LICENSE).
