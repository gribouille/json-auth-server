CREATE TABLE users (
  id            SERIAL NOT NULL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  "password"    TEXT NOT NULL,

  first_name    TEXT,
  last_name     TEXT,
  email         TEXT,
  phone         TEXT,
  avatar        BYTEA,

  date_joined   TIMESTAMP WITH TIME ZONE default NOW(),
  last_login    TIMESTAMP WITH TIME ZONE,

  is_active     BOOL DEFAULT false,
  is_superuser  BOOL DEFAULT false
);

CREATE TABLE groups (
  id            SERIAL NOT NULL PRIMARY KEY,
  name          TEXT UNIQUE NOT NULL
);

CREATE TABLE permissions (
  id            SERIAL NOT NULL PRIMARY KEY,
  name          TEXT UNIQUE NOT NULL,
  code          TEXT
);

CREATE TABLE ug (
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id      INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, group_id)
);

CREATE TABLE gp (
  group_id      INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  perm_id       INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, perm_id)
);

CREATE TABLE up (
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  perm_id       INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, perm_id)
);

--pass: admin
INSERT INTO users (username, first_name, last_name, "password", is_active, is_superuser) VALUES
  ('admin', 'Admin', 'Admin', '$2a$10$BeGHS3CvDIqPPVh99y2Ckun4ztl81jBKkoQi7GmyhUdiijUs/sWg6', true, true);
