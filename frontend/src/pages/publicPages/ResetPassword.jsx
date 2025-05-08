import { useSearchParams } from "react-router-dom";
import ResetPasswordForm from "../../components/part/ResetPasswordForm";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const exp = Number(searchParams.get('exp'));
    const now = Date.now();
    const linkIsValid = code && exp && (now < exp); // Check if the link is valid (code and expiration time are present and not expired)

    return (
        <div>
            {linkIsValid
                ? <ResetPasswordForm code={code} />
                : <div>
                    <h2>Invalid or expired link</h2>
                    <button className='text-button clickable'><a href='/password/forgot' className='clickable'>Send New Reset Email</a></button>
                </div>}
        </div>
    );
};

export default ResetPassword;