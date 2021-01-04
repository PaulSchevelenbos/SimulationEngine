class Locations {
    constructor(r) {
        this.resolution = r;
        this.cols = floor(width / r);
        this.rows = floor(height / r);
        this.list = []; // array to store all locations
        this.list.length = this.cols * this.rows;
        for (let i= 0; i < this.list.length; i++) {this.list[i] = null};
    };

    addLocation(myCPOid) {
        let newLocation = null;
        while (!newLocation) {
            let col = floor(random() * this.cols);
            let row = floor(random() * this.rows);
            let index = col + (row * this.cols);
            if (!this.list[index]) {
                let myLocationName = this.locationName(row, col);
                let myLeft = col * this.resolution;
                let myRight = (col + 1) * this.resolution;
                let myTop = row * this.resolution;
                let myBottom = (row + 1) * this.resolution;
                // create new location and add to the lists
                newLocation = new Location(myLocationName, myCPOid, myLeft, myRight, myTop, myBottom);
                this.list[index] = newLocation;
                myMSP.addLocation(newLocation);
            }
        };
        return newLocation;
    };

    locationName(myRow, myCol) {
        let rowLabel = "";
        for (let k = 0; k <= floor(myRow / 26); k++) {
            rowLabel += String.fromCharCode(65 + myRow % 26);
        }
        let locationName = rowLabel + String(myCol);
        return locationName; // e.g. "AA77"
    };

    maxLocations() {
        return (this.cols * this.rows);
    }

}