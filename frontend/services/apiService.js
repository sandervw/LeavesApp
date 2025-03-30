import { useAuthApiClient } from './authApiClient';

// Create a hook for authenticated API calls
export function useApiService() {
  const { authFetch } = useAuthApiClient();
  const API_BASE = 'http://localhost:8080';

  return {
    fetchElements: async (kind) => {
      try {
        const response = await authFetch(`${API_BASE}/${kind}/`);
        return response.json();
      } catch (err) {
        console.log(err);
        return err;
      }
    },

    fetchElement: async (kind, id) => {
      try {
        const response = await authFetch(`${API_BASE}/${kind}/${id}`);
        return response.json();
      } catch (err) {
        console.log(err);
        return err;
      }
    },

    fetchChildren: async (id) => {
      try {
        const response = await authFetch(`${API_BASE}/storynodes/children/${id}`);
        return response.json();
      } catch (err) {
        console.log(err);
        return err;
      }
    },

    upsertElement: async (kind, element) => {
      try {
        const response = await authFetch(`${API_BASE}/${kind}/`, {
          method: 'POST',
          body: JSON.stringify(element)
        });
        return response.json();
      } catch (err) {
        console.log(err);
        return err;
      }
    },

    createFromTemplate: async (templateId, parentId) => {
      try {
        const response = await authFetch(`${API_BASE}/storynodes/postfromtemplate/`, {
          method: 'POST',
          body: JSON.stringify(parentId ? { templateId, parentId } : { templateId })
        });
        return response.json();
      } catch (err) {
        console.log(err);
        return err;
      }
    },

    deleteElement: async (kind, id) => {
      try {
        const response = await authFetch(`${API_BASE}/${kind}/${id}`, { 
          method: 'DELETE' 
        });
        return response.json();
      } catch (err) {
        console.log(err);
        return err;
      }
    },

    createFile: async (id) => {
      try {
        const response = await authFetch(`${API_BASE}/storynodes/posttofile/`, {
          method: 'POST',
          body: JSON.stringify({ id })
        });
        return response.json();
      } catch (err) {
        console.log(err);
        return err;
      }
    },

    upsertUser: async (user) => {
      try {
        const response = await authFetch(`${API_BASE}/users/`, {
          method: 'POST',
          body: JSON.stringify({
            auth0Id: user.sub,
            name: user.name,
            email: user.email,
          })
        });
        return response.json();
      } catch (err) {
        console.log(err);
        return err;
      }
    }
  };
}