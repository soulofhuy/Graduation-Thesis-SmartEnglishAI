import type { Profile } from '@/lib/types';
import { ApiError, ApiSuccess } from '@/lib/types/responses';
import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';

export async function getMyProfile(token: string) {
  const response = await fetch(`${getApiBaseUrl()}/profile/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiSuccess<Profile> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Get profile failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Profile response is missing data');
  }

  return { profile: payload.data, message: payload.message };
}

export async function updateMyProfile(
  token: string,
  profileData: Partial<Profile>
) {
  const response = await fetch(`${getApiBaseUrl()}/profile/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  const payload = (await response.json()) as ApiSuccess<Profile> | ApiError;

  if (!response.ok || !payload.status) {
    const message = payload?.message || 'Update profile failed';
    throw new Error(message);
  }

  if (!payload.data) {
    throw new Error('Profile response is missing data');
  }

  return { profile: payload.data, message: payload.message };
}
