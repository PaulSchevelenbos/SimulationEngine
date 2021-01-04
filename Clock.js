class Clock {
    constructor(myStartTime) {
        this.startTime = (myStartTime || new Date()); // simulation starts here
        this.currentTime = this.startTime; // advances much quicker than real time
    }

    update(speedSliderReading) {
        let frameTimeUnit = speedSliderReading * oneMinute; // 60.000 milliseconds
        this.currentTime = new Date(this.currentTime.getTime() + frameTimeUnit);
    }

    getStartTime() {
        return this.startTime.toISOString().slice(0,16);
    }

    getCurrentTime() {
        return this.currentTime.toISOString().slice(0,16);
    }

    elapsedTime() {
        let elapsed = this.currentTime.getTime() - this.startTime.getTime(); // in milliseconds
        let inSeconds = floor(elapsed / 1000);
        let inMinutes = floor(inSeconds / 60);
        let inHours = floor(inMinutes / 60);
        let inDays = floor(inHours / 24);

        let seconds = String(inSeconds % 60);
        let minutes = String(inMinutes % 60);
        let hours = String(inHours % 24);
        let days = String(inDays);
        let elapsedTimeString = (`${days}d ${hours}h ${minutes}min`);

        return elapsedTimeString; 
    }

    getFrameTimeUnit(){
        return (speedSlider.value() * oneMinute); // 60.000 milliseconds
    }

    show() {
        noStroke();
        fill(colorReserved);
        textSize(15);
        textAlign(RIGHT);
        text('Start Time  : ' + this.getStartTime(), width - 5, 20);
        text('Current Time: ' + this.getCurrentTime(), width - 5, 40);
        text('Elapsed Time: ' + this.elapsedTime(), width - 5, 60);
        return;
    }
}
