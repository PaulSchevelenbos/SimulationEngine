class CDRToken {
    constructor() {
        this.uid = createRandomUID(36); // Unique ID by which this Token can be identified. This is the field used by the CPO’s system (RFID reader on the Charge Point) to identify this token. Currently, in most cases: type=RFID, this is the RFID hidden ID as read by the RFID reader, but that is not a requirement. If this is a type=APP_USER Token, it will be a unique, by the eMSP, generated ID.
        this.type = "APP_USER"; // Type of the token. type=RFID or type=APP_USER
        this.contract_id = createRandomUID(8); // Uniquely identifies the EV driver contract token within the eMSP’s platform (and suboperator platforms). Recommended to follow the specification for eMA ID from "eMI3 standard version V1.0" (http://emi3group.com/documents-links/) "Part 2: business objects."
    }
}