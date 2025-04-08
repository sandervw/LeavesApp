import useAuthContext from "../hooks/useAuthContext";
import apiService from "../services/apiService";
import { useCallback } from "react";
const useAPI = () => {
    const { user } = useAuthContext();

    const apiCall = useCallback(async (method, ...args) => {
        const serviceMethods = {...apiService}
        if (!user) return;
        const options = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
            },
        };
        if (!serviceMethods[method]) throw new Error(`Unknown API method: ${method}`);
        const result = await serviceMethods[method](...args, options);
        return result;

    }, [user]);
    return apiCall;
}

export default useAPI;