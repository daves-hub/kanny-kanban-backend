import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

interface MockResponse extends Partial<Response> {
  status: jest.Mock;
  json: jest.Mock;
  cookie: jest.Mock;
  clearCookie: jest.Mock;
}

export const createMockResponse = (): MockResponse => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res as MockResponse;
};

export const createMockNext = (): NextFunction => jest.fn();

export const createAuthRequest = (overrides: Partial<AuthRequest> = {}): AuthRequest => {
  const req: Partial<AuthRequest> = {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    ...overrides,
  };

  return req as AuthRequest;
};
