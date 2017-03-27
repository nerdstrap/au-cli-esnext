export default class EventTimer {

    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    start(interval, tickKey, timeoutKey) {
        let currentTime = interval;

        this.intervalId = window.setInterval(() => {
            if (--currentTime < 0) {
                this.stop();
                if (this.eventAggregator && this.eventAggregator.publish && timeoutKey) {
                    this.eventAggregator.publish(timeoutKey, 0);
                }
            }
            if (this.eventAggregator && this.eventAggregator.publish && tickKey) {
                this.eventAggregator.publish(tickKey, currentTime);
            }
        }, 1000);
    }

    stop() {
        window.clearInterval(this.intervalId);
    }
}
