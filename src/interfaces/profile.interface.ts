export interface IUpdateProfilePayload {
  fullName: string;
  email: string;
}

export interface IUpdateProfileResult {
  full_name: string;
  pending_mail?: string | null;
  activationCode?: string | null;
  is_active?: boolean;
  refreshToken?: string | null;
}

export interface IResultDataProfile {
  fullName: string;
  email: string;
  profilePicture: string | null;
  requireRelogin?: boolean;
}

export interface IProfileRepositoryResult {
  id: string;
  full_name: string;
  email: string;
  profile_picture?: string | null;
}
