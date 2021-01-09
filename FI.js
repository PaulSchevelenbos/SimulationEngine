class FI {
    constructor(myName, myFee) {
        this.name = myName;
        this.UID = createRandomUID(36); // Case insensitive String(36)
        this.ID = this.UID.slice(-8); // last 8 characters of UID, contract-id with MSP
        this.fee = myFee; // in € per transaction (CDR)
    }

    async createOnLedger() {

        let my_contract_id = this.ID;
        let my_uid = this.UID;
        let my_role = "FI";
        let my_wallet_balance = "0.00";
        let my_fee = this.fee;

        // TEST: curl --request POST --data '{"userId":"USER_001","password":"0x023","companyId":"COMP_001","email":"james.bond@mi6.org","firstname":"James","lastname":"Bond"}' -H "Content-Type: application/json"  http://127.0.0.1:8080/api/createUser;
        const createUserURL = 'http://127.0.0.1:8080/api/createUser';
        const data = { "userId": my_contract_id, "password": my_uid, "companyId": my_role, "email": my_wallet_balance, "firstname": my_fee, "lastname": "TEST" };
        const response2 = await fetch(createUserURL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        console.log("body parameter: ", JSON.stringify(data));
        console.log("response to createOnLedger -> fetch(): ", response2);

    }
}