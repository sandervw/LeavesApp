import useAuthContext from "../../hooks/useAuthContext";
import { Navigate, Outlet } from "react-router-dom";

const AuthContainer = () => {
    const { user } = useAuthContext();

    return (
        <div>
            {user
                ? (
                    <Outlet />
                )
                : <Navigate
                    to="/login"
                    replace
                    state={{
                        redirectUrl: window.location.pathname,
                    }}
                />
            }
        </div>
    );
};

export default AuthContainer;