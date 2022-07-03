// defines and initializes db connection
let db;
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const store = transaction.objectStore('new_transaction');
  store.add(record);
}


function checkDatabase() {
  const transaction = db.transaction(['new_transaction'], 'readwrite');
  const store = transaction.objectStore('new_transaction');
  const getAllStores = store.getAll();

  
  getAllStores.onsuccess = function () {
    if (getAllStores.result.length > 0) {
      getAllStores.result.forEach((record) => {
        // fetch request to /api/transaction
        fetch('/api/transaction', {
          //  POST method
          method: 'POST',
          body: JSON.stringify(record),
          //Defines types of data sent to server
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
          // Response is servers response to request
          .then((response) => {
            // return response to the server
            return response.json();
          })
          .then((data) => {
            if (data.message) {
              throw new Error(data);
            }
            const transaction = db.transaction(['new_transaction'], 'readwrite');
            const store = transaction.objectStore('new_transaction');
            store.clear(); 
            alert('Transactions Saved!');
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);