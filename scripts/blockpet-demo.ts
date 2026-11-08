
import { network } from "hardhat";

const { ethers } = await network.create();

async function main() {
  console.log("=== BlockPet Blockchain Demo ===");

  const [admin] = await ethers.getSigners();

  // Deploy smart contract
  const registry = await ethers.deployContract("PetRegistry");
  await registry.waitForDeployment();

  console.log("Contract deployed:");
  console.log(await registry.getAddress());

  // Register a pet
  const petId = 1;
  const petHash = ethers.id("Buddy-Dog-2026");

  const registerTx = await registry.registerPet(petId, petHash);
  await registerTx.wait();

  console.log("Pet registered successfully!");
  console.log("Pet ID:", petId);

  // Add vaccination
  const vaccineHash = ethers.id("Buddy-Rabies-2026");

  const vaccineTx = await registry.addVaccinationRecord(
    petId,
    vaccineHash
  );
  await vaccineTx.wait();

  console.log("Vaccination added successfully!");

  // Verify vaccination
  const verified = await registry.verifyRecord(
    petId,
    vaccineHash
  );

  console.log("Vaccination verified:", verified);
  console.log("=== Demo Completed ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
