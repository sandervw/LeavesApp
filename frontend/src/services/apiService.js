import API from "../config/apiClient";

export const authSignup = async (data) => API.post('/auth/signup', data);

export const authLogin = async (data) => API.post('/auth/login', data);

export const authLogout = async () => API.get('/auth/logout');

export const authRefresh = async () => API.get('/auth/refresh');

export const getUser = async () => API.get('/user');

export const verifyEmail = async (verificationCode) => API.get(`/auth/email/verify/${verificationCode}`);

export const forgotPassword = async (email) => API.post('/auth/password/forgot', { email });

export const resetPassword = async ({ verificationCode, password }) => API.post('/auth/password/reset', { verificationCode, password });

export const fetchElements = async (kind, query) => {
    if (query) return API.get(`${kind}/?${query}`);
    else return API.get(`${kind}/`);
};

export const fetchElement = async (kind, id) => API.get(`${kind}/${id}`);

export const fetchChildren = async (kind, id) => API.get(`${kind}/getchildren/${id}`);

export const upsertElement = async (kind, element) => API.post(`${kind}/`, element);

export const createFromTemplate = async (templateId, parentId) => API.post(`storynode/postfromtemplate/`, { templateId, parentId });

export const deleteElement = async (kind, id) => API.delete(`${kind}/${id}`);

export const downloadStory = async (id) => API.get(`storynode/getstoryfile/${id}`);