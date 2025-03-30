import { useAuth0 } from '@auth0/auth0-react';

export function useAuthApiClient() {
  const { isLoading, isAuthenticated, getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();

  const getToken = async () => {
    try {
      return await getAccessTokenSilently({
        authorizationParams: {
          audience: 'https://Leaves-app/5173',
        },
      });
    } catch (err) {
      if (err.error === 'consent_required' || err.error === 'login_required') {
        return await getAccessTokenWithPopup({
          authorizationParams: {
            audience: 'https://Leaves-app/5173',
          },
        });
      }
      console.error('Token error:', err);
      throw err;
    }
  };

  const authFetch = async (url, options = {}) => {
    
    if (isLoading || !isAuthenticated) throw new Error("User is not authenticated or loading");
    
    const token = await getToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return { authFetch };
}