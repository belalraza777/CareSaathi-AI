import React from "react";

const ConsultationDetails = React.memo(function ConsultationDetails({
    consultationData,
    loadingConsultationData,
    fallbackConsultationId
}) {

    const riskText = consultationData?.riskLevel || "n/a";

    const riskClassName =
        consultationData?.riskLevel === "Mild"
            ? "consultation-risk consultation-risk--mild"
            : consultationData?.riskLevel === "Moderate"
                ? "consultation-risk consultation-risk--moderate"
                : consultationData?.riskLevel === "Critical"
                    ? "consultation-risk consultation-risk--critical"
                    : "consultation-risk";

    return (
        <section className="consultation-card">

            <h3>
                Details
            </h3>

            {loadingConsultationData ? (
                <p>
                    Loading consultation details...
                </p>
            ) : (
                <div className="consultation-detail-grid">

                    <p>
                        <strong>ID:</strong>{" "}
                        {consultationData?.consultationId || fallbackConsultationId || "n/a"}
                    </p>

                    <p>
                        <strong>Age:</strong>{" "}
                        {consultationData?.age || "n/a"} years
                    </p>

                    <p>
                        <strong>Gender:</strong>{" "}
                        {consultationData?.gender || "n/a"}
                    </p>

                    <p>
                        <strong>Height:</strong>{" "}
                        {consultationData?.height
                            ? `${consultationData.height} cm`
                            : "n/a"}
                    </p>

                    <p>
                        <strong>Weight:</strong>{" "}
                        {consultationData?.weight
                            ? `${consultationData.weight} kg`
                            : "n/a"}
                    </p>

                    <p>
                        <strong>Symptoms:</strong>{" "}
                        {consultationData?.mainSymptom?.length
                            ? consultationData.mainSymptom.join(", ")
                            : "n/a"}
                    </p>

                    <p>
                        <strong>Duration:</strong>{" "}
                        {consultationData?.symptomDuration || "n/a"}
                    </p>

                    <p>
                        <strong>Risk:</strong>{" "}
                        <span className={riskClassName}>
                            {riskText}
                        </span>
                    </p>

                    <p>
                        <strong>Severity:</strong>{" "}
                        {consultationData?.severity || "Not assessed"}
                    </p>

                    <p>
                        <strong>Notes:</strong>{" "}
                        {consultationData?.notes?.trim()
                            ? consultationData.notes
                            : "None"}
                    </p>

                    <p>
                        <strong>Created:</strong>{" "}
                        {consultationData?.createdAt
                            ? new Date(consultationData.createdAt).toLocaleString()
                            : "n/a"}
                    </p>

                </div>
            )}

        </section>
    );
});

export default ConsultationDetails;