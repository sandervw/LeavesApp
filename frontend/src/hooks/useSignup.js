import { useState } from "react";
import useAuthContext from "../hooks/useAuthContext";
import { signupUser } from "../services/apiService";

const useSignup = () => {

    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { dispatch } = useAuthContext();

    const signup = async (email, username, password) => {
        setError(null);
        setIsPending(true);

        const response = await signupUser(email, username, password);
        const data = await response.json();

        if (!response.ok) {
            setError(data.error);
            setIsPending(false);
        } else {
            // save user to local storage
            localStorage.setItem("user", JSON.stringify(data));
            // dispatch login action to context
            dispatch({ type: "LOGIN", payload: data });
            setError(null);
            setIsPending(false);
        }
    };

    return { signup, error, isPending };

};
export default useSignup;