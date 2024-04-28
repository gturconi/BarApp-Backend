export const MOST_SELLED_PRODUCTS =
  'SELECT p.name, COUNT(*) as cant FROM products p LEFT JOIN orderDetail od ON p.id = od.productId LEFT JOIN orders o ON od.orderId = o.id  AND o.date_created >= DATE_FORMAT(CURDATE(), "%Y-%m-01") LEFT JOIN orderState os ON o.idState = os.id AND os.description = "Pagado" GROUP BY p.name ORDER BY cant LIMIT 10';
