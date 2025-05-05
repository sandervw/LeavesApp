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
    (error) => {
        console.log(error);
        
        const { status, data } = error.response || error;
        return Promise.reject({status, data});
    }
);

export default API;