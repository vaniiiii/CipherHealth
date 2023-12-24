import { buildPoseidon } from "circomlibjs";
import { ZKArtifact, groth16 } from "snarkjs";
import { resolve } from "path";
import { CipherHealth } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HealthRecordNFT } from "../../typechain-types/contracts/HealthRecord.sol";

async function calculateCommitment(
  cipherHealth: CipherHealth,
  patientAddress: SignerWithAddress,
  doctorAddress: SignerWithAddress,
  healthRecordNFT: HealthRecordNFT,
  endTimestamp: number,
  marker: string,
  salt: string,
) {
  // Create a health record
  const healthRecordId = await cipherHealth.getHealthRecordCount();

  // Initialize Poseidon
  const poseidon = await buildPoseidon();
  // Calculate Poseidon hash/commitment
  const commitmentBytes = poseidon([
    healthRecordId,
    patientAddress.address,
    doctorAddress.address,
    endTimestamp,
    marker,
    salt,
  ]);
  const commitment = poseidon.F.toString(commitmentBytes);

  return { commitment };
}

/*
leaving it here for future reference if needed
https://github.com/TheBojda/zk-merkle-tree/blob/main/src/zktree.ts#L136

function convertCallData(calldata: string) {
  const argv = calldata
    .replace(/["[\]\s]/g, "")
    .split(",")
    .map(x => BigNumber.from(x).toString());

  const a = [argv[0], argv[1]] as [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ] as [
      [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>],
      [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>],
    ];
  const c = [argv[6], argv[7]] as [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>];
  const input = [argv[8], argv[9]] as [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>];

  return { a, b, c, input };
}
*/

async function generateProofAndCalldata(
  cipherHealth: CipherHealth,
  healthRecordId: number,
  patientAddress: SignerWithAddress,
  doctorAddress: SignerWithAddress,
  healthRecordNFT: HealthRecordNFT,
  endTimestamp: number,
) {
  const marker = "100";
  const salt = "100";

  const { commitment } = await calculateCommitment(
    cipherHealth,
    patientAddress,
    doctorAddress,
    healthRecordNFT,
    endTimestamp,
    marker,
    salt,
  );

  await cipherHealth.setHealthRecordNFTAddress(healthRecordNFT.address);
  await cipherHealth.connect(doctorAddress).addHealthRecord(commitment, patientAddress.address, endTimestamp);
  // input for circuit
  const input = {
    healthRecordId: healthRecordId.toString(),
    commitment: commitment,
    patientAddress: patientAddress.address,
    doctorAddress: doctorAddress.address,
    endTimestamp: endTimestamp,
    marker: marker,
    salt: salt,
  };

  // Paths to the wasm and zkey files
  const wasmPath: ZKArtifact = resolve(__dirname, "../../../nextjs/public/circuit/cipherhealth.wasm");
  const zkeyPath: ZKArtifact = resolve(__dirname, "../../../nextjs/public/circuit/cipherhealth.zkey");
  // Generating the proof
  const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);
  // Format the proof for Solidity smart contract call
  const rawcalldata = await groth16.exportSolidityCallData(proof, publicSignals);
  const calldata = JSON.parse("[" + rawcalldata + "]");

  return { calldata };
}

export { generateProofAndCalldata };
