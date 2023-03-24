import { extend } from 'hammerjs';

export class LoginModel {
    public Id: number;
    public Name: string;
    public Password: string;
    public AccessLevel: UserRoles;
}

export class BadLoginModel {
  public Delay: number;
  public Error: string;
}

export enum UserRoles {
  Open = 1,
  Operator,
  Administrator
}
