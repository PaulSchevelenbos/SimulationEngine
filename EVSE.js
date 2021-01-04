class EVSE {
    // Electric Vehicle Supply Equipment (= ChargePoint for one EV at a time)
    constructor(myCPO, myID, myLocation, myMsp, myTariffs) {
        this.UID = createRandomUID(36); // Case insensitive String(36)
        this.CPO = myCPO; // chargepoint owner
        this.status; // free, charging, reserved
        this.position = createVector(); // position on simulation map (x,y)
        this.position.x = Math.min(round(random((myLocation.left() + objectSize), (myLocation.right() - objectSize))), width - 10);
        this.position.y = Math.min(round(random(myLocation.top() + objectSize, myLocation.bottom() - objectSize)), height - 10);
        this.evseID = myID; // identifier
        this.color = colorFree;
        this.MSP = myMsp; // onboarded MSP (simulation set up for a single MSP)
        this.specs =
            random([
                { make: "AC fast charge low", capacityKW: 7, nConnectors: 1 },
                { make: "AC fast charge medium", capacityKW: 14, nConnectors: 1 },
                { make: "TRES fast charge", capacityKW: 20, nConnectors: 2 },
                { make: "AC fast charge high", capacityKW: 22, nConnectors: 2 },
                { make: "DC rapid", capacityKW: 50, nConnectors: 2 },
                { make: "DC ultra rapid", capacityKW: 150, nConnectors: 1 }
            ]); // connector = power outlet = socket
        this.chargeQueue = []; // holds EV reservations for charging
        this.chargingSession = null;
        this.chargingEV = null;
        this.location = myLocation;
        return this;
    }

    getPosition() {
        return this.position;
    }

    isMyTurn(myEVid) {
        // true when evID is first in the queue
        return (this.chargeQueue[0] == myEVid)
    };

    RESERVE_NOW(myEVid) {
        if (this.chargeQueue.length < 10) {
            this.chargeQueue.push(myEVid);
            this.color = colorReserved;
            return true;
        } else {
            return false;
        }
    }

    selectConnector() {
        return (ceil(random() * this.specs.nConnectors));
    }

    START_CHARGING(myEV) {
        // ask CPO the tariffs valid at start of session
        let now = simulationClock.getCurrentTime();
        let energyTariff = this.CPO.tariffEngine.getTariff(
            "REGULAR", "ENERGY", "start_time", now);
        let parkingTariff = this.CPO.tariffEngine.getTariff(
            "REGULAR", "PARKING_TIME", "min_duration", now);

        this.chargingSession = new Session(
            this.CPO.getID(),
            this.location.getId(),
            this.UID,
            this.selectConnector(),
            now,
            myEV.cdrToken,
            energyTariff,
            parkingTariff
        );
        this.chargingSession.setStatus("ACTIVE");
        this.chargingEV = myEV; // state causing operate() to start charging
        this.color = colorCharging;
        return;
    }

    operate() {
        // provide energy or parking facility
        if (this.chargingSession && this.chargingEV) {
            if (this.chargingEV.isCharging) {
                // chargingSession runs and car is connected for charging
                let now = simulationClock.getCurrentTime();
                let chargingIncrement = this.energyOutput();
                let chargedKwh = this.chargingEV.chargeEnergy(chargingIncrement);
                // in kWh, increases battery level of the EV
                this.chargingSession.addEnergyToChargingPeriods(now, chargedKwh);
                myMSP.totalKWh += chargedKwh;
            }
        };
        if (this.chargingSession && this.chargingEV) {
            if (this.chargingEV.isParking) {
                // chargingSession runs and car remains parking
                let now = simulationClock.getCurrentTime();
                let parkingTime = this.chargingEV.parkingTimeDecrement();
                // in seconds, reduces remaining parking time
                this.chargingSession.addParkingTimeToChargingPeriods(now, parkingTime);
                myMSP.totalParkingTime += parkingTime;
            }
        };
        return;
    }

    cancelFirstReservation() {
        this.chargeQueue.shift(); // remove the first element
        if (this.chargeQueue.length == 0) {
            this.color = colorFree;
        } else {
            this.color = colorReserved;
        }
    }

    STOP_CHARGING() {
        simulationClock.getCurrentTime();
        let numberOfSteps = Math.ceil(this.chargingSession.kwh / this.chargingSession.energyTariff.step_size);
        let costOfStep = this.chargingSession.energyTariff.price * this.chargingSession.energyTariff.step_size;
        let energyCost = numberOfSteps * costOfStep;
        let energyVAT = energyCost * this.chargingSession.energyTariff.vat;
        let totalEnergyCost = energyCost + energyVAT;
        this.chargingSession.cost.energy = totalEnergyCost;
        myMSP.totalEnergyCost += totalEnergyCost;
    }

    STOP_PARKING() {
        simulationClock.getCurrentTime();
        let numberOfSteps = Math.ceil(this.chargingSession.parkingTime / this.chargingSession.parkingTariff.step_size);
        let costOfStep = this.chargingSession.parkingTariff.price * this.chargingSession.parkingTariff.step_size;
        let parkingCost = numberOfSteps * costOfStep;
        let parkingVAT = parkingCost * this.chargingSession.parkingTariff.vat;
        let totalParkingCost = parkingCost + parkingVAT;
        this.chargingSession.cost.parking = totalParkingCost;
        myMSP.totalParkingCost += totalParkingCost;
    }

    STOP_SESSION() {
        this.chargingSession.end_date_time = simulationClock.getCurrentTime();
        let totalSessionCost =
            this.chargingSession.cost.reservation +
            this.chargingSession.cost.session +
            this.chargingSession.cost.energy +
            this.chargingSession.cost.parking;
        this.chargingSession.cost.total = totalSessionCost;
        myMSP.totalCost += totalSessionCost;
        myMSP.nFinishedSessions += 1;

        // Create CDR for session
        let cdrExtendedLocation = this.chargingSession.location_id + "/" + this.chargingSession.evse_uid + "/" + this.chargingSession.connector_id;
        let cdrTariffs = [this.chargingSession.energyTariff, this.chargingSession.parkingTariff];
        let newCDR = new CDR(
            this.chargingSession.country_code,
            this.chargingSession.party_id,
            this.chargingSession.start_date_time,
            this.chargingSession.end_date_time,
            this.chargingSession.id,
            this.chargingSession.cdr_token,
            cdrExtendedLocation,
            this.chargingSession.currency,
            cdrTariffs,
            this.chargingSession.charging_periods,
            this.chargingSession.cost.total,
            this.chargingSession.kwh,
            this.chargingSession.cost.energy,
            this.chargingSession.parkingTime,
            this.chargingSession.cost.parking,
            simulationClock.getCurrentTime()
        );
        myMSP.addCDR(newCDR);
        // TBC -> remove the Session !!!

        // send CDR to eMSP
        this.chargingEV = null;
        this.chargeQueue.shift(); // remove the first element
        if (this.chargeQueue.length == 0) {
            this.color = colorFree;
        } else {
            this.color = colorReserved;
        }
    }

    energyOutput() {
        // taking into account ChargePoint specs and speedSlider (setting the time unit per frame)
        let outputPerHour = this.specs.capacityKW * 1; // output in one hour (kWh)
        let outputPerMinute = (outputPerHour / 60); // output in one minute (kWh)
        let energyOutput = map(speedSlider.value(), 1, 60, outputPerMinute, outputPerHour, true);
        return energyOutput;
    }

    show() {
        fill(this.color);
        rect(this.position.x, this.position.y, objectSize / 3, objectSize);
    }
}