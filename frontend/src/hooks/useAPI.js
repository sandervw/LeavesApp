import { useState } from "react";
import useAuthContext from "../hooks/useAuthContext";

const useAPI = () => {
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(false);
    const { dispatch } = useAuthContext();
    const abortCont = new AbortController();

    const apiCall = async (url, method, body) => {
        setIsPending(true);
        setError(null);

        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
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

    return { apiCall, error, isPending };
}

export default useAPI;