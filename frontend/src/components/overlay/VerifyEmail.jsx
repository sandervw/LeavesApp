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
    <>
      <div className='modal'>
        {error &&
          <div className='display-flex-column gap-medium'>
            <div>
              {error}
            </div>
            <button className='btn' onClick={() => navigate('/password/forgot')}>Reset Password</button>
          </div>}
        {isPending &&
          <div className='display-flex-column gap-medium'>Loading...</div>}
        {!isPending && !error &&
          <div className='display-flex-column gap-medium'>
            <h1>Email Verified</h1>
          </div>}
      </div>
      <div className='modal-backdrop'></div>
    </>
  );
};

export default VerifyEmail;