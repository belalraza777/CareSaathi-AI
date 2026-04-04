import "./ProfileForm.css";

// Simple array field component
function ArrayField({ label, fieldName, inputValue, onInputChange, onAdd, onRemove, items }) {
    const handleAdd = () => onAdd(fieldName);

    const handleEnterToAdd = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="profile-form__field-group">
            <div className="profile-form__field-head">
                <label>{label}</label>
                <span>{items.length} item(s)</span>
            </div>

            <div className="profile-form__array-input-row">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => onInputChange(e, fieldName)}
                    onKeyDown={handleEnterToAdd}
                    placeholder="Type and click Add"
                />

                <button type="button" className="profile-form__button-ghost" onClick={handleAdd}>
                    Add
                </button>
            </div>

            {items.length > 0 && (
                <ul className="profile-form__chip-list">
                    {items.map((item, idx) => (
                        <li key={idx} className="profile-form__chip-item">
                            <span>{item}</span>
                            <button
                                type="button"
                                className="profile-form__chip-remove"
                                onClick={() => onRemove(fieldName, idx)}
                                aria-label={`Remove ${item}`}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Form component for creating/editing profile
function ProfileForm({
    profile,
    formData,
    tempInput,
    error,
    onInputChange,
    onArrayInputChange,
    onAddArrayItem,
    onRemoveArrayItem,
    onSubmit,
    onCancel,
}) {
    return (
        <form onSubmit={onSubmit} className="profile-form">
            <div className="profile-form__header">
                <h2>{profile ? "Edit Profile" : "Create Profile"}</h2>
                <p>These details help your consultations stay accurate and personalized.</p>
            </div>

            {error && <p className="profile-form__error">{error}</p>}

            <section className="profile-form__card">
                <h3>Basic Details</h3>
                <div className="profile-form__grid">
                    <div className="profile-form__field-group">
                        <label>Age</label>
                        <input
                            type="number"
                            name="age"
                            min="0"
                            max="120"
                            value={formData.age}
                            onChange={onInputChange}
                            placeholder="Enter age"
                        />
                    </div>

                    <div className="profile-form__field-group">
                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={onInputChange}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="profile-form__card">
                <h3>Health Notes</h3>

                <ArrayField
                    label="Medical History"
                    fieldName="medicalHistory"
                    inputValue={tempInput.medicalHistory}
                    onInputChange={onArrayInputChange}
                    onAdd={onAddArrayItem}
                    onRemove={onRemoveArrayItem}
                    items={formData.medicalHistory}
                />

                <ArrayField
                    label="Allergies"
                    fieldName="allergies"
                    inputValue={tempInput.allergies}
                    onInputChange={onArrayInputChange}
                    onAdd={onAddArrayItem}
                    onRemove={onRemoveArrayItem}
                    items={formData.allergies}
                />

                <ArrayField
                    label="Medications"
                    fieldName="medications"
                    inputValue={tempInput.medications}
                    onInputChange={onArrayInputChange}
                    onAdd={onAddArrayItem}
                    onRemove={onRemoveArrayItem}
                    items={formData.medications}
                />
            </section>

            <div className="profile-form__actions">
                <button type="submit" className="profile-form__button-primary">
                    {profile ? "Save Changes" : "Create Profile"}
                </button>

                {profile && (
                    <button type="button" className="profile-form__button-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

export default ProfileForm;
