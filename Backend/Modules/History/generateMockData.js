// generateStockData.js
// Example usage with your given seed
const baseData = {
    date: "2024-05-19",
    price: 174.62,
    volume: 69701175,
};

function generateRandomInRange(base, percentRange) {
    const range = base * percentRange;
    const min = base - range;
    const max = base + range;
    return +(Math.random() * (max - min) + min).toFixed(2);
}

function generateStockData(days = 100) {
    const data = [];
    const basePrice = baseData.price;
    const baseVolume = baseData.volume;
    const startDate = new Date(baseData.date);

    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        data.push({
            date: currentDate.toISOString().split("T")[0],
            price: generateRandomInRange(basePrice, 0.015), // ±10%
            volume: Math.round(generateRandomInRange(baseVolume, 0.015)), // ±10%
        });
    }

    return data;
}

module.exports = { generateStockData };
