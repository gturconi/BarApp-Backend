
export class ProductPrice {
    public validFrom: Date;
    public price: number;
    public productId: number;

    constructor(validFrom: Date, price: number, productId: number) {
        this.validFrom = validFrom;
        this.price = price;
        this.productId = productId;
    }
}