class Session {
    constructor(
        myCPO_id,
        myLocation_id,
        myEvse_uid,
        myConnector_id,
        myStartTime,
        myCDRToken,
        myEnergyTariff,
        myParkingTariff
    ) {
        this.country_code = "BE"; // CiString(2), 1, ISO-3166 alpha-2 country code of the CPO that 'owns' this Session.
        this.party_id = myCPO_id; // CiString(3), 1, CPO ID of the CPO that 'owns' this Session (following the ISO-15118 standard).
        this.id = createRandomUID(36); // CiString(36), 1, The unique id that identifies the charging session in the CPO platform.
        this.start_date_time = myStartTime; // DateTime, 1, The timestamp when the session became ACTIVE in the Charge Point.
        // When the session is still PENDING, this field SHALL be set to the time the Session was created at the Charge Point. When a Session goes from PENDING to ACTIVE, this field SHALL be update to the moment the Session went to ACTIVE in the Charge Point.
        this.end_date_time; // DateTime, ?, The timestamp when the session was completed/finished, charging might have finished before the session ends, for example: EV is full, but parking cost also has to be paid.
        this.kwh = 0.0; // number, 1, How many kWh were charged.
        this.parkingTime = 0.0; // number, how many seconds parked after charging
        this.cdr_token = myCDRToken; // CdrToken, 1, Token used to start this charging session, including all the relevant information to identify the unique token.
        this.auth_method; // AuthMethod, 1, Method used for authentication.
        this.authorization_reference; // CiString(36), ?, Reference to the authorization given by the eMSP. When the eMSP provided an authorization_reference in either: real-time authorization or StartSession, this field SHALL contain the same value.
        // When different authorization_reference values have been given by the eMSP that are relevant to this Session, the last given value SHALL be used here.
        this.location_id = myLocation_id; // CiString(36), 1, Location.id of the Location object of this CPO, on which the charging session is/was happening.
        this.evse_uid = myEvse_uid; // CiString(36), 1, EVSE.uid of the EVSE of this Location on which the charging session is/was happening.
        this.connector_id = myConnector_id; // CiString(36), 1, Connector.id of the Connector of this Location the charging session is/was happening.
        this.meter_id; // string(255), ?, Optional identification of the kWh meter.
        this.currency = "EUR"; // string(3), 1, ISO 4217 code of the currency used for this session.
        this.charging_periods = []; // ChargingPeriod, *, An optional list of Charging Periods that can be used to calculate and verify the total cost.
        // this.total_cost; // Price, ?, The total cost of the session in the specified currency. This is the price that the eMSP will have to pay to the CPO. A total_cost of 0.00 means free of charge. When omitted, i.e. no price information is given in the Session object, it does not imply the session is/was free of charge.
        this.cost = { total: 0.0, reservation: 0.0, session: 0.0, energy: 0.0, parking: 0.0 };
        this.status = "RESERVATION"; // SessionStatus, 1, The status of the session.
        this.last_updated = simulationClock.getCurrentTime(); // DateTime, 1, Timestamp when this Session was last updated (or created)
        this.energyTariff = myEnergyTariff; // valid at beginning of charging session
        this.parkingTariff = myParkingTariff; // valid at beginning of charging session
        return this;
    }

    getEnergyUnitCost() {
        return this.energyTariff.price;
    }
    getEnergyStepSize() {
        return this.energyTariff.step_size;
    }

    getParkingUnitCost() {
        return this.parkingTariff.price;
    }
    getParkingStepSize() {
        return this.parkingTariff.step_size;
    }

    setStatus(newStatus) {
        return this.status = newStatus;
    }

    getStartTime() {
        return this.start_date_time;
    }

    addEnergyToChargingPeriods(myTime, myVolume) {
        this.addToChargingPeriods(myTime, "ENERGY_IMPORT", myVolume, this.energyTariff);
        this.kwh += myVolume;
        return;
    }

    addParkingTimeToChargingPeriods(myTime, myVolume) {
        this.addToChargingPeriods(myTime, "PARKING_TIME", myVolume, this.parkingTariff);
        this.parkingTime += myVolume;
        return;
    }

    addToChargingPeriods(myTime, myDimensionType, myVolume, myTariff) {
        if (this.charging_periods.length == 0) {
            let newChargingPeriod = new ChargingPeriod(myTime, myDimensionType, myTariff.tariff_id);
            newChargingPeriod.addVolume(myVolume);
            this.charging_periods.push(newChargingPeriod);
            this.last_updated = myTime;

        } else {
            // already some charging period running
            let indexLast = (this.charging_periods.length - 1);
            let currentChargingPeriod = this.charging_periods[indexLast];
            if ((currentChargingPeriod.dimensionType == myDimensionType) &&
                ((Date.parse(myTime) - Date.parse(currentChargingPeriod.start_date_time)) < (15 * 60 * 1000))) {
                currentChargingPeriod.addVolume(myVolume);
                this.last_updated = myTime;
            } else {
                let newChargingPeriod = new ChargingPeriod(myTime, myDimensionType, myTariff.tariff_id);
                newChargingPeriod.addVolume(myVolume);
                this.charging_periods.push(newChargingPeriod);
                this.last_updated = myTime;
            }
        };
        return;
    }
}