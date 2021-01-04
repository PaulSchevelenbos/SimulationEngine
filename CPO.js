class CPO {
    constructor(n) {
        this.UID = createRandomUID(36); // Case insensitive String(36)
        this.id = String(n).padStart(3,0); // CiString(3), 1, CPO ID of the CPO that 'owns' this Location (following the ISO-15118 standard).
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

}
