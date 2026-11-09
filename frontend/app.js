
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.15.0/+esm";

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

import {
    SUPABASE_URL,
    SUPABASE_KEY
} from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


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
        const petId = Number(document.getElementById("petId").value);
        const petName = document.getElementById("petName").value.trim();
        const petType = document.getElementById("petType").value;

        if (!Number.isSafeInteger(petId) || petId <= 0 ||
            !petName || !["Dog", "Cat"].includes(petType)) {
            throw new Error("Enter valid pet details.");
        }

        const { data: { user }, error: authError } =
            await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error("Please log in first.");
        }

        const { error } = await supabase
            .from("pets")
            .insert({
                id: petId,
                name: petName,
                animal_type: petType
            });

        if (error) {
            throw error;
        }

        registrationResult.textContent =
            "✓ Pet registered successfully in BlockPet!";
        registrationResult.style.color = "green";

        petForm.reset();

    } catch (error) {
        console.error(error);

        registrationResult.textContent =
            "Registration failed: " + error.message;
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
        const petId = Number(
            document.getElementById("vaccinePetId").value
        );

        const vaccineName = document
            .getElementById("vaccineName").value.trim();

        const vaccineDate = document
            .getElementById("vaccineDate").value;

        if (!Number.isSafeInteger(petId) || petId <= 0 ||
            !vaccineName || !vaccineDate) {
            throw new Error("Please enter valid vaccination details.");
        }

        const { data: { user }, error: authError } =
            await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error("Please log in first.");
        }

        const { error } = await supabase
            .from("vaccinations")
            .insert({
                pet_id: petId,
                vaccine_name: vaccineName,
                vaccination_date: vaccineDate
            });

        if (error) {
            throw error;
        }

        vaccinationResult.textContent =
            "✓ Vaccination saved successfully in BlockPet!";
        vaccinationResult.style.color = "green";

        vaccinationForm.reset();

    } catch (error) {
        console.error(error);

        vaccinationResult.textContent =
            "Failed to add vaccination: " + error.message;
        vaccinationResult.style.color = "red";
    }
});


const searchPetBtn = document.getElementById("searchPetBtn");
const searchResult = document.getElementById("searchResult");


searchPetBtn.addEventListener("click", async function () {
    const petId = Number(
        document.getElementById("searchPetId").value
    );

    if (!Number.isSafeInteger(petId) || petId <= 0) {
        searchResult.textContent = "Please enter a valid Pet ID.";
        searchResult.style.color = "red";
        return;
    }

    searchResult.textContent = "Searching for pet...";
    searchResult.style.color = "#6554d9";

    try {
        const { data: { user }, error: authError } =
            await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error("Please log in first.");
        }

        const { data: pet, error } = await supabase
            .from("pets")
            .select("id, name, animal_type")
            .eq("id", petId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!pet) {
            searchResult.textContent = "Pet not found.";
            searchResult.style.color = "red";
            return;
        }

        document.getElementById("displayPetName").textContent =
            pet.name;

        document.getElementById("displayPetType").textContent =
            pet.animal_type;

        document.getElementById("displaySpecies").textContent =
            pet.animal_type;

        const petImage = document.getElementById("displayPetImage");

        if (pet.animal_type === "Cat") {
            petImage.src = "images/котя.jpg";
        } else {
            petImage.src = "images/шабака.png";
        }

        petImage.alt = pet.name;

        document.getElementById("displayPetId").textContent =
            "Pet ID: #" + String(pet.id).padStart(4, "0");

        await showVaccinations(petId);
        generatePetQR(petId);

        searchResult.textContent =
            "✓ Pet passport loaded from BlockPet database!";
        searchResult.style.color = "green";

        document.getElementById("digitalPassport").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {
        console.error(error);

        searchResult.textContent =
            "Search failed: " + error.message;
        searchResult.style.color = "red";
    }
});



async function showVaccinations(petId) {
    const history = document.getElementById("vaccinationHistory");

    history.replaceChildren();

    const loading = document.createElement("p");
    loading.textContent = "Loading vaccinations...";
    history.appendChild(loading);

    try {
        const { data: records, error } = await supabase
            .from("vaccinations")
            .select("vaccine_name, vaccination_date")
            .eq("pet_id", petId)
            .order("vaccination_date", { ascending: false });

        if (error) {
            throw error;
        }

        history.replaceChildren();

        if (!records || records.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No vaccination records found.";
            history.appendChild(message);
            return;
        }

        records.forEach(function (record) {
            const card = document.createElement("div");
            card.className = "vaccination-card";

            const details = document.createElement("div");

            const title = document.createElement("h3");
            title.textContent = "💉 " + record.vaccine_name;

            const date = document.createElement("p");
            date.textContent = "Date: " + record.vaccination_date;

            const status = document.createElement("span");
            status.className = "status";
            status.textContent = "Saved in BlockPet";

            details.append(title, date);
            card.append(details, status);

            history.appendChild(card);
        });

    } catch (error) {
        console.error(error);

        history.replaceChildren();

        const message = document.createElement("p");
        message.textContent =
            "Failed to load vaccinations: " + error.message;

        history.appendChild(message);
    }
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

    
const url = new URL("https://blockpet-nine.vercel.app/");
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

async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Login failed: " + error.message);
        return;
    }

    alert("Welcome to BlockPet!");
    console.log("Logged in user:", data.user.email);
}

async function logoutUser() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Logout failed: " + error.message);
        return;
    }

    alert("You have logged out.");
}

const loginForm = document.getElementById("loginForm");
const blockpetApp = document.getElementById("blockpetApp");

function updateLoginUI(user) {
    const loggedIn = Boolean(user);

    loginForm.hidden = loggedIn;
    blockpetApp.hidden = !loggedIn;
    logoutBtn.hidden = !loggedIn;

    loginMessage.textContent = loggedIn
        ? "Logged in as " + user.email
        : "Please sign in.";
}
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

   const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        loginMessage.textContent = "Login failed: " + error.message;
        return;
    }

    updateLoginUI(data.user);
});


logoutBtn.addEventListener("click", async function () {
    const { error } = await supabase.auth.signOut();

    if (error) {
        loginMessage.textContent = error.message;
        return;
    }

    updateLoginUI(null);
    loginMessage.textContent = "You have logged out.";
});



async function checkLoginStatus() {
    const { data } = await supabase.auth.getUser();

    updateLoginUI(data.user);
}

checkLoginStatus();

async function openPetFromQR() {
    const params = new URLSearchParams(window.location.search);
    const petId = params.get("petId");

    if (!petId) {
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return;
    }

    document.getElementById("searchPetId").value = petId;
    searchPetBtn.click();
}

supabase.auth.onAuthStateChange(function (event, session) {
    if (event === "SIGNED_IN" && session) {
        setTimeout(openPetFromQR, 0);
    }
});

openPetFromQR();
