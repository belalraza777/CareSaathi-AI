import { useEffect } from "react";
import { useProfileStore } from "../../stores/profileStore";

// Simple hook to manage profile API operations
const useProfile = () => {
    const profile = useProfileStore((state) => state.profile);
    const loading = useProfileStore((state) => state.loading);
    const error = useProfileStore((state) => state.error);
    const isEditing = useProfileStore((state) => state.isEditing);
    const setError = useProfileStore((state) => state.setError);
    const setIsEditing = useProfileStore((state) => state.setIsEditing);
    const loadProfile = useProfileStore((state) => state.loadProfile);
    const createProfileData = useProfileStore((state) => state.createProfileData);
    const updateProfileData = useProfileStore((state) => state.updateProfileData);

    // Fetch profile on mount
    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // The hook keeps the existing component API but delegates state to Zustand.
    return {
        profile,
        loading,
        error,
        isEditing,
        setError,
        setIsEditing,
        create: createProfileData,
        update: updateProfileData,
    };
};

export default useProfile;
