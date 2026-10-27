import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { passwordChangeSchema, profileUpdateSchema } from './validation';

describe('account settings validation', () => {
  it('normalizes the profile email and accepts valid contact details', () => {
    const result = profileUpdateSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: ' ADA@example.com ',
      phone: '+57 300 123 4567',
    });

    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.email, 'ada@example.com');
  });

  it('rejects invalid profile contact data', () => {
    assert.equal(
      profileUpdateSchema.safeParse({
        firstName: 'A',
        lastName: 'Lovelace',
        email: 'not-an-email',
        phone: '123',
      }).success,
      false,
    );
  });

  it('requires matching, different passwords that meet the password rules', () => {
    const valid = {
      currentPassword: 'Old-password-1',
      newPassword: 'New-password-2',
      confirmPassword: 'New-password-2',
    };
    assert.equal(passwordChangeSchema.safeParse(valid).success, true);
    assert.equal(
      passwordChangeSchema.safeParse({
        ...valid,
        confirmPassword: 'Different-password',
      }).success,
      false,
    );
    assert.equal(
      passwordChangeSchema.safeParse({
        ...valid,
        newPassword: valid.currentPassword,
        confirmPassword: valid.currentPassword,
      }).success,
      false,
    );
  });
});
