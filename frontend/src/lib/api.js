import API from "../config/apiClient";

export const authLogin = async (data) => {
    return API.post('/auth/login', data);
}