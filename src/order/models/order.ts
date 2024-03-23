import { OrderDetail } from './orderDetail';

export class Order {
  public id?: number;
  public tableId: number;
  public userId: number;
  public employeeId?: number;
  public idState: number;
  public orderDetails: OrderDetail[];
  public date_created: Date;
  public total: number;
  public feedback?: string;
  public score?: number;

  constructor(
    tableId: number,
    userId: number,
    idState: number,
    orderDetails?: OrderDetail[],
    date_created?: Date,
    total?: number,
    feedback?: string,
    score?: number,
    idEmployee?: number
  ) {
    this.tableId = tableId;
    this.userId = userId;
    this.idState = idState;
    this.orderDetails = orderDetails || [];
    this.date_created = date_created || new Date();
    this.total = total || 0;
    this.feedback = feedback;
    this.score = score;
    this.employeeId = idEmployee;
  }
}
