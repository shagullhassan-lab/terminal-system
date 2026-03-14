let currentPage = 1;
const itemsPerPage = 20;

async function loadPage(page = 1) {
    const offset = (page - 1) * itemsPerPage;
    const result = await getTrips(itemsPerPage, offset);

    if (result.success) {
        displayTripsTable(result.data);
        currentPage = page;
        updatePaginationUI(page);
    }
}

function updatePaginationUI(page) {
    const paginationDiv = document.getElementById("pagination");
    if (!paginationDiv) return;

    let html = '<div class="pagination">';

    if (page > 1) {
        html += `<button onclick="loadPage(${page - 1})">← Previous</button>`;
    }

    for (let i = Math.max(1, page - 2); i <= page + 2; i++) {
        html += `<button ${i === page ? 'class="active"' : ''} onclick="loadPage(${i})">${i}</button>`;
    }

    if (page < 100) {
        html += `<button onclick="loadPage(${page + 1})">Next →</button>`;
    }

    html += '</div>';
    paginationDiv.innerHTML = html;
}