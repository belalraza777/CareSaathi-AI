import { useEffect } from "react";
import { useProfileStore } from "../../stores/profileStore";

const useProfileForm = (initialProfile) => {
    const formData = useProfileStore((state) => state.formData);
    const tempInput = useProfileStore((state) => state.tempInput);
    const syncFormFromProfile = useProfileStore((state) => state.syncFormFromProfile);
    const handleInputChange = useProfileStore((state) => state.handleInputChange);
    const handleArrayInputChange = useProfileStore((state) => state.handleArrayInputChange);
    const addArrayItem = useProfileStore((state) => state.addArrayItem);
    const removeArrayItem = useProfileStore((state) => state.removeArrayItem);

    // Sync form whenever a different profile record is loaded.
    useEffect(() => {
        syncFormFromProfile(initialProfile);
    }, [initialProfile, syncFormFromProfile]);

    return {
        formData,
        tempInput,
        handleInputChange,
        handleArrayInputChange,
        addArrayItem,
        removeArrayItem,
    };
};

export default useProfileForm;
