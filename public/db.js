const { checkout } = require("../routes/api");

let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (evt) {
    const db = evt.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsucess = function (evt) {
    db = evt.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (evt) {
    console.log("Error" + evt.target.errorCode);
};

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsucess = function () {
        if (getAll.result.length > 0){
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            });
        }
    };
}
window.addEventListener("online", checkDatabase);