# API usage

## Queries

* users
```graphql
{
	users {
    id username first_name last_name email phone date_joined is_active is_superuser
    groups {
      id name permissions {
        id name code
      }
    }
    permissions {
      id name code
    }
  }
}
```

* groups
```graphql
{
  groups {
    id name permissions {
      id name code
    }
  }
}
```

* permissions
```graphql
{
  permissions {
    id name code
  }
}
```

* userById
```graphql
{
  userById(id: 18) {
    id username first_name last_name email phone date_joined is_active is_superuser
    groups {
      id name permissions {
        id name code
      }
    }
    permissions {
      id name code
    }
  }
}
```

* userByUsername
```graphql
{
  userByUsername(username: "splankton") {
    id username first_name last_name email phone date_joined is_active is_superuser
    groups {
      id name permissions {
        id name code
      }
    }
    permissions {
      id name code
    }
  }
}
```

## Mutations

* addUser
```graphql
mutation {
  addUser(user: {
    username: "bleponge"
    first_name: "Bob"
    last_name: "Leponge"
    email: "bob.leponge@corp.com"
    phone: "+999 999 999"
    is_active: true
    is_superuser: true
  }, pass: "bleponge") {
    id username first_name last_name email phone date_joined is_active is_superuser
    groups {
      id name permissions {
        id name code
      }
    }
    permissions {
      id name code
    }
  }
}
```

* deleteUser
```graphql
mutation {
  deleteUser(id: 5) {
    id username first_name last_name email phone date_joined is_active is_superuser
    groups {
      id name permissions {
        id name code
      }
    }
    permissions {
      id name code
    }
  }
}
```

* editUser
```graphql
mutation {
  editUser(id: 6, user: {
    first_name: "Scoubidou"
  }) {
    id username first_name last_name email phone date_joined is_active is_superuser
    groups {
      id name permissions {
        id name code
      }
    }
    permissions {
      id name code
    }
  }
}
```

* editUserPassword
```graphql
mutation {
  editUserPassword(id: 2, old_pass: "bleponge", new_pass: "bleponge2") {
    id username first_name last_name email phone date_joined is_active is_superuser
    groups {
      id name permissions {
        id name code
      }
    }
    permissions {
      id name code
    }
  }
}
```

* addGroup
```graphql
mutation {
  addGroup(name: "group1") {
    id name permissions {
      id name code
    }
  }
}
```

* deleteGroup
```graphql
mutation {
  deleteGroup(id: 6) {
    id name permissions {
      id name code
    }
  }
}
```

* editGroup
```graphql
mutation {
  editGroup(id: 7, name: "truc") {
    id name permissions {
      id name code
    }
  }
}
```

* addPermission
```graphql
mutation {
  addPermission(name: "perm1", code: "code1") {
    id name code
  }
}
```

* deletePermission
```graphql
mutation {
  deletePermission(id: 9) {
    id name code
  }
}
```

* editPermission
```graphql
mutation {
  editPermission(id: 10, name: "read article 2", code: "reaart 2") {
    id name code
  }
}
```

* addGroupToUser
```graphql
mutation {
  addGroupToUser(userId: 3, groupId: 7) {
    id username first_name last_name email phone date_joined is_active is_superuser
    groups {
      id name permissions {
        id name code
      }
    }
  }
}
```

* addPermissionToGroup
```graphql
mutation {
  addPermissionToGroup(groupId: 3, permId: 1) {
    id name permissions {
      id name code
    }
  }
}
```

* deleteGroupFromUser
```graphql
mutation {
  deleteGroupFromUser(userId: 2, groupId: 2) {
    id username
    groups {
      id name permissions {
        id name code
      }
    }
  }
}
```

* deletePermissionFromUser
```graphql
mutation {
  deletePermissionFromUser(userId: 3, permId: 5) {
    id username
    groups {
      id name permissions {
        id name code
      }
    }
  }
}
```

* deletePermissionFromGroup
```graphql
mutation {
  deletePermissionFromGroup(groupId: 1, permId: 5) {
    id name permissions {
      id name code
    }
  }
}
```