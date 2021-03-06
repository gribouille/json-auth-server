const graphql     = require('graphql')
const graphqlHTTP = require('express-graphql')
const root        = require('./root')

const definition = `

# User type.
type User {
  # The unique id of user.
  id          : Int!
  
  # The unique login of user.
  username    : String!

  # The first name of user.
  first_name  : String

  # The last name of user.
  last_name   : String

  # The email of user.
  email       : String

  # The phone number of user.
  phone       : String

  # Date of account creation.
  date_joined : String!

  # Date of last user's connection.
  last_login  : String

  # Account status: if the account is disable then the user cannot get a token.
  is_active   : Boolean

  # Super user account.
  is_superuser: Boolean

  # List of user's groups.
  groups      : [Group!]

  # List of user's permissions.
  permissions : [Permission!]
}

# Input type to add or edit an user.
input UserIn {
  username    : String
  first_name  : String
  last_name   : String
  email       : String
  phone       : String
  is_active   : Boolean
  is_superuser: Boolean
}

# Group type.
type Group {
  # Unique id of the group.
  id         : Int!

  # Name of the group.
  name       : String!

  # List of permissions for the group.
  permissions: [Permission!]
}

# Permission type.
type Permission {

  # Unique id of the permission.
  id  : Int!

  # Name of the permission.
  name: String!

  # Additional information about the permission (optional).
  code: String
}

# Root query
type Query {

  # Show all users.
  users: [User!]!

  # Show all groups.
  groups: [Group!]!

  # Show all permissions.
  permissions: [Permission!]!

  # Show a user from this id.
  userById(id: Int!): User

  # Show a user from this username.
  userByUsername(username: String!): User
}

# Root mutation
type Mutation {

  # Add a new user and set this password.
  addUser(user: UserIn!, pass: String!): User

  # Delete an existing user from this id.
  deleteUser(id: Int!): User

  # Edit the information of user from this id.
  editUser(id: Int!, user: UserIn!): User

  # Change the user's password from this id.
  editUserPassword(id: Int!, old_pass: String!, new_pass: String!): User

  # Add a new group.
  addGroup(name: String!): Group

  # Delete an existing group from this id.
  deleteGroup(id: Int!): Group

  # Edit an existing group from this id.
  editGroup(id: Int!, name: String): Group

  # Add a new permission.
  addPermission(name: String!, code: String): Permission

  # Delete an existing permission from this id.
  deletePermission(id: Int!): Permission

  # Edit an existing permission from this id.
  editPermission(id: Int!, name: String!, code: String): Permission

  # Assign a group to the user.
  addGroupToUser(userId: Int!, groupId: Int!): User

  # Assign a permission to the user.
  addPermissionToUser(userId: Int!, permId: Int!): User

  # Assign a permission to the group.
  addPermissionToGroup(groupId: Int, permId: Int!): Group

  # Delete the group of user.
  deleteGroupFromUser(userId: Int!, groupId: Int!): User

  # Delete the permission of user.
  deletePermissionFromUser(userId: Int!, permId: Int!): User

  # Delete the permission of group.
  deletePermissionFromGroup(groupId: Int!, permId: Int!): Group
}
`

// GraphQL API
const schema = graphql.buildSchema(definition)

const prodGraphqlHTTP = graphqlHTTP((req) => ({
  schema: schema,
  rootValue: root(req),
  graphiql: false,
  formatError: error => ({
    message: error.message,
    path: error.path
  })
}))

const devGraphqlHTTP  = graphqlHTTP((req) => ({
  schema: schema,
  rootValue: root(req),
  graphiql: true,
  formatError: error => ({
    message: error.message.split('\n'),
    locations: error.locations,
    stack: error.stack,
    path: error.path
  })
}))

module.exports = process.env.NODE_ENV === 'development'
  ? devGraphqlHTTP : prodGraphqlHTTP
