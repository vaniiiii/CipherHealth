import React, { ChangeEvent, FormEvent, useState } from "react";
import { IFormData, calculateCommitment } from "../utils/form-utils/doctorForm";

// Import the interface and function

const DoctorForm: React.FC = () => {
  const [formData, setFormData] = useState<IFormData>({
    healthRecordId: "",
    patientAddress: "",
    doctorAddress: "",
    endTimestamp: new Date().toISOString().split("T")[0], // Start with current date
    marker: "",
    salt: "",
  });
  const [calculationResult, setCalculationResult] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>("");

  // Function to check if all fields are filled
  const allFieldsFilled = (): boolean => {
    return Object.values(formData).every(field => field.trim() !== "");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Convert the endTimestamp to UNIX timestamp string before submitting
    const submissionData = {
      ...formData,
      endTimestamp: (new Date(formData.endTimestamp).getTime() / 1000).toString(),
    };

    const result = await calculateCommitment(submissionData);
    setCalculationResult(result);
  };

  const handleCopyToClipboard = () => {
    if (calculationResult) {
      navigator.clipboard.writeText(calculationResult).then(
        () => setCopySuccess("Copied!"),
        () => setCopySuccess("Failed to copy"),
      );
    }
  };
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-base-200 rounded-xl shadow-lg my-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Calculate Commitment</h2>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        {/* Numeric fields as text inputs with numeric validation */}
        <input
          className="input input-bordered"
          name="healthRecordId"
          type="text"
          placeholder="Health Record ID"
          value={formData.healthRecordId}
          onChange={handleChange}
        />
        <input
          className="input input-bordered"
          name="patientAddress"
          type="text"
          placeholder="Patient Address"
          value={formData.patientAddress}
          onChange={handleChange}
        />
        <input
          className="input input-bordered"
          name="doctorAddress"
          type="text"
          placeholder="Doctor Address"
          value={formData.doctorAddress}
          onChange={handleChange}
        />
        <input
          className="input input-bordered"
          name="endTimestamp"
          type="date"
          value={formData.endTimestamp}
          onChange={handleChange}
        />
        <input
          className="input input-bordered"
          name="marker"
          type="string"
          placeholder="Marker"
          value={formData.marker}
          onChange={handleChange}
        />
        <input
          className="input input-bordered"
          name="salt"
          type="string"
          placeholder="Salt"
          value={formData.salt}
          onChange={handleChange}
        />
        <button className="btn btn-primary mt-3" type="submit" disabled={!allFieldsFilled()}>
          Calculate Commitment
        </button>
      </form>

      {calculationResult !== null && (
        <div className="mt-4">
          <h3 className="font-bold">Calculation Result:</h3>
          <p style={{ wordWrap: "break-word" }}>{calculationResult}</p>
          <button onClick={handleCopyToClipboard} className="btn btn-secondary mt-2">
            Copy to Clipboard
          </button>
          {copySuccess && <p className="mt-2">{copySuccess}</p>}
        </div>
      )}
    </div>
  );
};

export default DoctorForm;
