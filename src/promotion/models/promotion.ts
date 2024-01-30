import { Baja } from '../../shared/constants';

export class Promotion {
  public id?: number;
  public description: string;
  public valid_from?: Date;
  public valid_to?: Date;
  public discount?: number;
  public image: Buffer;
  public price?: number;
  public baja?: Baja;
  public products: number[];
  public days_of_week?: number[];

  constructor(
    description: string,
    image: Buffer,
    products: number[],
    price: number,
    valid_from?: Date,
    valid_to?: Date,
    discount?: number,
    days_of_week?: number[],
    baja?: Baja
  ) {
    this.id = 0;
    this.description = description;
    this.valid_from = valid_from;
    this.valid_to = valid_to;
    this.discount = discount;
    this.image = image;
    this.baja = baja || 0;
    this.products = products || [];
    this.days_of_week = days_of_week || [];
    this.price = price;
  }
}
