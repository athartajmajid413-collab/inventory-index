// =====================================
// DASHBOARD DATA
// =====================================

let items =
    JSON.parse(localStorage.getItem("items")) || [];

let history =
    JSON.parse(localStorage.getItem("history")) || [];

let demands =
    JSON.parse(localStorage.getItem("demands")) || [];

let demandHistory =
    JSON.parse(localStorage.getItem("demandHistory")) || [];

let demandEdits =
    JSON.parse(localStorage.getItem("demandEdits")) || {};

let selectedItem = null;

let dashboardChart = null;


// =====================================
// CURRENT MONTH
// =====================================

function getCurrentMonth(){

    let today = new Date();

    return {
        year: today.getFullYear(),
        month: today.getMonth()
    };

}


// =====================================
// GET RECORD DATE
// =====================================

function getRecordDate(record){

    let dateValue =
        record.date ||
        record.transactionDate ||
        record.entryDate ||
        record.transaction_date ||
        record.createdDate ||
        record.demandDate ||
        record.month ||
        "";

    if(!dateValue){

        return null;

    }

    let date =
        new Date(dateValue);

    if(!isNaN(date.getTime())){

        return date;

    }

    // YYYY-MM-DD
    let parts =
        String(dateValue).split("-");

    if(parts.length >= 2){

        let year =
            Number(parts[0]);

        let month =
            Number(parts[1]) - 1;

        if(!isNaN(year) && !isNaN(month)){

            return new Date(
                year,
                month,
                1
            );

        }

    }

    return null;

}


// =====================================
// IS CURRENT MONTH
// =====================================

function isCurrentMonth(record){

    let date =
        getRecordDate(record);

    if(!date){

        return false;

    }

    let current =
        getCurrentMonth();

    return (
        date.getFullYear() === current.year &&
        date.getMonth() === current.month
    );

}


// =====================================
// GET ITEM BY CODE
// =====================================

function getItemByCode(code){

    for(let i = 0; i < items.length; i++){

        if(
            String(items[i].code || "").trim() ===
            String(code || "").trim()
        ){

            return items[i];

        }

    }

    return null;

}


// =====================================
// STOCK IN - CURRENT MONTH
// =====================================

function getCurrentMonthStockIn(itemCode){

    let total = 0;

    for(let i = 0; i < history.length; i++){

        let record =
            history[i];

        if(
            record.type === "Stock In" &&
            String(record.itemCode || "").trim() ===
            String(itemCode || "").trim() &&
            isCurrentMonth(record)
        ){

            total +=
                Number(record.quantity || 0);

        }

    }

    return total;

}


// =====================================
// STOCK OUT - CURRENT MONTH
// =====================================

function getCurrentMonthStockOut(itemCode){

    let total = 0;

    for(let i = 0; i < history.length; i++){

        let record =
            history[i];

        if(
            (
                record.type === "Stock Issue" ||
                record.type === "Stock Out"
            ) &&
            String(record.itemCode || "").trim() ===
            String(itemCode || "").trim() &&
            isCurrentMonth(record)
        ){

            total +=
                Number(record.quantity || 0);

        }

    }

    return total;

}


// =====================================
// ALL STOCK IN
// Used for Current Stock
// =====================================

function getAllStockIn(itemCode){

    let total = 0;

    for(let i = 0; i < history.length; i++){

        let record =
            history[i];

        if(
            record.type === "Stock In" &&
            String(record.itemCode || "").trim() ===
            String(itemCode || "").trim()
        ){

            total +=
                Number(record.quantity || 0);

        }

    }

    return total;

}


// =====================================
// ALL STOCK OUT
// Used for Current Stock
// =====================================

function getAllStockOut(itemCode){

    let total = 0;

    for(let i = 0; i < history.length; i++){

        let record =
            history[i];

        if(
            (
                record.type === "Stock Issue" ||
                record.type === "Stock Out"
            ) &&
            String(record.itemCode || "").trim() ===
            String(itemCode || "").trim()
        ){

            total +=
                Number(record.quantity || 0);

        }

    }

    return total;

}


// =====================================
// CURRENT STOCK
// =====================================

function getCurrentStock(item){

    if(!item){

        return 0;

    }

    let openingStock =
        Number(item.openingStock || 0);

    let stockIn =
        getAllStockIn(item.code);

    let stockOut =
        getAllStockOut(item.code);

    let currentStock =
        openingStock +
        stockIn -
        stockOut;

    if(currentStock < 0){

        currentStock = 0;

    }

    return currentStock;

}


// =====================================
// LATEST RATE - CURRENT MONTH
// =====================================

function getLatestRate(itemCode){

    let latestRecord = null;

    for(let i = 0; i < history.length; i++){

        let record =
            history[i];

        if(
            record.type === "Stock In" &&
            String(record.itemCode || "").trim() ===
            String(itemCode || "").trim() &&
            isCurrentMonth(record)
        ){

            if(latestRecord === null){

                latestRecord =
                    record;

            }
            else{

                let currentDate =
                    getRecordDate(record);

                let latestDate =
                    getRecordDate(latestRecord);

                if(
                    currentDate &&
                    latestDate &&
                    currentDate >= latestDate
                ){

                    latestRecord =
                        record;

                }

            }

        }

    }


    if(latestRecord){

        return Number(
            latestRecord.unitCost ||
            latestRecord.latestRate ||
            latestRecord.rate ||
            0
        );

    }


    // اگر current month میں purchase نہ ہو
    // تو Master List کا latestRate استعمال ہوگا

    let item =
        getItemByCode(itemCode);

    if(item){

        return Number(
            item.latestRate ||
            item.unitCost ||
            item.cost ||
            0
        );

    }

    return 0;

}


// =====================================
// FIND DEMAND VALUE
// =====================================

function getDemandValue(record){

    return Number(
        record.finalDemand ??
        record.approvedQty ??
        record.demandQty ??
        record.demandQuantity ??
        record.quantity ??
        record.qty ??
        0
    );

}


// =====================================
// DEMAND CODE
// =====================================

function getDemandCode(record){

    return String(
        record.itemCode ??
        record.code ??
        record.itemID ??
        record.itemId ??
        ""
    ).trim();

}


// =====================================
// CURRENT MONTH DEMAND
// =====================================

function getCurrentMonthDemand(itemCode){

    let code =
        String(itemCode || "").trim();

    let total = 0;


    // =================================
    // 1. CURRENT DEMANDS
    // =================================

    for(let i = 0; i < demands.length; i++){

        let record =
            demands[i];

        if(
            getDemandCode(record) === code
        ){

            // اگر date موجود ہے تو current month check کریں
            // اگر date موجود نہیں تو current demand کو استعمال کریں

            let hasDate =
                !!(
                    record.date ||
                    record.demandDate ||
                    record.month ||
                    record.createdDate
                );

            if(
                !hasDate ||
                isCurrentMonth(record)
            ){

                total +=
                    getDemandValue(record);

            }

        }

    }


    // =================================
    // 2. DEMAND EDITS
    // =================================

    if(
        demandEdits &&
        typeof demandEdits === "object"
    ){

        let edit =
            demandEdits[code];

        if(edit !== undefined){

            if(typeof edit === "object"){

                total +=
                    Number(
                        edit.finalDemand ??
                        edit.demandQty ??
                        edit.demandQuantity ??
                        edit.quantity ??
                        edit.qty ??
                        0
                    );

            }
            else{

                total +=
                    Number(edit || 0);

            }

        }

    }


    // =================================
    // 3. DEMAND HISTORY
    // =================================

    for(let i = 0; i < demandHistory.length; i++){

        let historyRecord =
            demandHistory[i];

        // Demand History کا month/date check

        let historyIsCurrent =
            isCurrentMonth(historyRecord);

        // اگر history record میں date/month نہیں ہے
        // تو اس کو current نہیں سمجھیں گے

        let historyDateExists =
            !!(
                historyRecord.date ||
                historyRecord.demandDate ||
                historyRecord.month ||
                historyRecord.createdDate
            );

        if(
            historyDateExists &&
            !historyIsCurrent
        ){

            continue;

        }


        let list =
            historyRecord.demandItems ||
            historyRecord.items ||
            historyRecord.demands ||
            [];


        // اگر demandHistory خود ایک item object ہو

        if(!Array.isArray(list)){

            list = [];

        }


        for(let j = 0; j < list.length; j++){

            let demandItem =
                list[j];

            if(
                getDemandCode(demandItem) === code
            ){

                total +=
                    getDemandValue(demandItem);

            }

        }

    }


    return total;

}


// =====================================
// OVERALL CURRENT MONTH DEMAND
// =====================================

function getOverallDemand(){

    let total = 0;


    for(let i = 0; i < items.length; i++){

        total +=
            getCurrentMonthDemand(
                items[i].code
            );

    }


    return total;

}


// =====================================
// PENDING FOR ITEM
// =====================================

function getPendingForItem(item){

    let demand =
        getCurrentMonthDemand(item.code);

    let currentStock =
        getCurrentStock(item);

    let pending =
        Math.max(
            demand - currentStock,
            0
        );

    return {

        demand: demand,

        pendingDemand: pending,

        pendingPO: pending

    };

}


// =====================================
// OVERALL PENDING
// =====================================

function getOverallPending(){

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

}


// =====================================
// OVERALL COST
// =====================================

function getOverallCost(){

    let total = 0;

    for(let i = 0; i < history.length; i++){

        let record =
            history[i];

        if(record.type === "Stock In"){

            total +=
                Number(record.quantity || 0) *
                Number(record.unitCost || 0);

        }

    }

    return total;

}


// =====================================
// ITEM CURRENT COST
// =====================================

function getItemCurrentCost(item){

    if(!item){

        return 0;

    }

    let currentStock =
        getCurrentStock(item);

    let latestRate =
        getLatestRate(item.code);

    return currentStock * latestRate;

}


// =====================================
// SEARCH ITEM
// =====================================

function searchItem(){

    let input =
        document.getElementById("itemSearch");

    let code =
        input.value.trim();


    if(code === ""){

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

}


// =====================================
// CLEAR SEARCH
// =====================================

function clearItemSearch(){

    document.getElementById(
        "itemSearch"
    ).value = "";

    selectedItem = null;

    localStorage.removeItem(
        "dashboardSelectedItem"
    );

    updateDashboard();

}


// =====================================
// UPDATE DASHBOARD
// =====================================

function updateDashboard(){

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


    // =================================
    // OVERALL MODE
    // =================================

    if(!selectedItem){

        document.getElementById(
            "searchInfo"
        ).innerHTML =
            "Overall Dashboard — No item selected";


        masterValue.innerHTML =
            "-";

        masterInfo.innerHTML =
            "Select an Item ID to view item details.";


        stockInValue.innerHTML =
            "-";

        stockInInfo.innerHTML =
            "Current Month Stock In";


        stockOutValue.innerHTML =
            "-";

        stockOutInfo.innerHTML =
            "Current Month Stock Out";


        costValue.innerHTML =
            "Rs. " +
            getOverallCost().toFixed(2);

        costInfo.innerHTML =
            "Overall Stock In Cost";


        demandValue.innerHTML =
            getOverallDemand().toFixed(2);

        demandInfo.innerHTML =
            "Current Month Demand";


        pendingValue.innerHTML =
            getOverallPending().toFixed(2);

        pendingInfo.innerHTML =
            "Pending Demand / PO";


        clearDashboardGraph();

        buildCurrentStockTable();

        return;

    }


    // =================================
    // SELECTED ITEM
    // =================================

    let item =
        selectedItem;


    let stockIn =
        getCurrentMonthStockIn(item.code);

    let stockOut =
        getCurrentMonthStockOut(item.code);

    let currentStock =
        getCurrentStock(item);

    let latestRate =
        getLatestRate(item.code);

    let demand =
        getCurrentMonthDemand(item.code);

    let pending =
        getPendingForItem(item);

    let itemCost =
        getItemCurrentCost(item);


    // =================================
    // SEARCH INFO
    // =================================

    document.getElementById(
        "searchInfo"
    ).innerHTML =
        "✅ Selected: <b>" +
        item.code +
        "</b> — " +
        (item.itemName || "");


    // =================================
    // MASTER
    // =================================

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


    // =================================
    // STOCK IN
    // =================================

    stockInValue.innerHTML =
        stockIn.toFixed(2) +
        " " +
        (item.unit || "");

    stockInInfo.innerHTML =
        "Current Month Stock In";


    // =================================
    // STOCK OUT
    // =================================

    stockOutValue.innerHTML =
        stockOut.toFixed(2) +
        " " +
        (item.unit || "");

    stockOutInfo.innerHTML =
        "Current Month Stock Out";


    // =================================
    // COST
    // =================================

    costValue.innerHTML =
        "Rs. " +
        itemCost.toFixed(2);

    costInfo.innerHTML =
        "Current Stock Cost";


    // =================================
    // DEMAND
    // =================================

    demandValue.innerHTML =
        demand.toFixed(2) +
        " " +
        (item.unit || "");

    demandInfo.innerHTML =
        "Current Month Demand";


    // =================================
    // PENDING
    // =================================

    pendingValue.innerHTML =
        pending.pendingDemand.toFixed(2) +
        " " +
        (item.unit || "");

    pendingInfo.innerHTML =
        "Pending Demand / PO";


    // =================================
    // GRAPH
    // =================================

    showDashboardGraph(
        item.code
    );


    // =================================
    // TABLE
    // =================================

    buildCurrentStockTable();

}


// =====================================
// CLEAR SELECTED CARDS
// =====================================

function clearSelectedCards(){

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

}


// =====================================
// CURRENT STOCK TABLE
// =====================================

function buildCurrentStockTable(){

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


        // Search selected item
        if(
            selectedItem &&
            String(item.code || "").trim() !==
            String(selectedItem.code || "").trim()
        ){

            continue;

        }


        // Current Month Stock In
        let stockIn =
            getCurrentMonthStockIn(
                item.code
            );


        // Current Month Stock Out
        let stockOut =
            getCurrentMonthStockOut(
                item.code
            );


        // Current Stock
        let currentStock =
            getCurrentStock(item);


        // Current Month Latest Rate
        let latestRate =
            getLatestRate(item.code);


        // Current Month Demand
        let demandQty =
            getCurrentMonthDemand(
                item.code
            );


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
            stockIn.toFixed(2) +
            "</td>" +

            "<td>" +
            stockOut.toFixed(2) +
            "</td>" +

            "<td class='current-stock-cell'>" +
            currentStock.toFixed(2) +
            "</td>" +

            "<td>" +
            "Rs. " +
            latestRate.toFixed(2) +
            "</td>" +

            "<td>" +
            demandQty.toFixed(2) +
            "</td>";


        // =================================
        // CURRENT STOCK COLOR
        // =================================

        let stockCell =
            row.querySelector(
                ".current-stock-cell"
            );


        if(currentStock <= 0){

            stockCell.className =
                "current-stock-cell low";

        }
        else if(
            demandQty > 0 &&
            currentStock <= demandQty
        ){

            stockCell.className =
                "current-stock-cell warning";

        }
        else{

            stockCell.className =
                "current-stock-cell normal";

        }


        body.appendChild(row);

    }

}


// =====================================
// GRAPH
// =====================================

function showDashboardGraph(itemCode){

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
        getCurrentMonthStockIn(
            item.code
        );


    let stockOut =
        getCurrentMonthStockOut(
            item.code
        );


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

        " | Current Month In: " +
        stockIn +

        " | Current Month Out: " +
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
                        "Current Month In",
                        "Current Month Out",
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

}


// =====================================
// CLEAR GRAPH
// =====================================

function clearDashboardGraph(){

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

}


// =====================================
// SAVE SELECTED ITEM
// =====================================

function saveSelectedItem(){

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

}


// =====================================
// MASTER VIEW
// =====================================

function openMasterView(){

    if(selectedItem){

        saveSelectedItem();

    }

    window.location.href =
        "Master List .html";

}


// =====================================
// MASTER NEW
// =====================================

function newMasterEntry(){

    window.location.href =
        "Master List .html";

}


// =====================================
// STOCK IN VIEW
// =====================================

function openStockInView(){

    if(!saveSelectedItem()){

        return;

    }


    localStorage.setItem(
        "historyViewType",
        "stockIn"
    );


    window.location.href =
        "Stock In History.html";

}


// =====================================
// STOCK IN NEW
// =====================================

function newStockIn(){

    if(selectedItem){

        localStorage.setItem(
            "stockInSelectedItem",
            selectedItem.code
        );

    }


    window.location.href =
        "Stock In .html";

}


// =====================================
// STOCK OUT VIEW
// =====================================

function openStockOutView(){

    if(!saveSelectedItem()){

        return;

    }


    localStorage.setItem(
        "historyViewType",
        "stockOut"
    );


    window.location.href =
        "Stock Out History.html";

}


// =====================================
// STOCK OUT NEW
// =====================================

function newStockOut(){

    if(selectedItem){

        localStorage.setItem(
            "stockOutSelectedItem",
            selectedItem.code
        );

    }


    window.location.href =
        "Stock out .html";

}


// =====================================
// COST VIEW
// =====================================

function openCostView(){

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

}


// =====================================
// COST NEW
// =====================================

function newCostEntry(){

    if(selectedItem){

        localStorage.setItem(
            "costSelectedItem",
            selectedItem.code
        );

    }


    window.location.href =
        "Cost .html";

}


// =====================================
// DEMAND VIEW
// =====================================

function openDemandView(){

    if(!saveSelectedItem()){

        return;

    }


    localStorage.setItem(
        "demandViewItem",
        selectedItem.code
    );


    window.location.href =
        "Demand History.html";

}


// =====================================
// DEMAND NEW
// =====================================

function newDemandEntry(){

    if(selectedItem){

        localStorage.setItem(
            "demandSelectedItem",
            selectedItem.code
        );

    }


    window.location.href =
        "Monthly Demand .html";

}


// =====================================
// GRAPH VIEW
// =====================================

function openGraph(){

    if(!saveSelectedItem()){

        return;

    }


    window.location.href =
        "Graphs.html";

}


// =====================================
// LOAD SAVED ITEM
// =====================================

function loadSavedItem(){

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

}


// =====================================
// REFRESH DATA
// =====================================

function refreshDashboardData(){

    items =
        JSON.parse(
            localStorage.getItem("items")
        ) || [];


    history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];


    demands =
        JSON.parse(
            localStorage.getItem("demands")
        ) || [];


    demandHistory =
        JSON.parse(
            localStorage.getItem("demandHistory")
        ) || [];


    demandEdits =
        JSON.parse(
            localStorage.getItem("demandEdits")
        ) || [];


    if(selectedItem){

        let freshItem =
            getItemByCode(
                selectedItem.code
            );

        if(freshItem){

            selectedItem =
                freshItem;

        }

    }


    updateDashboard();

}


// =====================================
// PAGE START
// =====================================

loadSavedItem();


// =====================================
// REFRESH WHEN PAGE BECOMES VISIBLE
// =====================================

document.addEventListener(
    "visibilitychange",
    function(){

        if(
            document.visibilityState === "visible"
        ){

            refreshDashboardData();

        }

    }
);
