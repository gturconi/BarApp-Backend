import bcrypt from 'bcryptjs';
import { Baja } from '../../shared/constants';

export class User {
  public id?: number;
  public name: string;
  public tel: string;
  public email: string;
  public password: string;
  public role: number;
  public baja: Baja;
  public avatar?: Buffer;
  public fcm_token?: string;

  constructor(
    name: string,
    tel: string,
    email: string,
    password: string,
    baja?: Baja,
    id?: number,
    role?: number,
    avatar?: Buffer,
    fcm_token?: string
  ) {
    this.id = id || 0;
    this.name = name;
    this.tel = tel;
    this.email = email;
    this.password = password;
    this.role = role || 0;
    this.baja = baja || 0;
    this.avatar = avatar;
    this.fcm_token = fcm_token;
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
