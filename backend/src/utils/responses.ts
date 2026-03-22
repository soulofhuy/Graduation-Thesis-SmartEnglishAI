/* eslint-disable class-methods-use-this */

interface SuccessResponse<T = any> {
  status: true;
  message: string;
  data: T | null;
  error: null;
}

interface ErrorResponse {
  status: false;
  message: string;
  data: null;
  error: any;
}

class Responses {
  successResponse<T = any>(message: string, data: T | null = null): SuccessResponse<T> {
    return {
      status: true,
      message,
      data,
      error: null
    };
  }

  errorResponse(error: any): ErrorResponse {
    return {
      status: false,
      message: error?.message || 'An error occurred',
      data: null,
      error
    };
  }
}

export default new Responses();
