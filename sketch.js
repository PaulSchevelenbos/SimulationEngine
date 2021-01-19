// Pro memorie:
// to start server in index.html subdir: $ http-server
// in browser surf to URL: http://localhost:8081/ (if node is already started on port 8080)
// to beautify JS code in Visual Studio Code: CTRL+SHIFT+i 


// Global constants
const colorFree = [0, 200, 0, 200]; // RGB green
const colorReserved = [0, 0, 150, 200]; // RGB dark blue
const colorCharging = [255, 255, 0, 255]; // RGB yellow
const colorQueueing = [135, 206, 235, 255]; // RGB pale blue
const colorHeading = [30, 144, 255, 255]; // RGB dodger blue
const colorEmpty = [255, 153, 51, 255]; // RGB dodger blue
const oneMinute = 60000; // 60.000 milliseconds = 60 seconds = 1 minute 
const hexValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
const colorLocationField = [252, 159, 159, 150];


// Simulation parameters
let evCount = 5; // number of EV's
let nLocations = 2; // number of locations with EVSEs, topped to myLocations.maxLocations()
let evseDistribution = [5, 2, 1]; // maximum number of EVSEs per location
let objectSize; // size of EV's and CP's in pixels for display
let speedSlider; // slider element in the DOM: minutes per frame (1 to 60)
let maxSpeed = 5; // Maximum speed: 5 to 15
let maxForce = 2.0; // Maximum steering force: 2.0 to 4.0
let simulationFrameRate = 60; // 60 frames per second (every frame is from 1 minute up to 60 minutes)
let simulationClock; // keeps track of (accellerated) time progression
let startStopButton; // alternates between start/resume or stop 
let resetButton; // resets the currentTime to startTime
let simulationRunning = false; // function draw only executes when 'true'
let myLocations; // territory split in locations like a chessfield
let myResolution; // pixel length of one matrix square dividing the map in locations


// Utility functions
function createRandomUID(idLength) {
	// creates Unique Identifier of random Hex characters
	let outputString = "";
	for (let i = 0; i < idLength; i++) {
		outputString += random(hexValues);
	};
	return outputString;
}


// Ecosystem parameters
let avgDailyCommuteKm = 31.84; // source: https://www.duurzame-mobiliteit.be/nieuws/ovg-55-aantal-verplaatsingen-en-kilometers-blijven-gelijk
let lowBattery = 0.30; // EV requires charging below this remaining battery percentage
let highBattery = 0.80; // EV charges until this battery percentage
let initialFunding = 50.00; // EV Drivers receive this initial funding

const myFleet = []; // array of EV's
const myCPOs = []; // CPO's will onboard with our MSP
let myMSP; // Simulaton is set up for a single MSP
let myFI; // Simulation assumes a financial institution accountable for tx's
let myTech; // Tech account keeps track of created €-tokens


// preparation before draw
async function setup() {

	// createCanvas(windowWidth, windowHeight)
	cityMap = loadImage('images/Medium-MapLeuven.jpg'); // TBC zoomed-out image when many EV's
	createCanvas(787, 528);

	// time elements
	speedSlider = createSlider(1, 60, 1, 1); // createSlider(min, max, [value], [step])
	frameRate(simulationFrameRate);
	simulationClock = new Clock(new Date(2021, 02, 01, 9, 30));
	startStopButton = createButton('START/STOP'); // to start/stop the simulation run 
	startStopButton.mousePressed(startStopSimulation);

	// choose objectSize (ChargePoint, EV) and resolution of locations proportional with evCount
	objectSize = round(map(evCount, 0, 1000, 9, 3, true));
	myResolution = 5 * objectSize;
	myLocations = new Locations(myResolution);

	// create stakeholders, Locations and chargepoints
	myMSP = new MSP("TRES", 0.01); // specify name and fee
	const mspCreatedOnLedger = await myMSP.createOnLedger();
	myFI = new FI("KBC", 0.01); // specify name and fee
	const fiCreatedOnLedger = await myFI.createOnLedger();
	myTech = new TechAccount();
	const techCreatedOnLedger = await myTech.createOnLedger();

	nLocations = Math.min(nLocations, myLocations.maxLocations()); // no more than grid allows
	for (let i = 0; i < nLocations; i++) {
		let newCPO = new CPO(i);
		myCPOs.push(newCPO);
		const cpoCreatedOnLedger = await newCPO.createOnLedger();
		// create new location
		let newLocation = myLocations.addLocation(newCPO.getID());
		// create chargepoints (EVSEs) in this new location (number according to distribution)
		let nEVSEonLocation = random(evseDistribution);
		for (let j = 0; j < nEVSEonLocation; j++) {
			let newEVSEid = newLocation.getName() + "/" + newCPO.getName() + "/" + String(j);
			let newEVSE = new EVSE(newCPO, newEVSEid, newLocation, myMSP);
			newLocation.addEVSE(newEVSE);
			myMSP.addEVSE(newEVSE);
			newCPO.addEVSE(newEVSE);
		}
	}

	// create Electronic Vehicles
	for (let i = 0; i < evCount; i++) {
		let newEV = new EV(i);
		myFleet.push(newEV);
		const evCreatedOnLedger = await newEV.createOnLedger();
		const evFundedInitially = await newEV.fund(initialFunding);
	}
};

function startStopSimulation() {
	simulationRunning = !simulationRunning;
}

// draw per frame, using P5 library 
function draw() {
	if (simulationRunning) {
		background(cityMap);

		// display time info
		simulationClock.update(speedSlider.value());
		simulationClock.show();

		// animate EV Simulation
		myMSP.showLocations();
		myMSP.showStatistics();
		myMSP.processCDRqueue();

		for (let chargePoint of myMSP.chargePoints) {
			chargePoint.operate();
			chargePoint.show();
		}

		for (let ev of myFleet) {
			ev.borders();
			ev.driveAndCharge();
			ev.show();
		}
	}
}