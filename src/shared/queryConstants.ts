/* USER */
export const SELECT_USER_BY_EMAIL = "SELECT * FROM users WHERE email = ?";
export const SELECT_ROLE_BY_NAME = "SELECT * FROM roles WHERE name = ?";
export const SELECT_USER_BY_ID_NO_JOIN = "SELECT * FROM users WHERE id = ?";
export const SELECT_USER_BY_ID =
  "SELECT users.id, users.name, users.tel, users.email, users.password, roles.name FROM users INNER JOIN roles ON users.rol_id = roles.id WHERE id = ?";
export const INSERT_USER =
  "INSERT INTO users (name, tel, email, password, rol_id) VALUES (?, ?, ?, ?, ?)";
