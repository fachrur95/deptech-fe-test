import type { IEmployee } from "./employee";

export declare interface ILeave {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  employee: IEmployee;
}
