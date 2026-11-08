
import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "ethers";

const { ethers: hardhatEthers } =
  await network.connect();

describe("BlockPet - PetRegistry", function () {

  async function deployContract() {
    const [admin, clinic, stranger] =
      await hardhatEthers.getSigners();

    const registry =
      await hardhatEthers.deployContract("PetRegistry");

    await registry.waitForDeployment();

    const petHash = ethers.id("Pet: Buddy");
    const vaccineHash = ethers.id("Rabies vaccine");

    return {
      registry,
      admin,
      clinic,
      stranger,
      petHash,
      vaccineHash
    };
  }

  it("1. Should register a pet", async function () {
    const { registry, petHash } = await deployContract();

    await registry.registerPet(1, petHash);

    expect(await registry.petRecords(1)).to.equal(petHash);
  });

  it("2. Should authorize a veterinary clinic", async function () {
    const { registry, clinic } = await deployContract();

    await registry.authorizeClinic(clinic.address);

    expect(
      await registry.authorizedClinics(clinic.address)
    ).to.equal(true);
  });

  it("3. Should add a vaccination record", async function () {
    const { registry, petHash, vaccineHash } =
      await deployContract();

    await registry.registerPet(1, petHash);
    await registry.addVaccinationRecord(1, vaccineHash);

    expect(
      await registry.verifyRecord(1, vaccineHash)
    ).to.equal(true);
  });

  it("4. Should reject duplicate pet registration", async function () {
    const { registry, petHash } = await deployContract();

    await registry.registerPet(1, petHash);

    await expect(
      registry.registerPet(1, petHash)
    ).to.be.revertedWith("Pet already exists");
  });

  it("5. Should reject unauthorized users", async function () {
    const { registry, stranger, petHash } =
      await deployContract();

    await expect(
      registry.connect(stranger).registerPet(2, petHash)
    ).to.be.revertedWith("Not authorized");
  });

});
