
/* =====================================
   ECOMOVE - EMISSION CALCULATOR
   ===================================== */

// Illustrative emission factors in kg CO2 per passenger-km.
// Replace these with properly sourced factors for your final report.
const emissionFactors = {
    car: 0.192,
    bike: 0.103,
    bus: 0.089,
    train: 0.041
};

// Names and icons shown in the comparison chart.
const transportNames = {
    car: "🚗 Car",
    bike: "🏍️ Bike",
    bus: "🚌 Bus",
    train: "🚆 Train"
};

// Find the elements in your HTML.
const calculateButton = document.getElementById("calculateBtn");
const transportInput = document.getElementById("Transport");
const distanceInput = document.getElementById("Distance");
const tripsInput = document.getElementById("Trips");
const resultText = document.getElementById("resultText");

// Create the comparison area using JavaScript.
// You do not need to add these sections manually in HTML.
const comparisonSection = document.createElement("section");
comparisonSection.className = "comparison hidden";
comparisonSection.id = "comparisonSection";

comparisonSection.innerHTML = `
    <h2>📊 Compare Transportation Modes</h2>
    <p class="comparison-subtitle">
        Estimated emissions for the same distance and number of trips.
    </p>
    <div id="comparisonChart"></div>
    <p class="chart-note">
        Lower estimated emissions indicate a lower-carbon option
        under the assumptions used in this model.
    </p>
`;

const recommendationSection = document.createElement("section");
recommendationSection.className = "recommendation hidden";
recommendationSection.id = "recommendationSection";

recommendationSection.innerHTML = `
    <h2>🌱 Your Greener Travel Insight</h2>
    <p id="recommendationText"></p>
    <span class="tip" id="recommendationTip"></span>
`;

// Place the new sections below the calculator.
const mainElement = document.querySelector("main");
mainElement.appendChild(comparisonSection);
mainElement.appendChild(recommendationSection);


// Calculate when the button is clicked.
calculateButton.addEventListener("click", function () {

    const transport = transportInput.value;
    const distance = Number(distanceInput.value);
    const trips = Number(tripsInput.value);

    // Validate the input values.
    if (
        distanceInput.value.trim() === "" ||
        tripsInput.value.trim() === "" ||
        !Number.isFinite(distance) ||
        !Number.isFinite(trips) ||
        distance <= 0 ||
        trips <= 0
    ) {
        resultText.textContent =
            "Please enter a distance and number of trips greater than zero.";

        comparisonSection.classList.add("hidden");
        recommendationSection.classList.add("hidden");
        return;
    }

    if (distance > 1000000 || trips > 10000) {
        resultText.textContent =
            "Please enter a smaller, realistic distance and number of trips.";

        comparisonSection.classList.add("hidden");
        recommendationSection.classList.add("hidden");
        return;
    }

    // Calculate the selected mode's estimated emissions.
    const factor = emissionFactors[transport];
    const emission = distance * trips * factor;

    // Update the result card.
    resultText.innerHTML = `
        <span class="result-label">Estimated CO₂ emission</span>
        <strong class="emission-number">
            ${emission.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            })}
        </strong>
        <span class="result-unit">kg CO₂ equivalent (estimate)</span>
        <p class="result-details">
            ${transportNames[transport]} · ${distance} km per trip ·
            ${trips} trip(s)
        </p>
    `;

    // Calculate the emissions for every mode at the same distance.
    const comparisons = Object.keys(emissionFactors).map(function (mode) {
        return {
            mode: mode,
            name: transportNames[mode],
            emission: distance * trips * emissionFactors[mode]
        };
    });

    // Sort from lowest estimated emissions to highest.
    comparisons.sort(function (a, b) {
        return a.emission - b.emission;
    });

    const lowestEmission = comparisons[0].emission;
    const highestEmission = comparisons[comparisons.length - 1].emission;

    // Build the comparison chart.
    const chart = document.getElementById("comparisonChart");
    chart.innerHTML = "";

    comparisons.forEach(function (item) {

        const row = document.createElement("div");
        row.className = "chart-row";

        if (item.mode === transport) {
            row.classList.add("selected");
        }

        if (item.emission === lowestEmission) {
            row.classList.add("lowest");
        }

        // Keep the chart visible even if values are very small.
        const barWidth = highestEmission > 0
            ? Math.max(2, (item.emission / highestEmission) * 100)
            : 0;

        row.innerHTML = `
            <div class="chart-heading">
                <span>${item.name}</span>
                <strong>${item.emission.toFixed(2)} kg</strong>
            </div>
            <div class="bar-track">
                <div class="bar-fill" style="width: ${barWidth}%"></div>
            </div>
        `;

        chart.appendChild(row);
    });

    comparisonSection.classList.remove("hidden");

    // Find the lowest-emission option in this model.
    const lowestMode = comparisons[0];

    const recommendationText =
        document.getElementById("recommendationText");

    const recommendationTip =
        document.getElementById("recommendationTip");

    recommendationText.textContent =
        `${lowestMode.name} has the lowest estimated emissions ` +
        `(${lowestMode.emission.toFixed(2)} kg CO₂) among these ` +
        `four modes for your selected journey, using the factors in this tool.`;

    if (transport === lowestMode.mode) {
        recommendationTip.textContent =
            "Great! Your selected mode is the lowest-emission option in this comparison.";
    } else {
        const saving = emission - lowestMode.emission;
        const percentage = emission > 0
            ? (saving / emission) * 100
            : 0;

        recommendationTip.textContent =
            `Estimated difference: ${saving.toFixed(2)} kg CO₂ ` +
            `(${percentage.toFixed(1)}% lower than your selected mode) ` +
            `if you switch to ${lowestMode.name}.`;
    }

    recommendationSection.classList.remove("hidden");

    // Scroll down to show the calculated result.
    resultText.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
});
