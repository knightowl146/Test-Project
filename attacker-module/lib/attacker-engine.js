const scenarios = require('./scenarios');

let isRunning = false;
let intervalId = null;
let config = {
    interval: 2000, // Average time between attacks in ms
    enabledScenarios: Object.keys(scenarios) // All enabled by default
};

const startSimulation = () => {
    if (isRunning) return;
    isRunning = true;
    console.log('[Engine] Simulation Started');

    const loop = () => {
        if (!isRunning) return;

        // Pick a random enabled scenario
        const scenarioName = config.enabledScenarios[Math.floor(Math.random() * config.enabledScenarios.length)];
        const scenarioFn = scenarios[scenarioName];

        if (scenarioFn) {
            scenarioFn();
        }

        // Schedule next attack with some randomness
        const nextDelay = config.interval * (0.5 + Math.random());
        intervalId = setTimeout(loop, nextDelay);
    };

    loop();
};

const stopSimulation = () => {
    isRunning = false;
    if (intervalId) clearTimeout(intervalId);
    console.log('[Engine] Simulation Stopped');
};

const updateConfig = (newConfig) => {
    config = { ...config, ...newConfig };
    console.log('[Engine] Config Updated', config);
};

module.exports = {
    startSimulation,
    stopSimulation,
    updateConfig,
    getStatus: () => isRunning
};
