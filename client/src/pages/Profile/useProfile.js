import { useState, useEffect } from "react";
import { getProfile, createProfile, updateProfile } from "../../api/profileApi";

// Simple hook to manage profile API operations
const useProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch profile on mount
    useEffect(() => {
        const fetch = async () => {
            const result = await getProfile();
            if (result.success) {
                setProfile(result.data);
            } else {
                setProfile(null);
                setError(result.message);
            }
            setLoading(false);
        };
        fetch();
    }, []);

    // Create profile
    const create = async (data) => {
        const result = await createProfile(data);
        if (result.success) {
            setProfile(result.data);
            setError(null);
        } else {
            setError(result.message);
        }
        return result;
    };

    // Update profile
    const update = async (data) => {
        const result = await updateProfile(data);
        if (result.success) {
            setProfile(result.data);
            setError(null);
        } else {
            setError(result.message);
        }
        return result;
    };

    return { profile, loading, error, setError, create, update };
};

export default useProfile;
