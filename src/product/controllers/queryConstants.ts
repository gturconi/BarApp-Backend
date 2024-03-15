export const SELECT_PRODUCT_BY_ID =
  'SELECT p.id, p.name, p.description, p.image, c.description AS category, p.baja, p.stock, pre.price, (SELECT CASE WHEN COUNT(*) > 0 THEN JSON_ARRAYAGG(JSON_OBJECT( "discount", discount)) ELSE NULL END FROM products_promotions JOIN promotions ON products_promotions.idProm = promotions.id WHERE idProd = p.id AND CURDATE() BETWEEN valid_from AND valid_to AND baja = 0 AND price IS NULL GROUP BY idProd) AS promotions, (SELECT JSON_ARRAYAGG(day_of_week) FROM promotionDays WHERE promotion_id = (SELECT idProm FROM products_promotions WHERE idProd = p.id LIMIT 1)) AS days_of_week FROM products AS p INNER JOIN productsType AS c ON p.idCat = c.id INNER JOIN productPrice AS pre ON pre.idProd = p.id WHERE pre.valid_from = (SELECT MAX(valid_from) FROM productPrice WHERE idProd = p.id) AND p.id = ?';

export const SELECT_PRODUCT_BY_NAME = "SELECT * FROM products WHERE name = ?";

export const COUNT_PRODUCTS =
  "SELECT COUNT(*) AS total FROM products AS p INNER JOIN productsType AS c ON p.idCat = c.id INNER JOIN productPrice AS pre ON pre.idProd = p.id WHERE p.name LIKE CONCAT('%', ?, '%') OR p.description LIKE CONCAT('%', ?, '%') OR c.description LIKE CONCAT('%', ?, '%') OR pre.price < ?;";

export const SELECT_PRODUCTS =
  "SELECT p.id, p.name, p.description, p.image, c.description AS category, p.baja, p.stock, pre.price as price FROM products AS p INNER JOIN productsType AS c ON p.idCat = c.id INNER JOIN productPrice AS pre ON pre.idProd = p.id WHERE pre.valid_from = ( SELECT MAX(valid_from) FROM productPrice WHERE idProd = p.id ) AND (p.name LIKE ? OR p.description LIKE ? OR c.description LIKE ? OR pre.price < ?) ORDER BY p.name ASC LIMIT ?, ?";

export const INSERT_PRODUCT =
  "INSERT INTO products (name, description, image, idCat, stock) VALUES (?, ?, ?, ?, ?);";

export const INSERT_PRICE =
  "INSERT INTO productPrice (idProd, valid_from, price) VALUES (?, NOW(), ?);";

export const UPDATE_PRODUCT =
  "UPDATE products p INNER JOIN productPrice pre ON p.id = pre.idProd SET p.name = IFNULL(?, p.name), p.description = IFNULL(?, p.description), p.image = IFNULL(?, p.image), p.idCat = IFNULL(?, p.idCat), p.baja = IFNULL(?, p.baja), p.stock = IFNULL(?, p.stock), pre.price = IFNULL(?, pre.price) WHERE p.id = ?";

export const DELETE_PRODUCT = "DELETE FROM products WHERE id = ?";

export const DELETE_PRICES = "DELETE FROM productPrice WHERE idProd = ?";
