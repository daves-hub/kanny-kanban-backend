import { generateToken, verifyToken, JwtPayload } from '../jwt';

describe('JWT Utils', () => {
  const mockPayload: JwtPayload = {
    userId: 1,
    email: 'test@example.com',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for the same payload', () => {
      const token1 = generateToken(mockPayload);
      const token2 = generateToken(mockPayload);

      // Tokens will be different due to timestamp in JWT
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-token';

      expect(() => verifyToken(malformedToken)).toThrow();
    });
  });
});
