import useAuthContext from "./useAuthContext";

const useLogout = () => {
    const { dispatch } = useAuthContext();

    // No need for any backend call
    const logout = async () => {
        localStorage.removeItem("user"); // remove user from local storage
        dispatch({ type: "LOGOUT" }); // dispatch logout action to context
    };

    return { logout };

};
export default useLogout;