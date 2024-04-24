export const SELECT_BOOKING_DAYS = 'SELECT * FROM bookingDays';

export const SELECT_BOOKING_DAY_BY_ID =
  'SELECT * FROM bookingDays WHERE id = ?';

export const INSERT_BOOKING_DAY =
  'INSERT INTO bookingDays (day_of_week, init_hour, end_hour) VALUES (?, ?, ?)';

export const UPDATE_BOOKING_DAY =
  'UPDATE bookingDays SET day_of_week = ?, init_hour = ?, end_hour = ? WHERE id = ?';

export const DELETE_BOOKING_DAY = 'DELETE FROM bookingDays WHERE id = ?';

export const SELECT_BOOKING_BY_ID =
  'SELECT date_hour, JSON_OBJECT("id", b.userId, "name", u.name) as user, JSON_OBJECT("id", b.tableId, "number", t.number) as table_booking, JSON_OBJECT("id", b.stateId, "description", bs.description) as state, bookingDayId	 FROM bookings b INNER JOIN users u ON u.id = b.userId  INNER JOIN tables t ON t.id = b.tableId  INNER JOIN bookingState bs ON bs.id = b.stateId WHERE id = ?';

export const SELECT_BOOKINGS =
  'SELECT date_hour, JSON_OBJECT("id", b.userId, "name", u.name) as user, JSON_OBJECT("id", b.tableId, "number", t.number) as table_booking, JSON_OBJECT("id", b.stateId, "description", bs.description) as state, bookingDayId	 FROM bookings b INNER JOIN users u ON u.id = b.userId  INNER JOIN tables t ON t.id = b.tableId  INNER JOIN bookingState bs ON bs.id = b.stateId WHERE date_hour LIKE CONCAT("%", ?, "%") OR t.number = ? OR u.name LIKE CONCAT("%", ?, "%") OR bs.description LIKE CONCAT("%", ?, "%") ORDER BY date_hour DESC LIMIT ?, ?';
