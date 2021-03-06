class TechAccount {
    constructor() {
        this.name = "Technical Account"; // allows auditing on the total amount of euro-tokens created
        this.UID = createRandomUID(36); // Case insensitive String(36)
        this.ID = this.UID.slice(-8); // last 8 characters of UID, contract-id with MSP
        this.fee = 0.0; // in € per transaction (CDR)
    }

    async createOnLedger() {

        let my_contract_id = this.ID;
        let my_uid = this.UID;
        let my_role = "TECH";
        let my_wallet_balance = "0.00"; // starting with 0 eur and going negative allows easy visual control
        let my_fee = this.fee;

        //  curl --request POST --data '{"contractId":"33B37086","uId":"CAD34E62D4505529A31659661BC133B37086","rol":"TECH", "walletBalance":"0.00","fees":"0.00"}' -H "Content-Type: application/json"  http://127.0.0.1:8080/api/createStakeholder
        const createStakeholderURL = 'http://127.0.0.1:8080/api/createStakeholder';
        const data = { "contractId": my_contract_id, "uId": my_uid, "rol": my_role, "walletBalance": my_wallet_balance, "fees": my_fee };
        const response2 = await fetch(createStakeholderURL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        console.log("body parameter: ", JSON.stringify(data));
        console.log("response to createOnLedger -> fetch(): ", response2);

    }
}