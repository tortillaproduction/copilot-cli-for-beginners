class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DataError';
  }
}

class FileError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FileError';
  }
}

module.exports = { ValidationError, DataError, FileError };
