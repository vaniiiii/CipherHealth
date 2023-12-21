import { buildPoseidon } from "circomlibjs";

export interface IFormData {
  healthRecordId: string;
  patientAddress: string;
  doctorAddress: string;
  endTimestamp: string;
  marker: string;
  salt: string;
}

export const calculateCommitment = async (formData: IFormData): Promise<any> => {
  // Convert string data to numbers
  const healthRecordId = parseInt(formData.healthRecordId, 10);
  const endTimestamp = parseInt(formData.endTimestamp, 10);
  const marker = parseInt(formData.marker, 10);
  const salt = parseInt(formData.salt, 10);

  // Check for invalid inputs (NaN)
  if ([healthRecordId, endTimestamp, marker, salt].some(isNaN)) {
    throw new Error("Invalid input data. Please ensure all inputs are numbers.");
  }

  // Initialize Poseidon
  const poseidon = await buildPoseidon();

  // Calculate Poseidon hash
  const hashBytes = poseidon([healthRecordId, endTimestamp, marker, salt]);
  const hash = poseidon.F.toString(hashBytes);

  // Return the hash
  return hash;
};
