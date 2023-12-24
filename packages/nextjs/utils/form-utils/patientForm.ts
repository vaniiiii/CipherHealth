import { resolve } from "path";
import { ZKArtifact, groth16 } from "snarkjs";

export interface IPatientFormData {
  healthRecordId: string;
  commitment: string;
  patientAddress: string;
  doctorAddress: string;
  endTimestamp: string;
  marker: string;
  salt: string;
}

export const generateProof = async (formData: IPatientFormData): Promise<any> => {
  // Use formData to provide input values
  const input = {
    healthRecordId: formData.healthRecordId,
    commitment: formData.commitment,
    patientAddress: formData.patientAddress,
    doctorAddress: formData.doctorAddress,
    endTimestamp: formData.endTimestamp,
    marker: formData.marker,
    salt: formData.salt,
  };
  // Paths to the wasm and zkey files
  const wasmPath: ZKArtifact = resolve(__dirname, "circuit/cipherhealth.wasm");
  const zkeyPath: ZKArtifact = resolve(__dirname, "circuit/cipherhealth.zkey");
  // Generating the proof
  const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);

  // Format the proof for Solidity smart contract call
  const rawcalldata = await groth16.exportSolidityCallData(proof, publicSignals);
  console.log(JSON.parse("[" + rawcalldata + "]"));
  return JSON.parse("[" + rawcalldata + "]");
};
