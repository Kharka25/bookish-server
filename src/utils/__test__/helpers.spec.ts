import { generateToken, isValidEmail } from '@utils/helper';

describe('Helper Functions Test Suite', () => {
  it('returns 6 digit when no argument is passed', () => {
    const token = generateToken();
    expect(token).toHaveLength(6);
  });

  it('returns correct number of specified digit', () => {
    const testToken = '10857';
    const token = generateToken(5);
    expect(token).toHaveLength(testToken.length);
  });

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
