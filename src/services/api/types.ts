export type LoginParamsType = {
  email: string;
  password: string;
  rememberMe: boolean;
  captcha?: string;
};

export type FormFieldErrorType = { field: string; error: string };

export type ServerResponseType<D = {}> = {
  resultCode: number;
  messages: string[];
  fieldsErrors?: FormFieldErrorType[];
  data: D;
};

export type PutAvatarResponseType = {
  photos: {
    small: string;
    large: string;
  };
};
