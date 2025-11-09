import { authenticate } from '../auth';
import { createAuthRequest, createMockResponse, createMockNext } from '../../test/httpMocks';

jest.mock('../../utils/jwt', () => ({
  verifyToken: jest.fn(),
}));

import { verifyToken } from '../../utils/jwt';

const verifyTokenMock = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('authenticate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows request with valid bearer token', () => {
    const req = createAuthRequest({ headers: { authorization: 'Bearer valid' } as any });
    const res = createMockResponse();
    const next = createMockNext();

    verifyTokenMock.mockReturnValue({ userId: 1, email: 'user@example.com' });

    authenticate(req, res as any, next);

    expect(verifyTokenMock).toHaveBeenCalledWith('valid');
    expect(req.user).toEqual({ userId: 1, email: 'user@example.com' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('falls back to cookie token when header missing', () => {
    const req = createAuthRequest({ cookies: { token: 'cookie-token' } as any });
    const res = createMockResponse();
    const next = createMockNext();

    verifyTokenMock.mockReturnValue({ userId: 2, email: 'cookie@example.com' });

    authenticate(req, res as any, next);

    expect(verifyTokenMock).toHaveBeenCalledWith('cookie-token');
    expect(req.user).toEqual({ userId: 2, email: 'cookie@example.com' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects when no token provided', () => {
    const req = createAuthRequest();
    const res = createMockResponse();
    const next = createMockNext();

    authenticate(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects when token verification fails', () => {
    const req = createAuthRequest({ headers: { authorization: 'Bearer invalid' } as any });
    const res = createMockResponse();
    const next = createMockNext();

    verifyTokenMock.mockImplementation(() => {
      throw new Error('bad token');
    });

    authenticate(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });
});
