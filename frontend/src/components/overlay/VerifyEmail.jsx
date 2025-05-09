import { useEffect } from "react";
import useAPI from "../../hooks/useAPI";
import { useParams, useNavigate } from "react-router-dom";

const VerifyEmail = () => {

    const { code } = useParams();
    const { error, isPending, apiCall } = useAPI();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            if (code) {
                await apiCall('verifyEmail', code);
            }
        };
        verifyEmail();
    }, [code, apiCall]);

    return (
        <div className='modal-overlay'>
            {error &&
                <div className='modal-content'>
                    <div>
                        {error}
                    </div>
                    <button className='text-button clickable' onClick={() => navigate('/password/forgot')}>Reset Password</button>
                </div>}
            {isPending &&
                <div className='modal-content'>Loading...</div>}
            {!isPending && !error &&
                <div className='modal-content'>
                    <h1>Email Verified</h1>
                </div>}
        </div>
    );
};

export default VerifyEmail;