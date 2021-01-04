class ChargingPeriod {
    constructor(myStartDateTime, myDimensionType, myTarrifId) {
        this.start_date_time = myStartDateTime; // DateTime, 1, Start timestamp of the charging period. A period ends when the next period starts. The last period ends when the session ends.
        this.dimensionType = myDimensionType; // e.g. "ENERGY_IMPORT", "ENERGY_EXPORT", "PARKING_TIME"
        this.dimensionVolume = 0.0; // in kWh or seconds
        this.tariff_id = myTarrifId; // CiString(36), ?, Unique identifier of the Tariff that is relevant for this Charging Period. If not provided, no Tariff is relevant during this period.44
    }

    addVolume(myVolume){
        this.dimensionVolume += myVolume;
        return;
    }
}