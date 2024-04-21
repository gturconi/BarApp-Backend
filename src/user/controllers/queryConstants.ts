export const SELECT_USER_BY_EMAIL = 'SELECT * FROM users WHERE email = ?';

export const SELECT_ROLE_BY_NAME = 'SELECT * FROM roles WHERE name = ?';

export const SELECT_USER_BY_ID_NO_JOIN = 'SELECT * FROM users WHERE id = ?';

export const SELECT_USER_BY_ID =
  'SELECT u.id, u.name, u.tel, u.email, r.name AS role, u.avatar, u.baja FROM users u INNER JOIN roles AS r ON u.rol_id = r.id WHERE u.id = ?';

export const GET_USER_PASSWORD = 'SELECT password FROM users WHERE id = ?';

export const INSERT_USER =
  'INSERT INTO users (name, tel, email, password, rol_id, baja) VALUES (?, ?, ?, ?, ?, ?)';

export const COUNT_USERS =
  "SELECT COUNT(*) AS total FROM users AS us INNER JOIN roles AS rol ON us.rol_id = rol.id WHERE us.name LIKE CONCAT('%', ?, '%') OR us.tel LIKE CONCAT('%', ?, '%') OR us.email LIKE CONCAT('%', ?, '%') OR rol.name LIKE CONCAT('%', ?, '%');";

export const SELECT_USERS =
  "SELECT u.id, u.name, u.tel, u.email, r.name AS role, u.avatar, u.baja FROM users AS u INNER JOIN roles AS r ON u.rol_id = r.id WHERE u.name LIKE CONCAT('%', ?, '%') OR u.tel LIKE CONCAT('%', ?, '%') OR u.email LIKE CONCAT('%', ?, '%') OR r.name LIKE CONCAT('%', ?, '%') ORDER BY u.name ASC LIMIT ?, ?";

export const UPDATE_USER =
  'UPDATE users SET name = IFNULL(?, name), tel = IFNULL(?, tel), email = IFNULL(?, email), password = IFNULL(?, password) ,rol_id = IFNULL(?, rol_id), baja = IFNULL(?, baja) ,avatar = IFNULL(?, avatar) WHERE id = ?';

export const DELETE_USER = 'DELETE FROM users WHERE id = ?';

export const UPDATE_FCM_TOKEN =
  'UPDATE users SET fcm_token = IFNULL(?, fcm_token) WHERE id = ?';

export const SELECT_FCM_TOKEN =
  'SELECT fcm_token FROM users WHERE baja = 0 AND fcm_token IS NOT NULL';

export const SELECT_EMPLOYEE_FCM_TOKEN =
  'SELECT us.fcm_token FROM users AS us INNER JOIN roles AS rol ON us.rol_id = rol.id WHERE rol.name LIKE "employee" AND us.baja = 0 AND us.fcm_token IS NOT NULL';
