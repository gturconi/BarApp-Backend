export const SELECT_TABLE_BY_ID =
  'SELECT t.number, s.description FROM tables t INNER JOIN tableState s ON t.idState=s.id WHERE t.id = ?';

export const COUNT_TABLES = 'SELECT count(*) AS total FROM tables';

export const SELECT_TABLES =
  'SELECT t.number, s.description FROM tables t INNER JOIN tableState s ON t.idState=s.id ORDER BY t.number ASC LIMIT ?, ?';

export const SELECT_TABLE_BY_NUMBER =
  'SELECT * FROM tables t WHERE t.number = ?';

export const INSERT_TABLE =
  'INSERT INTO tables (number, idState) VALUES (?, ?)';

export const UPDATE_TABLE =
  'UPDATE tables SET number = IFNULL(?, number), idState = IFNULL(?, idState) WHERE id = ?';

export const DELETE_TABLE = 'DELETE FROM tables WHERE id = ?';
