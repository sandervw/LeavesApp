import useAuthContext from './useAuthContext';
import useAddableContext from './useAddableContext';
import useElementContext from './useElementContext';
import apiService from '../services/apiService';

const useLogout = () => {
    const { dispatch: authDispatch } = useAuthContext();
    const { dispatch: addableDispatch } = useAddableContext();
    const { dispatch: elementDispatch } = useElementContext();

    const logout = async () => {
        authDispatch({ type: 'LOGOUT' }); // dispatch logout action to context
        elementDispatch({ type: 'SET_CHILDREN', payload: null });
        addableDispatch({ type: 'SET_ADDABLES', payload: null });
        elementDispatch({ type: 'SET_ELEMENT', payload: null });
        localStorage.removeItem('user'); // remove user from local storage
        apiService.authLogout(); // call logout API (no need to await)
    };

    return { logout };

};
export default useLogout;