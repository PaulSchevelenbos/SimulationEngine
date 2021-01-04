class TariffEngine {
    constructor() {
        this.tariffTypeRegularEnergy =
            { tariff_id: createRandomUID(36), priceComponentType: "ENERGY", price: 0.20, vat: 0.10, step_size: 0.5, tariffRestriction: "start_time", treshHold: "00:00" };
        this.tariffTypeRegularParking =
            { tariff_id: createRandomUID(36), priceComponentType: "PARKING_TIME", price: (2.00 / 3600), vat: 0.10, step_size: 300, tariffRestriction: "min_duration", treshHold: "300" };
    };
    // start_time (string(5)): Start time of day in local time, the time zone is defined in the time_zone field of the Location, for example 13:30, valid from this time of the day. Must be in 24h format with leading zeros. Hour/Minute separator: ":" Regex: ([0-1][0-9]|2[0-3]):[0-5][0-9]
    // min_duration (int): Minimum duration in seconds the Charging Session MUST last (inclusive). When the duration of a Charging Session is longer than the defined value, this TariffElement is or becomes active. Before that moment, this TariffElement is not yet active.
    // price (number): Price per unit (excl. VAT) for this tariff dimension. -> per kWh or per second
    // vat (number): Applicable VAT percentage for this tariff dimension. If omitted, no VAT is applicable. Not providing a VAT is different from 0% VAT, which would be a value of 0.0 here.
    // step_size: e.g. 0.5 kWh or 300 seconds (= 5 minutes); Minimum amount to be billed. This unit will be billed in this step_size blocks. Amounts that are less then this step_size are rounded up to the given step_size. For example: if type is TIME and step_size has a value of 300, then time will be billed in blocks of 5 minutes. If 6 minutes were used, 10 minutes (2 blocks of step_size) will be billed.
    // priceComponentType -> TariffDimensionType -> 
    //   ENERGY: Defined in kWh, step_size multiplier: 1 Wh
    //   FLAT: Flat fee without unit for step_size
    //   PARKING_TIME: Time not charging: defined in hours, step_size multiplier: 1 second
    //   TIME: Time charging: defined in hours, step_size multiplier: 1 second; Can also be used in combination with a RESERVATION restriction to describe the price of the reservation time.

    getTariff(myTariffType, myPriceComponentType, myTariffRestriction, myChargingPeriodStartTime) {
        // lookup energy tariff
        if (myTariffType == "REGULAR" && myPriceComponentType == "ENERGY") {
            return this.tariffTypeRegularEnergy;
        };

        // lookup parking tariff
        if (myTariffType == "REGULAR" && myPriceComponentType == "PARKING_TIME") {
            return this.tariffTypeRegularParking;
        };
        return false; // no tariff found according to criteria
    }

}