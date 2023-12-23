import { expect } from "chai";
import { ethers } from "hardhat";
import { CipherHealth, Verifier } from "../typechain-types";

describe("YourContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let cipherHealth: CipherHealth;
  let verifier: Verifier;
  before(async () => {
    // const [deployer] = await ethers.getSigners();
    const verifierFactory = await ethers.getContractFactory("Verifier");
    const cipherHealthFactory = await ethers.getContractFactory("CipherHealth");

    verifier = (await verifierFactory.deploy()) as Verifier;
    await verifier.deployed();

    cipherHealth = (await cipherHealthFactory.deploy(verifier.address)) as CipherHealth;
    await cipherHealth.deployed();
  });

  describe("Deployment", function () {
    it("Should have right paramaaters on deploy", async function () {
      expect(await cipherHealth.verifier()).to.equal(verifier.address);
    });
  });
});
