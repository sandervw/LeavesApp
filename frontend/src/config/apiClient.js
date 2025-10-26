import axios from 'axios';

/**
 * Base cofinguration included with all requests.
 */
const options = {
  baseURL: import.meta.env.VITE_BASEAPIURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Used to refresh access token.
 * Same as API, but without error interceptor.
 * Prevents infinite loop when refreshing token.
 */
const TokenRefreshClient = axios.create(options);
TokenRefreshClient.interceptors.response.use(
  (response) => {
    return response.data;
  });

/**
 * Main API client.
 */
const API = axios.create(options);
API.interceptors.response.use(
  (response) => {
    console.log(`${response.statusText} response:`, response);
    return response.data;
  },
  async (error) => {
    console.log(error);
    const { config, response } = error;
    const { status, data } = response;

    // try to refresh the access token behind the scenes
    if (status === 401 && data?.errorCode === "InvalidAccessToken") {
      try {
        // refresh the access token (and user context)
        await TokenRefreshClient.get("/auth/refresh");
        const user = await TokenRefreshClient.get("/user");
        if (user) { // trigger user context update
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
        }
        // retry the original request
        config._retry = true;
        return API(config);
      } catch (refreshError) {
        console.log("Token refresh failed", refreshError);
        // Remove user from context
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: null }));
      }
    }
    return Promise.reject(`Error: ${data.message || "unknown error"} `);
  }
);

export default API;