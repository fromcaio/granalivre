import { cookies } from 'next/headers';

/**
 * A server-side utility to validate the user's session by making a
 * direct API call to the backend with the user's cookies.
 * This should only be used in Server Components.
 * @returns {Promise<object|null>} The user object if the session is valid, otherwise null.
 */
export async function validateSession() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  // If there's no access token, there's no session.
  if (!accessToken) {
    return null;
  }

  try {
    // We make a server-to-server API call to a protected endpoint.
    // The `cache: 'no-store'` option is crucial to prevent Next.js from
    // caching the result of this validation check.
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/user-info/`, {
      headers: {
        // Forward the access token from the user's browser to the backend.
        'Cookie': `access_token=${accessToken}`
      },
      cache: 'no-store',
    });

    // If the response is OK, the token is valid, and we return the user data.
    if (response.ok) {
      const userData = await response.json();
      return userData;
    }
    
    // If the response is not OK (e.g., 401 Unauthorized), the session is invalid.
    return null;

  } catch (error) {
    console.error('Server-side session validation failed:', error);
    return null;
  }
}