import useAPI from "../hooks/useAPI";
import { useParams } from "react-router-dom";

const VerifyEmail = () => {

    const { code } = useParams();
    const { error, isPending, apiCall } = useAPI();

    apiCall('verifyEmail', code);

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