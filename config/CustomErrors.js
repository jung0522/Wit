import { BaseError } from './BaseError.js';
import { errStatus } from './errorStatus.js';

export class BadRequestError extends BaseError {
  constructor() {
    super(errStatus.BAD_REQUEST);
  }
}


export class NotFoundError extends BaseError {
  constructor() {
    super(errStatus.POST_NOT_FOUND);
  }
}
