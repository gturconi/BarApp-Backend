export const SELECT_THEMES = "SELECT * FROM themes";

export const SELECT_THEME_BY_ID = "SELECT * FROM themes WHERE id = ?";

export const UPDATE_THEME =
  "UPDATE themes SET cssProperties = IFNULL(?, cssProperties) WHERE id = ?";
