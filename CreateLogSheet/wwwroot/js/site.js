// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
function calculateSummary() {

    document.querySelectorAll('.sum-cell').forEach(cell => {

        const op = cell.dataset.op;
        const shift = cell.dataset.shift;

        const inputs = document.querySelectorAll(`.inputToSave[data-shift="${shift}"]`);
        const values = [...inputs].map(i => parseFloat(i.value) || 0);

        let result = 0;

        switch (op) {
            case "sum":
                result = values.reduce((a, b) => a + b, 0);
                break;

            case "average":
                result = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                break;

            case "count":
                result = values.length;
                break;
        }

        cell.textContent = result.toFixed(2);
    });
}

document.addEventListener("input", e => {
    if (e.target.classList.contains("inputToSave")) {
        calculateSummary();
    }
});

calculateSummary();
