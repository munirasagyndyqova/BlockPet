
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.15.0/+esm";

const verifyBtn = document.getElementById("verifyBtn");
const verificationResult = document.getElementById("verificationResult");

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const contractABI = [
    "function verifyRecord(uint256 petId, bytes32 recordHash) view returns (bool)"
];

verifyBtn.addEventListener("click", async function () {
    verificationResult.textContent = "Checking blockchain...";

    try {
        const provider = new ethers.JsonRpcProvider(
            "http://127.0.0.1:8545"
        );

        const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            provider
        );

        const petId = 1;
        const vaccineHash = ethers.id("Buddy-Rabies-2026");

        const verified = await contract.verifyRecord(
            petId,
            vaccineHash
        );

        if (verified) {
            verificationResult.textContent =
                "✓ Vaccination successfully verified on blockchain!";
            verificationResult.style.color = "green";
        } else {
            verificationResult.textContent =
                "✗ Vaccination record not found on blockchain.";
            verificationResult.style.color = "red";
        }

    } catch (error) {
        console.error(error);
        verificationResult.textContent =
            "Connection failed. Check Hardhat local network.";
        verificationResult.style.color = "red";
    }
});

const petForm = document.getElementById("petForm");
const registrationResult =
    document.getElementById("registrationResult");

petForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    registrationResult.textContent = "Registering pet...";
    registrationResult.style.color = "#6554d9";

    try {
        const provider = new ethers.JsonRpcProvider(
            "http://127.0.0.1:8545"
        );

        const signer = await provider.getSigner(0);

        const registrationABI = [
            "function registerPet(uint256 petId, bytes32 recordHash)",
            "function petRecords(uint256 petId) view returns (bytes32)"
        ];

        const registry = new ethers.Contract(
            contractAddress,
            registrationABI,
            signer
        );

        const petId = document.getElementById("petId").value;
        const petName = document.getElementById("petName").value;
        const petType = document.getElementById("petType").value;

        const petHash = ethers.id(
    petId + "-" + petName + "-" + petType
);

        const tx = await registry.registerPet(
            petId,
            petHash
        );

        await tx.wait();
        const pet = {
    id: petId,
    name: petName,
    type: petType,
    status: "Active",
    recordHash: petHash
};

const pets = JSON.parse(
    localStorage.getItem("blockpet_pets") || "{}"
);

pets[petId] = pet;

localStorage.setItem(
    "blockpet_pets",
    JSON.stringify(pets)
);

        registrationResult.textContent =
            "✓ Pet registered successfully on blockchain!";
        registrationResult.style.color = "green";

        petForm.reset();

    } catch (error) {
        console.error(error);

        registrationResult.textContent =
            "Registration failed. Check Pet ID and blockchain connection.";
        registrationResult.style.color = "red";
    }
});

const vaccinationForm =
    document.getElementById("vaccinationForm");

const vaccinationResult =
    document.getElementById("vaccinationResult");

vaccinationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    vaccinationResult.textContent = "Saving vaccination...";
    vaccinationResult.style.color = "#6554d9";

    try {
        const provider = new ethers.JsonRpcProvider(
            "http://127.0.0.1:8545"
        );

        const signer = await provider.getSigner(0);

        const vaccinationABI = [
            "function addVaccinationRecord(uint256 petId, bytes32 recordHash)",
            "function verifyRecord(uint256 petId, bytes32 recordHash) view returns (bool)"
        ];

        const registry = new ethers.Contract(
            contractAddress,
            vaccinationABI,
            signer
        );

        const petId =
            document.getElementById("vaccinePetId").value;

        const vaccineName =
            document.getElementById("vaccineName").value;

        const vaccineDate =
            document.getElementById("vaccineDate").value;

        const vaccineHash = ethers.id(
            petId + "-" + vaccineName + "-" + vaccineDate
        );

        const tx = await registry.addVaccinationRecord(
            petId,
            vaccineHash
        );

        await tx.wait();

        const verified = await registry.verifyRecord(
            petId,
            vaccineHash
        );

        if (verified) {
            const vaccinations = JSON.parse(
    localStorage.getItem("blockpet_vaccinations") || "{}"
);

if (!vaccinations[petId]) {
    vaccinations[petId] = [];
}

vaccinations[petId].push({
    name: vaccineName,
    date: vaccineDate,
    hash: vaccineHash
});

localStorage.setItem(
    "blockpet_vaccinations",
    JSON.stringify(vaccinations)
);
            vaccinationResult.textContent =
                "✓ Vaccination saved and verified on blockchain!";
            vaccinationResult.style.color = "green";
            vaccinationForm.reset();
        } else {
            vaccinationResult.textContent =
                "Vaccination could not be verified.";
            vaccinationResult.style.color = "red";
        }

    } catch (error) {
        console.error(error);
        vaccinationResult.textContent =
            "Failed to add vaccination. Check Pet ID and network.";
        vaccinationResult.style.color = "red";
    }
});

const searchPetBtn = document.getElementById("searchPetBtn");
const searchResult = document.getElementById("searchResult");

searchPetBtn.addEventListener("click", async function () {
    const petId = document.getElementById("searchPetId").value;

    if (!petId) {
        searchResult.textContent = "Please enter a Pet ID.";
        return;
    }

    const pets = JSON.parse(
        localStorage.getItem("blockpet_pets") || "{}"
    );

    const pet = pets[petId];

    if (!pet) {
        searchResult.textContent =
            "Pet not found in local records.";
        searchResult.style.color = "red";
        return;
    }

    try {
        const provider = new ethers.JsonRpcProvider(
            "http://127.0.0.1:8545"
        );

        const registry = new ethers.Contract(
            contractAddress,
            [
                "function petRecords(uint256 petId) view returns (bytes32)"
            ],
            provider
        );

        const onChainHash = await registry.petRecords(petId);

        if (onChainHash !== pet.recordHash) {
            searchResult.textContent =
                "Blockchain record does not match.";
            searchResult.style.color = "red";
            return;
        }

        document.getElementById("displayPetName").textContent =
            pet.name;

        document.getElementById("displayPetType").textContent =
    pet.type;
        document.getElementById("displaySpecies").textContent =
    pet.type;

const petImage = document.getElementById("displayPetImage");

if (pet.type === "Cat") {
    petImage.src = "images/котя.jpg";
} else {
    petImage.src = "images/шабака.png";
}

petImage.alt = pet.name;

        document.getElementById("displayPetId").textContent =
            "Pet ID: #" + pet.id.toString().padStart(4, "0");
        showVaccinations(petId);
        generatePetQR(petId);
        searchResult.textContent =
            "✓ Pet passport verified and loaded!";
        searchResult.style.color = "green";
        document.getElementById("digitalPassport").scrollIntoView({
    behavior: "smooth",
    block: "center"
});
    } catch (error) {
        console.error(error);
        searchResult.textContent =
            "Could not connect to the blockchain.";
        searchResult.style.color = "red";
    }
});

function showVaccinations(petId) {
    const history = document.getElementById("vaccinationHistory");

    const vaccinations = JSON.parse(
        localStorage.getItem("blockpet_vaccinations") || "{}"
    );

    const records = vaccinations[petId] || [];

    history.replaceChildren();

    if (records.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No locally saved vaccination records.";
        history.appendChild(message);
        return;
    }

    records.forEach(function (record) {
        const card = document.createElement("div");
        card.className = "vaccination-card";

        const details = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = "💉 " + record.name;

        const date = document.createElement("p");
        date.textContent = "Date: " + record.date;

        const status = document.createElement("span");
        status.className = "status";
        status.textContent = "Locally Saved";

        details.append(title, date);
        card.append(details, status);
        history.appendChild(card);
    });
}
function generatePetQR(petId) {
    const container = document.getElementById("petQRCode");

    if (!container) {
        console.error("QR container not found");
        return;
    }

    container.replaceChildren();

    if (typeof QRCode === "undefined") {
        console.error("QRCode library not loaded");
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("petId", petId);
    url.hash = "passport";

    new QRCode(container, {
        text: url.toString(),
        width: 220,
        height: 220,
        colorDark: "#252944",
        colorLight: "#ffffff"
    });
}
// Generate QR for default Buddy passport
document.addEventListener("DOMContentLoaded", function () {
    generatePetQR(1);
});
generatePetQR(1);