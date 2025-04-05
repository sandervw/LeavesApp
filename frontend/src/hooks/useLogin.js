import { useState } from "react";
import useAuthContext from "./useAuthContext";
import { loginUser } from "../services/apiService";

const useLogin = () => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { dispatch } = useAuthContext();

    const login = async (username, password) => {
        setIsPending(true);
        setError(null);
        // Note: username can be an email or username
        const response = await loginUser(username, password);
        const data = await response.json();

        if (!response.ok) {
            setError(data.error);
            setIsPending(false);
            return false;
        } else {
            localStorage.setItem("user", JSON.stringify(data)); // save user to local storage
            dispatch({ type: "LOGIN", payload: data });
            setError(null);
            setIsPending(false);
            return true;
        }
    };

    return { login, error, isPending };

};
export default useLogin;