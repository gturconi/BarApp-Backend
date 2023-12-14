type UserEstate = 0 | 1;

export type UserRole = {
  id: number;
  name: string;
  tel: string;
  email: string;
  password: string;
  roleId: number;
  roleName: string;
  baja: UserEstate;
};
