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
    endTimestamp: "", // Current date
    marker: "",
    salt: "",
  });

  const [proofData, setProofData] = useState({ _pA: null, _pB: null, _pC: null });
  const [copySuccess, setCopySuccess] = useState<string>("");

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
    };

    const result = await generateProof(submissionData);
    setProofData({
      _pA: result[0],
      _pB: result[1],
      _pC: result[2],
    });
  };

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(data).then(
      () => setCopySuccess("Copied!"),
      () => setCopySuccess("Failed to copy"),
    );
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
          type="string"
          placeholder="Enter UNIX Timestamp"
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

      {proofData._pA || proofData._pB || proofData._pC ? (
        <div
          className="proof-container"
          style={{ padding: "10px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
        >
          {proofData._pA && (
            <div className="proof-section">
              <p>
                _pA:{" "}
                <span className="proof-array" style={{ wordBreak: "break-all" }}>
                  {JSON.stringify(proofData._pA)}
                </span>
              </p>
              <button onClick={() => copyToClipboard(JSON.stringify(proofData._pA))} className="btn btn-secondary mt-2">
                Copy _pA
              </button>
            </div>
          )}
          {proofData._pB && (
            <div className="proof-section">
              <p>
                _pB:{" "}
                <span className="proof-array" style={{ wordBreak: "break-all" }}>
                  {JSON.stringify(proofData._pB)}
                </span>
              </p>
              <button onClick={() => copyToClipboard(JSON.stringify(proofData._pB))} className="btn btn-secondary mt-2">
                Copy _pB
              </button>
            </div>
          )}
          {proofData._pC && (
            <div className="proof-section">
              <p>
                _pC:{" "}
                <span className="proof-array" style={{ wordBreak: "break-all" }}>
                  {JSON.stringify(proofData._pC)}
                </span>
              </p>
              <button onClick={() => copyToClipboard(JSON.stringify(proofData._pC))} className="btn btn-secondary mt-2">
                Copy _pC
              </button>
            </div>
          )}
        </div>
      ) : null}
      {copySuccess && <p className="mt-2">{copySuccess}</p>}
    </div>
  );
};

export default PatientForm;
