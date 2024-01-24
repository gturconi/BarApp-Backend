export const SELECT_PROMOTIONS =
  'SELECT P.*, JSON_ARRAYAGG( JSON_OBJECT("product_id", PP.idProd, "product_name", Prod.name) ) AS products, JSON_ARRAYAGG(pd.day_of_week) AS days_of_week FROM promotions P JOIN products_promotions PP ON P.id = PP.idProm JOIN products Prod ON PP.idProd = Prod.id LEFT JOIN promotionDays pd ON P.id = pd.promotion_id WHERE P.description LIKE CONCAT("%", ?, "%") GROUP BY P.id ORDER BY P.description ASC LIMIT ?, ?';

export const COUNT_PROMOTIONS =
  'SELECT COUNT(*) AS total FROM promotions WHERE description LIKE CONCAT("%", ?, "%")';

export const SELECT_PROMOTIONS_DAYS =
  'SELECT pd.day_of_week FROM promotionDays pd INNER JOIN promotions p ON pd.promotion_id = p.id WHERE p.description LIKE CONCAT("%", ?, "%")';

export const SELECT_PROMOTION_BY_ID =
  'SELECT P.*, JSON_ARRAYAGG( JSON_OBJECT("product_id", PP.idProd, "product_name", Prod.name) ) AS products, JSON_ARRAYAGG(pd.day_of_week) AS days_of_week FROM promotions P JOIN products_promotions PP ON P.id = PP.idProm JOIN products Prod ON PP.idProd = Prod.id LEFT JOIN promotionDays pd ON P.id = pd.promotion_id WHERE P.id = ? GROUP BY P.id ORDER BY P.description ASC';
