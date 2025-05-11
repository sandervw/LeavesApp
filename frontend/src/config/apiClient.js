import axios from 'axios';

const options = {
  baseURL: import.meta.env.VITE_BASEAPIURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

const API = axios.create(options);

API.interceptors.response.use(
  (response) => {
    console.log(response);
    return response.data;
  },
  async (error) => {
    console.log(error);

    const { status, data } = error.response;

    // try to refresh the access token behind the scenes
    if (status === 401 && data?.errorCode === "InvalidAccessToken") {
      try {
        // refresh the access token, then retry the original request
        await API.get("/auth/refresh");
        const user = await API.get("/user");
        if (user) { // trigger user context update
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
        }
        // return TokenRefreshClient(config);
      } catch (refreshError) {
        console.log("Token refresh failed", refreshError);
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: null }));
      }
    }
    return Promise.reject(`Error: ${data.message || "unknown error"} `);
  }
);

export default API;