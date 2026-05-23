export interface IUpdateProfilePayload {
  fullName: string;
  email: string;
}

export interface IResultDataProfile {
  fullName: string;
  email: string;
  profilePicture: string;
  requireRelogin?: boolean;
}
