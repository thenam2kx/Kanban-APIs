export interface IUser {
  _id: string;
  fullname: string;
  email: string;
  phone: string;
  role: {
    _id: string;
    name: string;
  };
  permissions?: {
    _id: string;
    name: string;
    apiPath: string;
    module: string;
  }[];
}
