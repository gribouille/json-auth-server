-- Example of data to test the API

-- add users
INSERT INTO users (username, first_name, last_name, email, "password", is_active, is_superuser) VALUES
  ('bleponge',   'Bob',     'Leponge',   'bob.leponge@corp.com',      '$2a$10$8sjRpZ5.2Ncdp0PEaRZiUObIaSnX.SwwkJfLQGo9f1.EWhJ6UJvau', true, true),
  ('ctentacule', 'Carlo',   'Tentacule', 'carlo.tentacule@corp.com',  '$2a$10$9iGuzfKPurD2/aMLYlAHCejG7Wy9gt6EKldzqmiJRN.SuIagOKZ0.', true, false),
  ('splankton',  'Sheldon', 'Plankton',  'sheldon.plankton@corp.com', '$2a$10$RlCAIjTls//JCS73YDEZNOeXCT0WJqbjWe6iKucev38IkNcl9LX0e', false, false),
  ('secureuil',  'Sandy',   'Ecureuil',  'sandy.ecureuil@corp.com',   '$2a$10$e9IjBXHec9ZYBINHWCmTUu3HzPpZs9WVMb7A41VlWlC7QM0FCA7T6', true, false);

-- avatars
-- \lo_import '/tmp/images/bob.png'
-- \lo_import '/tmp/images/carlo.png'

--
-- groups
--
INSERT INTO groups (name) VALUES ('Admin'), ('Writer'), ('Examiner'), ('Reader');

PREPARE link_user_group (text, text) AS
  INSERT INTO ug (user_id, group_id) VALUES (
    (SELECT id FROM users WHERE username = $1),
    (SELECT id FROM groups WHERE name = $2)
  );

EXECUTE link_user_group('bleponge', 'Admin');
EXECUTE link_user_group('ctentacule', 'Writer');
EXECUTE link_user_group('splankton', 'Examiner');
EXECUTE link_user_group('secureuil', 'Reader');

--
-- permissions
--
INSERT INTO permissions (name, code) VALUES
  ('add user', 'deluser'),
  ('delete user', 'adduser'),
  ('edit user', 'ediuser'),
  ('add article', 'addart'),
  ('delete article', 'delart'),
  ('edit article', 'ediart'),
  ('read article', 'reaart');

PREPARE link_group_perm (text, text) AS
  INSERT INTO gp (group_id, perm_id) VALUES (
    (SELECT id FROM groups WHERE name = $1),
    (SELECT id FROM permissions WHERE code = $2)
  );

EXECUTE link_group_perm('Admin', 'deluser');
EXECUTE link_group_perm('Admin', 'adduser');
EXECUTE link_group_perm('Admin', 'ediuser');
EXECUTE link_group_perm('Admin', 'addart');
EXECUTE link_group_perm('Admin', 'delart');
EXECUTE link_group_perm('Admin', 'ediart');
EXECUTE link_group_perm('Admin', 'reaart');
EXECUTE link_group_perm('Writer', 'addart');
EXECUTE link_group_perm('Writer', 'delart');
EXECUTE link_group_perm('Writer', 'ediart');
EXECUTE link_group_perm('Writer', 'reaart');
EXECUTE link_group_perm('Examiner', 'ediart');
EXECUTE link_group_perm('Examiner', 'reaart');
EXECUTE link_group_perm('Reader', 'reaart');
