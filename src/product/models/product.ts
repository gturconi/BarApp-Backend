export class Product {
  public id?: number;
  public name: string;
  public description: string;
  public image: Buffer;
  public price: number;
  public idCat: number;
  public promotions?: number[];

  constructor(
    name: string,
    description: string,
    image: Buffer,
    price: number,
    idCat: number,
    promotions?: number[],
    id?: number
  ) {
    this.id = id || 0;
    this.name = name;
    this.description = description;
    this.image = image;
    this.price = price;
    this.idCat = idCat;
    this.promotions = promotions;
  }
}
