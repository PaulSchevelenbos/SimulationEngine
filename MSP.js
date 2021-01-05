class MSP {
    constructor(myName, myFee) {
        this.ID = 0; // TBC change to Ledger key
        this.UID = createRandomUID(36); // Case insensitive String(36)
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
        this.fee = myFee ; // in € per transaction (CDR)
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
        text('CDRqueue.length: ' + this.CDRqueue.length, width - 5, height - 20);
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
    }


}
