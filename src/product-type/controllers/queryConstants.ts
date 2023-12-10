export const SELECT_PRODUCT_TYPE_BY_ID =
  "SELECT idProductType, description FROM productsType WHERE idProductType = ?";

  export const COUNT_PRODUCTS_TYPE =
  "SELECT COUNT(*) AS total FROM productsType WHERE description LIKE CONCAT('%', ?, '%');";

  export const SELECT_PRODUCTS_TYPE =
  "SELECT idProductType, description FROM productsType WHERE description LIKE CONCAT('%', ?, '%') LIMIT ?, ?";

  export const UPDATE_PRODUCT_TYPE =
  "UPDATE productsType SET description = IFNULL(?, description) WHERE idProductType = ?";

  export const DELETE_PRODUCT_TYPE = "DELETE FROM productsType WHERE idProductType = ?";

  export const SELECT_PRODUCT_TYPE_BY_DESCRIPTION = "SELECT * FROM productsType WHERE description = ?";

  export const INSERT_PRODUCT_TYPE =
  "INSERT INTO productsType (description) VALUES (?)";

