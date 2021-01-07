class FI {
    constructor(myName, myFee) {
        this.name = myName;
        this.UID = createRandomUID(36); // Case insensitive String(36)
        this.fee = myFee; // in € per transaction (CDR)
    }

    async createOnLedger() {

        /*
        //  TEST1: curl --request POST http://127.0.0.1:8080/api/enrollAdminOrg1
        const enrollAdminORG1URL = 'http://127.0.0.1:8080/api/enrollAdminOrg1';
        const response = await fetch(enrollAdminORG1URL, {
            method: 'POST',
            mode: 'cors',
            //cache: 'default',
            // credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            // redirect: 'follow',
            // referrerPolicy: 'Access-Control-Allow-Origin',
            // body: JSON.stringify(data)
        });
        console.log("response to createOnLedger -> fetch(): ", response);
        // const responseData = await response.json();
        */

        // TEST2: curl --request POST --data '{"userId":"USER_001","password":"0x023","companyId":"COMP_001","email":"james.bond@mi6.org","firstname":"James","lastname":"Bond"}' -H "Content-Type: application/json"  http://127.0.0.1:8080/api/createUser;
        const createUserURL = 'http://127.0.0.1:8080/api/createUser';
        const data = { "userId": "USER_013", "password": "0x023", "companyId": "COMP_001", "email": "james.bond@mi6.org", "firstname": "James", "lastname": "Bond" };
        const response = await fetch(createUserURL, {
            method: 'POST',
            mode: 'cors',
            //cache: 'default',
            // credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            // headers: { 'Content-Type': 'application/json' , 'Access-Control-Allow-Origin': '*'},
            // redirect: 'follow',
            // referrerPolicy: 'Access-Control-Allow-Origin',
            body: JSON.stringify(data)
        });
        console.log("body parameter: ", JSON.stringify(data));
        console.log("response to createOnLedger -> fetch(): ", response);
        // const responseData = await response.json();

    }
}