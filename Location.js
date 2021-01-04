class Location {
    constructor(myName, myCPOid, myLeft, myRight, myTop, myBottom) {
        // simulation properties
        this.westCoordinate = myLeft; // x1
        this.eastCoordinate = myRight; // x2
        this.northCoordinate = myTop; // y1
        this.southCoordinate = myBottom; // y2

        // OCPI properties
        this.country_code = "BE"; // CiString(2), 1, ISO-3166 alpha-2 country code of the CPO that 'owns' this Location.
        this.party_id = myCPOid; // CiString(3), 1, CPO ID of the CPO that 'owns' this Location (following the ISO-15118 standard).
        this.id = createRandomUID(36); // CiString(36), 1, Uniquely identifies the location within the CPOs platform (and suboperator platforms). This field can never be changed, modified or renamed.
        this.publish; // boolean, 1, Defines if a Location may be published on an website or app etc.
        // When this is set to false, only tokens identified in the field: publish_allowed_to are allowed to be shown this Location.
        // When the same location has EVSEs that may be published and may not be published, two 'Locations' should be created.
        this.publish_allowed_to; // PublishTokenType, *, This field may only be used when the publish field is set to false
        // Only owners of Tokens that match all the set fields of one PublishToken in the list are allowed to be shown this location.
        this.name = myName; // string(255), ?, Display name of the location.
        this.address; // string(45), 1, Street/block name and house number if available.
        this.city; // string(45), 1, City or town.
        this.postal_code; // string(10), ?, Postal code of the location, may only be omitted when the location has no postal code: in some countries charging locations at highways don’t have postal codes.
        this.state; // string(20), ?, State or province of the location, only to be used when relevant.
        this.country = "Belgium"; // string(3), 1, ISO 3166-1 alpha-3 code for the country of this location.
        this.coordinates; // GeoLocation, 1, Coordinates of the location.
        this.related_locations; // AdditionalGeoLocation, *, Geographical location of related points relevant to the user.
        this.parking_type; // ParkingType, ?, The general type of parking at the charge point location.
        this.evses = []; // EVSE, *, List of EVSEs that belong to this Location.
        this.directions; // DisplayText, *, Human-readable directions on how to reach the location.
        this.operator; // BusinessDetails, ?, Information of the operator. When not specified, the information retrieved from the Credentials module should be used instead.
        this.suboperator; // BusinessDetails, ?, Information of the suboperator if available.
        this.owner; // BusinessDetails, ?, Information of the owner if available.
        this.facilities; // Facility, *, Optional list of facilities this charging location directly belongs to.
        this.time_zone = "Europe/Oslo"; // string(255), 1, One of IANA tzdata’s TZ-values representing the time zone of the location. Examples: "Europe/Oslo", "Europe/Zurich". (http://www.iana.org/time-zones)
        this.opening_times; // Hours, ?, The times when the EVSEs at the location can be accessed for charging.
        this.charging_when_closed; // boolean, ?, Indicates if the EVSEs are still charging outside the opening hours of the location. E.g. when the parking garage closes its barriers over night, is it allowed to charge till the next morning? Default: true
        this.images; // Image, *, Links to images related to the location such as photos or logos.
        this.energy_mix; // EnergyMix, ?, Details on the energy supplied at this location.
        this.last_updated = simulationClock.getStartTime(); // DateTime, 1, Timestamp when this Location or one of its EVSEs or Connectors were last updated (or created).
    };

    addEVSE(myEVSE) {
        this.evses.push(myEVSE)
        return;
    };

    getName() {
        return this.name;
    };

    getId(){
        return this.id;
    }

    left() { return this.westCoordinate };
    right() { return this.eastCoordinate };
    top() { return this.northCoordinate };
    bottom() { return this.southCoordinate };
    position() {
        return createVector(
            round((this.westCoordinate + this.eastCoordinate) / 2),
            round((this.northCoordinate + this.southCoordinate) / 2)
        )
    };

    firstFreeEVSE() {
        let quickestEVSE = this.evses[0];
        if (this.evses.length > 1) {
            for (let i = 1; i < this.evses.length; i++) {
                if (this.evses[i].chargeQueue.length < quickestEVSE.chargeQueue.length) {
                    quickestEVSE = this.evses[i];
                }
            }
        };
        return quickestEVSE;
    };

    show() {
        noStroke();
        strokeWeight(1);
        fill(colorLocationField);
        rect(
            this.westCoordinate,
            this.northCoordinate,
            this.eastCoordinate - this.westCoordinate,
            this.southCoordinate - this.northCoordinate
        );
    }
}
