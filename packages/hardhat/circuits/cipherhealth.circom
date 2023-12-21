pragma circom 2.0.0; // The circom compiler version
include "../../../node_modules/circomlib/circuits/poseidon.circom";

// Calculate commitment function using Poseidon hash
template CalculateCommitment() { 
    // input signals
    signal input healthRecordId;
    signal input pacientAddress;
    signal input doctorAddress;
    signal input endTimestamp;
    signal input marker;
    signal input salt;

    // Calculate the commitment
    component hashCalculation = Poseidon(6);
    hashCalculation.inputs[0] <== healthRecordId;
    hashCalculation.inputs[1] <== pacientAddress;
    hashCalculation.inputs[2] <== doctorAddress;
    hashCalculation.inputs[3] <== endTimestamp;
    hashCalculation.inputs[4] <== marker;
    hashCalculation.inputs[5] <== salt;

    // output signals
    signal output commitment;
    commitment <== hashCalculation.out;

}

template CipherHealth () {
    // public inputs   
    signal input healthRecordId;
    signal input commitment;
    signal input pacientAddress;
    signal input doctorAddress;
    signal input endTimestamp;

    // private inputs
    signal input marker; // disease marker
    signal input salt; // salt for the commitment

    // Calculate the commitment
    component calculateCommitment = CalculateCommitment();
    calculateCommitment.healthRecordId <== healthRecordId;
    calculateCommitment.pacientAddress <== pacientAddress;
    calculateCommitment.doctorAddress <== doctorAddress;
    calculateCommitment.endTimestamp <== endTimestamp;
    calculateCommitment.marker <== marker;
    calculateCommitment.salt <== salt;

    commitment === calculateCommitment.commitment;
    
}

component main { public [ healthRecordId, commitment, pacientAddress,doctorAddress, endTimestamp ] } = CipherHealth();