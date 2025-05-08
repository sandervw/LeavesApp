import { useEffect } from "react";
import useAPI from "../../hooks/useAPI";
import { useParams, Link } from "react-router-dom";

const VerifyEmail = () => {

    const { code } = useParams();
    const { error, isPending, apiCall } = useAPI();

    useEffect(() => {
        const verifyEmail = async () => {
            if (code) {
                await apiCall('verifyEmail', code);
            }
        }
        verifyEmail();
    }, [code, apiCall]);

    return (<>
        {error && <div className='error container'>
            <div>
                {error}
            </div>
            <button className='text-button clickable'><Link to='/password/forgot' className='clickable'>Reset Password</Link></button>
            
            </div>}
        {isPending && <div className='loading container'>Loading...</div>}
        {!isPending && !error &&
            <div>
                <h1>Email Verified</h1>
            </div>}
    </>);
};

export default VerifyEmail;