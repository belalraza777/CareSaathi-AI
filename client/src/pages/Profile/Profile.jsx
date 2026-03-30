import useProfile from "./useProfile";
import useProfileForm from "./useProfileForm";
import ProfileView from "./ProfileView";
import ProfileForm from "./ProfileForm";

function Profile() {
    const { profile, loading, error, isEditing, setIsEditing, create, update } = useProfile();
    const { formData, tempInput, handleInputChange, handleArrayInputChange, addArrayItem, removeArrayItem } = useProfileForm(profile);

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare data
        const data = {
            age: formData.age ? parseInt(formData.age) : undefined,
            gender: formData.gender || undefined,
            medicalHistory: formData.medicalHistory.length > 0 ? formData.medicalHistory : undefined,
            allergies: formData.allergies.length > 0 ? formData.allergies : undefined,
            medications: formData.medications.length > 0 ? formData.medications : undefined,
        };

        // Remove undefined values
        Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

        // Call API
        const result = profile ? await update(data) : await create(data);
        if (result.success) {
            setIsEditing(false);
        }
    };

    if (loading) return <div><p>Loading...</p></div>;

    return (
        <div>
            <h2>My Profile</h2>

            {error && !isEditing && <div style={{ color: "red" }}>{error}</div>}

            {!isEditing && profile && <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />}

            {(isEditing || !profile) && (
                <ProfileForm
                    profile={profile}
                    formData={formData}
                    tempInput={tempInput}
                    error={error}
                    onInputChange={handleInputChange}
                    onArrayInputChange={handleArrayInputChange}
                    onAddArrayItem={addArrayItem}
                    onRemoveArrayItem={removeArrayItem}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsEditing(false)}
                />
            )}
        </div>
    );
}

export default Profile;

