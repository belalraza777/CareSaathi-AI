// Simple array field component
function ArrayField({ label, fieldName, value, inputValue, onInputChange, onAdd, onRemove, items }) {
    return (
        <div>
            <label>{label}</label>
            <div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => onInputChange(e, fieldName)}
                    placeholder={`Type and click Add...`}
                />
                <button type="button" onClick={() => onAdd(fieldName)}>Add</button>
            </div>
            {items.length > 0 && (
                <ul>
                    {items.map((item, idx) => (
                        <li key={idx}>
                            {item}
                            <button type="button" onClick={() => onRemove(fieldName, idx)}>✕</button>
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
        <form onSubmit={onSubmit}>
            <h2>{profile ? "Edit Profile" : "Create Profile"}</h2>
            {error && <div style={{ color: "red" }}>{error}</div>}

            <div>
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

            <div>
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={onInputChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>

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

            <div>
                <button type="submit">{profile ? "Update" : "Create"}</button>
                {profile && <button type="button" onClick={onCancel}>Cancel</button>}
            </div>
        </form>
    );
}

export default ProfileForm;
