/* =====================================
DASHBOARD DATA
===================================== */

let items =
JSON.parse(localStorage.getItem("items")) || [];

let history =
JSON.parse(localStorage.getItem("history")) || [];

let demands =
JSON.parse(localStorage.getItem("demands")) || [];

let demandHistory =
JSON.parse(localStorage.getItem("demandHistory")) || [];

let stockMonths =
JSON.parse(localStorage.getItem("stockMonths")) || {};

let selectedItem = null;

let dashboardChart = null;

/* =====================================
CURRENT MONTH
===================================== */

function getCurrentMonth(){

```
let today =
    new Date();

return (
    today.getFullYear() +
    "-" +
    String(
        today.getMonth() + 1
    ).padStart(2,"0")
);
```

}

/* =====================================
GET ITEM BY CODE
===================================== */

function getItemByCode(code){

```
for(let i = 0; i < items.length; i++){

    if(
        String(items[i].code).trim() ==
        String(code).trim()
    ){

        return items[i];

    }

}

return null;
```

}

/* =====================================
CURRENT MONTH STOCK IN
===================================== */

function getCurrentMonthStockIn(itemCode){

```
let total = 0;

let currentMonth =
    getCurrentMonth();

for(let i = 0; i < history.length; i++){

    let record =
        history[i];

    if(
        record.type == "Stock In" &&
        String(record.itemCode).trim() ==
        String(itemCode).trim() &&
        String(record.date || "").substring(0,7) ==
        currentMonth
    ){

        total +=
            Number(record.quantity || 0);

    }

}

return total;
```

}

/* =====================================
CURRENT MONTH STOCK OUT
===================================== */

function getCurrentMonthStockOut(itemCode){

```
let total = 0;

let currentMonth =
    getCurrentMonth();

for(let i = 0; i < history.length; i++){

    let record =
        history[i];

    if(
        record.type == "Stock Issue" &&
        String(record.itemCode).trim() ==
        String(itemCode).trim() &&
        String(record.date || "").substring(0,7) ==
        currentMonth
    ){

        total +=
            Number(record.quantity || 0);

    }

}

return total;
```

}

/* =====================================
ALL STOCK IN
===================================== */

function getStockIn(itemCode){

```
let total = 0;

for(let i = 0; i < history.length; i++){

    let record =
        history[i];

    if(
        record.type == "Stock In" &&
        String(record.itemCode).trim() ==
        String(itemCode).trim()
    ){

        total +=
            Number(record.quantity || 0);

    }

}

return total;
```

}

/* =====================================
ALL STOCK OUT
===================================== */

function getStockOut(itemCode){

```
let total = 0;

for(let i = 0; i < history.length; i++){

    let record =
        history[i];

    if(
        record.type == "Stock Issue" &&
        String(record.itemCode).trim() ==
        String(itemCode).trim()
    ){

        total +=
            Number(record.quantity || 0);

    }

}

return total;
```

}

/* =====================================
CURRENT STOCK
===================================== */

function getCurrentStock(item){

```
let openingStock =
    Number(item.openingStock || 0);

let stockIn =
    getStockIn(item.code);

let stockOut =
    getStockOut(item.code);

let currentStock =
    openingStock +
    stockIn -
    stockOut;

if(currentStock < 0){

    currentStock = 0;

}

return currentStock;
```

}

/* =====================================
LATEST PURCHASE RATE
===================================== */

function getLatestRate(itemCode){

```
let latest = null;

for(let i = 0; i < history.length; i++){

    let record =
        history[i];

    if(
        record.type == "Stock In" &&
        String(record.itemCode).trim() ==
        String(itemCode).trim()
    ){

        if(latest == null){

            latest = record;

        }
        else{

            let currentDateTime =
                String(record.date || "") +
                String(record.time || "");

            let latestDateTime =
                String(latest.date || "") +
                String(latest.time || "");

            if(
                currentDateTime >
                latestDateTime
            ){

                latest = record;

            }

        }

    }

}

if(latest){

    return Number(
        latest.unitCost || 0
    );

}

return 0;
```

}

/* =====================================
OVERALL STOCK IN COST
===================================== */

function getOverallCost(){

```
let total = 0;

for(let i = 0; i < history.length; i++){

    let record =
        history[i];

    if(record.type == "Stock In"){

        total +=
            Number(record.quantity || 0) *
            Number(record.unitCost || 0);

    }

}

return total;
```

}

/* =====================================
ITEM CURRENT COST
===================================== */

function getItemCurrentCost(item){

```
if(!item){

    return 0;

}

let currentStock =
    getCurrentStock(item);

let latestRate =
    getLatestRate(item.code);

return currentStock * latestRate;
```

}

/* =====================================
AVERAGE CONSUMPTION
SAME LOGIC AS MONTHLY DEMAND
===================================== */

function calculateAverageConsumption(itemCode){

```
let monthData = {};

for(let i = 0; i < history.length; i++){

    let record =
        history[i];

    if(
        record.type == "Stock Issue" &&
        String(record.itemCode).trim() ==
        String(itemCode).trim()
    ){

        let date =
            String(record.date || "");

        if(date.length < 7){

            continue;

        }

        let month =
            date.substring(0,7);

        if(!monthData[month]){

            monthData[month] = 0;

        }

        monthData[month] +=
            Number(record.quantity || 0);

    }

}

let months =
    Object.keys(monthData);

if(months.length == 0){

    return 0;

}

let total = 0;

for(let i = 0; i < months.length; i++){

    total +=
        monthData[months[i]];

}

return total / months.length;
```

}

/* =====================================
AUTO DEMAND QUANTITY
SAME LOGIC AS MONTHLY DEMAND
===================================== */

function getAutoDemandQuantity(item){

```
let average =
    calculateAverageConsumption(
        item.code
    );

let stockMonth =
    stockMonths[
        String(item.code)
    ];

if(
    stockMonth === undefined ||
    stockMonth === null ||
    stockMonth === ""
){

    stockMonth = 3;

}

stockMonth =
    Number(stockMonth);

let requiredStock =
    average *
    stockMonth;

let currentStock =
    getCurrentStock(item);

let demandQuantity =
    requiredStock -
    currentStock;

if(demandQuantity < 0){

    demandQuantity = 0;

}

return demandQuantity;
```

}

/* =====================================
ITEM DEMAND
SAVED / APPROVED DEMAND
===================================== */

function getItemDemand(itemCode){

```
let total = 0;

for(let i = 0; i < demands.length; i++){

    let record =
        demands[i];

    if(
        String(record.itemCode || "").trim() ==
        String(itemCode).trim()
    ){

        total +=
            Number(
                record.finalDemand ||
                record.approvedQty ||
                record.quantity ||
                record.demandQuantity ||
                0
            );

    }

}

for(let i = 0; i < demandHistory.length; i++){

    let record =
        demandHistory[i];

    let list =
        record.demandItems ||
        record.items ||
        [];

    for(let j = 0; j < list.length; j++){

        let demandItem =
            list[j];

        if(
            String(demandItem.code || "").trim() ==
            String(itemCode).trim()
        ){

            total +=
                Number(
                    demandItem.finalDemand ||
                    demandItem.approvedQty ||
                    demandItem.demandQuantity ||
                    0
                );

        }

    }

}

return total;
```

}

/* =====================================
OVERALL DEMAND
===================================== */

function getOverallDemand(){

```
let total = 0;

for(let i = 0; i < demands.length; i++){

    total +=
        Number(
            demands[i].finalDemand ||
            demands[i].approvedQty ||
            demands[i].quantity ||
            demands[i].demandQuantity ||
            0
        );

}

for(let i = 0; i < demandHistory.length; i++){

    let list =
        demandHistory[i].demandItems ||
        demandHistory[i].items ||
        [];

    for(let j = 0; j < list.length; j++){

        total +=
            Number(
                list[j].finalDemand ||
                list[j].approvedQty ||
                list[j].demandQuantity ||
                0
            );

    }

}

return total;
```

}

/* =====================================
ITEM PENDING
===================================== */

function getPendingForItem(item){

```
let demand =
    getItemDemand(item.code);

let currentStock =
    getCurrentStock(item);

let pending =
    Math.max(
        demand - currentStock,
        0
    );

return {

    demand:demand,

    pendingDemand:pending,

    pendingPO:pending

};
```

}

/* =====================================
OVERALL PENDING
===================================== */

function getOverallPending(){

```
let totalDemand =
    getOverallDemand();

let totalStock = 0;

for(let i = 0; i < items.length; i++){

    totalStock +=
        getCurrentStock(items[i]);

}

return Math.max(
    totalDemand - totalStock,
    0
);
```

}

/* =====================================
SEARCH ITEM
===================================== */

function searchItem(){

```
let input =
    document.getElementById(
        "itemSearch"
    );

let code =
    input.value.trim();

if(code == ""){

    selectedItem = null;

    localStorage.removeItem(
        "dashboardSelectedItem"
    );

    updateDashboard();

    return;

}

let found =
    getItemByCode(code);

if(found){

    selectedItem =
        found;

    localStorage.setItem(
        "dashboardSelectedItem",
        found.code
    );

    updateDashboard();

}
else{

    selectedItem = null;

    document.getElementById(
        "searchInfo"
    ).innerHTML =
        "❌ Item not found: " + code;

    clearSelectedCards();

    buildCurrentStockTable();

    clearDashboardGraph();

}
```

}

/* =====================================
CLEAR SEARCH
===================================== */

function clearItemSearch(){

```
document.getElementById(
    "itemSearch"
).value = "";

selectedItem = null;

localStorage.removeItem(
    "dashboardSelectedItem"
);

updateDashboard();
```

}

/* =====================================
UPDATE DASHBOARD
===================================== */

function updateDashboard(){

```
let masterValue =
    document.getElementById("masterValue");

let masterInfo =
    document.getElementById("masterInfo");

let stockInValue =
    document.getElementById("stockInValue");

let stockInInfo =
    document.getElementById("stockInInfo");

let stockOutValue =
    document.getElementById("stockOutValue");

let stockOutInfo =
    document.getElementById("stockOutInfo");

let costValue =
    document.getElementById("costValue");

let costInfo =
    document.getElementById("costInfo");

let demandValue =
    document.getElementById("demandValue");

let demandInfo =
    document.getElementById("demandInfo");

let pendingValue =
    document.getElementById("pendingValue");

let pendingInfo =
    document.getElementById("pendingInfo");


/* =================================
   OVERALL MODE
================================= */

if(!selectedItem){

    document.getElementById(
        "searchInfo"
    ).innerHTML =
        "Overall Dashboard — No item selected";


    masterValue.innerHTML = "-";

    masterInfo.innerHTML =
        "Select an Item ID to view item details.";


    stockInValue.innerHTML = "-";

    stockInInfo.innerHTML =
        "Select an Item ID to view Stock In.";


    stockOutValue.innerHTML = "-";

    stockOutInfo.innerHTML =
        "Select an Item ID to view Stock Out.";


    costValue.innerHTML =
        "Rs. " +
        getOverallCost().toFixed(2);

    costInfo.innerHTML =
        "Overall Stock In Cost";


    demandValue.innerHTML = "-";

    demandInfo.innerHTML =
        "Select an Item ID to view Demand.";


    pendingValue.innerHTML =
        getOverallPending().toFixed(2);

    pendingInfo.innerHTML =
        "Overall Pending Demand / PO";


    clearDashboardGraph();

    buildCurrentStockTable();

    return;

}


/* =================================
   SELECTED ITEM
================================= */

let item =
    selectedItem;

let stockIn =
    getStockIn(item.code);

let stockOut =
    getStockOut(item.code);

let currentMonthStockIn =
    getCurrentMonthStockIn(
        item.code
    );

let currentMonthStockOut =
    getCurrentMonthStockOut(
        item.code
    );

let currentStock =
    getCurrentStock(item);

let demand =
    getItemDemand(item.code);

let pending =
    getPendingForItem(item);

let itemCost =
    getItemCurrentCost(item);


document.getElementById(
    "searchInfo"
).innerHTML =

    "✅ Selected: <b>" +
    item.code +
    "</b> — " +
    item.itemName;


masterValue.innerHTML =
    item.itemName || "-";

masterInfo.innerHTML =

    "ID: " +
    (item.code || "-") +

    "<br>" +

    "Unit: " +
    (item.unit || "-") +

    "<br>" +

    "Current Stock: " +
    currentStock;


/* CURRENT MONTH CARD */

stockInValue.innerHTML =
    currentMonthStockIn.toFixed(2) +
    " " +
    (item.unit || "");

stockInInfo.innerHTML =
    "Current Month Stock In";


stockOutValue.innerHTML =
    currentMonthStockOut.toFixed(2) +
    " " +
    (item.unit || "");

stockOutInfo.innerHTML =
    "Current Month Stock Out";


costValue.innerHTML =
    "Rs. " +
    itemCost.toFixed(2);

costInfo.innerHTML =
    "Current Stock Cost";


demandValue.innerHTML =
    demand.toFixed(2) +
    " " +
    (item.unit || "");

demandInfo.innerHTML =
    "Selected Item Demand";


pendingValue.innerHTML =
    pending.pendingDemand.toFixed(2) +
    " " +
    (item.unit || "");

pendingInfo.innerHTML =
    "Pending Demand / PO";


showDashboardGraph(
    item.code
);

buildCurrentStockTable();
```

}

/* =====================================
CLEAR SELECTED CARDS
===================================== */

function clearSelectedCards(){

```
document.getElementById(
    "masterValue"
).innerHTML = "-";

document.getElementById(
    "masterInfo"
).innerHTML =
    "❌ Item not found.";

document.getElementById(
    "stockInValue"
).innerHTML = "-";

document.getElementById(
    "stockInInfo"
).innerHTML = "";

document.getElementById(
    "stockOutValue"
).innerHTML = "-";

document.getElementById(
    "stockOutInfo"
).innerHTML = "";

document.getElementById(
    "costValue"
).innerHTML =
    "Rs. 0.00";

document.getElementById(
    "costInfo"
).innerHTML = "";

document.getElementById(
    "demandValue"
).innerHTML = "-";

document.getElementById(
    "demandInfo"
).innerHTML = "";

document.getElementById(
    "pendingValue"
).innerHTML = "0";

document.getElementById(
    "pendingInfo"
).innerHTML = "";
```

}

/* =====================================
CURRENT MONTH STOCK TABLE
===================================== */

function buildCurrentStockTable(){

```
let body =
    document.getElementById(
        "currentStockBody"
    );

if(!body){

    return;

}

body.innerHTML = "";


for(let i = 0; i < items.length; i++){

    let item =
        items[i];


    if(
        selectedItem &&
        String(item.code).trim() !=
        String(selectedItem.code).trim()
    ){

        continue;

    }


    let currentMonthStockIn =
        getCurrentMonthStockIn(
            item.code
        );

    let currentMonthStockOut =
        getCurrentMonthStockOut(
            item.code
        );

    let currentStock =
        getCurrentStock(item);

    let latestRate =
        getLatestRate(item.code);

    let demandQty =
        getAutoDemandQuantity(item);


    let row =
        document.createElement("tr");


    row.innerHTML =

        "<td>" +
        (item.code || "-") +
        "</td>" +

        "<td>" +
        (item.itemName || "-") +
        "</td>" +

        "<td>" +
        (item.unit || "-") +
        "</td>" +

        "<td>" +
        currentMonthStockIn.toFixed(2) +
        "</td>" +

        "<td>" +
        currentMonthStockOut.toFixed(2) +
        "</td>" +

        "<td>" +
        currentStock.toFixed(2) +
        "</td>" +

        "<td>" +
        (
            latestRate > 0
            ? latestRate.toFixed(2)
            : "-"
        ) +
        "</td>" +

        "<td>" +
        demandQty.toFixed(2) +
        "</td>";


    let stockCell =
        row.children[5];


    /* =================================
       STOCK COLOR
       SAME LOGIC AS MONTHLY DEMAND
    ================================= */

    let average =
        calculateAverageConsumption(
            item.code
        );

    let stockMonth =
        stockMonths[
            String(item.code)
        ];


    if(
        stockMonth === undefined ||
        stockMonth === null ||
        stockMonth === ""
    ){

        stockMonth = 3;

    }


    stockMonth =
        Number(stockMonth);


    let requiredStock =
        average *
        stockMonth;


    /* RED = CURRENT STOCK <= MINIMUM
       Minimum column is removed from table,
       but existing Master List minimumStock
       is still used for color only.
    */

    let minimumStock =
        Number(
            item.minimumStock || 0
        );


    if(
        currentStock <=
        minimumStock
    ){

        stockCell.className =
            "low";

    }
    else if(
        currentStock <=
        requiredStock
    ){

        stockCell.className =
            "yellow";

    }
    else{

        stockCell.className =
            "normal";

    }


    body.appendChild(row);

}
```

}

/* =====================================
GRAPH
===================================== */

function showDashboardGraph(itemCode){

```
let canvas =
    document.getElementById(
        "dashboardGraph"
    );

let graphInfo =
    document.getElementById(
        "graphInfo"
    );

if(!canvas){

    return;

}

let item =
    getItemByCode(itemCode);

if(!item){

    clearDashboardGraph();

    return;

}

let openingStock =
    Number(
        item.openingStock || 0
    );

let stockIn =
    getStockIn(item.code);

let stockOut =
    getStockOut(item.code);

let currentStock =
    getCurrentStock(item);


graphInfo.innerHTML =

    "<b>" +
    item.code +
    " - " +
    (item.itemName || "") +
    "</b>" +

    "<br>" +

    "Opening: " +
    openingStock +

    " | Stock In: " +
    stockIn +

    " | Stock Out: " +
    stockOut +

    " | Current: " +
    currentStock;


if(dashboardChart){

    dashboardChart.destroy();

    dashboardChart = null;

}


if(typeof Chart === "undefined"){

    graphInfo.innerHTML +=
        "<br>Chart library not loaded.";

    return;

}


dashboardChart =
    new Chart(
        canvas,
        {

            type:"bar",

            data:{

                labels:[
                    "Opening Stock",
                    "Stock In",
                    "Stock Out",
                    "Current Stock"
                ],

                datasets:[

                    {

                        label:
                            item.itemName ||
                            item.code,

                        data:[

                            openingStock,
                            stockIn,
                            stockOut,
                            currentStock

                        ],

                        borderWidth:1

                    }

                ]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        display:true

                    }

                },

                scales:{

                    y:{

                        beginAtZero:true

                    }

                }

            }

        }

    );
```

}

/* =====================================
CLEAR GRAPH
===================================== */

function clearDashboardGraph(){

```
let graphInfo =
    document.getElementById(
        "graphInfo"
    );

if(graphInfo){

    graphInfo.innerHTML =
        "Select an Item ID to see its graph.";

}


if(dashboardChart){

    dashboardChart.destroy();

    dashboardChart = null;

}
```

}

/* =====================================
SAVE SELECTED ITEM
===================================== */

function saveSelectedItem(){

```
if(!selectedItem){

    alert(
        "Please enter a valid Item ID first."
    );

    return false;

}

localStorage.setItem(
    "dashboardSelectedItem",
    selectedItem.code
);

return true;
```

}

/* =====================================
MASTER VIEW
===================================== */

function openMasterView(){

```
if(selectedItem){

    saveSelectedItem();

}

window.location.href =
    "Master List .html";
```

}

/* =====================================
MASTER NEW
===================================== */

function newMasterEntry(){

```
window.location.href =
    "Master List .html";
```

}

/* =====================================
STOCK IN VIEW
===================================== */

function openStockInView(){

```
if(!saveSelectedItem()){

    return;

}

localStorage.setItem(
    "historyViewType",
    "stockIn"
);

window.location.href =
    "Stock In History.html";
```

}

/* =====================================
STOCK IN NEW
===================================== */

function newStockIn(){

```
if(selectedItem){

    localStorage.setItem(
        "stockInSelectedItem",
        selectedItem.code
    );

}

window.location.href =
    "Stock In .html";
```

}

/* =====================================
STOCK OUT VIEW
===================================== */

function openStockOutView(){

```
if(!saveSelectedItem()){

    return;

}

localStorage.setItem(
    "historyViewType",
    "stockOut"
);

window.location.href =
    "Stock Out History.html";
```

}

/* =====================================
STOCK OUT NEW
===================================== */

function newStockOut(){

```
if(selectedItem){

    localStorage.setItem(
        "stockOutSelectedItem",
        selectedItem.code
    );

}

window.location.href =
    "Stock out .html";
```

}

/* =====================================
COST VIEW
===================================== */

function openCostView(){

```
if(selectedItem){

    localStorage.setItem(
        "dashboardSelectedItem",
        selectedItem.code
    );

}
else{

    localStorage.removeItem(
        "dashboardSelectedItem"
    );

}

window.location.href =
    "Cost .html";
```

}

/* =====================================
COST NEW
===================================== */

function newCostEntry(){

```
if(selectedItem){

    localStorage.setItem(
        "costSelectedItem",
        selectedItem.code
    );

}

window.location.href =
    "Cost .html";
```

}

/* =====================================
DEMAND VIEW
===================================== */

function openDemandView(){

```
if(!saveSelectedItem()){

    return;

}

localStorage.setItem(
    "demandViewItem",
    selectedItem.code
);

window.location.href =
    "Demand History.html";
```

}

/* =====================================
DEMAND NEW
===================================== */

function newDemandEntry(){

```
if(selectedItem){

    localStorage.setItem(
        "demandSelectedItem",
        selectedItem.code
    );

}

window.location.href =
    "Monthly Demand .html";
```

}

/* =====================================
GRAPH VIEW
===================================== */

function openGraph(){

```
if(!saveSelectedItem()){

    return;

}

window.location.href =
    "Graphs.html";
```

}

/* =====================================
LOAD SAVED ITEM
===================================== */

function loadSavedItem(){

```
let saved =
    localStorage.getItem(
        "dashboardSelectedItem"
    );

if(saved){

    let item =
        getItemByCode(saved);

    if(item){

        selectedItem =
            item;

        let searchBox =
            document.getElementById(
                "itemSearch"
            );

        if(searchBox){

            searchBox.value =
                item.code;

        }

    }

}

updateDashboard();
```

}

/* =====================================
PAGE START
===================================== */

loadSavedItem();
