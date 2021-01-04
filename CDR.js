class CDR {
    constructor(
        myCountry_code,
        myParty_id,
        myStart_date_time,
        myEnd_date_time,
        mySession_id,
        myCdr_token,
        myExtendedLocation,
        myCurrency,
        myTariffs,
        myChargingPeriods,
        myTotalCost,
        myTotal_energy,
        myTotalEnergyCost,
        myTotal_parking_time,
        myTotal_parking_cost, 
        myLast_updated
    ) {
        this.country_code = myCountry_code; // CiString(2), ISO-3166 alpha-2 country code of the CPO that 'owns' this CDR.
        this.party_id = myParty_id; // CiString(3), CPO ID of the CPO that 'owns' this CDR (following the ISO-15118 standard).
        this.id = createRandomUID(36); // CiString(39), Uniquely identifies the CDR within the CPO’s platform (and suboperator platforms). This field is longer than the usual 36 characters to allow for credit CDRs to have something appended to the original ID. Normal (non-credit) CDRs SHALL only have an ID with a maximum length of 36.
        this.start_date_time = myStart_date_time; //DateTime, Start timestamp of the charging session, or in -case of a reservation(before the start of a session) the start of the reservation.
        this.end_date_time = myEnd_date_time; // DateTime, The timestamp when the session was completed/finished, charging might have finished before the session ends, for example: EV is full, but parking cost also has to be paid.
        this.session_id = mySession_id; // CiString(36), Unique ID of the Session for which this CDR is sent. Is only allowed to be omitted when the CPO has not implemented the Sessions module or this CDR is the result of a reservation that never became a charging session, thus no OCPI Session.
        this.cdr_token = myCdr_token; // CdrToken, Token used to start this charging session, includes all the relevant information to identify the unique token.
        this.auth_method = ""; // AuthMethod, Method used for authentication.
        this.authorization_reference = ""; // CiString(36), Reference to the authorization given by the eMSP. When the eMSP provided an authorization_reference in either: real-time authorization or StartSession, this field SHALL contain the same value. When different authorization_reference values have been given by the eMSP that are relevant to this Session, the last given value SHALL be used here.
        this.cdr_location = myExtendedLocation; // CdrLocation, Location where the charging session took place, including only the relevant EVSE and Connector.
        this.meter_id = ""; // string(255), ?, Identification of the Meter inside the Charge Point.
        this.currency = myCurrency; // string(3), Currency of the CDR in ISO 4217 Code.
        this.tariffs = myTariffs; // Tariff, *, List of relevant Tariff Elements, see: Tariff. When relevant, a Free of Charge tariff should also be in this list, and point to a defined Free of Charge Tariff.
        this.charging_periods = myChargingPeriods; // ChargingPeriod, +, List of Charging Periods that make up this charging session. A session consists of 1 or more periods, where each period has a different relevant Tariff.
        this.signed_data = ""; // SignedData, ?, Signed data that belongs to this charging Session.
        this.total_cost = myTotalCost; // Price, Total sum of all the costs of this transaction in the specified currency.
        this.total_fixed_cost = ""; // Price, ?, Total sum of all the fixed costs in the specified currency, except fixed price components of parking and reservation. The cost not depending on amount of time/energy used etc. Can contain costs like a start tariff.
        this.total_energy = myTotal_energy; // number, Total energy charged, in kWh.
        this.total_energy_cost = myTotalEnergyCost; // Price, ?, Total sum of all the cost of all the energy used, in the specified currency.
        this.total_time = ""; // number, Total duration of the charging session (including the duration of charging and not charging), in hours.
        this.total_time_cost = ""; // Price, ?, Total sum of all the cost related to duration of charging during this transaction, in the specified currency.
        this.total_parking_time = myTotal_parking_time; // number, ?, Total duration of the charging session where the EV was not charging (no energy was transferred between EVSE and EV), in hours.
        this.total_parking_cost = myTotal_parking_cost; // Price, ?, Total sum of all the cost related to parking of this transaction, including fixed price components, in the specified currency.
        this.total_reservation_cost = ""; // Price, ?, Total sum of all the cost related to a reservation of a Charge Point, including fixed price components, in the specified currency.
        this.remark = ""; // string(255), ?, Optional remark, can be used to provide additional human readable information to the CDR, for example: reason why a transaction was stopped.
        this.invoice_reference_id = ""; // CiString(39), ?, This field can be used to reference an invoice, that will later be send for this CDR. Making it easier to link a CDR to a given invoice. Maybe even group CDRs that will be on the same invoice.
        this.credit = false; // boolean, ?, When set to true, this is a Credit CDR, and the field credit_reference_id needs to be set as well.
        this.credit_reference_id = ""; // CiString(39), ?, Is required to be set for a Credit CDR. This SHALL contain the id of the CDR for which this is a Credit CDR.
        this.last_updated = myLast_updated; // DateTime, Timestamp when this CDR was last updated (or created).
    }
}