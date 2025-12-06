import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../utils/authContext';

const useUser = () => {
    const { isAuthenticated } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (isAuthenticated) {
                setLoading(true);
                try {
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        setUser(response.data.data);
                    } else {
                        setError('Failed to fetch user data');
                    }
                } catch (err) {
                    setError(err.message || 'An error occurred');
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
            }
        };

        fetchUser();
    }, [isAuthenticated]);

    return { user, loading, error };
};

export default useUser;
