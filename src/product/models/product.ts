import { Baja } from "../../shared/constants";

export class Product {
  public id?: number;
  public name: string;
  public description: string;
  public image: Buffer;
  public price: number;
  public idCat: number;
  public stock?: number;
  public promotions?: number[];
  public baja: Baja;

  constructor(
    name: string,
    description: string,
    image: Buffer,
    idCat: number,
    price: number,
    stock?: number,
    promotions?: number[],
    baja?: Baja,
    id?: number
  ) {
    this.id = id || 0;
    this.name = name;
    this.description = description;
    this.image = image;
    this.price = price;
    this.idCat = idCat;
    this.stock = stock;
    this.promotions = promotions;
    this.baja = baja || 0;
  }
}
