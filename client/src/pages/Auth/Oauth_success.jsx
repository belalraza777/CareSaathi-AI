import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import { getProfile } from '../../api/profileApi.js';
import './Oauth_success.css';


const OAuthSuccess = () => {
    // Navigation and auth context
    const navigate = useNavigate();
    const { refreshUser, loading } = useAuth();

    // Handle OAuth callback - fetch user data and redirect
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Backend has set httpOnly cookie, fetch user data
                const result = await refreshUser();
                if (result.success) {
                    const profileResult = await getProfile();
                    if (!profileResult.success && profileResult.message === "Profile not found") {
                        navigate('/profile', { replace: true, state: { fromSignup: true } });
                        return;
                    }
                    navigate('/', { replace: true });
                } else {
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                console.error('OAuth refresh failed:', error);
                navigate('/login', { replace: true });
            }
        };

        // Only fetch if not already loading
        if (!loading) {
            fetchUser();
        }
    }, [navigate, refreshUser, loading]);

    return (
        <div className="oauth-success-page">
            <p className="oauth-success-page__message">Completing login...</p>
        </div>
    );
};

export default OAuthSuccess;