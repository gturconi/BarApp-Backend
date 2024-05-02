export const MOST_SELLED_PRODUCTS =
  'SELECT p.name, COUNT(*) as cant FROM products p LEFT JOIN orderDetail od ON p.id = od.productId LEFT JOIN orders o ON od.orderId = o.id  AND o.date_created >= DATE_FORMAT(CURDATE(), "%Y-%m-01") LEFT JOIN orderState os ON o.idState = os.id AND os.description = "Pagado" GROUP BY p.name ORDER BY cant DESC LIMIT 5';

export const LESS_SELLED_PRODUCTS =
  'SELECT p.name, COUNT(*) as cant FROM products p LEFT JOIN orderDetail od ON p.id = od.productId LEFT JOIN orders o ON od.orderId = o.id  AND o.date_created >= DATE_FORMAT(CURDATE(), "%Y-%m-01") LEFT JOIN orderState os ON o.idState = os.id AND os.description = "Pagado" GROUP BY p.name ORDER BY cant ASC LIMIT 5';

export const TOP_FIVE_CUSTOMERS =
  'SELECT u.name, COUNT(*) as cant FROM users u LEFT JOIN orders o ON u.id = o.userId AND o.idState = 4 WHERE u.baja=0 GROUP BY u.name ORDER BY cant DESC LIMIT 5';

export const WEEKLY_SALES_HISTORY =
  'SELECT WEEK(date_created) as week, COUNT(*) as cant FROM orders WHERE idState = 4 GROUP BY week';
