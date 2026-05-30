import { describe, it, expect } from 'vitest';
import { loginSchema, passwordSchema, resetSchema } from './auth.schemas';

describe('auth schemas', () => {
  it('login lowercases email', () => {
    expect(loginSchema.parse({ email: ' A@B.COM ', password: 'x' }).email).toBe('a@b.com');
  });
  it('password policy', () => {
    expect(passwordSchema.safeParse('Str0ng!Pass99').success).toBe(true);
    expect(passwordSchema.safeParse('weak').success).toBe(false);
  });
  it('reset requires matching passwords', () => {
    expect(resetSchema.safeParse({ password: 'Str0ng!Pass99', confirm: 'Str0ng!Pass99' }).success).toBe(true);
    expect(resetSchema.safeParse({ password: 'Str0ng!Pass99', confirm: 'different' }).success).toBe(false);
  });
});
