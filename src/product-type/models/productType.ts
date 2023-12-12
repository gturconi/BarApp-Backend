export class ProductType {
  public id?: number;
  public description: string;
  public image: Buffer;

  constructor(description: string, image: Buffer, id?: number) {
    this.id = id || 0;
    this.description = description;
    this.image = image;
  }
}
