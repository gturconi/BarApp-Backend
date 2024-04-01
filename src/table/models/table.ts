import { TableState } from '../../types/tableState';
export const TABLE_STATE = ['Free', 'Occupied'];
export class Table {
  public id?: number;
  public number: number;
  public idState: number;

  constructor(number: number, idState: number) {
    this.number = number;
    this.idState = idState;
  }
}
