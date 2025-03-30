import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useApiService } from '../services/apiService';

function SyncUserToBackend() {
  const { isLoading, user, isAuthenticated } = useAuth0();
  const { upsertUser } = useApiService();

  useEffect(() => {
    const syncUser = async () => {
      if (!isAuthenticated || isLoading || !user) return;
      
      try {
        await upsertUser(user);
      } catch (err) {
        console.error('Error syncing user to backend:', err);
      }
    };

    syncUser();
  }, [isLoading, isAuthenticated, user, upsertUser]);

  return null; // this component only performs side-effect
}

export default SyncUserToBackend;