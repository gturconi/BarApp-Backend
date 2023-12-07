import { OkPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type DbDefaults =
  | RowDataPacket[]
  | RowDataPacket[][]
  | OkPacket[]
  | OkPacket;
export type DbQueryResult<T> = T & DbDefaults;

export type DbQueryInsert = ResultSetHeader;
