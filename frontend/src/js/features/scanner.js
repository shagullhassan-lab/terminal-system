function scanPassport() {
    const input = document.getElementById("passport");
    if (!input) {
        logger.error("Passport input not found");
        return;
    }

    const scannedValue = generateFakePassport();
    input.value = scannedValue;

    input.style.borderColor = "#059669";
    input.style.boxShadow = "0 0 0 4px rgba(5, 150, 105, 0.2)";

    showNotification(`✅ Scanned: ${scannedValue}`, "success");

    setTimeout(() => {
        input.style.borderColor = "";
        input.style.boxShadow = "";
    }, 2000);
}

function generateFakePassport() {
    const prefixes = ["A", "B", "C", "D", "E"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const numbers = Math.floor(Math.random() * 9000000 + 1000000);
    return `${prefix}${numbers}`;
}

window.addEventListener("DOMContentLoaded", () => {
    const scanBtn = document.getElementById("scanBtn");
    if (scanBtn) {
        scanBtn.addEventListener("click", scanPassport);
    }
});