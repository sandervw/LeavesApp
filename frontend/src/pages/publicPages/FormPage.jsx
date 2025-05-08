import useAuthContext from '../../hooks/useAuthContext';
import useAPI from '../../hooks/useAPI';
import { useNavigate } from 'react-router-dom';
import usePage from '../../hooks/usePage';
import Signup from '../../components/overlay/Signup';
import Login from '../../components/overlay/Login';

/**
 * Acts as a blank landing page for the following overlay forms:
 * - Sign Up
 * - Login
 * - Forgot Password
 * - Reset Password
 * - Verify Email
 */
const FormPage = ({formType}) => {
    const { user, dispatch } = useAuthContext();
    usePage({ page: 'landing' });
    const Navigate = useNavigate();
    const { apiCall } = useAPI();

    return (
        <div>
            {/* Render an empty div - logic is in the individual forms */}
            {formType==='signup' && <Signup hideModal={() => Navigate('/')} />}
            {formType==='login' && <Login hideModal={() => Navigate('/')} />}
            {formType==='forgot' && <ForgotPassword hideModal={() => Navigate('/')} />}
            {formType==='reset' && <ResetPassword hideModal={() => Navigate('/')} />}
            {formType==='verify' && <VerifyEmail hideModal={() => Navigate('/')} />}
        </div>
    );
}
 
export default FormPage;