const S         = require('sanctuary')
const bcrypt    = require('bcrypt')
const model     = require('./model')
const {client}  = require('./utils')

//
// UTILS
//

/// ([a] -> b) -> pg.Result [a] -> [b]
const rowsMap = parse => S.compose(S.map(parse), S.prop('rows'))

/// (a -> b) -> pg.Result [a] -> Nullable b
const rowMap = parse => S.pipe([
  S.prop('rows'),
  S.head,
  S.map(parse),
  S.maybeToNullable
])

/// Request -> Object -> User
const rowToUser = function transformRowToUser(req) {
  return row => {
    const user = new model.User(row.id, row) // /!\ password is exclude in User
    user.groups = getUserGroups(req, row.id)
    user.permissions = getUserPermissions(req, row.id)
    return user
  }
}

/// Request -> Object -> Group
const rowToGroup = function transformRowToGroup(req) {
  return row => {
    const group = new model.Group(row.id, row)
    group.permissions = getGroupPermissions(req, row.id)
    return group
  }
}

/// Request -> Object -> Permission
const rowToPermission = function transformRowToPermission(req) {
  return row => new model.Permission(row.id, row)
}

/// Request -> {rows: [Object]} -> Nullable User
const thenUser = req => rowMap(rowToUser(req))

/// Request -> {rows: [Object]} -> Nullable Group
const thenGroup = req => rowMap(rowToGroup(req))

/// Request -> {rows: [Object]} -> Nullable Permission
const thenPermission = req => rowMap(rowToPermission(req))

/// Request -> {rows: [Object]} -> [User]
const thenUsers = req => rowsMap(rowToUser(req))

/// Request -> {rows: [Object]} -> [Group]
const thenGroups = req => rowsMap(rowToGroup(req))

/// Request -> {rows: [Object]} -> [Permission]
const thenPermissions = req => rowsMap(rowToPermission(req))

/// String -> (Object -> Nullable Any)
const getRowProp = name => S.pipe([S.prop('rows'), S.head, S.map(S.prop(name)), S.maybeToNullable])

/// Request -> Int -> Promise User
const selectUser = function selectUserForReturn(req) {
  const query = `SELECT * FROM users WHERE id = $1`
  return id => client(req).query(query, [id]).then(thenUser(req))
}

/// Request -> Int -> Promise Group
const selectGroup = function selectGroupForReturn(req) {
  const query = `SELECT * FROM groups WHERE id = $1`
  return id => client(req).query(query, [id]).then(thenGroup(req))
}

/// Request -> (Object -> Promise User)
const thenReturnUser = req => S.compose(selectUser(req), getRowProp('user_id'))

/// Request -> (Object -> Promise Group)
const thenReturnGroup = req => S.compose(selectGroup(req), getRowProp('group_id'))

/// Request -> Int -> Promise [Group]
const getUserGroups = function promiseGetUserGroups(req, userId) {
  const query = `
    SELECT groups.id, groups.name
    FROM groups
    INNER JOIN ug ON ug.group_id = groups.id
    WHERE ug.user_id = $1;
  `
  return client(req).query(query, [userId]).then(thenGroups(req))
}

/// Request -> Int -> Promise [Permission]
const getGroupPermissions = function promiseGetGroupPermissions(req, groupId) {
  const query = `
    SELECT permissions.id, permissions.name, permissions.code
    FROM permissions
    INNER JOIN gp ON gp.perm_id = permissions.id
    WHERE gp.group_id = $1;
  `
  return client(req).query(query, [groupId])
    .then(thenPermissions(req))
}

/// Request -> Int -> Promise [Permission]
const getUserPermissions = function promiseGetUserPermissions(req, userId) {
  const query = `
    SELECT permissions.id, permissions.name, permissions.code
    FROM permissions
    INNER JOIN up ON up.perm_id = permissions.id
    WHERE up.user_id = $1;
  `
  return client(req).query(query, [userId])
    .then(thenPermissions(req))
}

//
// API
//

/// Request -> Promise [User]
const getUsers = function promiseGetUsers(req) {
  const query = `
    SELECT id, username, first_name, last_name, email, phone,
      avatar, date_joined, last_login, is_active, is_superuser
    FROM users;`
  return client(req).query(query)
    .then(thenUsers(req))
}

/// Request -> Promise [Group]
const getGroups = function promiseGetGroups(req) {
  const query = `SELECT id, name FROM groups;`
  return client(req).query(query).then(thenGroups(req))
}

/// Request -> Promise [Permission]
const getPermissions = function promiseGetPermissions(req) {
  const query = `SELECT id, name, code FROM permissions;`
  return client(req).query(query).then(thenPermissions(req))
}

/// Request -> Promise User
const getUserById = function promiseGetUserById(req, id) {
  const query = `
    SELECT id, username, first_name, last_name, email, phone,
      avatar, date_joined, last_login, is_active, is_superuser
    FROM users WHERE id = $1;`
  return client(req).query(query, [id]).then(thenUser(req))
}

/// Request -> Promise User
const getUserByUsername = function promiseGetUserByUsername(req, username) {
  const query = `SELECT id, username, first_name, last_name, email, phone,
    date_joined, last_login, is_active, is_superuser FROM users
    WHERE username = $1;`
  return client(req).query(query, [username]).then(thenUser(req))
}

/// Request -> UserIn -> Promise User
const addUser = function promiseAddUser(req, user, pass) {
  const query = `INSERT INTO users (username, first_name, last_name, email,
    phone, date_joined, is_active, is_superuser, "password")
    VALUES ($1, $2, $3, $4, $5, now(), $6, $7, $8) RETURNING *`
  if (user.is_superuser && !req.decoded.superuser) {
    throw new Error(`only a superuser can add an other superuser`)
  }
  if (pass.length < 5) {
    throw new Error(`invalid password (must be superior to 4 characters)`)
  }
  return bcrypt.hash(pass, 10).then(
    hash => client(req).query(query, model.userInToArray(user, hash))
      .then(thenUser(req))
  )
}

/// Request -> Int -> Pomise User
const deleteUser = function promiseDeleteUser(req, id) {
  const query = `DELETE FROM users WHERE id = $1 RETURNING *`
  return client(req).query(query, [id]).then(thenUser(req))
}

/// Request -> Int -> UserInt -> Promise User
const editUser = function promiseEditUser(req, id, user) {
  const query = `UPDATE users SET
      username      = COALESCE($1, username),
      first_name    = COALESCE($2, first_name),
      last_name     = COALESCE($3, last_name),
      email         = COALESCE($4, email),
      phone         = COALESCE($5, phone),
      is_active     = COALESCE($6, is_active),
      is_superuser  = COALESCE($7, is_superuser)
    WHERE id = $8 RETURNING *`
  if (user.is_superuser && !req.decoded.superuser) {
    throw new Error(`only a superuser can add an other superuser`)
  }
  return client(req).query(query, model.userInToArray(user, id))
    .then(thenUser(req))
}

/// Request -> Int -> String -> String -> Promise User
const editUserPassword = function editUserPassword(req, id, old_pass, new_pass) {
  const query1 = `SELECT "password" FROM users WHERE id = $1`
  const query2 = `UPDATE users SET "password" = $2 WHERE id = $1 RETURNING *`
  if (new_pass.length < 5) {
    throw new Error(`invalid password (must be superior to 4 characters)`)
  }
  const up = new_hash => client(req).query(query2, [id, new_hash]).then(thenUser(req))
  return client(req).query(query1, [id]).then(
    val => {
      if (val.rows.length === 0) {
        throw new Error(`no user found with the id '${id}`)
      }
      const hash = val.rows[0].password
      return bcrypt.compare(old_pass, hash).then(valid => {
        console.log(valid)
        if (!valid) {
          throw new Error(`invalid password`)
        }
        return bcrypt.hash(new_pass, 10).then(up)
      })
    }
  )
}

/// Request -> String -> Promise Group
const addGroup = function addGroup(req, name) {
  const query = `INSERT INTO groups (name) VALUES ($1) RETURNING *`
  return client(req).query(query, [name]).then(thenGroup(req))
}

/// Request -> Int -> Promise Group
const deleteGroup = function deleteGroup(req, id) {
  const query = `DELETE FROM groups WHERE id = $1 RETURNING *`
  return client(req).query(query, [id]).then(thenGroup(req))
}

/// Request -> Int -> String -> Promise Group
const editGroup = function editGroup(req, id, name) {
  const query = `UPDATE groups SET name = $2 WHERE id = $1 RETURNING *`
  return client(req).query(query, [id, name]).then(thenGroup(req))
}

/// Request -> String -> String -> Promise Permission
const addPermission = function addPermission(req, name, code) {
  const query = `INSERT INTO permissions (name, code) VALUES ($1, $2) RETURNING *`
  return client(req).query(query, [name, code]).then(thenPermission(req))
}

/// Request -> Int -> Promise Permission
const deletePermission = function deletePermission(req, id) {
  const query = `DELETE FROM permissions WHERE id = $1 RETURNING *`
  return client(req).query(query, [id]).then(thenPermission(req))
}

/// Request -> Int -> String -> String -> Promise Permission
const editPermission = function editPermission(req, id, name, code) {
  const query = `UPDATE permissions SET name = $2, code = $3 WHERE id = $1 RETURNING *`
  return client(req).query(query, [id, name, code]).then(thenPermission(req))
}

/// Request -> Int -> Int -> Promise User
const addGroupToUser = function addGroupToUser(req, userId, groupId) {
  const query = `INSERT INTO ug (user_id, group_id) VALUES ($1, $2) RETURNING user_id`
  return client(req).query(query, [userId, groupId]).then(thenReturnUser(req))
}

/// Request -> Int -> Int -> Promise User
const addPermissionToUser = function addPermissionToUser(req, userId, permId) {
  const query = `INSERT INTO up (user_id, perm_id) VALUES ($1, $2) RETURNING user_id`
  return client(req).query(query, [userId, permId]).then(thenReturnUser(req))
}

/// Request -> Int -> Int -> Promise Group
const addPermissionToGroup = function addPermissionToGroup(req, groupId, permId) {
  const query = `INSERT INTO gp (group_id, perm_id) VALUES ($1, $2) RETURNING group_id`
  return client(req).query(query, [groupId, permId]).then(thenReturnGroup(req))
}

/// Request -> Int -> Int -> Promise User
const deleteGroupFromUser = function deleteGroupFromUser(req, userId, groupId) {
  const query = `DELETE FROM ug WHERE user_id = $1 AND group_id = $2 RETURNING user_id`
  return client(req).query(query, [userId, groupId]).then(thenReturnUser(req))
}

/// Request -> Int -> Int -> Promise User
const deletePermissionFromUser = function deletePermissionFromUser(req, userId, permId) {
  const query = `DELETE FROM up WHERE user_id = $1 AND perm_id = $2 RETURNING user_id`
  return client(req).query(query, [userId, permId]).then(thenReturnUser(req))
}

/// Request -> Int -> Int -> Promise Group
const deletePermissionFromGroup = function deletePermissionFromGroup(req, groupId, permId) {
  const query = `DELETE FROM gp WHERE group_id = $1 AND perm_id = $2 RETURNING group_id`
  return client(req).query(query, [groupId, permId]).then(thenReturnGroup(req))
}

module.exports = {
  getUsers: getUsers,
  getGroups: getGroups,
  getPermissions: getPermissions,
  getUserById: getUserById,
  getUserByUsername: getUserByUsername,
  addUser: addUser,
  deleteUser: deleteUser,
  editUser: editUser,
  editUserPassword: editUserPassword,
  addGroup: addGroup,
  deleteGroup: deleteGroup,
  editGroup: editGroup,
  addPermission: addPermission,
  deletePermission: deletePermission,
  editPermission: editPermission,
  addGroupToUser: addGroupToUser,
  addPermissionToUser: addPermissionToUser,
  addPermissionToGroup: addPermissionToGroup,
  deleteGroupFromUser: deleteGroupFromUser,
  deletePermissionFromUser: deletePermissionFromUser,
  deletePermissionFromGroup: deletePermissionFromGroup
}
