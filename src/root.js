const queries = require('./queries')

module.exports = req => ({
  // users: [User!]!
  users: queries.getUsers(req),
  // groups: [Group!]!
  groups: queries.getGroups(req),
  // permissions: [Permission!]!
  permissions: queries.getPermissions(req),
  // userById(id: Int!): User
  userById: ({id}) => queries.getUserById(req, id),
  // userByUsername(username: String!): User
  userByUsername: ({username}) => queries.getUserByUsername(req, username),
  // addUser(id: Int!, user: UserIn!): User
  addUser: ({user, pass}) => queries.addUser(req, user, pass),
  // deleteUser(id: Int!): User
  deleteUser: ({id}) => queries.deleteUser(req, id),
  // editUser(id: Int!, user: UserIn!): User
  editUser: ({id, user}) => queries.editUser(req, id, user),
  // editUserPassword(id: Int!, old: String!, new: String!): User
  editUserPassword: ({id, old_pass, new_pass}) => queries.editUserPassword(req, id, old_pass, new_pass),
  // addGroup(name: String!): Group
  addGroup: ({name}) => queries.addGroup(req, name),
  // deleteGroup(id: Int!): Group
  deleteGroup: ({id}) => queries.deleteGroup(req, id),
  // editGroup(id: Group, name: String): Group
  editGroup: ({id, name}) => queries.editGroup(req, id, name),
  // addPermission(name: String!, code: String): Permission
  addPermission: ({name, code}) => queries.addPermission(req, name, code),
  // deletePermission(id: Int!): Permission
  deletePermission: ({id}) => queries.deletePermission(req, id),
  // editPermission(id: Int!, name: String!, code: String): Permission
  editPermission: ({id, name, code}) => queries.editPermission(req, id, name, code),
  // addGroupToUser(userId: Int!, groupId: Int!): User
  addGroupToUser: ({userId, groupId}) => queries.addGroupToUser(req, userId, groupId),
  // addPermissionToUser(userId: Int!, permId: Int!): User
  addPermissionToUser: ({userId, permId}) => queries.addPermissionToUser(req, userId, permId),
  // addPermissionToGroup(groupId: Int: permId: Int!): Group
  addPermissionToGroup: ({groupId, permId}) => queries.addPermissionToGroup(req, groupId, permId),
  // deleteGroupFromUser(userId: Int!, groupId: Int!): User
  deleteGroupFromUser: ({userId, groupId}) => queries.deleteGroupFromUser(req, userId, groupId),
  // deletePermissionFromUser(userId: Int!, permId: Int!): User
  deletePermissionFromUser: ({userId, permId}) => queries.deletePermissionFromUser(req, userId, permId),
  // deletePermissionFromGroup(groupId: Int!, permId: Int!): Group
  deletePermissionFromGroup: ({groupId, permId}) => queries.deletePermissionFromGroup(req, groupId, permId)
})
