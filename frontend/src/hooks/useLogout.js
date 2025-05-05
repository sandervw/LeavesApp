import useAuthContext from './useAuthContext';
import useAddableContext from './useAddableContext';
import useElementContext from './useElementContext';

const useLogout = () => {
    const { dispatch: authDispatch } = useAuthContext();
    const { dispatch: addableDispatch } = useAddableContext();
    const { dispatch: elementDispatch } = useElementContext();

    // No need for any backend call
    const logout = async () => {
        authDispatch({ type: 'LOGOUT' }); // dispatch logout action to context
        localStorage.removeItem('user'); // remove user from local storage
        addableDispatch({ type: 'SET_ADDABLES', payload: null });
        elementDispatch({ type: 'SET_ELEMENT', payload: null });
        elementDispatch({ type: 'SET_CHILDREN', payload: null });
    };

    return { logout };

};
export default useLogout;