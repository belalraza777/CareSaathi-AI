import { useEffect, useMemo } from "react";
import { useAuth } from "../../context/authContext";
import useProfile from "./useProfile";
import useProfileForm from "./useProfileForm";
import ProfileView from "./ProfileView";
import ProfileForm from "./ProfileForm";
import "./Profile.css";

function Profile() {
    const { user } = useAuth();
    const { profile, loading, error, isEditing, setIsEditing, create, update } = useProfile();
    const { formData, tempInput, handleInputChange, handleArrayInputChange, addArrayItem, removeArrayItem } = useProfileForm(profile);

    const displayName = profile?.user?.name || user?.name || "Not available";
    const displayEmail = profile?.user?.email || user?.email || "Not available";

    const completionStats = useMemo(() => {
        const fields = [
            Boolean(profile?.age),
            Boolean(profile?.gender),
            Boolean(profile?.medicalHistory?.length),
            Boolean(profile?.allergies?.length),
            Boolean(profile?.medications?.length),
        ];

        const completed = fields.filter(Boolean).length;
        const total = fields.length;
        return {
            completed,
            total,
            percentage: Math.round((completed / total) * 100),
        };
    }, [profile]);

    const closeFormModal = () => setIsEditing(false);

    useEffect(() => {
        if (!isEditing) {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isEditing]);

    useEffect(() => {
        if (!isEditing) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsEditing(false);
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isEditing, setIsEditing]);

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

    if (loading) {
        return (
            <main className="profile-page">
                <section className="profile-hero profile-hero--loading">
                    <h2>My Profile</h2>
                    <p>Loading your health details...</p>
                </section>

                <section className="profile-loading-card" aria-hidden="true">
                    <div className="profile-skeleton profile-skeleton--line" />
                    <div className="profile-skeleton profile-skeleton--line profile-skeleton--line-mid" />
                    <div className="profile-skeleton profile-skeleton--block" />
                </section>
            </main>
        );
    }

    return (
        <main className="profile-page">
            <section className="profile-hero">
                <div>
                    <h2>My Profile</h2>
                    <p>Keep personal health details updated for better and faster consultations.</p>
                </div>

                <div className="profile-hero__actions">
                    {/* Keep one consistent primary action in the hero across read and edit states. */}
                    <button
                        type="button"
                        className="profile-hero__button"
                        onClick={() => setIsEditing(true)}
                    >
                        {profile ? "Edit profile" : "Create profile"}
                    </button>

                    <span className="profile-hero__pill">
                        {profile ? `${completionStats.percentage}% complete` : "Profile not created"}
                    </span>
                </div>
            </section>

            <section className="profile-account-card profile-account-card--identity">
                {/* Keep account identity visible in both profile view and edit modes. */}
                <h3>Account Identity</h3>
                <div className="profile-account-grid">
                    <article className="profile-account-item">
                        <span>Name</span>
                        <strong>{displayName}</strong>
                    </article>
                    <article className="profile-account-item">
                        <span>Email</span>
                        <strong>{displayEmail}</strong>
                    </article>
                </div>
            </section>

            {profile && !isEditing ? (
                <>
                    <section className="profile-overview-card">
                        <div className="profile-overview-card__head">
                            {/* Keep health details visually separated from account identity details. */}
                            <h3>Health Profile Overview</h3>
                            <p>Clinical information used for better consultation responses.</p>
                        </div>

                        <div className="profile-stats-grid">
                            <article className="profile-stat-card">
                                <span className="profile-stat-card__label">Completion</span>
                                <strong className="profile-stat-card__value">{completionStats.completed}/{completionStats.total}</strong>
                            </article>

                            <article className="profile-stat-card">
                                <span className="profile-stat-card__label">Medical History</span>
                                <strong className="profile-stat-card__value">{profile.medicalHistory?.length || 0} items</strong>
                            </article>

                            <article className="profile-stat-card">
                                <span className="profile-stat-card__label">Active Medications</span>
                                <strong className="profile-stat-card__value">{profile.medications?.length || 0} items</strong>
                            </article>
                        </div>
                    </section>
                </>
            ) : null}

            {!profile && !isEditing ? (
                <section className="profile-empty-state">
                    <h3>Start Your Health Profile</h3>
                    <p>Add your age, history, allergies, and medications for better consultation responses.</p>
                    <button
                        type="button"
                        className="profile-empty-state__button"
                        onClick={() => setIsEditing(true)}
                    >
                        Create profile
                    </button>
                </section>
            ) : null}

            {error && !isEditing && profile && <p className="profile-page__error">{error}</p>}

            {!isEditing && profile && <ProfileView profile={profile} />}

            {isEditing && (
                <div
                    className="profile-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="profile-form-title"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeFormModal();
                        }
                    }}
                >
                    <div className="profile-modal__content">
                        <button
                            type="button"
                            className="profile-modal__close"
                            onClick={closeFormModal}
                            aria-label="Close profile form"
                        >
                            Close
                        </button>

                        <ProfileForm
                            headingId="profile-form-title"
                            profile={profile}
                            formData={formData}
                            tempInput={tempInput}
                            error={error}
                            onInputChange={handleInputChange}
                            onArrayInputChange={handleArrayInputChange}
                            onAddArrayItem={addArrayItem}
                            onRemoveArrayItem={removeArrayItem}
                            onSubmit={handleSubmit}
                            onCancel={closeFormModal}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

export default Profile;

