export const SELECT_ORDER_BY_ID =
  'SELECT o.id, JSON_OBJECT("id", o.tableId, "number", t.number) as table_order, JSON_OBJECT("id", o.userId, "name", u.name) as user, JSON_OBJECT("id", os.id, "description", os.description) as state, o.date_created, o.total, o.feedback, o.score, CASE WHEN o.employeeId IS NULL THEN NULL ELSE JSON_OBJECT("id", o.employeeId, "name", emp.name) END as employee,  JSON_ARRAYAGG(JSON_OBJECT("productId", od.productId, "promotionId", od.promotionId, "quantity", od.quantity, "unitPrice", od.unitPrice, "comments", od.comments)) AS orderDetails FROM orders AS o INNER JOIN orderDetail od ON od.orderId = o.id INNER JOIN orderState os ON os.id = o.idState INNER JOIN users u ON o.userId = u.id LEFT JOIN users emp ON o.employeeId = emp.id INNER JOIN tables t ON o.tableId = t.id WHERE o.id = ? GROUP BY o.id, o.tableId, t.number, o.userId, u.name, os.id, os.description, o.date_created, o.total, o.feedback, o.score, o.employeeId,emp.name ORDER BY date_created';

export const COUNT_ORDERS =
  'SELECT COUNT(DISTINCT (o.id)) AS total FROM orders as o INNER JOIN orderDetail od ON od.orderId = o.id INNER JOIN orderState os ON os.id = o.idState INNER JOIN users u ON o.userId = u.id LEFT JOIN users emp ON o.employeeId = emp.id INNER JOIN tables t ON o.tableId = t.id WHERE o.date_created LIKE CONCAT("%", ?, "%") OR t.number = ? OR u.name LIKE CONCAT("%", ?, "%") OR emp.name LIKE CONCAT("%", ?, "%") OR o.total = ? OR os.description LIKE CONCAT("%", ?, "%")';

export const SELECT_ORDERS =
  'SELECT o.id, JSON_OBJECT("id", o.tableId, "number", t.number) as table_order, JSON_OBJECT("id", o.userId, "name", u.name) as user, JSON_OBJECT("id", os.id, "description", os.description) as state, o.date_created, o.total, o.feedback, o.score, CASE WHEN o.employeeId IS NULL THEN NULL ELSE JSON_OBJECT("id", o.employeeId, "name", emp.name) END as employee, JSON_ARRAYAGG(JSON_OBJECT("productId", od.productId, "promotionId", od.promotionId, "quantity", od.quantity, "unitPrice", od.unitPrice, "comments", od.comments)) AS orderDetails FROM orders AS o INNER JOIN orderDetail od ON od.orderId = o.id INNER JOIN orderState os ON os.id = o.idState INNER JOIN users u ON o.userId = u.id LEFT JOIN users emp ON o.employeeId = emp.id INNER JOIN tables t ON o.tableId = t.id WHERE o.date_created LIKE CONCAT("%", ?, "%") OR t.number = ? OR u.name LIKE CONCAT("%", ?, "%") OR (o.employeeId IS NOT NULL AND emp.name LIKE CONCAT("%", ?, "%")) OR o.total = ? OR os.description LIKE CONCAT("%", ?, "%") GROUP BY o.id, o.tableId, t.number, o.userId, u.name, os.id, os.description, o.date_created, o.total, o.feedback, o.score, o.employeeId,emp.name ORDER BY date_created DESC LIMIT ?, ?';

export const SELECT_USER_ORDERS =
  'SELECT o.id, JSON_OBJECT("id", o.tableId, "number", t.number) as table_order, JSON_OBJECT("id", o.userId, "name", u.name) as user, JSON_OBJECT("id", os.id, "description", os.description) as state, o.date_created, o.total, o.feedback, o.score, CASE WHEN o.employeeId IS NULL THEN NULL ELSE JSON_OBJECT("id", o.employeeId, "name", emp.name) END as employee, JSON_ARRAYAGG(JSON_OBJECT("productId", od.productId, "promotionId", od.promotionId, "quantity", od.quantity, "unitPrice", od.unitPrice, "comments", od.comments)) AS orderDetails FROM orders AS o INNER JOIN orderDetail od ON od.orderId = o.id INNER JOIN orderState os ON os.id = o.idState INNER JOIN users u ON o.userId = u.id LEFT JOIN users emp ON o.employeeId = emp.id INNER JOIN tables t ON o.tableId = t.id WHERE u.id = ? GROUP BY o.id, o.tableId, t.number, o.userId, u.name, os.id, os.description, o.date_created, o.total, o.feedback, o.score, o.employeeId,emp.name ORDER BY date_created DESC LIMIT ?, ?';

export const INSERT_ORDER =
  'INSERT INTO orders (tableId, userId, idState, date_created, total, feedback, score, employeeId) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)';

export const INSERT_ORDER_DETAIL =
  ' INSERT INTO orderDetail (orderId, productId, promotionId, quantity, unitPrice, comments) VALUES (?, ?, ?, ?, ?, ?)';

export const DELETE_ORDER = 'DELETE FROM orders WHERE id = ?';

export const DELETE_ORDER_DETAIL = 'DELETE FROM orderDetail WHERE orderId = ?';

export const UPDATE_ORDER_STATE = 'UPDATE orders SET idState = ? WHERE id = ?';

export const UPDATE_ORDER_FEEDBACK =
  'UPDATE orders SET feedback = ?, score = ? WHERE id = ?';

export const CHECK_EXISTING_UNCONFIRMED_ORDER =
  'SELECT * FROM orders WHERE idState = 1 AND userId = ?';

export const CHECK_EXISTING_ORDER_IN_TABLE =
  'SELECT * FROM orders WHERE idState IN (1,2,3) AND tableId = ? AND userId = ?';

export const CHECK_EXISTING_ORDER_STATE =
  'SELECT * FROM orderState WHERE id = ?';

export const SAVE_TICKET =
  'INSERT INTO tickets (order_id, date_created, user_email, payment_method, status, total_paid_amount) VALUES (?, ?, ?, ?, ?, ?)';
