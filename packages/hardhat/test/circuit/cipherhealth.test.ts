import * as hre from "hardhat";
import { assert, expect } from "chai";
import { ZKArtifact, groth16 } from "snarkjs";
import { Verifier } from "../../typechain-types";
import { CircuitTestUtils } from "hardhat-circom";
import { resolve } from "path";

const ethers = hre.ethers;

describe("cipherhealth circuit", () => {
  let circuit: CircuitTestUtils;

  const sampleInput = {
    healthRecordId: "0",
    commitment: "10422485148533736140502856433020574708126974884107362425003492141168368230646",
    patientAddress: "0x037483D1c95A96DF1A2092a9E61e0972d6F0c377",
    doctorAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    endTimestamp: "1703289600",
    marker: "100",
    salt: "100",
  };
  const sanityCheck = true;

  before(async () => {
    circuit = await hre.circuitTest.setup("cipherhealth");
  });

  describe("circuit tests", () => {
    it("produces a witness with valid constraints", async () => {
      const witness = await circuit.calculateWitness(sampleInput, sanityCheck);
      await circuit.checkConstraints(witness);
    });

    it("has expected witness values", async () => {
      const witness = await circuit.calculateLabeledWitness(sampleInput, sanityCheck);
      assert.propertyVal(witness, "main.healthRecordId", sampleInput.healthRecordId);
      assert.propertyVal(witness, "main.patientAddress", BigInt(sampleInput.patientAddress).toString());
      assert.propertyVal(witness, "main.doctorAddress", BigInt(sampleInput.doctorAddress).toString());
      assert.propertyVal(witness, "main.endTimestamp", sampleInput.endTimestamp);
      assert.propertyVal(witness, "main.marker", sampleInput.marker);
      assert.propertyVal(witness, "main.salt", sampleInput.salt);
    });

    it("fails if the input is wrong", async () => {
      await expect(
        circuit.calculateWitness(
          {
            healthRecordId: "0",
            commitment: "10422485148533736140502856433020574708126974884107362425003492141168368230646",
            pacientAddress: "0x037483D1c95A96DF1A2092a9E61e0972d6F0c377",
            doctorAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            endTimestamp: "1703289600",
            marker: "777",
            salt: "100",
          },
          sanityCheck,
        ),
      ).to.be.rejectedWith(Error);
    });
  });

  describe("verifier tests", () => {
    let verifier: Verifier;
    let jsonCalldata: any;

    beforeEach(async () => {
      // Create and deploy the Verifier contract
      const VerifierFactory = await ethers.getContractFactory("Verifier");
      verifier = (await VerifierFactory.deploy()) as Verifier;
      await verifier.deployed();

      // Paths to the wasm and zkey files
      const wasmPath: ZKArtifact = resolve(__dirname, "../../../nextjs/public/circuit/cipherhealth.wasm");
      const zkeyPath: ZKArtifact = resolve(__dirname, "../../../nextjs/public/circuit/cipherhealth.zkey");
      // Generate the proof using snarkjs
      const { proof, publicSignals } = await groth16.fullProve(sampleInput, wasmPath, zkeyPath);
      // Construct the raw calldata to be sent to the verifier contract
      const rawcalldata = await groth16.exportSolidityCallData(proof, publicSignals);
      jsonCalldata = JSON.parse("[" + rawcalldata + "]");
    });

    it("proves the proof", async () => {
      assert.isTrue(await verifier.verifyProof(jsonCalldata[0], jsonCalldata[1], jsonCalldata[2], jsonCalldata[3]));
    });

    it("fails to prove if the public signals are wrong", async () => {
      // wrong public signals
      jsonCalldata[3] = [
        "0x0000000000000000000000000000000000000000000000000000000000000001", // healthRecordId = 1 instead of 0
        "0x170aeae42f13d514a06bc1538bfcee50a469fac3695deb9869379bae2fbb20f6",
        "0x000000000000000000000000037483d1c95a96df1a2092a9e61e0972d6f0c377",
        "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "0x0000000000000000000000000000000000000000000000000000000065862300",
      ];
      assert.isFalse(await verifier.verifyProof(jsonCalldata[0], jsonCalldata[1], jsonCalldata[2], jsonCalldata[3]));
    });
  });
});
