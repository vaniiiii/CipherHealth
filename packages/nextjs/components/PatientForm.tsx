import React, { ChangeEvent, FormEvent, useState } from "react";
import { generateProof } from "../utils/form-utils/patientForm";

export interface IPatientFormData {
  healthRecordId: string;
  commitment: string;
  patientAddress: string;
  doctorAddress: string;
  endTimestamp: string;
  marker: string;
  salt: string;
}

const PatientForm: React.FC = () => {
  const [formData, setFormData] = useState<IPatientFormData>({
    healthRecordId: "",
    commitment: "",
    patientAddress: "",
    doctorAddress: "",
    endTimestamp: new Date().toISOString().split("T")[0], // Current date
    marker: "",
    salt: "",
  });
  const [proofResult, setProofResult] = useState<string | null>(null);

  const allFieldsFilled = (): boolean => {
    return Object.values(formData).every(field => field.trim() !== "");
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Convert endTimestamp to UNIX timestamp string
    const submissionData = {
      ...formData,
      endTimestamp: (new Date(formData.endTimestamp).getTime() / 1000).toString(),
    };

    const result = await generateProof(submissionData);
    setProofResult(result);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-base-200 rounded-xl shadow-lg my-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Generate Health Record Proof</h2>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
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
          name="commitment"
          type="text"
          placeholder="Commitment"
          value={formData.commitment}
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
          Generate Proof
        </button>
      </form>

      {proofResult !== null && (
        <div className="mt-4">
          <h3 className="font-bold">Proof Result:</h3>
          <p style={{ wordWrap: "break-word" }}>{proofResult}</p>
        </div>
      )}
    </div>
  );
};

export default PatientForm;
