export class Product {
    public id?: number;
    public name: string;
    public description: string;
    public image: Buffer;    
    public productTypeId: number;
    public promotions?: number[];    

    constructor(name: string, description: string, image: Buffer, productTypeId: number, promotions?: number[], id?: number) {
        this.id = id || 0;
        this.name = name;
        this.description = description;
        this.image = image;
        this.productTypeId = productTypeId;
        this.promotions = promotions;
    }
}