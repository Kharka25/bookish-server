import { isValidEmail } from '@utils/helper';

describe('Helper Functions Test Suite', () => {
  it('returns false when email is invalid', () => {
    const result = isValidEmail('mail.com');
    expect(result).toBeFalsy();
  });

  it('returns true when email is valid', () => {
    const result = isValidEmail('user1@mail.com');
    expect(result).toBeTruthy();
  });

  it('returns null when email is empty', () => {
    const result = isValidEmail('');
    expect(result).toBeFalsy();
  });
});
