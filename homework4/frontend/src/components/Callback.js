import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { msalInstance } from '../msalConfig';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          console.log('Login successful:', response);
          navigate('/');
        }
      } catch (error) {
        console.error('Redirect error:', error);
      }
    };

    handleRedirect();
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Callback;
