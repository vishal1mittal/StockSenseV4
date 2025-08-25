let counters = {};

const increment = (name, labels = {}) => {
    if (!counters[name]) counters[name] = { value: 0, labels };

    counters[name].value++;
};

const getMetrics = () => {
    return "# Metrics endpoint not implimented yet\n";
};

module.exports = {
    increment,
    getMetrics,
};
