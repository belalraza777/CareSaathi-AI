import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConsultationFormStore } from "../../stores/consultationFormStore";
import "./Consultation.css";

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
    }, [submitConsultation, navigate]);

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
                            <button className="consultation-button" type="button" onClick={addMainSymptom}>Add</button>
                        </div>
                        {consultationForm.mainSymptom.length > 0 && (
                            <ul className="consultation-list">
                                {consultationForm.mainSymptom.map((symptom, index) => (
                                    <li className="consultation-list-item" key={`${symptom}-${index}`}>
                                        <span>{symptom}</span>
                                        <button className="consultation-button" type="button" onClick={() => removeMainSymptom(index)}>✕</button>
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