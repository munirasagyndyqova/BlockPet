
Educational project for the course Introduction to Finance. Not a real product, service or investment offer. Do not use with real funds.

# BlockPet — Digital Pet Passport

## Project Overview

BlockPet is an educational blockchain prototype developed for the Introduction to Finance course at Astana IT University.

The project demonstrates a digital pet passport system that allows veterinary clinics to register pets, add vaccination records, and verify record integrity using blockchain technology.

The prototype uses a local Hardhat blockchain with fictional pet data. No real cryptocurrency, customer information, or financial transactions are involved.

## Team Information

Team: 06

Members:
- Kenes Nurziya
- Sagyndykova Munira
- Koshkinbayeva Akbota

Group: SE-2536

## Technologies

- Solidity — Smart Contract
- Hardhat 3 — Local Blockchain
- Ethers.js — Blockchain Interactions
- Mocha — Unit Testing
- HTML, CSS, JavaScript — Frontend

## Smart Contract

The PetRegistry smart contract supports:

- registerPet() — Register a new pet.
- addVaccinationRecord() — Add a vaccination record hash.
- verifyRecord() — Verify a registered record.
- authorizeClinic() — Authorize a veterinary clinic.

Only authorized clinic accounts can register pets and vaccination records.

## Installation

Install Node.js and npm.

Open the project folder in VS Code.

Install dependencies:

```bash
npm install
```

## Compile Smart Contracts

```bash
npx hardhat compile
```

## Run Unit Tests

```bash
npx hardhat test
```

The project includes five PetRegistry unit tests covering pet registration, clinic authorization, vaccination records, duplicate registration protection, and unauthorized access.

## Run Local Blockchain

Open a terminal and execute:

```bash
npx hardhat node
```

Keep this terminal running.

## Deploy and Demonstrate BlockPet

Open a second terminal and execute:

```bash
npx hardhat run scripts/blockpet-demo.ts --network localhost
```

The demo deploys PetRegistry, registers a fictional pet, adds a vaccination record, and verifies its hash.

## Frontend

Open frontend/index.html using VS Code Live Server.

The frontend supports:

- Digital pet passports
- Dog and cat profiles
- Pet registration
- Vaccination registration
- Blockchain record verification
- QR code generation
- Pet ID search

The frontend connects to the local Hardhat blockchain at http://127.0.0.1:8545.

The prototype uses local browser storage for pet details and vaccination history. Only record hashes are stored on the blockchain.

## Security

- Uses a local development blockchain.
- No real funds or personal data.
- Access control for veterinary clinics.
- Protection against duplicate pet registration.
- Cryptographic hashes for record verification.

This prototype is for educational demonstration only and is not production-ready.

## Demo Video

University OneDrive demo link: To be added after recording.

## AI Disclosure

AI tools were used to assist with explanations, code drafting, debugging, and documentation. The exact tools and models used will be documented in the final AI Disclosure Statement.
