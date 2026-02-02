import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie, removeCookie } from '../utils/cookie';

const ProtectedRoute = ({ user, loading, children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // If still loading, do nothing and wait.
    if (loading) {
      return;
    }

    const isLoggingOut = getCookie('isLoggingOut');

    // After loading is complete, if there is no user:
    if (!user) {
      // If the user is actively logging out, suppress the alert.
      if (isLoggingOut === 'true') {
        removeCookie('isLoggingOut'); // Clear the flag
      } else {
        alert('로그인이 필요합니다.');
      }
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // If loading, render nothing to avoid showing the page prematurely.
  // If not loading and user exists, render the page.
  if (loading) {
    return null; // Or a loading spinner component
  }

  return user ? children : null;
};

export default ProtectedRoute;
