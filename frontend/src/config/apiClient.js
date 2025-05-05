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
      const { config, response } = error;
      const { status, data } = response || {};
  
    //   // try to refresh the access token behind the scenes
    //   if (status === UNAUTHORIZED && data?.errorCode === "InvalidAccessToken") {
    //     try {
    //       // refresh the access token, then retry the original request
    //       await TokenRefreshClient.get("/auth/refresh");
    //       return TokenRefreshClient(config);
    //     } catch (error) {
    //       // handle refresh errors by clearing the query cache & redirecting to login
    //       queryClient.clear();
    //       navigate("/login", {
    //         state: {
    //           redirectUrl: window.location.pathname,
    //         },
    //       });
    //     }
    //   }
  
    //   return Promise.reject({ status, ...data });
    }
);

export default API;