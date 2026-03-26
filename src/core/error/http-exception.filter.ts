import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    // Always log non-HTTP exceptions so we can debug 500s
    if (!(exception instanceof HttpException)) {
      console.error('[HttpExceptionFilter] Unhandled exception:', exception);
    }

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;
    const message =
      typeof exceptionResponse === 'object' && exceptionResponse && 'message' in exceptionResponse
        ? (exceptionResponse as { message: string | string[] }).message
        : isHttpException
          ? exception.message
          : 'Internal server error';

    const errors = Array.isArray(message) ? message : [message];
    const traceId = request.header('x-request-id') ?? randomUUID();
    const code = isHttpException ? 'HTTP_ERROR' : 'INTERNAL_SERVER_ERROR';

    const responseBody: Record<string, unknown> = {
      type: `https://api.vesta-immo.com/errors/${code.toLowerCase()}`,
      title: HttpStatus[status] ?? 'Error',
      status,
      code,
      detail: Array.isArray(message) ? message.join(', ') : message,
      errors,
      instance: request.url,
      traceId,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    if (!isHttpException && exception instanceof Error) {
      responseBody['stack'] = exception.stack;
    }

    response.status(status).json(responseBody);
  }
}
