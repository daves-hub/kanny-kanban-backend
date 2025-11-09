import { errorHandler, AppError } from '../errorHandler';
import { createMockResponse, createMockNext } from '../../test/httpMocks';

describe('errorHandler middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it('handles AppError instances', () => {
    const err = new AppError('Bad request', 400);
    const res = createMockResponse();

    errorHandler(err, {} as any, res as any, createMockNext());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bad request' });
  });

  it('conceals unexpected error messages outside development', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Sensitive info');
    const res = createMockResponse();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, {} as any, res as any, createMockNext());

    expect(consoleSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('exposes error message in development', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Debug info');
    const res = createMockResponse();
    jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, {} as any, res as any, createMockNext());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Debug info' });
  });
});
