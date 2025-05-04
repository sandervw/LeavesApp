import API from "../config/apiClient";

export const authSignup = async (data) => API.post('/auth/signup', data);

export const authLogin = async (data) => API.post('/auth/login', data);

export const authLogout = async () => API.post('/auth/logout');

export const authRefresh = async () => API.get('/auth/refresh');

export const fetchElements = async (data) => {
    const { kind, query, options } = data;
    if (query) return await API.get(`${kind}/?${query}`, options);
    else return await API.get(`${kind}/`, options);
}

