class MSP {
    constructor(myName, myFee) {
        this.UID = createRandomUID(36); // Case insensitive String(36)
        this.ID = this.UID.slice(-8); // last 8 characters of UID
        this.name = myName;
        this.chargePoints = []; // array of charge points onboarded with MSP
        this.locations = [];
        this.totalKWh = 0;
        this.totalParkingTime = 0; // in seconds
        this.totalEnergyCost = 0;
        this.totalParkingCost = 0;
        this.totalCost = 0;
        this.nFinishedSessions = 0;
        this.CDRqueue = [];
        // this.SettlementQueue = [];
        this.nCDRsUnconfirmed = 0;
        // this.nCDRsUnSettled = 0;
        this.fee = myFee; // in € per transaction (CDR)
    }

    addEVSE(myEVSE) {
        this.chargePoints.push(myEVSE);
        return;
    }

    addLocation(myLocation) {
        this.locations.push(myLocation);
        return;
    }

    findNearestLocation(myEVPosition) {
        let nearestLocation = this.locations[0];
        let delta = p5.Vector.sub(nearestLocation.position(), myEVPosition);
        let shortestSqDistance = delta.magSq(); // squared magnitude is faster, no root calculation
        if (this.locations.length > 1) {
            for (let i = 1; i < this.locations.length; i++) {
                delta = p5.Vector.sub(this.locations[i].position(), myEVPosition);
                if (delta.magSq() < shortestSqDistance) {
                    nearestLocation = this.locations[i];
                    shortestSqDistance = delta.magSq();
                };
            };
        }
        return nearestLocation; // TBC: if queuelength > reasonable, then skip this location
    };

    showLocations() {
        for (let i = 0; i < this.locations.length; i++) {
            this.locations[i].show();
        }
    };

    showStatistics() {
        noStroke();
        fill(colorReserved);
        textSize(15);
        textAlign(LEFT);
        text('totalKWh: ' + this.totalKWh.toFixed(2), 10, 20);
        text('totalParkingTime: ' + this.formatParkingTime(this.totalParkingTime), 10, 40);
        text('nFinishedSessions: ' + this.nFinishedSessions.toFixed(0), 10, 60);


        text('totalEnergyCost: ' + this.totalEnergyCost.toFixed(2), 10, height - 60);
        text('totalParkingCost: ' + this.totalParkingCost.toFixed(2), 10, height - 40);
        text('totalCost: ' + this.totalCost.toFixed(2), 10, height - 20);

        textAlign(RIGHT);
        text('CDRqueue.length: ' + this.CDRqueue.length, width - 5, height - 40);
        text('nCDRsUnconfirmed: ' + this.nCDRsUnconfirmed, width - 5, height - 20);

        return;
    }

    formatParkingTime(myParkingTime) {
        let inSeconds = floor(myParkingTime);
        let inMinutes = floor(inSeconds / 60);
        let inHours = floor(inMinutes / 60);

        let seconds = String(inSeconds % 60);
        let minutes = String(inMinutes % 60);
        let hours = String(inHours);
        let formattedParkingTime = (` ${hours}h ${minutes}min ${seconds}sec`);
        return formattedParkingTime;
    }

    addCDR(myCDR) {
        // add CDR to queue in order to send to the eMSP ledger
        this.CDRqueue.push(myCDR);
        this.nCDRsUnconfirmed += 1;
    }

    async processCDRqueue() {

        if (this.CDRqueue.length > 0) {

            // take the first CDR from the queue in memory => queue shrinks by one element
            let firstCDR = this.CDRqueue.shift();

            // register this CDR on the ledger
            let my_countryCode = firstCDR.country_code; // 0
            let my_cpoContractId = firstCDR.party_id; // 1
            let my_recordId = firstCDR.id; // 2
            let my_startDateTime = firstCDR.start_date_time; // 3
            let my_endDateTime = firstCDR.end_date_time; // 4
            let my_sessionId = firstCDR.session_id; // 5
            let my_cdrTokenUid = firstCDR.cdr_token.uid; // 6
            let my_cdrTokenType = firstCDR.cdr_token.type; // 7
            let my_evdrContractId = firstCDR.cdr_token.contract_id; // 8
            let my_authMethod = firstCDR.auth_method; // 9
            let my_authorizationReference = firstCDR.authorization_reference; // 10
            let my_cdrLocation = firstCDR.cdr_location; // 11
            let my_meterId = firstCDR.meter_id; // 12
            let my_currency = firstCDR.currency; // 13
            // let my_tariffs = firstCDR.tariffs;
            // let my_charging_periods = firstCDR.charging_periods;
            let my_signedData = firstCDR.signed_data; // 14
            let my_totalCost = firstCDR.total_cost; // 15
            let my_totalFixedCost = firstCDR.total_fixed_cost; // 16
            let my_totalEnergy = firstCDR.total_energy; // 17
            let my_totalEnergyCost = firstCDR.total_energy_cost; // 18
            let my_totalTime = firstCDR.total_time; // 19
            let my_totalTimeCost = firstCDR.total_time_cost; // 20
            let my_totalParkingTime = firstCDR.total_parking_time; // 21
            let my_totalParkingCost = firstCDR.total_parking_cost; // 22
            let my_totalReservationCost = firstCDR.total_reservation_cost; // 23
            let my_remark = firstCDR.remark; // 24
            let my_invoiceReferenceId = firstCDR.invoice_reference_id; // 25
            let my_credit = firstCDR.credit; // 26
            let my_creditReferenceId = firstCDR.credit_reference_id; // 27
            let my_lastUpdated = firstCDR.last_updated; // 28

            let my_contractIdFI = myFI.ID;
            let my_contractIdEMSP = this.ID;

            //  curl --request POST --data '{"recordId":"1CB7D788881AFCE3DF7CEB3392B549310E5F","cpoContractId":"D12A7100","countryCode":"xxx","startDateTime":"xxx","endDateTime":"xxx","sessionId":"xxx","cdrTokenUid":"xxx","cdrTokenType":"xxx", "evdrContractId": "8256E4B0", "authMethod": "xxx", "authorizationReference": "xxx", "cdrLocation": "xxx", "meterId": "xxx", "currency": "xxx", "signedData": "xxx", "totalCost": "xxx", "totalFixedCost": "xxx", "totalEnergy": "xxx", "totalEnergyCost": "xxx", "totalTime": "xxx", "totalTimeCost": "xxx", "totalParkingTime": "xxx", "totalParkingCost": "xxx", "totalReservationCost": "xxx", "remark": "xxx", "invoiceReferenceId": "xxx", "credit": "xxx", "creditReferenceId": "xxx", "lastUpdated": "xxx", "contractIdFI":"7FAD7F72","contractIdEMSP":"785244A1"}' -H "Content-Type: application/json"  http://127.0.0.1:8080/api/processCDR
            const processCDRurl = 'http://127.0.0.1:8080/api/processCDR';
            const data = { "recordId": my_recordId, "cpoContractId": my_cpoContractId, "countryCode": my_countryCode, "startDateTime": my_startDateTime, "endDateTime": my_endDateTime, "sessionId": my_sessionId, "cdrTokenUid": my_cdrTokenUid, "cdrTokenType": my_cdrTokenType, "evdrContractId": my_evdrContractId, "authMethod": my_authMethod, "authorizationReference": my_authorizationReference, "cdrLocation": my_cdrLocation, "meterId": my_meterId, "currency": my_currency, "signedData": my_signedData, "totalCost": my_totalCost, "totalFixedCost": my_totalFixedCost, "totalEnergy": my_totalEnergy, "totalEnergyCost": my_totalEnergyCost, "totalTime": my_totalTime, "totalTimeCost": my_totalTimeCost, "totalParkingTime": my_totalParkingTime, "totalParkingCost": my_totalParkingCost, "totalReservationCost": my_totalReservationCost, "remark": my_remark, "invoiceReferenceId": my_invoiceReferenceId, "credit": my_credit, "creditReferenceId": my_creditReferenceId, "lastUpdated": my_lastUpdated, "contractIdFI": my_contractIdFI, "contractIdEMSP": my_contractIdEMSP };
            const response = await fetch(processCDRurl, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                // if CDR is successfully registered and settled on the ledger
                this.nCDRsUnconfirmed -= 1;
                console.log("body parameter: ", JSON.stringify(data));
                console.log("response to createOnLedger -> fetch(): ", response);
                return true;
            } else {
                // if CDR is not succesfully registered and settled on the ledger, reinsert in CDRqueue 
                this.CDRqueue.push(firstCDR);
                return false;
            }
        }
        return false;

    }

    /*
    async processCDRqueue() {

        if (this.CDRqueue.length > 0) {

            // take the first CDR from the queue in memory
            let firstCDR = this.CDRqueue.shift();

            // register this CDR on the ledger
            let my_countryCode = firstCDR.country_code; // 0
            let my_cpoContractId = firstCDR.party_id; // 1
            let my_recordId = firstCDR.id; // 2
            let my_startDateTime = firstCDR.start_date_time; // 3
            let my_endDateTime = firstCDR.end_date_time; // 4
            let my_sessionId = firstCDR.session_id; // 5
            let my_cdrTokenUid = firstCDR.cdr_token.uid; // 6
            let my_cdrTokenType = firstCDR.cdr_token.type; // 7
            let my_evdrContractId = firstCDR.cdr_token.contract_id; // 8
            let my_authMethod = firstCDR.auth_method; // 9
            let my_authorizationReference = firstCDR.authorization_reference; // 10
            let my_cdrLocation = firstCDR.cdr_location; // 11
            let my_meterId = firstCDR.meter_id; // 12
            let my_currency = firstCDR.currency; // 13
            // let my_tariffs = firstCDR.tariffs;
            // let my_charging_periods = firstCDR.charging_periods;
            let my_signedData = firstCDR.signed_data; // 14
            let my_totalCost = firstCDR.total_cost; // 15
            let my_totalFixedCost = firstCDR.total_fixed_cost; // 16
            let my_totalEnergy = firstCDR.total_energy; // 17
            let my_totalEnergyCost = firstCDR.total_energy_cost; // 18
            let my_totalTime = firstCDR.total_time; // 19
            let my_totalTimeCost = firstCDR.total_time_cost; // 20
            let my_totalParkingTime = firstCDR.total_parking_time; // 21
            let my_totalParkingCost = firstCDR.total_parking_cost; // 22
            let my_totalReservationCost = firstCDR.total_reservation_cost; // 23
            let my_remark = firstCDR.remark; // 24
            let my_invoiceReferenceId = firstCDR.invoice_reference_id; // 25
            let my_credit = firstCDR.credit; // 26
            let my_creditReferenceId = firstCDR.credit_reference_id; // 27
            let my_lastUpdated = firstCDR.last_updated; // 28

            //  curl --request POST --data '{"recordId":"1CB7D788881AFCE3DF7CEB3392B549310E5F","cpoContractId":"D12A7100","countryCode":"xxx","startDateTime":"xxx","endDateTime":"xxx","sessionId":"xxx","cdrTokenUid":"xxx","cdrTokenType":"xxx", "evdrContractId": "8256E4B0", "authMethod": "xxx", "authorizationReference": "xxx", "cdrLocation": "xxx", "meterId": "xxx", "currency": "xxx", "signedData": "xxx", "totalCost": "xxx", "totalFixedCost": "xxx", "totalEnergy": "xxx", "totalEnergyCost": "xxx", "totalTime": "xxx", "totalTimeCost": "xxx", "totalParkingTime": "xxx", "totalParkingCost": "xxx", "totalReservationCost": "xxx", "remark": "xxx", "invoiceReferenceId": "xxx", "credit": "xxx", "creditReferenceId": "xxx", "lastUpdated": "xxx"}' -H "Content-Type: application/json"  http://127.0.0.1:8080/api/registerCDR
            const registerCDRurl = 'http://127.0.0.1:8080/api/registerCDR';
            const data = { "recordId": my_recordId, "cpoContractId": my_cpoContractId, "countryCode": my_countryCode, "startDateTime": my_startDateTime, "endDateTime": my_endDateTime, "sessionId": my_sessionId, "cdrTokenUid": my_cdrTokenUid, "cdrTokenType": my_cdrTokenType, "evdrContractId": my_evdrContractId, "authMethod": my_authMethod, "authorizationReference": my_authorizationReference, "cdrLocation": my_cdrLocation, "meterId": my_meterId, "currency": my_currency, "signedData": my_signedData, "totalCost": my_totalCost, "totalFixedCost": my_totalFixedCost, "totalEnergy": my_totalEnergy, "totalEnergyCost": my_totalEnergyCost, "totalTime": my_totalTime, "totalTimeCost": my_totalTimeCost, "totalParkingTime": my_totalParkingTime, "totalParkingCost": my_totalParkingCost, "totalReservationCost": my_totalReservationCost, "remark": my_remark, "invoiceReferenceId": my_invoiceReferenceId, "credit": my_credit, "creditReferenceId": my_creditReferenceId, "lastUpdated": my_lastUpdated };
            const response = await fetch(registerCDRurl, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                // if CDR is successfully registered on the ledger, execute settlementCDR
                console.log("body parameter: ", JSON.stringify(data));
                console.log("response to createOnLedger -> fetch(): ", response);

                //  curl --request POST --data '{"recordId":"BA6F8D71399662794B8E80B0EAC82416E21F","contractIdFI":"7FAD7F72","contractIdEMSP":"785244A1"}' -H "Content-Type: application/json"  http://127.0.0.1:8080/api/settlementCDR
                const settlementCDRurl = 'http://127.0.0.1:8080/api/settlementCDR';
                const data2 = { "recordId": my_recordId, "contractIdFI": myFI.ID, "contractIdEMSP": this.ID };
                const response2 = await fetch(settlementCDRurl, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data2)
                });
                if (response2.ok) {
                    this.nCDRsUnconfirmed -= 1;
                    return true;
                }
            } else {
                // if CDR is not succesfully registered on the ledger, reinsert in CDRqueue 
                this.CDRqueue.push(firstCDR);
                return false;
            }
        }
        return false;

    }
    */

    async createOnLedger() {

        let my_contract_id = this.ID;
        let my_uid = this.UID;
        let my_role = "MSP";
        let my_wallet_balance = "0.00";
        let my_fee = this.fee;


        //  cf: curl --request POST http://127.0.0.1:8080/api/enrollAdminOrg1
        const enrollAdminORG1URL = 'http://127.0.0.1:8080/api/enrollAdminOrg1';
        const response1 = await fetch(enrollAdminORG1URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
        });
        console.log("response to createOnLedger -> fetch(): ", response1);
        // const responseData = await response.json();


        //  curl --request POST --data '{"contractId":"33B37086","uId":"CAD34E62D4505529A31659661BC133B37086","rol":"MSP", "walletBalance":"0","fees":"0.0"}' -H "Content-Type: application/json"  http://127.0.0.1:8080/api/createStakeholder
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
        // const responseData = await response.json();

        return true;

    }

}
