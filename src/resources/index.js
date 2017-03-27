export function configure(config) {
    config.globalResources([
        "./value-converters/date-formatter",
        "./value-converters/phone-formatter",
        "./value-converters/timer-formatter"
    ]);
}
