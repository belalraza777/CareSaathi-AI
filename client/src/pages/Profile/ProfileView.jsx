import "./ProfileView.css";

// Display profile information in read-only mode
function ProfileView({ profile }) {
    if (!profile) return null;

    return (
        <div className="profile-view">
            <section className="profile-view-card profile-view-card--highlight">
                <h3>Profile Snapshot</h3>
                <div className="profile-basic-grid">
                    <article className="profile-basic-item">
                        <span>Age</span>
                        <strong>{profile.age || "Not specified"}</strong>
                    </article>
                    <article className="profile-basic-item">
                        <span>Gender</span>
                        <strong>{profile.gender || "Not specified"}</strong>
                    </article>
                </div>
            </section>

            <div className="profile-view-grid">
                <section className="profile-view-card profile-view-card--medical">
                    <h3>Medical History</h3>
                    {profile.medicalHistory?.length > 0 ? (
                        <ul className="profile-chip-list">
                            {profile.medicalHistory.map((item, idx) => (
                                <li key={idx} className="profile-chip profile-chip--medical">{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="profile-empty">No medical history added yet.</p>
                    )}
                </section>

                <section className="profile-view-card profile-view-card--allergies">
                    <h3>Allergies</h3>
                    {profile.allergies?.length > 0 ? (
                        <ul className="profile-chip-list">
                            {profile.allergies.map((item, idx) => (
                                <li key={idx} className="profile-chip profile-chip--allergies">{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="profile-empty">No allergies listed.</p>
                    )}
                </section>

                <section className="profile-view-card profile-view-card--medications">
                    <h3>Medications</h3>
                    {profile.medications?.length > 0 ? (
                        <ul className="profile-chip-list">
                            {profile.medications.map((item, idx) => (
                                <li key={idx} className="profile-chip profile-chip--medications">{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="profile-empty">No medications added.</p>
                    )}
                </section>
            </div>
        </div>
    );
}

export default ProfileView;
