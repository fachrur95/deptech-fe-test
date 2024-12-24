import type { GenderEnum } from "./user";

export declare interface IEmployee {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  gender: GenderEnum;
  phoneNumber: string;
  address: string;
}
