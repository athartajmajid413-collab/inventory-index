// =====================================
// DASHBOARD DATA - SUPABASE VERSION
// Month Selector + Correct Monthly Opening Stock
// =====================================

let items = [];
let history = [];
let demands = [];
let demandHistory = [];
let demandEdits = JSON.parse(localStorage.getItem("demandEdits")) || {};
let selectedItem = null;
let dashboardChart = null;

// Selected dashboard month: YYYY-MM
let selectedDashboardMonth =
    localStorage.getItem("dashboardSelectedMonth") || getTodayMonthKey();


// =====================================
// TODAY MONTH
// =====================================

function getTodayMonthKey(){

    const d = new Date();

    return d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0");
}


// =====================================
// SELECTED MONTH PARTS
// =====================================

function getSelectedMonthParts(){

    const p =
        String(selectedDashboardMonth).split("-");

    return {
        year: Number(p[0]),
        month: Number(p[1]) - 1
    };
}


// =====================================
// MONTH NAME
// =====================================

function getMonthName(key){

    const p =
        String(key).split("-");

    const d =
        new Date(
            Number(p[0]),
            Number(p[1]) - 1,
            1
        );

    return d.toLocaleString(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    );
}


// =====================================
// SET DASHBOARD MONTH
// =====================================

function setDashboardMonth(key){

    if(!/^\d{4}-\d{2}$/.test(key))
        return;

    selectedDashboardMonth = key;

    localStorage.setItem(
        "dashboardSelectedMonth",
        key
    );

    updateMonthUI();

    updateDashboard();
}


// =====================================
// UPDATE MONTH UI
// =====================================

function updateMonthUI(){

    const picker =
        document.getElementById(
            "dashboardMonth"
        );

    const label =
        document.getElementById(
            "dashboardMonthName"
        );

    const title =
        document.getElementById(
            "stockTableTitle"
        );


    if(picker){

        picker.value =
            selectedDashboardMonth;

    }


    if(label){

        label.textContent =
            getMonthName(
                selectedDashboardMonth
            );

    }


    if(title){

        title.textContent =
            getMonthName(
                selectedDashboardMonth
            ) +
            " Stock";

    }

}


function getCurrentMonth(){

    return getSelectedMonthParts();

}


// =====================================
// GET RECORD DATE
// =====================================
//
// Supports:
//
// YYYY-MM-DD
// YYYY-MM-DD HH:mm:ss
// YYYY-MM-DDTHH:mm:ss
// DD/MM/YYYY
// DD-MM-YYYY
//
// =====================================

function getRecordDate(record){

    if(!record)
        return null;


    const value =
        record.date ??
        record.transactionDate ??
        record.entryDate ??
        record.transaction_date ??
        record.createdDate ??
        record.demandDate ??
        record.demand_month ??
        record.month ??
        "";


    if(!value)
        return null;


    const text =
        String(value).trim();


    if(!text)
        return null;


    // ---------------------------------
    // YYYY-MM-DD
    // ---------------------------------

    let match =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );


    if(match){

        const year =
            Number(match[1]);

        const month =
            Number(match[2]) - 1;

        const day =
            Number(match[3]);


        const d =
            new Date(
                year,
                month,
                day
            );


        if(!isNaN(d.getTime()))
            return d;

    }


    // ---------------------------------
    // DD/MM/YYYY
    // ---------------------------------

    match =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
        );


    if(match){

        const day =
            Number(match[1]);

        const month =
            Number(match[2]) - 1;

        const year =
            Number(match[3]);


        const d =
            new Date(
                year,
                month,
                day
            );


        if(!isNaN(d.getTime()))
            return d;

    }


    // ---------------------------------
    // DD-MM-YYYY
    // ---------------------------------

    match =
        text.match(
            /^(\d{1,2})-(\d{1,2})-(\d{4})/
        );


    if(match){

        const day =
            Number(match[1]);

        const month =
            Number(match[2]) - 1;

        const year =
            Number(match[3]);


        const d =
            new Date(
                year,
                month,
                day
            );


        if(!isNaN(d.getTime()))
            return d;

    }


    // ---------------------------------
    // FALLBACK
    // ---------------------------------

    const d =
        new Date(text);


    return isNaN(d.getTime())
        ? null
        : d;

}


// =====================================
// GET RECORD MONTH KEY
// =====================================

function getRecordMonthKey(record){

    const d =
        getRecordDate(record);


    if(!d)
        return "";


    return d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2, "0");

}


// =====================================
// SELECTED MONTH CHECK
// =====================================

function isSelectedMonth(record){

    return (
        getRecordMonthKey(record) ===
        selectedDashboardMonth
    );

}


// =====================================
// BEFORE SELECTED MONTH
// =====================================

function isBeforeSelectedMonth(record){

    const d =
        getRecordDate(record);


    if(!d)
        return false;


    const parts =
        String(
            selectedDashboardMonth
        ).split("-");


    const selectedYear =
        Number(parts[0]);


    const selectedMonth =
        Number(parts[1]);


    const recordYear =
        d.getFullYear();


    const recordMonth =
        d.getMonth() + 1;


    return (

        recordYear < selectedYear ||

        (
            recordYear === selectedYear &&
            recordMonth < selectedMonth
        )

    );

}


// =====================================
// GET ITEM BY CODE
// =====================================

function getItemByCode(code){

    const c =
        String(code || "").trim();


    return items.find(
        x =>
            String(
                x.code || ""
            ).trim() === c
    ) || null;

}


// =====================================
// LOAD DATA FROM SUPABASE
// =====================================

async function loadDashboardFromSupabase(){

    console.log(
        "Loading Dashboard from Supabase..."
    );


    // ---------------------------------
    // ITEMS
    // ---------------------------------

    const itemsResult =
        await supabaseRequest(
            "items",
            "GET",
            null,
            "?select=*"
        );


    items =
        itemsResult.success
        ? (itemsResult.data || [])
        : [];


    // ---------------------------------
    // STOCK IN
    // ---------------------------------

    const stockInResult =
        await supabaseRequest(
            "stock_in",
            "GET",
            null,
            "?select=*"
        );


    // ---------------------------------
    // STOCK OUT
    // ---------------------------------

    const stockOutResult =
        await supabaseRequest(
            "stock_issue",
            "GET",
            null,
            "?select=*"
        );


    history = [];


    // =================================
    // STOCK IN HISTORY
    // =================================

    if(stockInResult.success){

        (stockInResult.data || [])
        .forEach(r => {

            history.push({

                id:
                    r.id,

                date:
                    r.date,

                time:
                    r.time,

                itemCode:
                    r.item_code,

                itemName:
                    r.item_name,

                unit:
                    r.unit,

                source:
                    r.source,

                supplier:
                    r.supplier,

                location:
                    r.location,

                department:
                    r.department,

                quantity:
                    Number(
                        r.quantity || 0
                    ),

                unitCost:
                    Number(
                        r.unit_cost || 0
                    ),

                totalCost:
                    Number(
                        r.total_cost || 0
                    ),

                type:
                    "Stock In"

            });

        });

    }


    // =================================
    // STOCK OUT HISTORY
    // =================================

    if(stockOutResult.success){

        (stockOutResult.data || [])
        .forEach(r => {

            history.push({

                id:
                    r.id,

                date:
                    r.date,

                time:
                    r.time,

                itemCode:
                    r.item_code,

                itemName:
                    r.item_name,

                unit:
                    r.unit,

                source:
                    r.source,

                supplier:
                    r.supplier,

                location:
                    r.location,

                department:
                    r.department,

                quantity:
                    Number(
                        r.quantity || 0
                    ),

                unitCost:
                    0,

                totalCost:
                    0,

                type:
                    "Stock Issue"

            });

        });

    }


    // =================================
    // DEMAND HISTORY
    // =================================

    const demandResult =
        await supabaseRequest(
            "demand_history",
            "GET",
            null,
            "?select=*"
        );


    demandHistory =
        demandResult.success
        ? (demandResult.data || [])
        : [];


    // Local demand data
    demands =
        JSON.parse(
            localStorage.getItem(
                "demands"
            )
        ) || [];


    updateMonthUI();

    loadSavedItem();

}


// =====================================
// MASTER OPENING STOCK
// =====================================

function getMasterOpeningStock(item){

    if(!item)
        return 0;


    return Number(

        item.opening_stock ??

        item.openingStock ??

        0

    ) || 0;

}


// =====================================
// PREVIOUS STOCK CALCULATION
// =====================================
//
// IMPORTANT:
//
// Master Opening
// +
// ALL previous Stock In
// -
// ALL previous Stock Out
//
// = Selected Month Opening
//
// =====================================

function getStockBeforeMonth(itemCode){

    const code =
        String(
            itemCode || ""
        ).trim();


    let totalIn = 0;

    let totalOut = 0;


    history.forEach(record => {


        const recordCode =
            String(
                record.itemCode || ""
            ).trim();


        if(recordCode !== code)
            return;


        // Only previous months
        if(!isBeforeSelectedMonth(record))
            return;


        const qty =
            Number(
                record.quantity || 0
            ) || 0;


        // STOCK IN
        if(
            record.type ===
            "Stock In"
        ){

            totalIn += qty;

        }


        // STOCK OUT
        if(

            record.type ===
            "Stock Issue"

            ||

            record.type ===
            "Stock Out"

        ){

            totalOut += qty;

        }

    });


    return {

        totalIn:
            totalIn,

        totalOut:
            totalOut,

        balance:
            totalIn - totalOut

    };

}


// =====================================
// MONTHLY OPENING STOCK
// =====================================
//
// Example:
//
// Master Opening = 100
//
// August:
// In = 150
// Out = 50
//
// August Closing:
// 100 + 150 - 50 = 200
//
// September Opening:
// 200
//
// =====================================

function getMonthlyOpeningStock(item){

    if(!item)
        return 0;


    const masterOpening =
        getMasterOpeningStock(item);


    const previous =
        getStockBeforeMonth(
            item.code
        );


    const opening =
        masterOpening +
        previous.balance;


    console.log(
        "OPENING STOCK",
        {
            item:
                item.code,

            month:
                selectedDashboardMonth,

            masterOpening:
                masterOpening,

            previousStockIn:
                previous.totalIn,

            previousStockOut:
                previous.totalOut,

            opening:
                opening
        }
    );


    return Math.max(
        opening,
        0
    );

}


// =====================================
// SELECTED MONTH STOCK IN
// =====================================

function getSelectedMonthStockIn(itemCode){

    const code =
        String(
            itemCode || ""
        ).trim();


    let total = 0;


    history.forEach(record => {


        if(
            record.type !==
            "Stock In"
        ){

            return;

        }


        if(
            String(
                record.itemCode || ""
            ).trim() !== code
        ){

            return;

        }


        if(
            !isSelectedMonth(record)
        ){

            return;

        }


        total +=
            Number(
                record.quantity || 0
            ) || 0;

    });


    return total;

}


// =====================================
// SELECTED MONTH STOCK OUT
// =====================================

function getSelectedMonthStockOut(itemCode){

    const code =
        String(
            itemCode || ""
        ).trim();


    let total = 0;


    history.forEach(record => {


        if(

            record.type !==
            "Stock Issue"

            &&

            record.type !==
            "Stock Out"

        ){

            return;

        }


        if(
            String(
                record.itemCode || ""
            ).trim() !== code
        ){

            return;

        }


        if(
            !isSelectedMonth(record)
        ){

            return;

        }


        total +=
            Number(
                record.quantity || 0
            ) || 0;

    });


    return total;

}


// =====================================
// CURRENT BALANCE
// =====================================
//
// Current Balance
//
// = Opening Stock
// + Selected Month Stock In
// - Selected Month Stock Out
//
// =====================================

function getCurrentStock(item){

    if(!item)
        return 0;


    const opening =
        getMonthlyOpeningStock(item);


    const stockIn =
        getSelectedMonthStockIn(
            item.code
        );


    const stockOut =
        getSelectedMonthStockOut(
            item.code
        );


    const current =
        opening +
        stockIn -
        stockOut;


    console.log(
        "CURRENT BALANCE",
        {
            item:
                item.code,

            month:
                selectedDashboardMonth,

            opening:
                opening,

            stockIn:
                stockIn,

            stockOut:
                stockOut,

            current:
                current
        }
    );


    return Math.max(
        current,
        0
    );

}


// =====================================
// BACKWARD COMPATIBILITY
// =====================================

function getCurrentMonthStockIn(itemCode){

    return getSelectedMonthStockIn(
        itemCode
    );

}


function getCurrentMonthStockOut(itemCode){

    return getSelectedMonthStockOut(
        itemCode
    );

}


// =====================================
// ALL STOCK IN
// =====================================

function getAllStockIn(itemCode){

    const code =
        String(
            itemCode || ""
        ).trim();


    let total = 0;


    history.forEach(r => {

        if(

            r.type === "Stock In"

            &&

            String(
                r.itemCode || ""
            ).trim() === code

        ){

            total +=
                Number(
                    r.quantity || 0
                ) || 0;

        }

    });


    return total;

}


// =====================================
// ALL STOCK OUT
// =====================================

function getAllStockOut(itemCode){

    const code =
        String(
            itemCode || ""
        ).trim();


    let total = 0;


    history.forEach(r => {

        if(

            (
                r.type ===
                "Stock Issue"

                ||

                r.type ===
                "Stock Out"
            )

            &&

            String(
                r.itemCode || ""
            ).trim() === code

        ){

            total +=
                Number(
                    r.quantity || 0
                ) || 0;

        }

    });


    return total;

}


// =====================================
// LATEST RATE
// =====================================

function getLatestRate(itemCode){

    let latest = null;


    history.forEach(r => {


        if(

            r.type !==
            "Stock In"

            ||

            String(
                r.itemCode || ""
            ).trim() !==
            String(
                itemCode || ""
            ).trim()

            ||

            !isSelectedMonth(r)

        ){

            return;

        }


        if(!latest){

            latest = r;

            return;

        }


        const a =
            getRecordDate(r);


        const b =
            getRecordDate(latest);


        if(
            a &&
            b &&
            a >= b
        ){

            latest = r;

        }

    });


    if(latest){

        return Number(

            latest.unitCost ||

            latest.latestRate ||

            latest.rate ||

            0

        ) || 0;

    }


    const item =
        getItemByCode(
            itemCode
        );


    return item
        ? Number(

            item.latestRate ||

            item.unit_cost ||

            item.unitCost ||

            item.cost ||

            0

        ) || 0

        : 0;

}


// =====================================
// DEMAND
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

    ) || 0;

}


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


function getDemandList(record){

    let list =

        record.demand_items ||

        record.demandItems ||

        record.items ||

        record.demands ||

        [];


    if(
        typeof list ===
        "string"
    ){

        try{

            list =
                JSON.parse(list);

        }
        catch(e){

            list = [];

        }

    }


    return Array.isArray(list)
        ? list
        : [];

}


function isDemandRecordSelectedMonth(record){

    const month =
        String(

            record.demand_month ||

            record.demandMonth ||

            ""

        ).trim();


    if(month)
        return (
            month ===
            selectedDashboardMonth
        );


    return isSelectedMonth(
        record
    );

}


function getCurrentMonthDemand(itemCode){

    const code =
        String(
            itemCode || ""
        ).trim();


    let total = 0;


    for(
        const record of demands
    ){

        if(
            getDemandCode(record)
            !== code
        ){

            continue;

        }


        if(

            !record.date &&

            !record.demandDate &&

            !record.month &&

            !record.demand_month &&

            !record.createdDate

        ){

            total +=
                getDemandValue(
                    record
                );

        }

        else if(
            isSelectedMonth(
                record
            )
        ){

            total +=
                getDemandValue(
                    record
                );

        }

    }


    // Current month manual edits

    if(

        selectedDashboardMonth ===
        getTodayMonthKey()

        &&

        demandEdits

    ){

        const edit =
            demandEdits[code];


        if(
            edit !== undefined
        ){

            total += Number(

                typeof edit ===
                "object"

                ?

                (

                    edit.finalDemand ??

                    edit.final_demand ??

                    edit.demandQty ??

                    edit.demand_qty ??

                    edit.demandQuantity ??

                    edit.demand_quantity ??

                    edit.quantity ??

                    edit.qty ??

                    0

                )

                :

                edit

            ) || 0;

        }

    }


    // Demand History

    for(
        const hr of demandHistory
    ){

        if(
            !isDemandRecordSelectedMonth(
                hr
            )
        ){

            continue;

        }


        for(
            const di of
            getDemandList(hr)
        ){

            if(
                getDemandCode(di)
                === code
            ){

                total +=
                    getDemandValue(di);

            }

        }

    }


    return total;

}


function getOverallDemand(){

    return items.reduce(

        (sum,item) =>

            sum +
            getCurrentMonthDemand(
                item.code
            ),

        0

    );

}


function getPendingForItem(item){

    const demand =
        getCurrentMonthDemand(
            item.code
        );


    const currentStock =
        getCurrentStock(
            item
        );


    const pending =
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


function getOverallPending(){

    let demand = 0;

    let stock = 0;


    items.forEach(i => {

        demand +=
            getCurrentMonthDemand(
                i.code
            );


        stock +=
            getCurrentStock(
                i
            );

    });


    return Math.max(
        demand - stock,
        0
    );

}


// =====================================
// COST
// =====================================

function getOverallCost(){

    let total = 0;


    history.forEach(r => {

        if(

            r.type ===
            "Stock In"

            &&

            isSelectedMonth(r)

        ){

            total +=

                Number(
                    r.quantity || 0
                ) *

                Number(
                    r.unitCost || 0
                );

        }

    });


    return total;

}


function getItemCurrentCost(item){

    return (

        getCurrentStock(item)

        *

        getLatestRate(
            item.code
        )

    );

}


// =====================================
// SEARCH ITEM
// =====================================

function searchItem(){

    const input =
        document.getElementById(
            "itemSearch"
        );


    if(!input)
        return;


    const code =
        input.value.trim();


    if(!code){

        selectedItem = null;


        localStorage.removeItem(
            "dashboardSelectedItem"
        );


        updateDashboard();

        return;

    }


    const found =
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


        const info =
            document.getElementById(
                "searchInfo"
            );


        if(info){

            info.innerHTML =
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

    const input =
        document.getElementById(
            "itemSearch"
        );


    if(input)
        input.value = "";


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

    const el =
        id =>
            document.getElementById(
                id
            );


    if(!el("masterValue"))
        return;


    updateMonthUI();


    // =================================
    // OVERALL DASHBOARD
    // =================================

    if(!selectedItem){

        el("searchInfo").innerHTML =
            "Overall Dashboard — No item selected";


        el("masterValue").innerHTML =
            "-";


        el("masterInfo").innerHTML =
            "Select an Item ID to view item details.";


        el("stockInValue").innerHTML =
            "-";


        el("stockInInfo").innerHTML =
            "Stock In — " +
            getMonthName(
                selectedDashboardMonth
            );


        el("stockOutValue").innerHTML =
            "-";


        el("stockOutInfo").innerHTML =
            "Stock Out — " +
            getMonthName(
                selectedDashboardMonth
            );


        el("costValue").innerHTML =
            "Rs. " +
            getOverallCost().toFixed(2);


        el("costInfo").innerHTML =
            "Stock In Cost — " +
            getMonthName(
                selectedDashboardMonth
            );


        el("demandValue").innerHTML =
            getOverallDemand().toFixed(2);


        el("demandInfo").innerHTML =
            "Demand — " +
            getMonthName(
                selectedDashboardMonth
            );


        el("pendingValue").innerHTML =
            getOverallPending().toFixed(2);


        el("pendingInfo").innerHTML =
            "Pending Demand / PO";


        clearDashboardGraph();

        buildCurrentStockTable();

        return;

    }


    // =================================
    // SELECTED ITEM
    // =================================

    const item =
        selectedItem;


    const opening =
        getMonthlyOpeningStock(
            item
        );


    const stockIn =
        getSelectedMonthStockIn(
            item.code
        );


    const stockOut =
        getSelectedMonthStockOut(
            item.code
        );


    const current =
        getCurrentStock(
            item
        );


    const rate =
        getLatestRate(
            item.code
        );


    const demand =
        getCurrentMonthDemand(
            item.code
        );


    const pending =
        getPendingForItem(
            item
        );


    const cost =
        getItemCurrentCost(
            item
        );


    el("searchInfo").innerHTML =
        "✅ Selected: <b>" +
        item.code +
        "</b> — " +
        (
            item.item_name ||
            item.itemName ||
            ""
        );


    el("masterValue").innerHTML =
        item.item_name ||
        item.itemName ||
        "-";


    el("masterInfo").innerHTML =

        "ID: " +
        (item.code || "-") +

        "<br>Unit: " +
        (item.unit || "-") +

        "<br>Opening (" +
        getMonthName(
            selectedDashboardMonth
        ) +
        "): " +
        opening.toFixed(2) +

        "<br>Current Stock: " +
        current.toFixed(2);


    el("stockInValue").innerHTML =
        stockIn.toFixed(2) +
        " " +
        (item.unit || "");


    el("stockInInfo").innerHTML =
        "Stock In — " +
        getMonthName(
            selectedDashboardMonth
        );


    el("stockOutValue").innerHTML =
        stockOut.toFixed(2) +
        " " +
        (item.unit || "");


    el("stockOutInfo").innerHTML =
        "Stock Out — " +
        getMonthName(
            selectedDashboardMonth
        );


    el("costValue").innerHTML =
        "Rs. " +
        cost.toFixed(2);


    el("costInfo").innerHTML =
        "Current Stock Cost — " +
        getMonthName(
            selectedDashboardMonth
        );


    el("demandValue").innerHTML =
        demand.toFixed(2) +
        " " +
        (item.unit || "");


    el("demandInfo").innerHTML =
        "Demand — " +
        getMonthName(
            selectedDashboardMonth
        );


    el("pendingValue").innerHTML =
        pending.pendingDemand.toFixed(2) +
        " " +
        (item.unit || "");


    el("pendingInfo").innerHTML =
        "Pending Demand / PO";


    showDashboardGraph(
        item.code
    );


    buildCurrentStockTable();

}


// =====================================
// CLEAR SELECTED CARDS
// =====================================

function clearSelectedCards(){

    [

        "masterValue",
        "stockInValue",
        "stockOutValue",
        "demandValue",
        "pendingValue"

    ]
    .forEach(id => {

        const e =
            document.getElementById(
                id
            );


        if(e)
            e.innerHTML = "-";

    });


    const c =
        document.getElementById(
            "costValue"
        );


    if(c)
        c.innerHTML =
            "Rs. 0.00";


    const m =
        document.getElementById(
            "masterInfo"
        );


    if(m)
        m.innerHTML =
            "❌ Item not found.";

}


// =====================================
// CURRENT STOCK TABLE
// =====================================

function buildCurrentStockTable(){

    const body =
        document.getElementById(
            "currentStockBody"
        );


    if(!body)
        return;


    body.innerHTML = "";


    items.forEach(item => {


        if(

            selectedItem

            &&

            String(
                item.code || ""
            ).trim()

            !==

            String(
                selectedItem.code || ""
            ).trim()

        ){

            return;

        }


        const opening =
            getMonthlyOpeningStock(
                item
            );


        const stockIn =
            getSelectedMonthStockIn(
                item.code
            );


        const stockOut =
            getSelectedMonthStockOut(
                item.code
            );


        const current =
            getCurrentStock(
                item
            );


        const rate =
            getLatestRate(
                item.code
            );


        const demand =
            getCurrentMonthDemand(
                item.code
            );


        const name =
            item.item_name ||
            item.itemName ||
            "-";


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML =

            "<td>" +
            (item.code || "-") +
            "</td>" +

            "<td>" +
            name +
            "</td>" +

            "<td>" +
            (item.unit || "-") +
            "</td>" +

            "<td>" +
            opening.toFixed(2) +
            "</td>" +

            "<td>" +
            stockIn.toFixed(2) +
            "</td>" +

            "<td>" +
            stockOut.toFixed(2) +
            "</td>" +

            "<td class='current-stock-cell'>" +
            current.toFixed(2) +
            "</td>" +

            "<td>Rs. " +
            rate.toFixed(2) +
            "</td>" +

            "<td>" +
            demand.toFixed(2) +
            "</td>";


        const cell =
            row.querySelector(
                ".current-stock-cell"
            );


        if(current <= 0){

            cell.className =
                "current-stock-cell low";

        }

        else if(

            demand > 0 &&

            current <= demand

        ){

            cell.className =
                "current-stock-cell warning";

        }

        else{

            cell.className =
                "current-stock-cell normal";

        }


        body.appendChild(
            row
        );

    });

}


// =====================================
// GRAPH
// =====================================

function showDashboardGraph(itemCode){

    const canvas =
        document.getElementById(
            "dashboardGraph"
        );


    const info =
        document.getElementById(
            "graphInfo"
        );


    if(!canvas)
        return;


    const item =
        getItemByCode(
            itemCode
        );


    if(!item){

        clearDashboardGraph();

        return;

    }


    const opening =
        getMonthlyOpeningStock(
            item
        );


    const stockIn =
        getSelectedMonthStockIn(
            item.code
        );


    const stockOut =
        getSelectedMonthStockOut(
            item.code
        );


    const current =
        getCurrentStock(
            item
        );


    if(info){

        info.innerHTML =

            "<b>" +

            item.code +

            " - " +

            (
                item.item_name ||
                item.itemName ||
                ""
            ) +

            "</b><br>" +

            getMonthName(
                selectedDashboardMonth
            ) +

            " — Opening: " +

            opening.toFixed(2) +

            " | In: " +

            stockIn.toFixed(2) +

            " | Out: " +

            stockOut.toFixed(2) +

            " | Current: " +

            current.toFixed(2);

    }


    if(dashboardChart){

        dashboardChart.destroy();

        dashboardChart = null;

    }


    if(
        typeof Chart ===
        "undefined"
    ){

        if(info){

            info.innerHTML +=
                "<br>Chart library not loaded.";

        }

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
                        "Stock In",
                        "Stock Out",
                        "Current Stock"

                    ],

                    datasets:[{

                        label:

                            (
                                item.item_name ||
                                item.itemName ||
                                item.code
                            )

                            +

                            " — " +

                            getMonthName(
                                selectedDashboardMonth
                            ),

                        data:[

                            opening,
                            stockIn,
                            stockOut,
                            current

                        ],

                        borderWidth:
                            1

                    }]

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


function clearDashboardGraph(){

    const info =
        document.getElementById(
            "graphInfo"
        );


    if(info){

        info.innerHTML =
            "Select an Item ID to see its graph.";

    }


    if(dashboardChart){

        dashboardChart.destroy();

        dashboardChart = null;

    }

}


// =====================================
// NAVIGATION
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


function openMasterView(){

    if(selectedItem)
        saveSelectedItem();


    window.location.href =
        "Master List .html";

}


function newMasterEntry(){

    window.location.href =
        "Master List .html";

}


function openStockInView(){

    if(!saveSelectedItem())
        return;


    localStorage.setItem(
        "historyViewType",
        "stockIn"
    );


    window.location.href =
        "Stock In History.html";

}


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


function openStockOutView(){

    if(!saveSelectedItem())
        return;


    localStorage.setItem(
        "historyViewType",
        "stockOut"
    );


    window.location.href =
        "Stock Out History.html";

}


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


function openDemandView(){

    if(!saveSelectedItem())
        return;


    localStorage.setItem(
        "demandViewItem",
        selectedItem.code
    );


    window.location.href =
        "Demand History.html";

}


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


function openGraph(){

    if(!saveSelectedItem())
        return;


    window.location.href =
        "Graphs.html";

}


function openUserProfile(){

    window.location.href =
        "User Profile.html";

}


// =====================================
// LOAD SAVED ITEM
// =====================================

function loadSavedItem(){

    const saved =
        localStorage.getItem(
            "dashboardSelectedItem"
        );


    if(saved){

        const item =
            getItemByCode(
                saved
            );


        if(item){

            selectedItem =
                item;


            const box =
                document.getElementById(
                    "itemSearch"
                );


            if(box){

                box.value =
                    item.code;

            }

        }

    }


    updateMonthUI();

    updateDashboard();

}


// =====================================
// REFRESH
// =====================================

async function refreshDashboardData(){

    await loadDashboardFromSupabase();

}


// =====================================
// PAGE LOAD
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        updateMonthUI();


        const picker =
            document.getElementById(
                "dashboardMonth"
            );


        if(picker){

            picker.addEventListener(
                "change",
                () => {

                    setDashboardMonth(
                        picker.value
                    );

                }
            );

        }


        loadDashboardFromSupabase();

    }
);


// =====================================
// AUTO REFRESH
// =====================================

document.addEventListener(
    "visibilitychange",
    () => {

        if(
            document.visibilityState ===
            "visible"
        ){

            refreshDashboardData();

        }

    }
);
