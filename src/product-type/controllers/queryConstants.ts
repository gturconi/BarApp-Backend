export const SELECT_PRODUCT_TYPE_BY_ID =
  'SELECT id, description, image, baja FROM productsType WHERE id = ?';

export const COUNT_PRODUCTS_TYPE =
  "SELECT COUNT(*) AS total FROM productsType WHERE description LIKE CONCAT('%', ?, '%');";

export const SELECT_PRODUCTS_TYPE =
  "SELECT id, description, image, baja FROM productsType WHERE description LIKE CONCAT('%', ?, '%') ORDER BY description ASC LIMIT ?, ?";

export const UPDATE_PRODUCT_TYPE =
  'UPDATE productsType SET description = IFNULL(?, description), image = IFNULL(?, image), baja = IFNULL(?, baja) WHERE id = ?';

export const DELETE_PRODUCT_TYPE = 'DELETE FROM productsType WHERE id = ?';

export const SELECT_PRODUCT_TYPE_BY_DESCRIPTION =
  'SELECT * FROM productsType WHERE description = ?';

export const INSERT_PRODUCT_TYPE =
  'INSERT INTO productsType (description, image) VALUES (?, ?)';
