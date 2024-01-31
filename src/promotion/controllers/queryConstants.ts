export const SELECT_PROMOTIONS =
  'SELECT P.*, PP.products, pd.days_of_week FROM promotions P JOIN (SELECT idProm, JSON_ARRAYAGG(JSON_OBJECT("product_id", idProd, "product_name", name)) AS products  FROM products_promotions  JOIN products ON products_promotions.idProd = products.id GROUP BY idProm) PP ON P.id = PP.idProm LEFT JOIN (SELECT promotion_id, JSON_ARRAYAGG(day_of_week) AS days_of_week FROM promotionDays GROUP BY promotion_id) pd ON P.id = pd.promotion_id WHERE P.description LIKE CONCAT("%", ?, "%") ORDER BY P.description ASC LIMIT ?, ?';

export const COUNT_PROMOTIONS =
  'SELECT COUNT(*) AS total FROM promotions WHERE description LIKE CONCAT("%", ?, "%")';

export const SELECT_PROMOTIONS_DAYS =
  'SELECT pd.day_of_week FROM promotionDays pd INNER JOIN promotions p ON pd.promotion_id = p.id WHERE p.description LIKE CONCAT("%", ?, "%")';

export const SELECT_PROMOTION_BY_ID =
  'SELECT P.*, PP.products, pd.days_of_week FROM promotions P JOIN (SELECT idProm, JSON_ARRAYAGG(JSON_OBJECT("product_id", idProd, "product_name", name)) AS products FROM products_promotions  JOIN products ON products_promotions.idProd = products.id GROUP BY idProm) PP ON P.id = PP.idProm LEFT JOIN (SELECT promotion_id, JSON_ARRAYAGG(day_of_week) AS days_of_week FROM promotionDays GROUP BY promotion_id) pd ON P.id = pd.promotion_id WHERE P.id = ? GROUP BY P.id ORDER BY P.description ASC';

export const SELECT_PRMOTION_BY_DESC =
  'SELECT id FROM promotions WHERE description = ?';

export const INSERT_PROMOTION =
  'INSERT INTO promotions (description, valid_from, valid_to, discount, image, price) VALUES (?, ?, ?, ?, ?, ?)';

export const INSERT_PRODUCT_PROMOTION =
  ' INSERT INTO products_promotions (idProm, idProd) VALUES (?, ?)';

export const INSERT_PROMOTION_DAYS =
  ' INSERT INTO promotionDays (promotion_id, day_of_week) VALUES (?, ?)';

export const UPDATE_PROMOTION =
  'UPDATE promotions p SET p.description = IFNULL(?, p.description), p.valid_from = IFNULL(?, p.valid_from), p.valid_to = IFNULL(?, p.valid_to), p.discount = IFNULL(?, p.discount), p.baja = IFNULL(?, p.baja), p.image = IFNULL(?, p.image), p.price = IFNULL(?, p.price) WHERE p.id = ?';

export const UPDATE_PROMOTION_PRODUCTS =
  'UPDATE products_promotions SET idProd = IFNULL(?, idProd) WHERE idProm = ?';

export const UPDATE_PROMOTION_DAYS =
  'UPDATE promotionDays SET day_of_week = ? WHERE promotion_id = ?';

export const DELETE_PROMOTION_PRODUCTS =
  'DELETE FROM products_promotions WHERE idProm = ? AND idProd = ?';

export const DELETE_PROMOTION_DAYS =
  'DELETE FROM promotionDays WHERE promotion_id = ? AND day_of_week = ?';

export const DELETE_PROMOTION = 'DELETE FROM promotions WHERE id = ?';

export const DELETE_DAYS = 'DELETE FROM promotionDays WHERE promotion_id = ?';

export const DELETE_PRODUCTS =
  'DELETE FROM products_promotions WHERE idProm = ?';

export const SELECT_PROMOTION_BY_PRODUCT =
  'SELECT * FROM products_promotions WHERE idProd = ?';
