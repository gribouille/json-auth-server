// /!\ User MUST NOT have the password field.
class User {
  constructor(id, {
    username,
    first_name,
    last_name,
    email,
    phone,
    date_joined,
    last_login,
    is_active,
    is_superuser,
    groups,
    permissions
  }) {
    this.id = id
    this.username = username
    this.first_name = first_name
    this.last_name = last_name
    this.email = email
    this.phone = phone
    this.date_joined = date_joined
    this.last_login = last_login
    this.is_active = is_active
    this.is_superuser = is_superuser
    this.groups = groups || []
    this.permissions = permissions || []
  }
}

class Group {
  constructor(id, {
    name,
    permissions
  }) {
    this.id = id
    this.name = name
    this.permissions = permissions || []
  }
}

class Permission {
  constructor(id, {
    name,
    code
  }) {
    this.id = id
    this.name = name
    this.code = code || ''
  }
}

/// UserIn -> [Any]
const userInToArray = function convertUserInToArray(user, x) {
  return [
    user.username,
    user.first_name,
    user.last_name,
    user.email,
    user.phone,
    user.is_active,
    user.is_superuser,
    x
  ]
}

module.exports = {
  User: User,
  Group: Group,
  Permission: Permission,
  userInToArray: userInToArray
}
