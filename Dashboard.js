// =====================================
// DASHBOARD DATA
// SUPABASE VERSION
// =====================================

let items = [];

let history = [];

let demands = [];

let demandHistory = [];

let demandEdits =
    JSON.parse(localStorage.getItem("demandEdits")) || {};

let selectedItem = null;

let dashboardChart = null;


// =====================================
// LOAD DASHBOARD DATA FROM SUPABASE
// =====================================

async function loadDashboardFromSupabase(){

    console.log("=====================================");
    console.log("LOADING DASHBOARD DATA FROM SUPABASE");
    console.log("=====================================");


    // =================================
    // MASTER ITEMS
    // =================================

    let itemsResult =
        await supabaseRequest(
            "items",
            "GET",
            null,
            "?select=*"
        );


    if(itemsResult.success){

        items =
            itemsResult.data || [];

        console.log(
            "Supabase Items:",
            items.length
        );

    }
    else{

        console.error(
            "Items Load Error:",
            itemsResult.error
        );

        items = [];

    }


    // =================================
    // STOCK IN
    // =================================

    let stockInResult =
        await supabaseRequest(
            "stock_in",
            "GET",
            null,
            "?select=*"
        );


    // =================================
    // STOCK OUT
    // =================================

    let stockOutResult =
        await supabaseRequest(
            "stock_issue",
            "GET",
            null,
            "?select=*"
        );


    // =================================
    // COMBINE STOCK HISTORY
    // =================================

    history = [];


    if(stockInResult.success){

        let stockInData =
            stockInResult.data || [];


        for(let i = 0; i < stockInData.length; i++){

            let record =
                stockInData[i];


            history.push({

                id:
                    record.id,

                date:
                    record.date,

                time:
                    record.time,

                itemCode:
                    record.item_code,

                itemName:
                    record.item_name,

                unit:
                    record.unit,

                source:
                    record.source,

                supplier:
                    record.supplier,

                location:
                    record.location,

                department:
                    record.department,

                quantity:
                    Number(record.quantity || 0),

                unitCost:
                    Number(record.unit_cost || 0),

                totalCost:
                    Number(record.total_cost || 0),

                type:
                    "Stock In"

            });

        }

    }
    else{

        console.error(
            "Stock In Load Error:",
            stockInResult.error
        );

    }


    if(stockOutResult.success){

        let stockOutData =
            stockOutResult.data || [];


        for(let i = 0; i < stockOutData.length; i++){

            let record =
                stockOutData[i];


            history.push({

                id:
                    record.id,

                date:
                    record.date,

                time:
                    record.time,

                itemCode:
                    record.item_code,

                itemName:
                    record.item_name,

                unit:
                    record.unit,

                source:
                    record.source,

                supplier:
                    record.supplier,

                location:
                    record.location,

                department:
                    record.department,

                quantity:
                    Number(record.quantity || 0),

                unitCost:
                    0,

                totalCost:
                    0,

                type:
                    "Stock Issue"

            });

        }

    }
    else{

        console.error(
            "Stock Out Load Error:",
            stockOutResult.error
        );

    }


    console.log(
        "Stock In:",
        stockInResult.success
        ? stockInResult.data.length
        : 0
    );


    console.log(
        "Stock Out:",
        stockOutResult.success
        ? stockOutResult.data.length
        : 0
    );


    // =================================
    // DEMAND HISTORY
    // =================================

    let demandResult =
        await supabaseRequest(
            "demand_history",
            "GET",
            null,
            "?select=*"
        );


    if(demandResult.success){

        demandHistory =
            demandResult.data || [];

        console.log(
            "Demand History:",
            demandHistory.length
        );

    }
    else{

        console.error(
            "Demand History Load Error:",
            demandResult.error
        );

        demandHistory = [];

    }


    // =================================
    // COST HISTORY
    // =================================
    // Dashboard calculation currently
    // does not require cost_history.
    // Cost is calculated from Stock In.


    console.log(
        "====================================="
    );

    console.log(
        "DASHBOARD SUPABASE DATA LOADED"
    );

    console.log(
        "Items:",
        items.length
    );

    console.log(
        "History:",
        history.length
    );

    console.log(
        "Demand History:",
        demandHistory.length
    );

    console.log(
        "=====================================");


    // =================================
    // LOAD SAVED ITEM
    // =================================

    loadSavedItem();

}


// =====================================
// CURRENT MONTH
// =====================================

function getCurrentMonth(){

    let today =
        new Date();

    return {

        year:
            today.getFullYear(),

        month:
            today.getMonth()

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
        record.demand_month ||
        record.month ||
        "";

    if(!dateValue){

        return null;

    }


    // =================================
    // DD/MM/YYYY
    // =================================

    let text =
        String(dateValue).trim();


    let slashParts =
        text.split("/");


    if(slashParts.length === 3){

        let day =
            Number(slashParts[0]);

        let month =
            Number(slashParts[1]) - 1;

        let year =
            Number(slashParts[2]);


        if(
            !isNaN(day) &&
            !isNaN(month) &&
            !isNaN(year)
        ){

            return new Date(
                year,
                month,
                day
            );

        }

    }


    // =================================
    // YYYY-MM-DD
    // =================================

    let dashParts =
        text.split("-");


    if(
        dashParts.length >= 2
    ){

        let year =
            Number(dashParts[0]);

        let month =
            Number(dashParts[1]) - 1;


        if(
            !isNaN(year) &&
            !isNaN(month)
        ){

            if(dashParts.length >= 3){

                let day =
                    Number(
                        String(
                            dashParts[2]
                        ).substring(0,2)
                    );


                if(
                    !isNaN(day) &&
                    day > 0
                ){

                    return new Date(
                        year,
                        month,
                        day
                    );

                }

            }


            return new Date(
                year,
                month,
                1
            );

        }

    }


    let date =
        new Date(dateValue);


    if(!isNaN(date.getTime())){

        return date;

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

        date.getFullYear() ===
        current.year

        &&

        date.getMonth() ===
        current.month

    );

}


// =====================================
// GET ITEM BY CODE
// =====================================

function getItemByCode(code){

    for(
        let i = 0;
        i < items.length;
        i++
    ){

        if(

            String(
                items[i].code ||
                ""
            ).trim()

            ===

            String(
                code ||
                ""
            ).trim()

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


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            record.type ===
            "Stock In"

            &&

            String(
                record.itemCode ||
                ""
            ).trim()

            ===

            String(
                itemCode ||
                ""
            ).trim()

            &&

            isCurrentMonth(record)

        ){

            total +=
                Number(
                    record.quantity ||
                    0
                );

        }

    }


    return total;

}


// =====================================
// STOCK OUT - CURRENT MONTH
// =====================================

function getCurrentMonthStockOut(itemCode){

    let total = 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            (

                record.type ===
                "Stock Issue"

                ||

                record.type ===
                "Stock Out"

            )

            &&

            String(
                record.itemCode ||
                ""
            ).trim()

            ===

            String(
                itemCode ||
                ""
            ).trim()

            &&

            isCurrentMonth(record)

        ){

            total +=
                Number(
                    record.quantity ||
                    0
                );

        }

    }


    return total;

}


// =====================================
// ALL STOCK IN
// =====================================

function getAllStockIn(itemCode){

    let total = 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            record.type ===
            "Stock In"

            &&

            String(
                record.itemCode ||
                ""
            ).trim()

            ===

            String(
                itemCode ||
                ""
            ).trim()

        ){

            total +=
                Number(
                    record.quantity ||
                    0
                );

        }

    }


    return total;

}


// =====================================
// ALL STOCK OUT
// =====================================

function getAllStockOut(itemCode){

    let total = 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            (

                record.type ===
                "Stock Issue"

                ||

                record.type ===
                "Stock Out"

            )

            &&

            String(
                record.itemCode ||
                ""
            ).trim()

            ===

            String(
                itemCode ||
                ""
            ).trim()

        ){

            total +=
                Number(
                    record.quantity ||
                    0
                );

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
        Number(
            item.opening_stock ??
            item.openingStock ??
            0
        );


    let stockIn =
        getAllStockIn(
            item.code
        );


    let stockOut =
        getAllStockOut(
            item.code
        );


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

    let latestRecord =
        null;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            record.type ===
            "Stock In"

            &&

            String(
                record.itemCode ||
                ""
            ).trim()

            ===

            String(
                itemCode ||
                ""
            ).trim()

            &&

            isCurrentMonth(record)

        ){

            if(
                latestRecord === null
            ){

                latestRecord =
                    record;

            }
            else{

                let currentDate =
                    getRecordDate(
                        record
                    );


                let latestDate =
                    getRecordDate(
                        latestRecord
                    );


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


    let item =
        getItemByCode(
            itemCode
        );


    if(item){

        return Number(

            item.latestRate ||
            item.unit_cost ||
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

        record.final_demand ??

        record.approvedQty ??

        record.approved_qty ??

        record.demandQty ??

        record.demand_qty ??

        record.demandQuantity ??

        record.demand_quantity ??

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

        record.item_code ??

        record.code ??

        record.itemID ??

        record.item_id ??

        record.itemId ??

        ""

    ).trim();

}


// =====================================
// READ DEMAND LIST
// =====================================

function getDemandList(record){

    let list =
        record.demand_items ||
        record.demandItems ||
        record.items ||
        record.demands ||
        [];


    // =================================
    // JSON STRING
    // =================================

    if(typeof list === "string"){

        try{

            list =
                JSON.parse(list);

        }
        catch(error){

            console.error(
                "Demand JSON Error:",
                error
            );

            list = [];

        }

    }


    if(!Array.isArray(list)){

        return [];

    }


    return list;

}


// =====================================
// CHECK DEMAND MONTH
// =====================================

function isDemandRecordCurrentMonth(record){

    let month =
        String(
            record.demand_month ||
            record.demandMonth ||
            ""
        ).trim();


    if(month){

        let current =
            getCurrentMonth();


        let currentMonth =
            current.year +
            "-" +
            String(
                current.month + 1
            ).padStart(2,"0");


        return (
            month ===
            currentMonth
        );

    }


    return isCurrentMonth(
        record
    );

}


// =====================================
// CURRENT MONTH DEMAND
// =====================================

function getCurrentMonthDemand(itemCode){

    let code =
        String(
            itemCode ||
            ""
        ).trim();


    let total = 0;


    // =================================
    // 1. OLD CURRENT DEMANDS
    // =================================

    for(
        let i = 0;
        i < demands.length;
        i++
    ){

        let record =
            demands[i];


        if(
            getDemandCode(record) !==
            code
        ){

            continue;

        }


        let hasDate =
            !!(

                record.date ||
                record.demandDate ||
                record.month ||
                record.demand_month ||
                record.createdDate

            );


        if(

            !hasDate

            ||

            isCurrentMonth(record)

        ){

            total +=
                getDemandValue(
                    record
                );

        }

    }


    // =================================
    // 2. DEMAND EDITS
    // =================================

    if(

        demandEdits &&

        typeof demandEdits ===
        "object"

    ){

        let edit =
            demandEdits[code];


        if(edit !== undefined){

            if(
                typeof edit ===
                "object"
            ){

                total +=
                    Number(

                        edit.finalDemand ??

                        edit.final_demand ??

                        edit.demandQty ??

                        edit.demand_qty ??

                        edit.demandQuantity ??

                        edit.demand_quantity ??

                        edit.quantity ??

                        edit.qty ??

                        0

                    );

            }
            else{

                total +=
                    Number(
                        edit || 0
                    );

            }

        }

    }


    // =================================
    // 3. SUPABASE DEMAND HISTORY
    // =================================

    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let historyRecord =
            demandHistory[i];


        if(
            !isDemandRecordCurrentMonth(
                historyRecord
            )
        ){

            continue;

        }


        let list =
            getDemandList(
                historyRecord
            );


        for(
            let j = 0;
            j < list.length;
            j++
        ){

            let demandItem =
                list[j];


            if(

                getDemandCode(
                    demandItem
                )

                ===

                code

            ){

                total +=
                    getDemandValue(
                        demandItem
                    );

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


    for(
        let i = 0;
        i < items.length;
        i++
    ){

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
        getCurrentMonthDemand(
            item.code
        );


    let currentStock =
        getCurrentStock(
            item
        );


    let pending =
        Math.max(
            demand -
            currentStock,
            0
        );


    return {

        demand:
            demand,

        pendingDemand:
            pending,

        pendingPO:
            pending

    };

}


// =====================================
// OVERALL PENDING
// =====================================

function getOverallPending(){

    let totalDemand =
        getOverallDemand();


    let totalStock = 0;


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        totalStock +=
            getCurrentStock(
                items[i]
            );

    }


    return Math.max(
        totalDemand -
        totalStock,
        0
    );

}


// =====================================
// OVERALL COST
// =====================================

function getOverallCost(){

    let total = 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(
            record.type ===
            "Stock In"
        ){

            total +=

                Number(
                    record.quantity ||
                    0
                )

                *

                Number(
                    record.unitCost ||
                    0
                );

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
        getCurrentStock(
            item
        );


    let latestRate =
        getLatestRate(
            item.code
        );


    return (
        currentStock *
        latestRate
    );

}


// =====================================
// SEARCH ITEM
// =====================================

function searchItem(){

    let input =
        document.getElementById(
            "itemSearch"
        );


    if(!input){

        return;

    }


    let code =
        input.value.trim();


    if(code === ""){

        selectedItem =
            null;


        localStorage.removeItem(
            "dashboardSelectedItem"
        );


        updateDashboard();

        return;

    }


    let found =
        getItemByCode(
            code
        );


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

        selectedItem =
            null;


        let searchInfo =
            document.getElementById(
                "searchInfo"
            );


        if(searchInfo){

            searchInfo.innerHTML =
                "❌ Item not found: " +
                code;

        }


        clearSelectedCards();

        buildCurrentStockTable();

        clearDashboardGraph();

    }

}


// =====================================
// CLEAR SEARCH
// =====================================

function clearItemSearch(){

    let input =
        document.getElementById(
            "itemSearch"
        );


    if(input){

        input.value = "";

    }


    selectedItem =
        null;


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
        document.getElementById(
            "masterValue"
        );


    let masterInfo =
        document.getElementById(
            "masterInfo"
        );


    let stockInValue =
        document.getElementById(
            "stockInValue"
        );


    let stockInInfo =
        document.getElementById(
            "stockInInfo"
        );


    let stockOutValue =
        document.getElementById(
            "stockOutValue"
        );


    let stockOutInfo =
        document.getElementById(
            "stockOutInfo"
        );


    let costValue =
        document.getElementById(
            "costValue"
        );


    let costInfo =
        document.getElementById(
            "costInfo"
        );


    let demandValue =
        document.getElementById(
            "demandValue"
        );


    let demandInfo =
        document.getElementById(
            "demandInfo"
        );


    let pendingValue =
        document.getElementById(
            "pendingValue"
        );


    let pendingInfo =
        document.getElementById(
            "pendingInfo"
        );


    if(!masterValue){

        return;

    }


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
        getCurrentMonthStockIn(
            item.code
        );


    let stockOut =
        getCurrentMonthStockOut(
            item.code
        );


    let currentStock =
        getCurrentStock(
            item
        );


    let latestRate =
        getLatestRate(
            item.code
        );


    let demand =
        getCurrentMonthDemand(
            item.code
        );


    let pending =
        getPendingForItem(
            item
        );


    let itemCost =
        getItemCurrentCost(
            item
        );


    // =================================
    // SEARCH INFO
    // =================================

    document.getElementById(
        "searchInfo"
    ).innerHTML =

        "✅ Selected: <b>" +

        item.code +

        "</b> — " +

        (
            item.item_name ||
            item.itemName ||
            ""
        );


    // =================================
    // MASTER
    // =================================

    masterValue.innerHTML =

        item.item_name ||
        item.itemName ||
        "-";


    masterInfo.innerHTML =

        "ID: " +

        (
            item.code ||
            "-"
        )

        +

        "<br>"

        +

        "Unit: " +

        (
            item.unit ||
            "-"
        )

        +

        "<br>"

        +

        "Current Stock: " +

        currentStock;


    // =================================
    // STOCK IN
    // =================================

    stockInValue.innerHTML =

        stockIn.toFixed(2)

        +

        " "

        +

        (
            item.unit ||
            ""
        );


    stockInInfo.innerHTML =
        "Current Month Stock In";


    // =================================
    // STOCK OUT
    // =================================

    stockOutValue.innerHTML =

        stockOut.toFixed(2)

        +

        " "

        +

        (
            item.unit ||
            ""
        );


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

        demand.toFixed(2)

        +

        " "

        +

        (
            item.unit ||
            ""
        );


    demandInfo.innerHTML =
        "Current Month Demand";


    // =================================
    // PENDING
    // =================================

    pendingValue.innerHTML =

        pending.pendingDemand.toFixed(2)

        +

        " "

        +

        (
            item.unit ||
            ""
        );


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

    let ids = [

        "masterValue",
        "stockInValue",
        "stockOutValue",
        "costValue",
        "demandValue",
        "pendingValue"

    ];


    for(
        let i = 0;
        i < ids.length;
        i++
    ){

        let element =
            document.getElementById(
                ids[i]
            );


        if(element){

            element.innerHTML =
                ids[i] ===
                "costValue"
                ? "Rs. 0.00"
                : "-";

        }

    }


    let masterInfo =
        document.getElementById(
            "masterInfo"
        );


    if(masterInfo){

        masterInfo.innerHTML =
            "❌ Item not found.";

    }

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


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let item =
            items[i];


        if(

            selectedItem

            &&

            String(
                item.code ||
                ""
            ).trim()

            !==

            String(
                selectedItem.code ||
                ""
            ).trim()

        ){

            continue;

        }


        let stockIn =
            getCurrentMonthStockIn(
                item.code
            );


        let stockOut =
            getCurrentMonthStockOut(
                item.code
            );


        let currentStock =
            getCurrentStock(
                item
            );


        let latestRate =
            getLatestRate(
                item.code
            );


        let demandQty =
            getCurrentMonthDemand(
                item.code
            );


        let itemName =
            item.item_name ||
            item.itemName ||
            "-";


        let row =
            document.createElement(
                "tr"
            );


        row.innerHTML =

            "<td>" +

            (
                item.code ||
                "-"
            )

            +

            "</td>"

            +

            "<td>" +

            itemName +

            "</td>"

            +

            "<td>" +

            (
                item.unit ||
                "-"
            )

            +

            "</td>"

            +

            "<td>" +

            stockIn.toFixed(2)

            +

            "</td>"

            +

            "<td>" +

            stockOut.toFixed(2)

            +

            "</td>"

            +

            "<td class='current-stock-cell'>" +

            currentStock.toFixed(2)

            +

            "</td>"

            +

            "<td>Rs. " +

            latestRate.toFixed(2)

            +

            "</td>"

            +

            "<td>" +

            demandQty.toFixed(2)

            +

            "</td>";


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

            currentStock <=
            demandQty

        ){

            stockCell.className =
                "current-stock-cell warning";

        }
        else{

            stockCell.className =
                "current-stock-cell normal";

        }


        body.appendChild(
            row
        );

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
        getItemByCode(
            itemCode
        );


    if(!item){

        clearDashboardGraph();

        return;

    }


    let openingStock =
        Number(

            item.opening_stock ??

            item.openingStock ??

            0

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
        getCurrentStock(
            item
        );


    graphInfo.innerHTML =

        "<b>" +

        item.code +

        " - " +

        (

            item.item_name ||
            item.itemName ||
            ""

        )

        +

        "</b>"

        +

        "<br>"

        +

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

        dashboardChart =
            null;

    }


    if(
        typeof Chart ===
        "undefined"
    ){

        graphInfo.innerHTML +=
            "<br>Chart library not loaded.";

        return;

    }


    dashboardChart =
        new Chart(

            canvas,

            {

                type:
                    "bar",

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

                                item.item_name ||

                                item.itemName ||

                                item.code,

                            data:[

                                openingStock,
                                stockIn,
                                stockOut,
                                currentStock

                            ],

                            borderWidth:
                                1

                        }

                    ]

                },

                options:{

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins:{

                        legend:{

                            display:
                                true

                        }

                    },

                    scales:{

                        y:{

                            beginAtZero:
                                true

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

        dashboardChart =
            null;

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
            getItemByCode(
                saved
            );


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

async function refreshDashboardData(){

    await loadDashboardFromSupabase();

}


// =====================================
// PAGE START
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        loadDashboardFromSupabase();

    }
);


// =====================================
// REFRESH WHEN PAGE BECOMES VISIBLE
// =====================================

document.addEventListener(
    "visibilitychange",
    function(){

        if(
            document.visibilityState ===
            "visible"
        ){

            refreshDashboardData();

        }

    }
);
function openUserProfile(){

    window.location.href =
        "User Profile.html";

}
