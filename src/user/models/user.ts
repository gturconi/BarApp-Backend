import bcrypt from "bcryptjs";

export class User {
  public id?: number;
  public name: string;
  public tel: string;
  public email: string;
  public password: string;
  public role: number;

  constructor(
    name: string,
    tel: string,
    email: string,
    password: string,
    id?: number,
    role?: number
  ) {
    this.id = id || 0;
    this.name = name;
    this.tel = tel;
    this.email = email;
    this.password = password;
    this.role = role || 0;
  }

  static comparePasswords = async (
    password: string,
    receivedPassword: string
  ) => {
    return await bcrypt.compare(password, receivedPassword);
  };

  static encryptPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  };
}
