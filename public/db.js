let db;
// new db request for budget database
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (evt) {
    const db = evt.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsucess = function (evt) {
    db = evt.target.result;
// app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (evt) {
    console.log("Error" + evt.target.errorCode);
};

function saveRecord(record){
    // create transaction on pending db
    const transaction = db.transaction(["pending", "readwrite"]);

    // access pending object
    const store = transaction.objectStore("pending");

    // add record to store
    store.add(record);
}

function checkDatabase() {
    // open transaction on pending db
    const transaction = db.transaction(["pending"], "readwrite");
    // access pending object
    const store = transaction.objectStore("pending");
    // get all records from store and set to a variable
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