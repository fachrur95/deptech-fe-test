export declare interface IUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: GenderEnum;
}

export enum GenderEnum {
  MALE = "MALE",
  FEMALE = "FEMALE",
}
