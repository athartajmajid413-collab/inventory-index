// ======================================================
// REPORTS.JS - SUPABASE VERSION
// Monthly Demand uses DEMAND MONTH, not Generate Date
// ======================================================


// ------------------------------------------------------
// SUPABASE CONFIG
// ------------------------------------------------------

const REPORT_SUPABASE_URL =
    "https://YOUR-PROJECT.supabase.co";

const REPORT_SUPABASE_KEY =
    "YOUR-SUPABASE-ANON-KEY";


// ------------------------------------------------------
// GLOBAL DATA
// ------------------------------------------------------

let items = [];
let history = [];
let demands = [];
let demandHistory = [];


// ------------------------------------------------------
// SUPABASE REQUEST
// ------------------------------------------------------

async function reportSupabaseRequest(
    table,
    options = {}
){

    const {
        method = "GET",
        body = null,
        query = ""
    } = options;

    const url =
        REPORT_SUPABASE_URL +
        "/rest/v1/" +
        table +
        query;

    const response =
        await fetch(
            url,
            {
                method: method,

                headers: {
                    "apikey":
                        REPORT_SUPABASE_KEY,

                    "Authorization":
                        "Bearer " +
                        REPORT_SUPABASE_KEY,

                    "Content-Type":
                        "application/json",

                    "Prefer":
                        "return=representation"
                },

                body:
                    body
                        ? JSON.stringify(body)
                        : null
            }
        );

    if(!response.ok){

        const errorText =
            await response.text();

        throw new Error(
            errorText ||
            response.statusText
        );
    }

    const text =
        await response.text();

    if(!text){
        return [];
    }

    return JSON.parse(text);
}


// ------------------------------------------------------
// PAGE LOAD
// ------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function(){

        loadReportData();

    }
);


// ------------------------------------------------------
// LOAD REPORT DATA
// ------------------------------------------------------

async function loadReportData(){

    try{

        console.log(
            "Loading report data..."
        );


        // ----------------------------------------------
        // ITEMS
        // ----------------------------------------------

        try{

            items =
                await reportSupabaseRequest(
                    "items"
                );

        }catch(error){

            console.error(
                "Items loading error:",
                error
            );

            items = [];
        }


        // ----------------------------------------------
        // STOCK IN
        // ----------------------------------------------

        let stockInData = [];

        try{

            stockInData =
                await reportSupabaseRequest(
                    "stock_in"
                );

        }catch(error){

            console.error(
                "Stock In loading error:",
                error
            );

            stockInData = [];
        }


        // ----------------------------------------------
        // STOCK OUT
        // ----------------------------------------------

        let stockIssueData = [];

        try{

            stockIssueData =
                await reportSupabaseRequest(
                    "stock_issue"
                );

        }catch(error){

            console.error(
                "Stock Out loading error:",
                error
            );

            stockIssueData = [];
        }


        // ----------------------------------------------
        // HISTORY TABLE
        // ----------------------------------------------

        let historyData = [];

        try{

            historyData =
                await reportSupabaseRequest(
                    "history"
                );

        }catch(error){

            console.warn(
                "History table not available:",
                error
            );

            historyData = [];
        }


        // ----------------------------------------------
        // BUILD COMMON HISTORY
        // ----------------------------------------------

        history = [];


        // Stock In history

        for(
            let i = 0;
            i < stockInData.length;
            i++
        ){

            let row =
                stockInData[i];

            history.push({

                id:
                    row.id,

                itemCode:
                    row.item_code ||
                    row.itemCode ||
                    row.code ||
                    "",

                itemName:
                    row.item_name ||
                    row.itemName ||
                    "",

                type:
                    "Stock In",

                quantity:
                    Number(
                        row.quantity ||
                        row.qty ||
                        0
                    ),

                unitCost:
                    Number(
                        row.unit_cost ||
                        row.unitCost ||
                        row.rate ||
                        0
                    ),

                totalCost:
                    Number(
                        row.total_cost ||
                        row.totalCost ||
                        (
                            Number(
                                row.quantity ||
                                row.qty ||
                                0
                            ) *
                            Number(
                                row.unit_cost ||
                                row.unitCost ||
                                row.rate ||
                                0
                            )
                        )
                    ),

                date:
                    row.date ||
                    row.stock_in_date ||
                    row.created_at ||
                    "",

                sourceTable:
                    "stock_in",

                sourceRow:
                    row

            });

        }


        // Stock Out history

        for(
            let i = 0;
            i < stockIssueData.length;
            i++
        ){

            let row =
                stockIssueData[i];

            history.push({

                id:
                    row.id,

                itemCode:
                    row.item_code ||
                    row.itemCode ||
                    row.code ||
                    "",

                itemName:
                    row.item_name ||
                    row.itemName ||
                    "",

                type:
                    "Stock Out",

                quantity:
                    Number(
                        row.quantity ||
                        row.qty ||
                        0
                    ),

                unitCost:
                    Number(
                        row.unit_cost ||
                        row.unitCost ||
                        row.rate ||
                        0
                    ),

                totalCost:
                    Number(
                        row.total_cost ||
                        row.totalCost ||
                        (
                            Number(
                                row.quantity ||
                                row.qty ||
                                0
                            ) *
                            Number(
                                row.unit_cost ||
                                row.unitCost ||
                                row.rate ||
                                0
                            )
                        )
                    ),

                date:
                    row.date ||
                    row.stock_issue_date ||
                    row.created_at ||
                    "",

                sourceTable:
                    "stock_issue",

                sourceRow:
                    row

            });

        }


        // ----------------------------------------------
        // OLD DEMANDS TABLE
        // ----------------------------------------------

        try{

            demands =
                await reportSupabaseRequest(
                    "demands"
                );

        }catch(error){

            console.warn(
                "Demands table not available:",
                error
            );

            demands = [];
        }


        // ----------------------------------------------
        // DEMAND HISTORY
        // ----------------------------------------------

        try{

            demandHistory =
                await reportSupabaseRequest(
                    "demand_history"
                );

        }catch(error){

            console.error(
                "Demand History loading error:",
                error
            );

            demandHistory = [];
        }


        console.log(
            "Items:",
            items
        );

        console.log(
            "History:",
            history
        );

        console.log(
            "Demand History:",
            demandHistory
        );


    }catch(error){

        console.error(
            "Report data loading error:",
            error
        );

        alert(
            "Report data load نہیں ہو سکا۔"
        );

    }

}


// ======================================================
// DATE HELPERS
// ======================================================


// ------------------------------------------------------
// GET MONTH KEY
// ------------------------------------------------------

function getMonthKeyFromDate(value){

    if(!value){
        return "";
    }

    let text =
        String(value).trim();


    // YYYY-MM-DD
    let match =
        text.match(
            /^(\d{4})-(\d{1,2})/
        );

    if(match){

        return (
            match[1] +
            "-" +
            String(
                match[2]
            ).padStart(
                2,
                "0"
            )
        );

    }


    // Try JavaScript date

    let date =
        new Date(value);

    if(
        !isNaN(
            date.getTime()
        )
    ){

        return (
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            )
        );

    }


    return "";

}


// ------------------------------------------------------
// GET DEMAND MONTH
// ------------------------------------------------------

function getDemandMonthKey(
    record,
    demandItem = null
){

    // IMPORTANT:
    // demand_month is the actual month
    // for which demand was generated.

    let demandMonth =
        record.demand_month ||
        record.demandMonth ||
        record.selected_month ||
        record.selectedMonth ||
        "";


    // Sometimes old data may keep
    // month inside the item.

    if(
        !demandMonth &&
        demandItem
    ){

        demandMonth =
            demandItem.demand_month ||
            demandItem.demandMonth ||
            demandItem.selected_month ||
            demandItem.selectedMonth ||
            "";

    }


    if(demandMonth){

        let monthKey =
            getMonthKeyFromDate(
                demandMonth
            );

        if(monthKey){
            return monthKey;
        }

    }


    // --------------------------------------------------
    // LEGACY FALLBACK
    // --------------------------------------------------
    // Only if demand_month does not exist.

    let fallbackDate =
        record.date ||
        record.generate_date ||
        record.generateDate ||
        "";

    return getMonthKeyFromDate(
        fallbackDate
    );

}


// ------------------------------------------------------
// DEMAND MONTH FILTER
// ------------------------------------------------------

function demandMonthMatchesRange(
    demandMonth,
    fromDate,
    toDate
){

    if(!demandMonth){

        return false;

    }


    let fromMonth =
        getMonthKeyFromDate(
            fromDate
        );

    let toMonth =
        getMonthKeyFromDate(
            toDate
        );


    if(
        fromMonth &&
        demandMonth < fromMonth
    ){

        return false;

    }


    if(
        toMonth &&
        demandMonth > toMonth
    ){

        return false;

    }


    return true;

}


// ======================================================
// DEMAND HELPERS
// ======================================================


// ------------------------------------------------------
// GET DEMAND ITEMS ARRAY
// ------------------------------------------------------

function getDemandItems(
    record
){

    let list =
        record.demand_items ||
        record.demandItems ||
        record.items ||
        [];


    // Supabase may return JSON
    // as a string.

    if(
        typeof list === "string"
    ){

        try{

            list =
                JSON.parse(list);

        }catch(error){

            console.error(
                "Demand items JSON error:",
                error
            );

            list = [];

        }

    }


    if(
        !Array.isArray(list)
    ){

        return [];

    }


    return list;

}


// ------------------------------------------------------
// GET DEMAND ITEM CODE
// ------------------------------------------------------

function getDemandItemCode(
    item
){

    return String(

        item.code ||
        item.item_code ||
        item.itemCode ||
        ""

    ).trim();

}


// ------------------------------------------------------
// GET DEMAND ITEM NAME
// ------------------------------------------------------

function getDemandItemName(
    item
){

    return (

        item.itemName ||
        item.item_name ||
        item.name ||
        ""

    );

}


// ------------------------------------------------------
// GET DEMAND QUANTITY
// ------------------------------------------------------

function getDemandQuantity(
    item
){

    let value =

        item.finalDemand ??
        item.final_demand ??
        item.approvedQty ??
        item.approved_qty ??
        item.quantity ??
        item.demandQuantity ??
        item.demand_quantity ??
        item.demand ??
        0;


    let number =
        Number(value);


    if(
        isNaN(number)
    ){

        return 0;

    }


    return number;

}


// ------------------------------------------------------
// GET PENDING DEMAND
// ------------------------------------------------------

function getPendingDemand(
    item
){

    let value =

        item.pendingDemand ??
        item.pending_demand ??
        0;


    let number =
        Number(value);


    return isNaN(number)
        ? 0
        : number;

}


// ------------------------------------------------------
// GET PENDING PO
// ------------------------------------------------------

function getPendingPO(
    item
){

    let value =

        item.pendingPO ??
        item.pending_po ??
        item.po ??
        0;


    let number =
        Number(value);


    return isNaN(number)
        ? 0
        : number;

}


// ======================================================
// GENERATE REPORT
// ======================================================

async function generateReport(){

    let reportType =
        document.getElementById(
            "reportType"
        )?.value || "";


    let fromDate =
        document.getElementById(
            "fromDate"
        )?.value || "";


    let toDate =
        document.getElementById(
            "toDate"
        )?.value || "";


    let itemCode =
        String(
            document.getElementById(
                "itemCode"
            )?.value || ""
        ).trim();


    let department =
        String(
            document.getElementById(
                "department"
            )?.value || ""
        ).trim();


    // --------------------------------------------------
    // MAKE SURE DATA IS LOADED
    // --------------------------------------------------

    if(
        !items.length &&
        !history.length &&
        !demandHistory.length
    ){

        await loadReportData();

    }


    // --------------------------------------------------
    // CLEAR OLD TABLE
    // --------------------------------------------------

    let tableBody =
        document.getElementById(
            "reportTableBody"
        );


    if(tableBody){

        tableBody.innerHTML = "";

    }


    // --------------------------------------------------
    // UPDATE HEADERS
    // --------------------------------------------------

    updateReportHeaders(
        reportType
    );


    // --------------------------------------------------
    // TOTALS
    // --------------------------------------------------

    let totalEntries = 0;
    let totalQuantity = 0;
    let totalValue = 0;


    // ==================================================
    // STOCK IN
    // ==================================================

    if(
        reportType === "stockIn"
    ){

        let filtered =
            history.filter(
                function(row){

                    if(
                        row.type !==
                        "Stock In"
                    ){

                        return false;

                    }


                    if(
                        itemCode &&
                        String(
                            row.itemCode
                        ).trim() !==
                        itemCode
                    ){

                        return false;

                    }


                    if(
                        !dateMatches(
                            row.date,
                            fromDate,
                            toDate
                        )
                    ){

                        return false;

                    }


                    return true;

                }
            );


        for(
            let i = 0;
            i < filtered.length;
            i++
        ){

            let row =
                filtered[i];

            totalEntries++;

            totalQuantity +=
                Number(
                    row.quantity || 0
                );

            totalValue +=
                Number(
                    row.totalCost || 0
                );

            addReportRow(
                row
            );

        }

    }


    // ==================================================
    // STOCK OUT
    // ==================================================

    else if(
        reportType === "stockOut"
    ){

        let filtered =
            history.filter(
                function(row){

                    if(
                        row.type !==
                        "Stock Out"
                    ){

                        return false;

                    }


                    if(
                        itemCode &&
                        String(
                            row.itemCode
                        ).trim() !==
                        itemCode
                    ){

                        return false;

                    }


                    if(
                        !dateMatches(
                            row.date,
                            fromDate,
                            toDate
                        )
                    ){

                        return false;

                    }


                    return true;

                }
            );


        for(
            let i = 0;
            i < filtered.length;
            i++
        ){

            let row =
                filtered[i];

            totalEntries++;

            totalQuantity +=
                Number(
                    row.quantity || 0
                );

            totalValue +=
                Number(
                    row.totalCost || 0
                );

            addReportRow(
                row
            );

        }

    }


    // ==================================================
    // ALL TRANSACTIONS
    // ==================================================

    else if(
        reportType === "all"
    ){

        let filtered =
            history.filter(
                function(row){

                    if(
                        itemCode &&
                        String(
                            row.itemCode
                        ).trim() !==
                        itemCode
                    ){

                        return false;

                    }


                    if(
                        !dateMatches(
                            row.date,
                            fromDate,
                            toDate
                        )
                    ){

                        return false;

                    }


                    return true;

                }
            );


        for(
            let i = 0;
            i < filtered.length;
            i++
        ){

            let row =
                filtered[i];

            totalEntries++;

            totalQuantity +=
                Number(
                    row.quantity || 0
                );

            totalValue +=
                Number(
                    row.totalCost || 0
                );

            addReportRow(
                row
            );

        }

    }


    // ==================================================
    // CURRENT STOCK
    // ==================================================

    else if(
        reportType === "currentStock"
    ){

        for(
            let i = 0;
            i < items.length;
            i++
        ){

            let item =
                items[i];


            let code =
                String(
                    item.code ||
                    item.item_code ||
                    item.itemCode ||
                    ""
                ).trim();


            if(
                itemCode &&
                code !== itemCode
            ){

                continue;

            }


            let departmentValue =
                item.department ||
                "";


            if(
                department &&
                !String(
                    departmentValue
                ).toLowerCase()
                .includes(
                    department.toLowerCase()
                )
            ){

                continue;

            }


            let currentStock =
                calculateCurrentStock(
                    code,
                    item
                );


            let row = {

                itemCode:
                    code,

                itemName:
                    item.item_name ||
                    item.itemName ||
                    item.name ||
                    "",

                unit:
                    item.unit ||
                    "",

                quantity:
                    currentStock,

                currentStock:
                    currentStock,

                minimumStock:
                    item.minimum_stock ??
                    item.minimumStock ??
                    item.minimum_Stock ??
                    0

            };


            totalEntries++;

            totalQuantity +=
                currentStock;


            addCurrentStockRow(
                row
            );

        }

    }


    // ==================================================
    // COST
    // ==================================================

    else if(
        reportType === "cost"
    ){

        for(
            let i = 0;
            i < items.length;
            i++
        ){

            let item =
                items[i];


            let code =
                String(
                    item.code ||
                    item.item_code ||
                    item.itemCode ||
                    ""
                ).trim();


            if(
                itemCode &&
                code !== itemCode
            ){

                continue;

            }


            let latestRate =
                getLatestRate(
                    code
                );


            let row = {

                itemCode:
                    code,

                itemName:
                    item.item_name ||
                    item.itemName ||
                    item.name ||
                    "",

                unit:
                    item.unit ||
                    "",

                latestRate:
                    latestRate

            };


            totalEntries++;

            totalValue +=
                Number(
                    latestRate || 0
                );


            addCostRow(
                row
            );

        }

    }


    // ==================================================
    // MONTHLY DEMAND
    // ==================================================

    else if(
        reportType === "demand"
    ){

        /*
        ==================================================
        IMPORTANT FIX
        ==================================================

        OLD CODE:

        demands[] was used here.

        That caused a problem because the demand report
        was not using demand_month.

        Example:

        Demand Month  = 2026-06
        Generate Date = 2026-09-11

        OLD REPORT:
        September

        NEW REPORT:
        June

        We now read demand_history and use:

        demand_month

        as the actual demand month.
        ==================================================
        */


        let demandData = {};


        // ------------------------------------------------
        // USE DEMAND HISTORY
        // ------------------------------------------------

        if(
            demandHistory &&
            demandHistory.length > 0
        ){

            for(
                let i = 0;
                i < demandHistory.length;
                i++
            ){

                let record =
                    demandHistory[i];


                // ----------------------------------------
                // GET ACTUAL DEMAND MONTH
                // ----------------------------------------

                let demandMonth =
                    getDemandMonthKey(
                        record
                    );


                if(
                    !demandMonth
                ){

                    console.warn(
                        "Demand record has no month:",
                        record
                    );

                    continue;

                }


                // ----------------------------------------
                // MONTH FILTER
                // ----------------------------------------

                if(
                    !demandMonthMatchesRange(
                        demandMonth,
                        fromDate,
                        toDate
                    )
                ){

                    continue;

                }


                // ----------------------------------------
                // DEMAND ITEMS
                // ----------------------------------------

                let demandItems =
                    getDemandItems(
                        record
                    );


                for(
                    let j = 0;
                    j < demandItems.length;
                    j++
                ){

                    let demandItem =
                        demandItems[j];


                    let code =
                        getDemandItemCode(
                            demandItem
                        );


                    if(!code){

                        continue;

                    }


                    // ------------------------------------
                    // ITEM FILTER
                    // ------------------------------------

                    if(
                        itemCode &&
                        code !== itemCode
                    ){

                        continue;

                    }


                    // ------------------------------------
                    // CREATE RECORD
                    // ------------------------------------

                    if(
                        !demandData[code]
                    ){

                        demandData[code] = {

                            itemCode:
                                code,

                            itemName:
                                getDemandItemName(
                                    demandItem
                                ),

                            demand:
                                0,

                            pendingDemand:
                                0,

                            pendingPO:
                                0

                        };

                    }


                    // ------------------------------------
                    // DEMAND
                    // ------------------------------------

                    demandData[code].demand +=
                        getDemandQuantity(
                            demandItem
                        );


                    // ------------------------------------
                    // PENDING DEMAND
                    // ------------------------------------

                    demandData[code].pendingDemand +=
                        getPendingDemand(
                            demandItem
                        );


                    // ------------------------------------
                    // PENDING PO
                    // ------------------------------------

                    demandData[code].pendingPO +=
                        getPendingPO(
                            demandItem
                        );


                    // ------------------------------------
                    // ITEM NAME
                    // ------------------------------------

                    if(
                        !demandData[code].itemName
                    ){

                        demandData[code].itemName =
                            getDemandItemName(
                                demandItem
                            );

                    }

                }

            }


        }


        // ------------------------------------------------
        // BACKWARD COMPATIBILITY
        // ------------------------------------------------
        // Only use old demands table if there is NO
        // demand_history data at all.
        // This prevents double counting.

        else if(
            demands &&
            demands.length > 0
        ){

            for(
                let i = 0;
                i < demands.length;
                i++
            ){

                let demand =
                    demands[i];


                let code =
                    String(
                        demand.item_code ||
                        demand.itemCode ||
                        demand.code ||
                        ""
                    ).trim();


                if(!code){

                    continue;

                }


                if(
                    itemCode &&
                    code !== itemCode
                ){

                    continue;

                }


                if(
                    !demandData[code]
                ){

                    demandData[code] = {

                        itemCode:
                            code,

                        itemName:
                            demand.item_name ||
                            demand.itemName ||
                            demand.name ||
                            "",

                        demand:
                            0,

                        pendingDemand:
                            0,

                        pendingPO:
                            0

                    };

                }


                demandData[code].demand +=
                    Number(
                        demand.demand ??
                        demand.finalDemand ??
                        demand.final_demand ??
                        demand.quantity ??
                        0
                    );


                demandData[code].pendingDemand +=
                    Number(
                        demand.pendingDemand ??
                        demand.pending_demand ??
                        0
                    );


                demandData[code].pendingPO +=
                    Number(
                        demand.pendingPO ??
                        demand.pending_po ??
                        demand.po ??
                        0
                    );

            }

        }


        // ------------------------------------------------
        // ADD DEMAND ROWS
        // ------------------------------------------------

        for(
            let code in demandData
        ){

            let record =
                demandData[code];


            totalEntries++;


            totalQuantity +=
                Number(
                    record.demand || 0
                );


            addDemandRow(
                record
            );

        }

    }


    // --------------------------------------------------
    // UPDATE TOTALS
    // --------------------------------------------------

    updateReportTotals(
        totalEntries,
        totalQuantity,
        totalValue
    );


}


// ======================================================
// DATE MATCH
// ======================================================

function dateMatches(
    dateValue,
    fromDate,
    toDate
){

    if(
        !fromDate &&
        !toDate
    ){

        return true;

    }


    if(!dateValue){

        return false;

    }


    let date =
        String(
            dateValue
        ).substring(
            0,
            10
        );


    if(
        fromDate &&
        date < fromDate
    ){

        return false;

    }


    if(
        toDate &&
        date > toDate
    ){

        return false;

    }


    return true;

}


// ======================================================
// CURRENT STOCK CALCULATION
// ======================================================

function calculateCurrentStock(
    code,
    item
){

    let openingStock =
        Number(
            item.openingStock ??
            item.opening_stock ??
            item.opening_Stock ??
            0
        );


    let stockIn = 0;
    let stockOut = 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let row =
            history[i];


        let rowCode =
            String(
                row.itemCode ||
                ""
            ).trim();


        if(
            rowCode !== code
        ){

            continue;

        }


        if(
            row.type ===
            "Stock In"
        ){

            stockIn +=
                Number(
                    row.quantity || 0
                );

        }


        if(
            row.type ===
            "Stock Out"
        ){

            stockOut +=
                Number(
                    row.quantity || 0
                );

        }

    }


    return (
        openingStock +
        stockIn -
        stockOut
    );

}


// ======================================================
// LATEST RATE
// ======================================================

function getLatestRate(
    code
){

    let latestDate = "";
    let latestRate = 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let row =
            history[i];


        if(
            row.type !==
            "Stock In"
        ){

            continue;

        }


        let rowCode =
            String(
                row.itemCode ||
                ""
            ).trim();


        if(
            rowCode !== code
        ){

            continue;

        }


        let rowDate =
            String(
                row.date || ""
            );


        if(
            rowDate >= latestDate
        ){

            latestDate =
                rowDate;

            latestRate =
                Number(
                    row.unitCost || 0
                );

        }

    }


    return latestRate;

}


// ======================================================
// UPDATE REPORT HEADERS
// ======================================================

function updateReportHeaders(
    reportType
){

    let header =
        document.getElementById(
            "reportTableHead"
        );


    if(!header){

        return;

    }


    if(
        reportType ===
        "demand"
    ){

        header.innerHTML = `

            <tr>

                <th>Item Code</th>

                <th>Item Name</th>

                <th>Demand</th>

                <th>Pending Demand</th>

                <th>Pending PO</th>

            </tr>

        `;

        return;

    }


    if(
        reportType ===
        "currentStock"
    ){

        header.innerHTML = `

            <tr>

                <th>Item Code</th>

                <th>Item Name</th>

                <th>Unit</th>

                <th>Current Stock</th>

                <th>Minimum Stock</th>

            </tr>

        `;

        return;

    }


    if(
        reportType ===
        "cost"
    ){

        header.innerHTML = `

            <tr>

                <th>Item Code</th>

                <th>Item Name</th>

                <th>Unit</th>

                <th>Latest Rate</th>

            </tr>

        `;

        return;

    }


    // Default transaction report

    header.innerHTML = `

        <tr>

            <th>Date</th>

            <th>Item Code</th>

            <th>Item Name</th>

            <th>Type</th>

            <th>Quantity</th>

            <th>Unit Cost</th>

            <th>Total Cost</th>

        </tr>

    `;

}


// ======================================================
// ADD TRANSACTION ROW
// ======================================================

function addReportRow(
    row
){

    let body =
        document.getElementById(
            "reportTableBody"
        );


    if(!body){

        return;

    }


    let tr =
        document.createElement(
            "tr"
        );


    tr.innerHTML = `

        <td>
            ${formatDate(row.date)}
        </td>

        <td>
            ${escapeHtml(row.itemCode)}
        </td>

        <td>
            ${escapeHtml(row.itemName)}
        </td>

        <td>
            ${escapeHtml(row.type)}
        </td>

        <td>
            ${formatNumber(row.quantity)}
        </td>

        <td>
            ${formatNumber(row.unitCost)}
        </td>

        <td>
            ${formatNumber(row.totalCost)}
        </td>

    `;


    body.appendChild(
        tr
    );

}


// ======================================================
// ADD DEMAND ROW
// ======================================================

function addDemandRow(
    record
){

    let body =
        document.getElementById(
            "reportTableBody"
        );


    if(!body){

        return;

    }


    let tr =
        document.createElement(
            "tr"
        );


    tr.innerHTML = `

        <td>
            ${escapeHtml(
                record.itemCode
            )}
        </td>

        <td>
            ${escapeHtml(
                record.itemName
            )}
        </td>

        <td>
            ${formatNumber(
                record.demand
            )}
        </td>

        <td>
            ${formatNumber(
                record.pendingDemand
            )}
        </td>

        <td>
            ${formatNumber(
                record.pendingPO
            )}
        </td>

    `;


    body.appendChild(
        tr
    );

}


// ======================================================
// ADD CURRENT STOCK ROW
// ======================================================

function addCurrentStockRow(
    row
){

    let body =
        document.getElementById(
            "reportTableBody"
        );


    if(!body){

        return;

    }


    let tr =
        document.createElement(
            "tr"
        );


    tr.innerHTML = `

        <td>
            ${escapeHtml(
                row.itemCode
            )}
        </td>

        <td>
            ${escapeHtml(
                row.itemName
            )}
        </td>

        <td>
            ${escapeHtml(
                row.unit
            )}
        </td>

        <td>
            ${formatNumber(
                row.currentStock
            )}
        </td>

        <td>
            ${formatNumber(
                row.minimumStock
            )}
        </td>

    `;


    body.appendChild(
        tr
    );

}


// ======================================================
// ADD COST ROW
// ======================================================

function addCostRow(
    row
){

    let body =
        document.getElementById(
            "reportTableBody"
        );


    if(!body){

        return;

    }


    let tr =
        document.createElement(
            "tr"
        );


    tr.innerHTML = `

        <td>
            ${escapeHtml(
                row.itemCode
            )}
        </td>

        <td>
            ${escapeHtml(
                row.itemName
            )}
        </td>

        <td>
            ${escapeHtml(
                row.unit
            )}
        </td>

        <td>
            ${formatNumber(
                row.latestRate
            )}
        </td>

    `;


    body.appendChild(
        tr
    );

}


// ======================================================
// UPDATE TOTALS
// ======================================================

function updateReportTotals(
    entries,
    quantity,
    value
){

    let entriesElement =
        document.getElementById(
            "totalEntries"
        );


    let quantityElement =
        document.getElementById(
            "totalQuantity"
        );


    let valueElement =
        document.getElementById(
            "totalValue"
        );


    if(entriesElement){

        entriesElement.textContent =
            entries;

    }


    if(quantityElement){

        quantityElement.textContent =
            formatNumber(
                quantity
            );

    }


    if(valueElement){

        valueElement.textContent =
            formatNumber(
                value
            );

    }

}


// ======================================================
// FORMAT NUMBER
// ======================================================

function formatNumber(
    value
){

    let number =
        Number(value);


    if(
        isNaN(number)
    ){

        number = 0;

    }


    return number.toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 2
        }
    );

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(
    value
){

    if(!value){

        return "";

    }


    let date =
        new Date(value);


    if(
        isNaN(
            date.getTime()
        )
    ){

        return String(value);

    }


    return (
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        ) +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +
        "-" +
        date.getFullYear()
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(
value
){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ======================================================
// CLEAR REPORT
// ======================================================

function clearReport(){

    let fromDate =
        document.getElementById(
            "fromDate"
        );

    let toDate =
        document.getElementById(
            "toDate"
        );

    let itemCode =
        document.getElementById(
            "itemCode"
        );

    let department =
        document.getElementById(
            "department"
        );

    let reportType =
        document.getElementById(
            "reportType"
        );


    if(fromDate){

        fromDate.value = "";

    }


    if(toDate){

        toDate.value = "";

    }


    if(itemCode){

        itemCode.value = "";

    }


    if(department){

        department.value = "";

    }


    if(reportType){

        reportType.value = "";

    }


    let body =
        document.getElementById(
            "reportTableBody"
        );


    if(body){

        body.innerHTML = "";

    }


    updateReportTotals(
        0,
        0,
        0
    );

}


// ======================================================
// EXPORT TO EXCEL
// ======================================================

function exportReportToExcel(){

    let table =
        document.getElementById(
            "reportTable"
        );


    if(!table){

        alert(
            "Report table نہیں ملی۔"
        );

        return;

    }


    if(
        typeof XLSX ===
        "undefined"
    ){

        alert(
            "Excel library load نہیں ہوئی۔"
        );

        return;

    }


    let workbook =
        XLSX.utils.table_to_book(
            table,
            {
                sheet:
                    "Report"
            }
        );


    XLSX.writeFile(
        workbook,
        "Inventory_Report.xlsx"
    );

}


// ======================================================
// PRINT REPORT
// ======================================================

function printReport(){

    window.print();

}


// ======================================================
// DELETE TRANSACTION
// ======================================================

async function deleteTransaction(
    index
){

    if(
        index < 0 ||
        index >= history.length
    ){

        return;

    }


    let row =
        history[index];


    if(!row){

        return;

    }


    let confirmed =
        confirm(
            "کیا آپ واقعی یہ transaction delete کرنا چاہتے ہیں؟"
        );


    if(!confirmed){

        return;

    }


    try{

        let table =
            row.sourceTable;


        if(!table){

            alert(
                "Original table معلوم نہیں ہو سکی۔"
            );

            return;

        }


        await reportSupabaseRequest(
            table,
            {
                method:
                    "DELETE",

                query:
                    "?id=eq." +
                    encodeURIComponent(
                        row.id
                    )
            }
        );


        alert(
            "Transaction delete ہو گئی۔"
        );


        await loadReportData();

        generateReport();


    }catch(error){

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Transaction delete نہیں ہو سکی۔"
        );

    }

}


// ======================================================
// OPTIONAL REPORT TYPE CHANGE
// ======================================================

function onReportTypeChange(){

    let reportType =
        document.getElementById(
            "reportType"
        )?.value || "";


    updateReportHeaders(
        reportType
    );

}


// ======================================================
// END
// ======================================================
