export class ProductType {
    public id?: number;
    public description: string;
  
    constructor(
      description: string,
      id?: number,
    ) {
      this.id = id || 0;
      this.description = description;
    }
  }
  