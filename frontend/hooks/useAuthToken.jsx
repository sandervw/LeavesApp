// Services to handle authentication logic
import { useAuth0 } from '@auth0/auth0-react';

export const useAuthToken = () => {
    const { isLoading, user, getAccessTokenSilently, getAccessTokenWithPopup, isAuthenticated } = useAuth0();
    
    const getToken = async () => {
        console.log('SyncUserToBackend component loaded:', { isLoading, user, isAuthenticated });
        
        let token;
        if (!isAuthenticated || isLoading) return; // wait for loading to finish
        try {
        token = await getAccessTokenSilently({
            authorizationParams: {
            audience: 'https://Leaves-app/5173',
            },
        });
        } catch (err) {
        if (err.error === 'consent_required' || err.error === 'login_required') {
            token = await getAccessTokenWithPopup({
            authorizationParams: {
                audience: 'https://Leaves-app/5173',
            },
            });
        } else {
            console.error('Token error:', err);
        }
        }
    
        if (!token) return;
    
        return token;
    };
    
    return { getToken };
}