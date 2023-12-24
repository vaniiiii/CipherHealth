import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { CipherHealth, Verifier, HealthRecordNFT } from "../typechain-types";
import { generateProofAndCalldata } from "./fixture/generateProofAndCalldata";

describe("CipherHealth", function () {
  // We define a fixture to reuse the same setup in every test.
  let cipherHealth: CipherHealth;
  let verifier: Verifier;
  let healthRecordNFT: HealthRecordNFT;

  let deployer: SignerWithAddress;
  let doctorAddress: SignerWithAddress;
  let operatorAddress: SignerWithAddress;
  let patientAddress: SignerWithAddress;
  let testAddress: SignerWithAddress;
  let newDoctorAddress: SignerWithAddress;
  let newOperatorAddress: SignerWithAddress;

  beforeEach(async () => {
    [deployer, doctorAddress, operatorAddress, patientAddress, testAddress, newDoctorAddress, newOperatorAddress] =
      await ethers.getSigners();
    const verifierFactory = await ethers.getContractFactory("Verifier");

    const cipherHealthFactory = await ethers.getContractFactory("CipherHealth");
    const HealthRecordNFTFactory = await ethers.getContractFactory("HealthRecordNFT");

    verifier = (await verifierFactory.deploy()) as Verifier;
    await verifier.deployed();

    cipherHealth = (await cipherHealthFactory.deploy(verifier.address)) as CipherHealth;
    await cipherHealth.deployed();

    healthRecordNFT = (await HealthRecordNFTFactory.deploy(cipherHealth.address)) as HealthRecordNFT;
    await healthRecordNFT.deployed();

    await cipherHealth.registerDoctor(doctorAddress.address);
    await cipherHealth.registerOperator(operatorAddress.address);
  });

  describe("Deployment", function () {
    describe("success", function () {
      it("Should have right parameters on deploy", async function () {
        expect(await cipherHealth.verifier()).to.equal(verifier.address);
        expect(await cipherHealth.owner()).to.equal(deployer.address);
      });
    });
    describe("failure", function () {
      it("Should fail to deploy if verifier address is zero address", async function () {
        const cipherHealthFactory = await ethers.getContractFactory("CipherHealth");
        await expect(cipherHealthFactory.deploy(ethers.constants.AddressZero)).to.be.to.be.revertedWithCustomError(
          cipherHealth,
          "CipherHealth__ZeroAddress",
        );
      });
    });
  });

  describe("registerDoctor", function () {
    describe("success", function () {
      it("Should register a doctor if caller is owner", async function () {
        const valueBefore = await cipherHealth.verifiedDoctors(newDoctorAddress.address);
        expect(valueBefore).to.equal(false);

        await cipherHealth.registerDoctor(newDoctorAddress.address);

        const valueAfter = await cipherHealth.verifiedDoctors(newDoctorAddress.address);
        expect(valueAfter).to.equal(true);
      });
      it("Should register a doctor if caller is operator", async function () {
        const valueBefore = await cipherHealth.verifiedDoctors(newDoctorAddress.address);
        expect(valueBefore).to.equal(false);

        await cipherHealth.connect(operatorAddress).registerDoctor(newDoctorAddress.address);

        const valueAfter = await cipherHealth.verifiedDoctors(newDoctorAddress.address);
        expect(valueAfter).to.equal(true);
      });
      it("Should emit DoctorRegistered event", async function () {
        await expect(cipherHealth.registerDoctor(newDoctorAddress.address))
          .to.emit(cipherHealth, "DoctorRegistered")
          .withArgs(newDoctorAddress.address);
      });
    });
    describe("failure", function () {
      it("Should fail to register a doctor if caller is not owner or operator", async function () {
        await expect(
          cipherHealth.connect(testAddress).registerDoctor(newDoctorAddress.address),
        ).to.be.to.be.revertedWithCustomError(cipherHealth, "CipherHealth__NotAuthorizedForAddingDoctors");
      });
      it("Should fail to register a doctor if doctor address is zero address", async function () {
        await expect(cipherHealth.registerDoctor(ethers.constants.AddressZero)).to.be.to.be.revertedWithCustomError(
          cipherHealth,
          "CipherHealth__ZeroAddress",
        );
      });
      it("Should fail to register a doctor if doctor address is already registered", async function () {
        await expect(cipherHealth.registerDoctor(doctorAddress.address)).to.be.to.be.revertedWithCustomError(
          cipherHealth,
          "CipherHealth__DoctorAlreadyRegistered",
        );
      });
    });
  });

  describe("registerOperator", function () {
    describe("success", function () {
      it("Should register an operator", async function () {
        const valueBefore = await cipherHealth.operators(newOperatorAddress.address);
        expect(valueBefore).to.equal(false);

        await cipherHealth.registerOperator(newOperatorAddress.address);

        const valueAfter = await cipherHealth.operators(newOperatorAddress.address);
        expect(valueAfter).to.equal(true);
      });
      it("Should emit OperatorRegistered event", async function () {
        await expect(cipherHealth.registerOperator(newOperatorAddress.address))
          .to.emit(cipherHealth, "OperatorRegistered")
          .withArgs(newOperatorAddress.address);
      });
    });
    describe("failure", function () {
      it("Should fail to register an operator if caller is not owner", async function () {
        await expect(
          cipherHealth.connect(testAddress).registerOperator(newOperatorAddress.address),
        ).to.be.to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("Should fail to register an operator if operator address is zero address", async function () {
        await expect(cipherHealth.registerOperator(ethers.constants.AddressZero)).to.be.to.be.revertedWithCustomError(
          cipherHealth,
          "CipherHealth__ZeroAddress",
        );
      });
      it("Should fail to register an operator if operator address is already registered", async function () {
        await expect(cipherHealth.registerOperator(operatorAddress.address)).to.be.to.be.revertedWithCustomError(
          cipherHealth,
          "CipherHealth__OperatorAlreadyRegistered",
        );
      });
    });
  });

  describe("addHealthRecord", function () {
    describe("success", function () {
      it("Should add a health record", async function () {
        const healthRecordCountBefore = await cipherHealth.getHealthRecordCount();
        const commitment = BigInt("10422485148533736140502856433020574708126974884107362425003492141168368230646");
        const endTimestamp = (await time.latest()) + 1;

        await cipherHealth.connect(doctorAddress).addHealthRecord(commitment, patientAddress.address, endTimestamp);

        const healthRecordCountAfter = await cipherHealth.getHealthRecordCount();
        const healthRecord = await cipherHealth.healthRecords(healthRecordCountBefore);

        expect(healthRecordCountAfter).to.equal(healthRecordCountBefore + 1);
        expect(healthRecord.commitment).to.equal(commitment);
        expect(healthRecord.patientAddress).to.equal(patientAddress.address);
        expect(healthRecord.doctorAddress).to.equal(doctorAddress.address);
        expect(healthRecord.endTimestamp).to.equal(endTimestamp);
      });
      it("Should emit HealthRecordAdded event", async function () {
        const healthRecordId = await cipherHealth.getHealthRecordCount();

        const commitment = BigInt("10422485148533736140502856433020574708126974884107362425003492141168368230646");
        const endTimestamp = (await time.latest()) + 1;
        await expect(
          cipherHealth.connect(doctorAddress).addHealthRecord(commitment, patientAddress.address, endTimestamp),
        )
          .to.emit(cipherHealth, "HealthRecordAdded")
          .withArgs(healthRecordId, commitment, patientAddress.address, doctorAddress.address, endTimestamp);
      });
    });
    describe("failure", function () {
      it("Should fail to add a health record if caller is not doctor", async function () {
        const commitment = BigInt("10422485148533736140502856433020574708126974884107362425003492141168368230646");
        const endTimestamp = (await time.latest()) + 1;
        await expect(
          cipherHealth.connect(testAddress).addHealthRecord(commitment, patientAddress.address, endTimestamp),
        ).to.be.to.be.revertedWithCustomError(cipherHealth, "CipherHealth__NotAuthorizedForAddingHealthRecords");
      });
      it("Should fail to add a health record if patient address is zero address", async function () {
        const commitment = BigInt("10422485148533736140502856433020574708126974884107362425003492141168368230646");
        const endTimestamp = (await time.latest()) + 1;
        await expect(
          cipherHealth.connect(doctorAddress).addHealthRecord(commitment, ethers.constants.AddressZero, endTimestamp),
        ).to.be.to.be.revertedWithCustomError(cipherHealth, "CipherHealth__ZeroAddress");
      });
      it("Should fail to add a health record if endTimestamp is in past", async function () {
        const commitment = BigInt("10422485148533736140502856433020574708126974884107362425003492141168368230646");
        const endTimestamp = (await time.latest()) - 1;
        await expect(
          cipherHealth.connect(doctorAddress).addHealthRecord(commitment, patientAddress.address, endTimestamp),
        ).to.be.to.be.revertedWithCustomError(cipherHealth, "CipherHealth__CanNotCreateRecordInPast");
      });
      it("Should fail to add a health record if doctor address is patient address", async function () {
        const commitment = BigInt("10422485148533736140502856433020574708126974884107362425003492141168368230646");
        const endTimestamp = (await time.latest()) + 1;
        await expect(
          cipherHealth.connect(doctorAddress).addHealthRecord(commitment, doctorAddress.address, endTimestamp),
        ).to.be.to.be.revertedWithCustomError(cipherHealth, "CipherHealth__NotAllowedForAddingRecordsToYourself");
      });
    });
  });

  describe("issueNFT", function () {
    describe("success", function () {
      it("Should issue NFT for specific ID", async function () {
        const healthRecordId = await cipherHealth.getHealthRecordCount();
        const balanceBefore = await healthRecordNFT.balanceOf(patientAddress.address);

        const endTimestamp = (await time.latest()) + 10;
        const { calldata } = await generateProofAndCalldata(
          cipherHealth,
          healthRecordId,
          patientAddress,
          doctorAddress,
          healthRecordNFT,
          endTimestamp,
        );

        await cipherHealth.connect(patientAddress).issueNFT(healthRecordId, calldata.a, calldata.b, calldata.c);

        const balanceAfter = await healthRecordNFT.balanceOf(patientAddress.address);
        expect(balanceAfter).to.equal(balanceBefore + 1);
      });
      it("Should emit NFTIssued event", async function () {
        const healthRecordId = await cipherHealth.getHealthRecordCount();

        const endTimestamp = (await time.latest()) + 10;
        const { calldata } = await generateProofAndCalldata(
          cipherHealth,
          healthRecordId,
          patientAddress,
          doctorAddress,
          healthRecordNFT,
          endTimestamp,
        );

        await expect(cipherHealth.connect(patientAddress).issueNFT(healthRecordId, calldata.a, calldata.b, calldata.c))
          .to.emit(cipherHealth, "HealthRecordNFTIssued")
          .withArgs(healthRecordId, patientAddress.address, doctorAddress.address, endTimestamp);
      });
    });
    describe("failure", function () {
      it("Should fail to issue NFT for specific ID if it's already issued", async function () {
        const healthRecordId = await cipherHealth.getHealthRecordCount();

        const endTimestamp = (await time.latest()) + 10;
        const { calldata } = await generateProofAndCalldata(
          cipherHealth,
          healthRecordId,
          patientAddress,
          doctorAddress,
          healthRecordNFT,
          endTimestamp,
        );

        await cipherHealth.connect(patientAddress).issueNFT(healthRecordId, calldata.a, calldata.b, calldata.c);

        await expect(
          cipherHealth.connect(patientAddress).issueNFT(healthRecordId, calldata.a, calldata.b, calldata.c),
        ).to.be.to.be.revertedWithCustomError(cipherHealth, "CipherHealth__HealthRecordNFTAlreadyIssued");
      });
      it("Should fail to issue NFT if health record expired", async function () {
        const healthRecordId = await cipherHealth.getHealthRecordCount();

        const endTimestamp = (await time.latest()) + 10;
        const { calldata } = await generateProofAndCalldata(
          cipherHealth,
          healthRecordId,
          patientAddress,
          doctorAddress,
          healthRecordNFT,
          endTimestamp,
        );

        await time.increaseTo(endTimestamp + 1);
        await expect(
          cipherHealth.connect(patientAddress).issueNFT(healthRecordId, calldata.a, calldata.b, calldata.c),
        ).to.be.revertedWithCustomError(cipherHealth, "CipherHealth__HealthRecordExpired");
      });
      it("Should fail to issue NFT if proof is invalid", async function () {
        const healthRecordId = await cipherHealth.getHealthRecordCount();

        const endTimestamp = (await time.latest()) + 10;
        const { calldata } = await generateProofAndCalldata(
          cipherHealth,
          healthRecordId,
          patientAddress,
          doctorAddress,
          healthRecordNFT,
          endTimestamp,
        );

        await expect(
          cipherHealth.connect(patientAddress).issueNFT(healthRecordId, calldata.c, calldata.b, calldata.c),
        ).to.be.to.be.revertedWithCustomError(cipherHealth, "CipherHealth__InvalidProof");
      });
    });
  });

  describe("setHealthRecordNFTAddress", function () {
    describe("success", function () {
      it("Should set health record NFT address", async function () {
        const HealthRecordNFTFactory = await ethers.getContractFactory("HealthRecordNFT");
        const HealthRecordNFT = (await HealthRecordNFTFactory.deploy(cipherHealth.address)) as HealthRecordNFT;
        await HealthRecordNFT.deployed();

        const valueBefore = await cipherHealth.healthRecordNFTAddress();
        expect(valueBefore).to.equal(ethers.constants.AddressZero);

        await cipherHealth.setHealthRecordNFTAddress(HealthRecordNFT.address);

        const valueAfter = await cipherHealth.healthRecordNFTAddress();
        expect(valueAfter).to.equal(HealthRecordNFT.address);
      });
    });
    describe("failure", function () {
      it("Should fail to set health record NFT address if caller is not owner", async function () {
        await expect(
          cipherHealth.connect(testAddress).setHealthRecordNFTAddress(patientAddress.address),
        ).to.be.to.be.revertedWith("Ownable: caller is not the owner");
      });
      it("Should fail to set health record NFT address if health record NFT address is zero address", async function () {
        await expect(
          cipherHealth.setHealthRecordNFTAddress(ethers.constants.AddressZero),
        ).to.be.to.be.revertedWithCustomError(cipherHealth, "CipherHealth__ZeroAddress");
      });
      it("Should fail to set health record NFT address if health record NFT address is already set", async function () {
        await cipherHealth.setHealthRecordNFTAddress(healthRecordNFT.address);
        await expect(
          cipherHealth.setHealthRecordNFTAddress(patientAddress.address),
        ).to.be.to.be.revertedWithCustomError(cipherHealth, "CipherHealth__HealthRecordNFTAddressAlreadySet");
      });
    });
  });
});
