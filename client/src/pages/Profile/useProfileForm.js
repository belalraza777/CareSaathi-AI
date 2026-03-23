import { useState } from "react";

const useProfileForm = (initialProfile) => {
    // Main form data - what will be saved
    const [formData, setFormData] = useState({
        age: initialProfile?.age || "",
        gender: initialProfile?.gender || "",
        medicalHistory: initialProfile?.medicalHistory || [],
        allergies: initialProfile?.allergies || [],
        medications: initialProfile?.medications || [],
    });

    // Temporary input fields - what user is currently typing (not added to list yet)
    // Example: user types "Diabetes" but hasn't clicked "Add" yet
    const [tempInput, setTempInput] = useState({
        medicalHistory: "",
        allergies: "",
        medications: "",
    });

    // When user types in input field
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // When user types in array input field (before clicking Add)
    const handleArrayInputChange = (e, field) => {
        const inputValue = e.target.value;
        setTempInput((prev) => ({ ...prev, [field]: inputValue }));
    };

    // When user clicks "Add" button - move from temp input to actual array
    const addArrayItem = (field) => {
        const value = tempInput[field].trim();
        if (value) {
            // Add to medical history/allergies/medications list
            setFormData((prev) => ({
                ...prev,
                [field]: [...prev[field], value],
            }));
            // Clear the temp input after adding
            setTempInput((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // Remove item from array when user clicks delete button
    const removeArrayItem = (field, index) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

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
