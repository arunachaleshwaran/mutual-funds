import type HttpStatusCode from './HttpStatusCode';

export default class ExpressError extends Error {
  public readonly status: (typeof HttpStatusCode)[keyof typeof HttpStatusCode];
  public constructor(
    message: string,
    status: ExpressError['status']
  ) {
    super(message);
    this.status = status;
  }
}
