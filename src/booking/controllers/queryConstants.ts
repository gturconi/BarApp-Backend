export const SELECT_BOOKING_DAYS = 'SELECT * FROM bookingDays';

export const SELECT_BOOKING_DAY_BY_ID =
  'SELECT * FROM bookingDays WHERE id = ?';

export const INSERT_BOOKING_DAY =
  'INSERT INTO bookingDays (day_of_week, init_hour, end_hour) VALUES (?, ?, ?)';

export const UPDATE_BOOKING_DAY =
  'UPDATE bookingDays SET day_of_week = ?, init_hour = ?, end_hour = ? WHERE id = ?';

export const DELETE_BOOKING_DAY = 'DELETE FROM bookingDays WHERE id = ?';

export const SEARCH_EXISTS_BOOKING_DAY =
  'SELECT * FROM bookingDays WHERE day_of_week = ? AND init_hour = ? AND end_hour = ?';

export const SELECT_BOOKING_BY_ID =
  'SELECT id, b.date_hour, JSON_OBJECT("id", b.userId, "name", u.name) as user, quota, JSON_OBJECT("id", b.stateId, "description", bs.description) as state, b.bookingDayId	 FROM bookings b INNER JOIN users u ON u.id = b.userId INNER JOIN bookingState bs ON bs.id = b.stateId WHERE b.id = ?';

export const SELECT_BOOKINGS =
  'SELECT id, b.date_hour, JSON_OBJECT("id", b.userId, "name", u.name) as user, quota , JSON_OBJECT("id", b.stateId, "description", bs.description) as state, b.bookingDayId	 FROM bookings b INNER JOIN users u ON u.id = b.userId INNER JOIN bookingState bs ON bs.id = b.stateId WHERE date_hour LIKE CONCAT("%", ?, "%") OR u.name LIKE CONCAT("%", ?, "%") OR bs.description LIKE CONCAT("%", ?, "%") ORDER BY date_hour DESC LIMIT ?, ?';

export const COUNT_BOOKINGS =
  'SELECT COUNT(*) as total FROM bookings b INNER JOIN users u ON u.id = b.userId INNER JOIN bookingState bs ON bs.id = b.stateId WHERE date_hour LIKE CONCAT("%", ?, "%") OR u.name LIKE CONCAT("%", ?, "%") OR bs.description LIKE CONCAT("%", ?, "%")';

export const SELECT_BOOKING_STATE = 'SELECT * FROM bookingState WHERE id = ?';

export const INSERT_BOOKING =
  'INSERT INTO bookings (date_hour, userId, stateId, quota, bookingDayId) VALUES (?, ?, ?, ?, ?)';

export const CHECK_EXISTING_BOOKING =
  'SELECT * FROM bookings b INNER JOIN bookingState bs ON bs.id = b.stateId WHERE b.userId = ? AND bs.description = "Pendiente"';

export const GET_FUTURE_BOOKINGS =
  'SELECT * FROM bookings WHERE date_hour > DATE(CONVERT_TZ(NOW(), "+00:00", "-03:00")) AND userId = ?';

export const UPDATE_BOOKING_STATE =
  'UPDATE bookings SET stateId = ? WHERE id = ?';
