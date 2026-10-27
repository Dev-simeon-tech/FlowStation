export type ErrorFieldData = Record<string, string>[];

export class HttpException extends Error {
  constructor(
    public status: number,
    message = "Something went wrong",
    public data: ErrorFieldData = [],
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestException extends HttpException {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Not found") {
    super(404, message);
  }
}

export class ValidationException extends HttpException {
  constructor(message = "Invalid input provided", data: ErrorFieldData = []) {
    super(422, message, data);
  }
}

export class InternalException extends HttpException {
  constructor(message = "Internal error") {
    super(500, message);
  }
}
