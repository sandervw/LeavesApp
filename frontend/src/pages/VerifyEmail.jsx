import { useEffect } from "react";
import useAPI from "../hooks/useAPI";
import { useParams } from "react-router-dom";

const VerifyEmail = () => {

    const { code } = useParams();
    const { error, isPending, apiCall } = useAPI();

    useEffect(() => {
        const verifyEmail = async () => {
            if (code) {
                await apiCall('verifyEmail', code);
                console.log(error, isPending);
                
            }
        }
        verifyEmail();
    }, [code, apiCall]);

    return (<>
        {error && <div className='error container'>{error}</div>}
        {isPending && <div className='loading container'>Loading...</div>}
        {!isPending && !error &&
            <div>
                <h1>Email Verified</h1>
            </div>}
    </>);
};

export default VerifyEmail;