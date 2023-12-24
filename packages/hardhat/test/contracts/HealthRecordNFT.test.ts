import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HealthRecordNFT } from "../../typechain-types";

describe("CipherHealth", function () {
  // We define a fixture to reuse the same setup in every test.
  let healthRecordNFT: HealthRecordNFT;
  let deployer: SignerWithAddress;
  let testAddress: SignerWithAddress;
  let cipherHealth: SignerWithAddress; // mock

  beforeEach(async () => {
    [deployer, testAddress, cipherHealth] = await ethers.getSigners();

    const healthRecordNFTFactory = await ethers.getContractFactory("HealthRecordNFT");

    healthRecordNFT = (await healthRecordNFTFactory.deploy(cipherHealth.address)) as HealthRecordNFT;
    await healthRecordNFT.deployed();
  });

  describe("Deployment", function () {
    describe("success", function () {
      it("Should have right parameters on deploy", async function () {
        expect(await healthRecordNFT.cipherHealth()).to.equal(cipherHealth.address);
        expect(await healthRecordNFT.totalSupply()).to.equal(0);
      });
    });

    describe("failure", function () {
      it("Should fail to deploy if cipher health address is zero address", async function () {
        const healthRecordNFTFactory = await ethers.getContractFactory("HealthRecordNFT");
        await expect(healthRecordNFTFactory.deploy(ethers.constants.AddressZero)).to.be.to.be.revertedWithCustomError(
          healthRecordNFT,
          "HealthRecordNFT__ZeroAddress",
        );
      });
    });
  });

  describe("mint", function () {
    describe("success", function () {
      it("Should mint a NFT if caller is cipher health", async function () {
        const totalSupplyBefore = await healthRecordNFT.totalSupply();
        const balanceBefore = await healthRecordNFT.balanceOf(testAddress.address);

        await healthRecordNFT.connect(cipherHealth).mint(testAddress.address);

        const totalSupplyAfter = await healthRecordNFT.totalSupply();
        const balanceAfter = await healthRecordNFT.balanceOf(testAddress.address);

        expect(totalSupplyAfter).to.equal(totalSupplyBefore + 1);
        expect(balanceAfter).to.equal(balanceBefore + 1);
      });

      it("Should emit Transfer event", async function () {
        await expect(healthRecordNFT.connect(cipherHealth).mint(testAddress.address))
          .to.emit(healthRecordNFT, "Transfer")
          .withArgs(ethers.constants.AddressZero, testAddress.address, 0);
      });
    });

    describe("failure", function () {
      it("Should fail to mint if caller is not cipher health", async function () {
        await expect(healthRecordNFT.mint(testAddress.address)).to.be.revertedWithCustomError(
          healthRecordNFT,
          "HealthRecordNFT__NotAuthorizedForMinting",
        );
      });
    });
  });

  describe("transferFrom", function () {
    describe("failure", function () {
      it("should fail to transfer soul-bound token", async function () {
        await healthRecordNFT.connect(cipherHealth).mint(testAddress.address);
        await expect(
          healthRecordNFT.connect(testAddress).transferFrom(testAddress.address, deployer.address, 0),
        ).to.be.revertedWithCustomError(healthRecordNFT, "HealthRecordNFT__NotAuthorizedForTransfer");
      });
    });
  });
});
