// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";

/// @title CipherHealth Contract
/// @notice This contract allows doctors to add health records for patients and issue NFTs for those records.
/// @dev This contract is Ownable2Step, which means that certain operations require a two-step verification process.
contract CipherHealth is Ownable2Step {
	// Define a struct to hold public inputs related to sickness
	struct HealthRecord {
		uint256 commitment;
		address patientAddress;
		address doctorAddress;
		uint48 endTimestamp;
	}

	uint256 healthRecordId;
	address public healthRecordNFTAddress;
	bool internal healthRecordNFTAddressSet;

	mapping(uint256 => HealthRecord) public healthRecords;
	mapping(uint256 => bool) public healthRecordNFTIssued; // health record id => is issued (NFT)
	mapping(address => bool) public operators; // operator address => is operator
	mapping(address => bool) public verifiedDoctors; // doctor address => is verified

	IVerifier public immutable verifier;

	// events
	event HealthRecordAdded(
		uint256 healthRecordId,
		address indexed patientAddress,
		address indexed doctorAddress,
		uint48 endTimestamp
	);
	event DoctorRegistered(address doctorAddress);
	event OperatorRegistered(address operatorAddress);

	// errors
	error CipherHealth__NotAuthorizedForAddingRecords();
	error CipherHealth__NotAllowedForAddingRecordsToYourself();
	error CipherHealth__NotAuthorizedForAddingDoctors();
	error CipherHealth__HealthRecordNFTAlreadyIssued();
	error CipherHealth__HealthRecordExpired();
	error CipherHealth__InvalidProof();
	error CipherHealth__NotAuthorized();

	// modifiers
	modifier onlyDoctor() {
		if (!verifiedDoctors[msg.sender]) {
			revert CipherHealth__NotAuthorizedForAddingRecords();
		}
		_;
	}

	modifier onlyOwnerOrOperator() {
		if (!operators[msg.sender] && owner() != msg.sender) {
			revert CipherHealth__NotAuthorizedForAddingRecords();
		}
		_;
	}

	/// @notice Constructor function that sets the verifier address
	/// @param verifier_ The address of the verifier contract
	constructor(address verifier_) {
		verifier = IVerifier(verifier_);
	}

	/// @notice Adds a health record for a patient
	/// @param commitment The commitment value associated with the health record
	/// @param patientAddress The address of the patient
	/// @param endTimestamp The end timestamp of the health record
	function addHealthRecord(
		uint256 commitment,
		address patientAddress,
		uint48 endTimestamp
	) external onlyDoctor {
		if (patientAddress == msg.sender) {
			revert CipherHealth__NotAllowedForAddingRecordsToYourself();
		}

		healthRecords[healthRecordId] = HealthRecord({
			commitment: commitment,
			patientAddress: patientAddress,
			doctorAddress: msg.sender,
			endTimestamp: endTimestamp
		});

		++healthRecordId;

		emit HealthRecordAdded(
			healthRecordId,
			patientAddress,
			msg.sender,
			endTimestamp
		);
	}

	/// @notice Issues an NFT for a health record
	/// @param healthRecordId_ The ID of the health record
	/// @param proof The proof array used for verification
	function issueNFT(uint256 healthRecordId_, uint[8] memory proof) external {
		if (!healthRecordNFTIssued[healthRecordId]) {
			revert CipherHealth__HealthRecordNFTAlreadyIssued();
		}

		HealthRecord memory healthRecord = healthRecords[healthRecordId_];

		if (healthRecord.endTimestamp > block.timestamp) {
			revert CipherHealth__HealthRecordExpired();
		}

		uint256 commitment = healthRecord.commitment;
		address patientAddress = msg.sender;
		address doctorAddress = healthRecord.doctorAddress;
		uint48 endTimestamp = healthRecord.endTimestamp;

		uint256[5] memory _pubSignals = [
			healthRecordId,
			commitment,
			uint256(uint160(patientAddress)),
			uint256(uint160(doctorAddress)),
			uint256(endTimestamp)
		];

		uint256[2] memory _pA = [proof[0], proof[1]];
		uint256[2][2] memory _pB = [[proof[2], proof[3]], [proof[4], proof[5]]];
		uint256[2] memory _pC = [proof[6], proof[7]];

		if (!verifier.verifyProof(_pA, _pB, _pC, _pubSignals)) {
			revert CipherHealth__InvalidProof();
		}

		// mint NFT
		IHealthRecordNFT(healthRecordNFTAddress).mint(patientAddress);
	}

	/// @notice Registers a doctor
	/// @param doctorAddress The address of the doctor to be registered
	function registerDoctor(
		address doctorAddress
	) external onlyOwnerOrOperator {
		verifiedDoctors[doctorAddress] = true;
		emit DoctorRegistered(doctorAddress);
	}

	/// @notice Registers an operator
	/// @param operatorAddress The address of the operator to be registered
	function registerOperator(address operatorAddress) external onlyOwner {
		operators[operatorAddress] = true;
		emit OperatorRegistered(operatorAddress);
	}

	/// @notice Sets the address of the health record NFT contract
	/// @param healthRecordNFTAddress_ The address of the health record NFT contract
	function setHealthRecordNFTAddress(
		address healthRecordNFTAddress_
	) external onlyOwner {
		if (healthRecordNFTAddressSet) {
			revert CipherHealth__NotAuthorized();
		}
		healthRecordNFTAddress = healthRecordNFTAddress_;
		healthRecordNFTAddressSet = true;
	}

	/// @notice Gets a health record by ID
	/// @param healthRecordId_ The ID of the health record
	/// @return The HealthRecord struct
	function getHealthRecord(
		uint256 healthRecordId_
	) public view returns (HealthRecord memory) {
		return healthRecords[healthRecordId_];
	}

	/// @notice Gets the total count of health records
	/// @return The total count of health records
	function getHealthRecordCount() public view returns (uint256) {
		return healthRecordId;
	}
}

/// @title IVerifier
/// @notice Interface for the Verifier contract
interface IVerifier {
	function verifyProof(
		uint256[2] calldata _pA,
		uint256[2][2] calldata _pB,
		uint256[2] calldata _pC,
		uint256[5] calldata _pubSignals
	) external view returns (bool);
}

/// @title IHealthRecordNFT
/// @notice Interface for the HealthRecordNFT contract
interface IHealthRecordNFT {
	function mint(address to) external;
}
