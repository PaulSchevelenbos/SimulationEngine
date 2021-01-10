class CPO {
    constructor(n) {
        this.UID = createRandomUID(36); // Case insensitive String(36)
        // this.id = String(n).padStart(3,0); // CiString(3), 1, CPO ID of the CPO that 'owns' this Location (following the ISO-15118 standard).
        this.id = this.UID.slice(-8); // last 8 characters of UID
        this.name = "cpo" + this.id;
        this.chargePoints = []; // array of charge points
        // this.company; // organisation name in Hyperledger Fabric grouping the CPO's 
        this.tariffEngine = new TariffEngine();
    }

    getName() {
        return this.name;
    }

    getID(){
        return this.id;
    }

    addEVSE(myEVSE){
        this.chargePoints.push(myEVSE);
        return;
    }

    async createOnLedger() {

        let my_contract_id = this.id;
        let my_uid = this.UID;
        let my_role = "CPO";
        let my_wallet_balance = "0.00";
        let my_fee = "0.00";

       //  curl --request POST --data '{"contractId":"33B37086","uId":"CAD34E62D4505529A31659661BC133B37086","rol":"MSP", "walletBalance":"0","fees":"0.0"}' -H "Content-Type: application/json"  http://127.0.0.1:8080/api/createStakeholder
       const createStakeholderURL = 'http://127.0.0.1:8080/api/createStakeholder';
       const data = { "contractId": my_contract_id, "uId": my_uid, "rol": my_role, "walletBalance": my_wallet_balance, "fees": my_fee};
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
