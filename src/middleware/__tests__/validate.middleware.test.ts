import { z } from 'zod';
import { validate } from '../validate';
import { createAuthRequest, createMockResponse, createMockNext } from '../../test/httpMocks';

describe('validate middleware', () => {
  const schema = z.object({
    body: z.object({
      foo: z.string(),
    }),
    query: z.any().optional(),
    params: z.any().optional(),
  });

  it('calls next when validation passes', () => {
    const req = createAuthRequest({ body: { foo: 'bar' } });
    const res = createMockResponse();
    const next = createMockNext();

    validate(schema)(req as any, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds with 400 when validation fails', () => {
    const req = createAuthRequest({ body: { foo: 123 } as any });
    const res = createMockResponse();
    const next = createMockNext();

    validate(schema)(req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: [
        {
          path: 'body.foo',
          message: 'Expected string, received number',
        },
      ],
    });
    expect(next).not.toHaveBeenCalled();
  });
});
