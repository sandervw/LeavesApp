import { useNavigate } from 'react-router-dom';
import usePage from '../../hooks/usePage';
import Signup from '../../components/overlay/Signup';
import Login from '../../components/overlay/Login';
import ForgotPassword from '../../components/overlay/ForgotPassword';
import ResetPassword from '../../components/overlay/ResetPassword';
import VerifyEmail from '../../components/overlay/VerifyEmail';

/**
 * Acts as a blank landing page for the following overlay forms:
 * - Sign Up
 * - Login
 * - Forgot Password
 * - Reset Password
 * - Verify Email
 */
const FormPage = ({formType}) => {
    usePage({ page: 'formPage' });
    const Navigate = useNavigate();

    return (
        /* Render an empty div - logic is in the individual forms */
        <div>
            {formType==='signup' && <Signup hideModal={() => Navigate('/landing')} />}
            {formType==='login' && <Login hideModal={() => Navigate('/landing')} />}
            {formType==='forgot' && <ForgotPassword hideModal={() => Navigate('/')} />}
            {formType==='reset' && <ResetPassword />}
            {formType==='verify' && <VerifyEmail hideModal={() => Navigate('/')} />}
        </div>
    );
}
 
export default FormPage;