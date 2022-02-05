export enum Status {
  Incomplete = ' ',
  Successful = '+',
  Failed = '-',
}

export const isStatus = (maybeStatus?: string): maybeStatus is Status =>
  !!maybeStatus && Object.values(Status).includes(maybeStatus as Status)
