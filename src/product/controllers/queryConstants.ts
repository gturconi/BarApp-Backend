export const SELECT_PRODUCT_BY_ID =
  "SELECT p.name, p.description, p.image, p.idCat, pre.price FROM products AS p INNER JOIN productPrice AS pre ON pre.idProd = p.id WHERE pre.valid_from = ( SELECT MAX(valid_from) FROM productPrice WHERE idProd = p.id ) AND p.id = ?";

export const SELECT_PRODUCT_BY_NAME = "SELECT * FROM products WHERE name = ?";

export const COUNT_PRODUCTS =
  "SELECT COUNT(*) AS total FROM products AS p INNER JOIN productsType AS c ON p.idCat = c.idProductType INNER JOIN productPrice AS pre ON pre.idProd = p.id WHERE p.name LIKE CONCAT('%', ?, '%') OR p.description LIKE CONCAT('%', ?, '%') OR c.description LIKE CONCAT('%', ?, '%') OR pre.price < ?;";

export const SELECT_PRODUCTS =
  "SELECT p.name, p.description, p.image, c.description AS category, pre.price as price FROM products AS p INNER JOIN productsType AS c ON p.idCat = c.idProductType INNER JOIN productPrice AS pre ON pre.idProd = p.id WHERE pre.valid_from = ( SELECT MAX(valid_from) FROM productPrice WHERE idProd = p.id ) AND (p.name LIKE CONCAT('%', ?, '%') OR p.description LIKE CONCAT('%', ?, '%') OR c.description LIKE CONCAT('%', ?, '%') OR pre.price < ?) ORDER BY p.name ASC LIMIT ?, ?";

export const INSERT_PRODUCT =
  "INSERT INTO products (name, description, image, idCat) VALUES (?, ?, ?, ?);";

export const INSERT_PRICE =
  "INSERT INTO productPrice (idProd, valid_from, price) VALUES (?, NOW(), ?);";

export const UPDATE_PRODUCT =
  "UPDATE products p INNER JOIN productPrice pre ON p.id = pre.idProd SET p.name = IFNULL(?, p.name), p.description = IFNULL(?, p.description), p.image = IFNULL(?, p.image), p.idCat = IFNULL(?, p.idCat), pre.price = IFNULL(?, pre.price) WHERE p.id = ?";

export const DELETE_PRODUCT = "DELETE FROM products WHERE id = ?";

export const DELETE_PRICES = "DELETE FROM productPrice WHERE idProd = ?";
