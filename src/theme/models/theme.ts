export class Theme {
  id: number;
  cssProperties: string;

  constructor(id: number, cssProperties: string) {
    this.id = id;
    this.cssProperties = cssProperties;
  }
}
