export class Contact {
  public name: string;
  public description: string;
  public tel: string;
  public address: string;
  public open_dayhr: string;
  public contact_email: string | null;

  constructor(name: string,
  description: string,
  tel: string,
  address: string,
  open_dayhr: string,
  contact_email: string | null,
) {
    this.name = name;
    this.description = description;
    this.tel = tel;
    this.address = address;
    this.open_dayhr = open_dayhr;
    this.contact_email = contact_email;
  }
}
