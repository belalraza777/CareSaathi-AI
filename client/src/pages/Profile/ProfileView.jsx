// Display profile information in read-only mode
function ProfileView({ profile, onEdit }) {
    if (!profile) return null;

    return (
        <div>
            <h2>Profile Information</h2>

            <div>
                <h3>Basic Info</h3>
                <p><strong>Age:</strong> {profile.age || "Not specified"}</p>
                <p><strong>Gender:</strong> {profile.gender || "Not specified"}</p>
            </div>

            <div>
                <h3>Medical History</h3>
                {profile.medicalHistory?.length > 0 ? (
                    <ul>
                        {profile.medicalHistory.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                ) : (
                    <p>None</p>
                )}
            </div>

            <div>
                <h3>Allergies</h3>
                {profile.allergies?.length > 0 ? (
                    <ul>
                        {profile.allergies.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                ) : (
                    <p>None</p>
                )}
            </div>

            <div>
                <h3>Medications</h3>
                {profile.medications?.length > 0 ? (
                    <ul>
                        {profile.medications.map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                ) : (
                    <p>None</p>
                )}
            </div>

            <button onClick={onEdit}>Edit Profile</button>
        </div>
    );
}

export default ProfileView;
