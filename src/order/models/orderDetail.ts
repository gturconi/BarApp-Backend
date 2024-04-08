export class OrderDetail {
  public id?: number;
  public orderId: number;
  public productId?: number;
  public promotionId?: number;
  public quantity?: number;
  public unitPrice?: number;
  public comments?: string;

  constructor(
    orderId: number,
    productId?: number,
    promotionId?: number,
    quantity?: number,
    unitPrice?: number,
    comments?: string
  ) {
    this.orderId = orderId;
    this.productId = productId;
    this.promotionId = promotionId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.comments = comments;
  }
}
