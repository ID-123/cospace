'use client';

import { useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/components/shared/LocaleProvider';

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

function getErrorCode(result: unknown): string | undefined {
  if (
    typeof result !== 'object' ||
    result === null ||
    !('error' in result) ||
    typeof result.error !== 'object' ||
    result.error === null ||
    !('code' in result.error) ||
    typeof result.error.code !== 'string'
  ) {
    return undefined;
  }
  return result.error.code;
}

export function AccountSettings({
  initialProfile,
}: {
  initialProfile: Profile;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function saveProfile(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage('');
    setProfileError('');
    setIsSavingProfile(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      firstName: String(formData.get('firstName')),
      lastName: String(formData.get('lastName')),
      email: String(formData.get('email')),
      phone: String(formData.get('phone')),
    };

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as
        | { user: Profile }
        | ApiError;
      if (!response.ok || !('user' in result)) {
        const code = getErrorCode(result);
        setProfileError(
          code === 'EMAIL_IN_USE'
            ? t('emailInUse')
            : code === 'UNAUTHENTICATED'
              ? t('unauthenticated')
              : code === 'INVALID_INPUT'
                ? t('invalidInput')
                : t('profileSaveFailed'),
        );
        return;
      }

      setProfile(result.user);
      setProfileMessage(t('profileSaved'));
      router.refresh();
    } catch {
      setProfileError(t('connectionError'));
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function changePassword(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    setIsSavingPassword(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      currentPassword: String(formData.get('currentPassword')),
      newPassword: String(formData.get('newPassword')),
      confirmPassword: String(formData.get('confirmPassword')),
    };

    try {
      const response = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiError;
      if (!response.ok) {
        const code = getErrorCode(result);
        setPasswordError(
          code === 'INVALID_CURRENT_PASSWORD'
            ? t('invalidCurrentPassword')
            : code === 'UNAUTHENTICATED'
              ? t('unauthenticated')
              : code === 'INVALID_INPUT'
                ? t('invalidInput')
                : t('passwordChangeFailed'),
        );
        return;
      }

      event.currentTarget.reset();
      setPasswordMessage(t('passwordUpdated'));
      router.refresh();
    } catch {
      setPasswordError(t('connectionError'));
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <>
      <p className="home-section-eyebrow">{t('accountEyebrow')}</p>
      <h1>{t('profileTitle')}</h1>
      <div className="profile-settings">
        <form className="profile-settings__form" onSubmit={saveProfile}>
          <h2>{t('personalDetails')}</h2>
          <label>
            {t('firstName')}
            <input
              name="firstName"
              autoComplete="given-name"
              value={profile.firstName}
              onChange={(event) =>
                setProfile({ ...profile, firstName: event.currentTarget.value })
              }
              minLength={2}
              maxLength={80}
              required
            />
          </label>
          <label>
            {t('lastName')}
            <input
              name="lastName"
              autoComplete="family-name"
              value={profile.lastName}
              onChange={(event) =>
                setProfile({ ...profile, lastName: event.currentTarget.value })
              }
              minLength={2}
              maxLength={80}
              required
            />
          </label>
          <label>
            {t('email')}
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={profile.email}
              onChange={(event) =>
                setProfile({ ...profile, email: event.currentTarget.value })
              }
              maxLength={254}
              required
            />
          </label>
          <label>
            {t('phone')}
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              value={profile.phone}
              onChange={(event) =>
                setProfile({ ...profile, phone: event.currentTarget.value })
              }
              minLength={7}
              maxLength={20}
              required
            />
          </label>
          {profileError ? (
            <p className="auth-form__error" role="alert">{profileError}</p>
          ) : null}
          {profileMessage ? (
            <p className="profile-settings__success" role="status">{profileMessage}</p>
          ) : null}
          <button className="auth-form__submit" type="submit" disabled={isSavingProfile}>
            {isSavingProfile ? t('saving') : t('saveChanges')}
          </button>
        </form>

        <form className="profile-settings__form" onSubmit={changePassword}>
          <h2>{t('changePassword')}</h2>
          <label>
            {t('currentPassword')}
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            {t('newPassword')}
            <input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label>
            {t('confirmPassword')}
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          {passwordError ? (
            <p className="auth-form__error" role="alert">{passwordError}</p>
          ) : null}
          {passwordMessage ? (
            <p className="profile-settings__success" role="status">{passwordMessage}</p>
          ) : null}
          <button className="auth-form__submit" type="submit" disabled={isSavingPassword}>
            {isSavingPassword ? t('saving') : t('updatePassword')}
          </button>
        </form>
      </div>
    </>
  );
}
