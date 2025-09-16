export class CustomError extends Error {
  constructor(message, status, name) {
    super(message);
    this.status = status;
    this.name = name;
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'NotFoundError');
  }
}

export class ValidationError extends CustomError {
  constructor(message = 'Datos inválidos') {
    super(message, 400, 'ValidationError');
  }
}