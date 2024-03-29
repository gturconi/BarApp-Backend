export const SELECT_PROMOTIONS =
  'SELECT P.*, PP.products, pd.days_of_week FROM promotions P JOIN (SELECT idProm, JSON_ARRAYAGG(JSON_OBJECT("product_id", idProd, "product_name", name)) AS products  FROM products_promotions  JOIN products ON products_promotions.idProd = products.id GROUP BY idProm) PP ON P.id = PP.idProm LEFT JOIN (SELECT promotion_id, JSON_ARRAYAGG(day_of_week) AS days_of_week FROM promotionDays GROUP BY promotion_id) pd ON P.id = pd.promotion_id WHERE P.description LIKE CONCAT("%", ?, "%") ORDER BY P.description ASC LIMIT ?, ?';

export const COUNT_PROMOTIONS =
  'SELECT COUNT(*) AS total FROM promotions WHERE description LIKE CONCAT("%", ?, "%")';

export const SELECT_PROMOTIONS_DAYS =
  'SELECT pd.day_of_week FROM promotionDays pd INNER JOIN promotions p ON pd.promotion_id = p.id WHERE p.description LIKE CONCAT("%", ?, "%")';

export const SELECT_PROMOTION_BY_ID =
  'SELECT P.*, PP.products, pd.days_of_week FROM promotions P JOIN (SELECT idProm, JSON_ARRAYAGG(JSON_OBJECT("id", idProd, "description", name)) AS products FROM products_promotions  JOIN products ON products_promotions.idProd = products.id GROUP BY idProm) PP ON P.id = PP.idProm LEFT JOIN (SELECT promotion_id, JSON_ARRAYAGG(day_of_week) AS days_of_week FROM promotionDays GROUP BY promotion_id) pd ON P.id = pd.promotion_id WHERE P.id = ? GROUP BY P.id ORDER BY P.description ASC';

export const SELECT_PRMOTION_BY_DESC =
  "SELECT id FROM promotions WHERE description = ?";

export const INSERT_PROMOTION =
  "INSERT INTO promotions (description, valid_from, valid_to, discount, image, price, baja) VALUES (?, ?, ?, ?, ?, ?, ?)";

export const INSERT_PRODUCT_PROMOTION =
  " INSERT INTO products_promotions (idProm, idProd) VALUES (?, ?)";

export const INSERT_PROMOTION_DAYS =
  " INSERT INTO promotionDays (promotion_id, day_of_week) VALUES (?, ?)";

export const UPDATE_PROMOTION =
  "UPDATE promotions p SET p.description = IFNULL(?, p.description), p.valid_from = IFNULL(?, NULL), p.valid_to = IFNULL(?, NULL), p.discount = IFNULL(?, NULL), p.baja = IFNULL(?, p.baja), p.image = IFNULL(?, p.image), p.price = IFNULL(?, NULL) WHERE p.id = ?";

export const UPDATE_PROMOTION_PRODUCTS =
  "UPDATE products_promotions SET idProd = IFNULL(?, idProd) WHERE idProm = ?";

export const UPDATE_PROMOTION_DAYS =
  "UPDATE promotionDays SET day_of_week = ? WHERE promotion_id = ?";

export const DELETE_PROMOTION_PRODUCTS =
  "DELETE FROM products_promotions WHERE idProm = ? AND idProd = ?";

export const DELETE_PROMOTION_DAYS =
  "DELETE FROM promotionDays WHERE promotion_id = ? AND day_of_week = ?";

export const DELETE_PROMOTION = "DELETE FROM promotions WHERE id = ?";

export const DELETE_DAYS = "DELETE FROM promotionDays WHERE promotion_id = ?";

export const DELETE_PRODUCTS =
  "DELETE FROM products_promotions WHERE idProm = ?";

export const SELECT_PROMOTION_BY_PRODUCT =
  "SELECT * FROM products_promotions WHERE idProd = ?";

export const CHECK_OVERLAPPING_PROMOTIONS_DATES =
  "SELECT * FROM promotions p INNER JOIN products_promotions pp on pp.idProm=p.id WHERE pp.idProd = ? AND NOT(p.valid_from > ? OR p.valid_to < ?) AND p.baja = 0 AND p.price IS NULL";

export const CHECK_OVERLAPPING_PROMOTIONS_DAYS =
  "SELECT * FROM promotions p INNER JOIN products_promotions pp on pp.idProm=p.id INNER JOIN promotionDays pd on pd.promotion_id=p.id WHERE pp.idProd = ? AND FIND_IN_SET(pd.day_of_week, ?) > 0 AND p.baja = 0 AND p.price IS NULL AND (p.valid_to IS NULL OR p.valid_to >= NOW())";

export const CHECK_OVERLAPPING_PROMOTIONS_DATES_AND_DAYS =
  "SELECT * FROM promotions p INNER JOIN products_promotions pp ON pp.idProm=p.id INNER JOIN promotionDays pd on pd.promotion_id=p.id WHERE pp.idProd = ? AND p.baja = 0 AND NOT(p.valid_from > ? OR p.valid_to < ?) AND FIND_IN_SET(pd.day_of_week, ?) > 0 AND p.price IS NULL AND (p.valid_to IS NULL OR p.valid_to >= NOW())";

export const CHECK_OVERLAPPING_PROMOTIONS_DATES_UPDATE =
  "SELECT * FROM promotions p INNER JOIN products_promotions pp on pp.idProm=p.id WHERE pp.idProd = ? AND p.baja = 0 AND p.id <> ? AND p.price IS NULL AND ((? IS NOT NULL AND ? IS NOT NULL AND NOT(p.valid_from > ? OR p.valid_to < ?)) OR (? IS NOT NULL AND ? IS NULL AND NOT(p.valid_from > ?)) OR (? IS NULL AND ? IS NOT NULL AND NOT(p.valid_to < ?)))";

export const CHECK_OVERLAPPING_PROMOTIONS_DAYS_UPDATE =
  "SELECT * FROM promotions p INNER JOIN products_promotions pp on pp.idProm=p.id INNER JOIN promotionDays pd on pd.promotion_id=p.id WHERE pp.idProd = ? AND FIND_IN_SET(pd.day_of_week, ?) > 0 AND p.baja = 0 AND p.price IS NULL AND p.id <> ?";

export const CHECK_OVERLAPPING_PROMOTIONS_DATES_AND_DAYS_UPDATE =
  "SELECT * FROM promotions p INNER JOIN products_promotions pp ON pp.idProm=p.id INNER JOIN promotionDays pd on pd.promotion_id=p.id WHERE pp.idProd = ? AND p.baja = 0 AND p.id <> ? AND FIND_IN_SET(pd.day_of_week, ?) > 0 AND p.price IS NULL AND ((? IS NOT NULL AND ? IS NOT NULL AND NOT(p.valid_from > ? OR p.valid_to < ?)) OR (? IS NOT NULL AND ? IS NULL AND NOT(p.valid_from > ?)) OR (? IS NULL AND ? IS NOT NULL AND NOT(p.valid_to < ?)))";
