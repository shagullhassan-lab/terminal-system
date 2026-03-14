// ============ PAGE INITIALIZATION ============
window.addEventListener("DOMContentLoaded", () => {
    logger.info("App initializing...");

    initOfflineSync();
    loadTrips();
    updateTotals();
    bindEventListeners();

    setInterval(() => {
        loadTrips();
        updateTotals();
    }, 120000);

    logger.info("App ready!");
});

// ============ EVENT BINDING ============
function bindEventListeners() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        const debouncedSearch = debounce(filterTrips, 500);
        searchInput.addEventListener("keyup", debouncedSearch);
    }
}

// ============ LOAD TRIPS ============
async function loadTrips() {
    try {
        const result = await getTrips(20, 0);
        if (!result.success) {
            logger.error("Failed to load trips");
            return;
        }

        displayTripsTable(result.data);
    } catch (err) {
        logger.error("loadTrips", err);
        showNotification("❌ Failed to load trips", "error");
    }
}

// ============ DISPLAY TRIPS ============
function displayTripsTable(trips) {
    const tbody = document.getElementById("tripsBody");
    const noTripsMsg = document.getElementById("noTrips");

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!trips || trips.length === 0) {
        if (noTripsMsg) noTripsMsg.style.display = "block";
        return;
    }

    if (noTripsMsg) noTripsMsg.style.display = "none";

    const fragment = document.createDocumentFragment();

    trips.forEach(trip => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td data-label="ID">${trip.id}</td>
            <td data-label="Passenger">${escapeHtml(trip.passenger)}</td>
            <td data-label="Passport">${escapeHtml(trip.passport)}</td>
            <td data-label="Driver">${escapeHtml(trip.driver)}</td>
            <td data-label="Destination">${escapeHtml(trip.destination)}</td>
            <td data-label="Type"><span class="badge">${escapeHtml(trip.type)}</span></td>
            <td data-label="Fare">${formatCurrency(trip.fare)}</td>
            <td data-label="Date">${formatDateTime(trip.date)}</td>
            <td data-label="Actions">
                <button class="btn-danger" onclick="deleteTripHandler(${trip.id})">🗑️</button>
                <button class="btn-info" onclick="printTicket(${trip.id})">🖨️</button>
            </td>
        `;
        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

// ============ SAVE TRIP ============
async function saveTrip() {
    const validatedData = validateTripForm();
    if (!validatedData) return;

    try {
        if (!navigator.onLine) {
            saveTripOffline(validatedData);
            showNotification("📴 Saved offline. Will sync when online.", "warning");
            clearForm();
            return;
        }

        const result = await addTrip(validatedData);

        if (result.success) {
            showNotification(`✅ Trip saved! ID: ${result.data.id}`, "success");
            clearForm();
            loadTrips();
            updateTotals();
        } else {
            showNotification(`❌ ${result.error}`, "error");
        }
    } catch (err) {
        logger.error("saveTrip", err);
        showNotification("❌ Failed to save trip", "error");
    }
}

// ============ DELETE TRIP ============
async function deleteTripHandler(id) {
    if (!confirm("Delete this trip?")) return;

    try {
        const result = await deleteTrip(id);

        if (result.success) {
            showNotification("✅ Trip deleted", "success");
            loadTrips();
            updateTotals();
        } else {
            showNotification(`❌ ${result.error}`, "error");
        }
    } catch (err) {
        logger.error("deleteTripHandler", err);
        showNotification("❌ Failed to delete trip", "error");
    }
}

// ============ FILTER/SEARCH ============
async function filterTrips() {
    const q = document.getElementById("searchInput")?.value?.trim() || "";

    if (!q) {
        loadTrips();
        return;
    }

    try {
        const result = await searchTrips(q);

        if (result.success) {
            displayTripsTable(result.data);
        } else {
            showNotification("❌ Search failed", "error");
        }
    } catch (err) {
        logger.error("filterTrips", err);
        showNotification("❌ Search error", "error");
    }
}

// ============ UPDATE TOTALS ============
async function updateTotals() {
    try {
        const result = await getStats();

        if (result.success) {
            const { trips, earnings } = result.data;
            const totalCountBox = document.getElementById("totalCount");

            if (totalCountBox) {
                totalCountBox.innerHTML = `
                    <h3>Today's Earnings: <strong>${formatCurrency(earnings)}</strong></h3>
                    <p>${trips} trips completed</p>
                `;
            }
        }
    } catch (err) {
        logger.error("updateTotals", err);
    }
}

// ============ VALIDATE FORM ============
function validateTripForm() {
    const passenger = document.getElementById("passenger")?.value?.trim() || "";
    const passport = document.getElementById("passport")?.value?.trim() || "";
    const driver = document.getElementById("driver")?.value?.trim() || "";
    const destination = document.getElementById("destination")?.value?.trim() || "";
    const type = document.getElementById("type")?.value || "Local";
    const fare = document.getElementById("fare")?.value?.trim() || "";

    const errors = [];

    if (!passenger || passenger.length < 2) errors.push("❌ Passenger name (min 2 chars)");
    if (passenger.length > 50) errors.push("❌ Passenger name too long");

    if (!passport || passport.length < 3) errors.push("❌ Valid passport required");

    if (!driver || driver.length < 2) errors.push("❌ Driver name (min 2 chars)");

    if (!destination || destination.length < 2) errors.push("❌ Destination (min 2 chars)");

    const fareNum = parseFloat(fare);
    if (!fare || isNaN(fareNum) || fareNum <= 0) errors.push("❌ Valid fare required");

    if (errors.length > 0) {
        errors.forEach(err => showNotification(err, "error"));
        return null;
    }

    return {
        passenger,
        passport,
        driver,
        destination,
        type,
        fare: fareNum
    };
}

// ============ CLEAR FORM ============
function clearForm() {
    document.getElementById("passenger").value = "";
    document.getElementById("passport").value = "";
    document.getElementById("driver").value = "";
    document.getElementById("destination").value = "";
    document.getElementById("type").value = "Local";
    document.getElementById("fare").value = "";
    document.getElementById("passenger").focus();
}