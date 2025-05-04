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
        
        return { status: response.statusText, data: response.data };
    },
    (error) => {
        console.log(error.response);
        
        const { status, data } = error.response;
        return Promise.reject({status, ...data});
    }
);

export default API;