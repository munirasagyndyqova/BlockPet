
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PetRegistry {
    address public admin;

    mapping(address => bool) public authorizedClinics;
    mapping(uint256 => bytes32) public petRecords;
    mapping(uint256 => bytes32[]) private vaccinationRecords;

    event PetRegistered(uint256 petId, bytes32 recordHash);
    event VaccinationAdded(uint256 petId, bytes32 recordHash);

    constructor() {
        admin = msg.sender;
        authorizedClinics[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyClinic() {
        require(authorizedClinics[msg.sender], "Not authorized");
        _;
    }

    function authorizeClinic(address clinic) public onlyAdmin {
        require(clinic != address(0), "Invalid clinic");
        authorizedClinics[clinic] = true;
    }

    function registerPet(
        uint256 petId,
        bytes32 recordHash
    ) public onlyClinic {
        require(petId != 0, "Invalid Pet ID");
        require(recordHash != bytes32(0), "Invalid hash");
        require(petRecords[petId] == bytes32(0), "Pet already exists");

        petRecords[petId] = recordHash;
        emit PetRegistered(petId, recordHash);
    }

    function addVaccinationRecord(
        uint256 petId,
        bytes32 recordHash
    ) public onlyClinic {
        require(petRecords[petId] != bytes32(0), "Pet not found");
        require(recordHash != bytes32(0), "Invalid hash");

        vaccinationRecords[petId].push(recordHash);
        emit VaccinationAdded(petId, recordHash);
    }

    function verifyRecord(
        uint256 petId,
        bytes32 recordHash
    ) public view returns (bool) {
        if (petRecords[petId] == recordHash &&
            recordHash != bytes32(0)) {
            return true;
        }

        for (uint256 i = 0; i < vaccinationRecords[petId].length; i++) {
            if (vaccinationRecords[petId][i] == recordHash) {
                return true;
            }
        }

        return false;
    }
}
