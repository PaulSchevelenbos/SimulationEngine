
class EV {
    constructor(myID) {
        this.ID = myID;
        this.UID = createRandomUID(36); // Case insensitive String(36)
        this.cdrToken = new CDRToken(); // contains 'contract_id', identifying EV Driver with MSP
        this.position = createVector();
        this.position.x = random() * width;
        this.position.y = random() * height;
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(0.0, maxSpeed));
        this.acceleration = createVector(0, 0);
        this.specs =
            random([
                { make: "BMW i3 (2019)", BatterykWh: 42, RangeKm: 345, kWhPerkm: 0.165 },
                { make: "GM Spark", BatterykWh: 21, RangeKm: 120, kWhPerkm: 0.175 },
                { make: "Fiat 500e", BatterykWh: 24, RangeKm: 135, kWhPerkm: 0.180 },
                { make: "Honda Fit", BatterykWh: 20, RangeKm: 112, kWhPerkm: 0.180 },
                { make: "Nissan Leaf", BatterykWh: 30, RangeKm: 160, kWhPerkm: 0.190 },
                { make: "Mitsubishi MiEV", BatterykWh: 16, RangeKm: 85, kWhPerkm: 0.190 },
                { make: "Ford Focus", BatterykWh: 23, RangeKm: 110, kWhPerkm: 0.200 },
                { make: "Smart ED", BatterykWh: 16.5, RangeKm: 90, kWhPerkm: 0.200 },
                { make: "Mercedes B", BatterykWh: 28, RangeKm: 136, kWhPerkm: 0.205 },
                { make: "Tesla S 60", BatterykWh: 60, RangeKm: 275, kWhPerkm: 0.220 },
                { make: "Tesla S 85", BatterykWh: 90, RangeKm: 360, kWhPerkm: 0.240 },
                { make: "Tesla 3", BatterykWh: 75, RangeKm: 496, kWhPerkm: 0.151 }
            ]);
        this.remainingBatteryKwh = ((random() * (highBattery - lowBattery) + lowBattery) * this.specs.BatterykWh);
        this.color = [255, 0, 0, 255]; // RGB and Alpha values between 0 and 255
        this.reservedChargePoint = null; // object {MSP id; CPO id; CP id; EVSE id}
        this.arrivedAtChargePoint = false;
        this.startedCharging = false; // true when charging started
        this.isCharging = false; // true while charging 
        this.startedParking = false; // true when parking started (after charging)
        this.isParking = false; // true while parking
        this.parkingTimeDuration = 0.0; // in seconds
        this.sessionEnded = false; // true when charging and parking ended
    };  

    getUID() {
        return (this.UID);
    }

    batteryLife() {
        return (this.remainingBatteryKwh / this.specs.BatterykWh);
    }

    batteryHigh() {
        return (this.batteryLife() > highBattery);
    }

    batteryLow() {
        return (this.batteryLife() <= lowBattery);
    }

    batteryEmpty() {
        if (this.remainingBatteryKwh <= 0) {
            this.remainingBatteryKwh = 0;
            this.color = colorEmpty;
            if (this.reservedChargePoint && this.reservedChargePoint.isMyTurn(this.ID)) {
                this.reservedChargePoint.cancelFirstReservation();
            };
            return true;
        } else {
            return false;
        }
    }

    batteryDecrement() {
        let batteryDecrementPerHour = Number(avgDailyCommuteKm * this.specs.kWhPerkm / 24); // in kWh
        let batteryDecrementPerMinute = Number(batteryDecrementPerHour / 60); // in kWh
        let batteryDecrement = map(speedSlider.value(), 1, 60, batteryDecrementPerMinute, batteryDecrementPerHour, true); // in kWh
        return batteryDecrement;
    }

    parkingTimeDecrement() {
        let timeDecrement = Math.ceil(simulationClock.getFrameTimeUnit() / 1000); // in seconds
        let feasibleTimeDecrement = Math.min(this.parkingTimeDuration, timeDecrement); // in seconds
        this.parkingTimeDuration -= feasibleTimeDecrement;
        return feasibleTimeDecrement;
    }

    parkingTimeOver(){
        return (this.parkingTimeDuration < 5); // leaving in a few seonds
    }

    applyForce(force) {
        maxForce = map(speedSlider.value(), 1, 60, 2.0, 4.0, true);
        force.limit(maxForce);
        this.acceleration.add(force);
    }

    driveAndCharge() {
        if (!this.batteryEmpty()) {
            // cars with zero battery no longer participate in simulation
            maxSpeed = round(map(speedSlider.value(), 1, 60, 4, 15, true));
            if (!this.batteryLow() && (!this.isCharging) && (!this.isParking)) {
                // drive around and drain battery
                this.randomDrive();

            } else if (!this.reservedChargePoint) {
                // make ChargePoint reservation 
                let nearestLocation = myMSP.findNearestLocation(this.position);
                let myNearestChargepoint = nearestLocation.firstFreeEVSE();
                if (myNearestChargepoint.RESERVE_NOW(this.ID)) {
                    this.reservedChargePoint = myNearestChargepoint;
                } else {
                    this.randomDrive();
                }

            } else if (!this.arrivedAtChargePoint) {
                // move to reservedChargePoint
                this.color = (this.reservedChargePoint.isMyTurn(this.ID)) ? colorHeading : colorQueueing;
                this.arriveAtTarget(this.reservedChargePoint);
            } else if (!this.reservedChargePoint.isMyTurn(this.ID)) {
                // do nothing, keep queueing around chargepoint

            } else if (!this.startedCharging) {
                // jump on chargepoint and charge energy
                this.position = this.reservedChargePoint.position.copy();
                this.reservedChargePoint.START_CHARGING(this);
                this.startedCharging = true;
                this.isCharging = true;
                this.color = colorCharging;
                this.parkingTimeDuration = Math.floor(((random() * (2.0 - 0.1)) + 0.1) * 15 * 60); // in seconds
                // random parking time between 10% and 200% of 15 minutes

            } else if (!this.batteryHigh()) {
                // do nothing, let EVSE charge battery

            } else if (!this.startedParking) {
                // change to parking modus
                this.reservedChargePoint.STOP_CHARGING();
                this.isCharging = false;
                this.startedParking = true;
                this.isParking = true;

            } else if (!this.parkingTimeOver()) {
                // do nothing, keep parking
                // EVSE accounts for parkingtime and triggers status change

            } else {
                // batteryHigh() and parkingTime finished
                this.reservedChargePoint.STOP_PARKING();
                this.reservedChargePoint.STOP_SESSION();
                this.reservedChargePoint = null;
                this.arrivedAtChargePoint = false;
                this.startedCharging = false;
                this.startedParking = false;
                this.isParking = false;
                this.color = colorFree;
            }
        }
    }

    randomDrive() {
        // calculate acceleration, velocity and position for next frame
        let r = random(100);  // only steer to desired location in r% of the time
        let turningFrequency = Math.round(map(speedSlider.value(), 1, 60, 4, 15, true));
        if (r < turningFrequency) { // between 5 minSpeed and 15 at maxSpeed
            let desired = p5.Vector.random2D(); // set direction
            desired.mult(random(0, maxSpeed)); // set random magnitude
            let steering = desired.sub(this.velocity); // make relative to current velocity
            this.applyForce(steering);
        }
        this.velocity.add(this.acceleration);
        this.velocity.limit(maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.remainingBatteryKwh -= this.batteryDecrement();
        this.colorUpdate(); // color evolves along batteryLife reduction
    }

    arriveAtTarget(targetPoint) {
        // calculate acceleration, velocity and position for next frame towards targetPoint
        let desired = p5.Vector.sub(targetPoint.position, this.position);
        let distance = Number(desired.mag());
        let steering = desired.sub(this.velocity);
        this.applyForce(steering);
        this.velocity.add(this.acceleration);
        if (distance > (10 * objectSize)) {
            this.velocity.setMag(maxSpeed);
        } else {
            let decliningSpeed = map(distance, (10 * objectSize), 0, maxSpeed, 0, true);
            this.velocity.setMag(decliningSpeed);
        };
        this.position.add(this.velocity);
        this.acceleration.mult(0);
        this.remainingBatteryKwh -= this.batteryDecrement();
        this.arrivedAtChargePoint = (p5.Vector.dist(targetPoint.position, this.position) <= 3 * objectSize);
    }

    chargeEnergy(myChargingIncrement) {
        let expectedKwh = (this.remainingBatteryKwh + myChargingIncrement);
        let overloadKwh = Math.max(expectedKwh - (highBattery * this.specs.BatterykWh), 0);
        let chargedKwh = (myChargingIncrement - 0.99 * overloadKwh);
        this.remainingBatteryKwh += chargedKwh;
        return chargedKwh;
    }


    colorUpdate() {
        let brightness = map(this.batteryLife(), 0.2, 0.8, 255, 30, true);
        let redValue = 255;
        let greenValue = 0;
        let blueValue = 0;
        this.color = [redValue, greenValue, blueValue, brightness];
    }

    borders() {
        // left
        if (this.position.x < objectSize) {
            this.position.x = objectSize;
            this.velocity.x *= -1;
        };
        // right
        if (this.position.x > width - objectSize) {
            this.position.x = width - objectSize;
            this.velocity.x *= -1;
        };
        // top
        if (this.position.y < objectSize) {
            this.position.y = objectSize;
            this.velocity.y *= -1;
        };
        // bottom
        if (this.position.y > height - objectSize) {
            this.position.y = height - objectSize;
            this.velocity.y *= -1;
        }
    }

    show() {
        // point(this.position.x, this.position.y);
        drawArrow(this.position, this.velocity, objectSize, this.color);

        // draw an arrow for a vector at a given base position
        function drawArrow(base, vec, arrowSize, myColor) {
            push();
            noStroke();
            fill(myColor);
            translate(base.x, base.y);
            line(0, 0, vec.x, vec.y);
            rotate(vec.heading());
            translate(vec.mag() - arrowSize, 0);
            triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
            pop();
        }
    }

    async createOnLedger() {

        let my_contract_id = this.cdrToken.contract_id;
        let my_uid = this.cdrToken.uid;
        let my_role = "EVDR";
        let my_wallet_balance = "0.00";
        let my_fee = "0.00";

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