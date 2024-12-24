export declare interface ITokenData {
  accessToken: string;
  refreshToken: string;
}

export declare interface ITokenLoginResponse {
  email: string;
  token: ITokenData;
}
