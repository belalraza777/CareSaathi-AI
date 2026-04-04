import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConsultationFormStore } from "../../stores/consultationFormStore";
import "./NewConsultation.css";

function NewConsultation() {
    const navigate = useNavigate();
    const consultationForm = useConsultationFormStore((state) => state.consultationForm);
    const loadingCreate = useConsultationFormStore((state) => state.loadingCreate);
    const error = useConsultationFormStore((state) => state.error);
    const setField = useConsultationFormStore((state) => state.setField);
    const addMainSymptom = useConsultationFormStore((state) => state.addMainSymptom);
    const removeMainSymptom = useConsultationFormStore((state) => state.removeMainSymptom);
    const submitConsultation = useConsultationFormStore((state) => state.submitConsultation);
    const clearFormState = useConsultationFormStore((state) => state.clearFormState);

    // Handles all consultation form field updates through one state object.
    const handleConsultationInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setField(name, value);
    }, [setField]);

    // Keep submit callback stable and only recalculate when payload actually changes.
    const handleCreateConsultation = useCallback(async (e) => {
        e.preventDefault();
        const result = await submitConsultation();
        if (result.success) {
            clearFormState();
            // Redirect newly created consultations to the dedicated chat page.
            navigate(`/consultation/chat/${result.data?.consultationId || ""}`);
        }
    }, [submitConsultation, clearFormState, navigate]);

    return (
        <div className="consultation-page">
            <h2>Consultation</h2>

            {error && <p className="consultation-error">{error}</p>}

            <section className="consultation-card">
                <h2>Start New Consultation</h2>
                <form onSubmit={handleCreateConsultation}>
                    <div className="consultation-field">
                        <label htmlFor="mainSymptom">Main symptoms</label>
                        <div className="consultation-row">
                            <input
                                className="consultation-input"
                                id="mainSymptom"
                                name="mainSymptomInput"
                                type="text"
                                value={consultationForm.mainSymptomInput}
                                onChange={handleConsultationInputChange}
                                placeholder="Type symptom and click Add"
                            />
                            <button
                                className="consultation-button consultation-button--ghost consultation-button--sm"
                                type="button"
                                onClick={addMainSymptom}
                            >
                                Add
                            </button>
                        </div>
                        {consultationForm.mainSymptom.length > 0 && (
                            <ul className="consultation-list">
                                {consultationForm.mainSymptom.map((symptom, index) => (
                                    <li className="consultation-list-item" key={`${symptom}-${index}`}>
                                        <span>{symptom}</span>
                                        <button
                                            className="consultation-button consultation-button--danger-ghost consultation-button--sm"
                                            type="button"
                                            onClick={() => removeMainSymptom(index)}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="consultation-field">
                        <label htmlFor="symptomDuration">Symptom duration</label>
                        <input
                            className="consultation-input"
                            id="symptomDuration"
                            name="symptomDuration"
                            type="text"
                            value={consultationForm.symptomDuration}
                            onChange={handleConsultationInputChange}
                            placeholder="e.g. 2 days"
                        />
                    </div>

                    <div className="consultation-field">
                        <label htmlFor="gender">Gender</label>
                        <select
                            className="consultation-input"
                            id="gender"
                            name="gender"
                            value={consultationForm.gender}
                            onChange={handleConsultationInputChange}
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="consultation-field">
                        <label htmlFor="age">Age</label>
                        <input
                            className="consultation-input"
                            id="age"
                            name="age"
                            type="number"
                            min="0"
                            max="120"
                            value={consultationForm.age}
                            onChange={handleConsultationInputChange}
                            placeholder="e.g. 28"
                        />
                    </div>

                    <div className="consultation-field">
                        <label htmlFor="height">Height (cm)</label>
                        <input
                            className="consultation-input"
                            id="height"
                            name="height"
                            type="number"
                            min="30"
                            max="300"
                            value={consultationForm.height}
                            onChange={handleConsultationInputChange}
                            placeholder="e.g. 170"
                        />
                    </div>

                    <div className="consultation-field">
                        <label htmlFor="weight">Weight (kg)</label>
                        <input
                            className="consultation-input"
                            id="weight"
                            name="weight"
                            type="number"
                            min="1"
                            max="500"
                            value={consultationForm.weight}
                            onChange={handleConsultationInputChange}
                            placeholder="e.g. 65"
                        />
                    </div>

                    <div className="consultation-field">
                        <label htmlFor="notes">Notes</label>
                        <textarea
                            className="consultation-textarea"
                            id="notes"
                            name="notes"
                            value={consultationForm.notes}
                            onChange={handleConsultationInputChange}
                            placeholder="Any extra details"
                        />
                    </div>

                    <button className="consultation-button" type="submit" disabled={loadingCreate}>
                        {loadingCreate ? "Starting..." : "Start Consultation"}
                    </button>
                </form>
            </section>
        </div>
    );
}

export default NewConsultation;