class FI {
    constructor(myName, myFee) {
        this.name = myName;
        this.UID = createRandomUID(36); // Case insensitive String(36)
        this.fee = myFee; // in € per transaction (CDR)
    }

    createOnLedger() {
        // Fetch to REST API
    }
}