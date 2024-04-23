export interface IEmailInfo {
  email: string;
  message: string;
  data: IInfo;
}

export interface IInfo {
  orderId: number;
  viewOrderNumber: string;
}
