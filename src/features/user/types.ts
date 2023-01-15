import type { ProfileServerModelType } from 'services/api';

export type UserInAppType = {
  id: number | null;
  auth: boolean;
  login: string;
  name: string;
  about: string | null;
  email: string;
  photoLarge: string | null;
  allUserData: ProfileServerModelType;
};
