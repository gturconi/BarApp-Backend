import { Baja } from '../shared/constants';

export type UserRole = {
  id: number;
  name: string;
  tel: string;
  email: string;
  password: string;
  roleId: number;
  role: string;
  baja: Baja;
};
