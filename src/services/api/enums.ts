export enum TaskStatus {
  New,
  InProgress,
  Completed,
  Draft,
}

export enum TaskPriority {
  Low,
  Middle,
  High,
  Urgent,
  Later,
}

export enum RequestResultCode {
  Success,
  Error,
  // eslint-disable-next-line no-magic-numbers
  CaptchaRequired = 10,
}
