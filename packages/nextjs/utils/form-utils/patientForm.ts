import { buildPoseidon } from "circomlibjs";

export interface IPatientFormData {
  healthRecordId: string;
  commitment: string;
  patientAddress: string;
  doctorAddress: string;
  endTimestamp: string;
  marker: string;
  salt: string;
}

export const calculateProof = async (formData: IPatientFormData): Promise<any> => {
  // Convert string data to numbers where necessary
  const healthRecordId = parseInt(formData.healthRecordId, 10);
  const commitment = parseInt(formData.commitment, 10); // Assuming commitment is a number
  const endTimestamp = parseInt(formData.endTimestamp, 10);
  const marker = parseInt(formData.marker, 10);
  const salt = parseInt(formData.salt, 10);

  // Check for invalid inputs (NaN)
  if ([healthRecordId, commitment, endTimestamp, marker, salt].some(isNaN)) {
    throw new Error("Invalid input data. Please ensure all inputs are numbers.");
  }

  // Initialize Poseidon
  const poseidon = await buildPoseidon();

  // Calculate Poseidon hash (or any other logic for proof generation)
  const hashBytes = poseidon([healthRecordId, commitment, endTimestamp, marker, salt]);
  const hash = poseidon.F.toString(hashBytes);

  // Return the proof result
  return hash;
};
