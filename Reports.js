// =====================================================
// REPORTS SYSTEM
// MECAS ENGINEERING PVT LIMITED SUNDAR
// SUPABASE CONNECTED VERSION
// =====================================================


// =====================================================
// SUPABASE SETTINGS
// =====================================================

const REPORT_SUPABASE_URL =
    "https://tncmmkyrpzlkupdnkyqm.supabase.co";

const REPORT_SUPABASE_KEY =
    "sb_publishable_e6j_EkJescicSS3nEOnscg_INwxeukT";


// =====================================================
// SUPABASE REQUEST
// =====================================================
// اگر supabase.js پہلے سے load ہے تو وہی function استعمال ہوگا
// ورنہ یہ fallback function خود request کرے گا.
// =====================================================

async function reportSupabaseRequest(
    table,
    method = "GET",
    data = null,
    query = ""
){

    try{

        let options = {

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

            }

        };


        if(data !== null){

            options.body =
                JSON.stringify(data);

        }


        let response =
            await fetch(

                REPORT_SUPABASE_URL +
                "/rest/v1/" +
                table +
                query,

                options

            );


        let result =
            await response.json();


        if(!response.ok){

            console.error(
                "Report Supabase Error:",
                result
            );

            return {

                success:false,

                error:result

            };

        }


        return {

            success:true,

            data:result

        };

    }

    catch(error){

        console.error(
            "Report Supabase Connection Error:",
            error
        );

        return {

            success:false,

            error:error

        };

    }

}


// =====================================================
// DATA
// =====================================================

let items = [];

let history = [];

let demands = [];

let demandHistory = [];


// =====================================================
// LOAD REPORT DATA FROM SUPABASE
// =====================================================

async function loadReportData(){

    console.log(
        "================================="
    );

    console.log(
        "Loading Report Data from Supabase..."
    );

    console.log(
        "================================="
    );


    try{

        // =============================================
        // ITEMS
        // =============================================

        let itemResult =
            await reportSupabaseRequest(
                "items",
                "GET",
                null,
                "?select=*"
            );


        if(itemResult.success){

            items =
                Array.isArray(itemResult.data)
                    ? itemResult.data
                    : [];

        }

        else{

            console.error(
                "Items Load Error:",
                itemResult.error
            );

            items = [];

        }


        // =============================================
        // STOCK IN
        // =============================================

        let stockInResult =
            await reportSupabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*"
            );


        let stockInData = [];


        if(stockInResult.success){

            stockInData =
                Array.isArray(stockInResult.data)
                    ? stockInResult.data
                    : [];

        }

        else{

            console.error(
                "Stock In Load Error:",
                stockInResult.error
            );

        }


        // =============================================
        // STOCK ISSUE
        // =============================================

        let stockIssueResult =
            await reportSupabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*"
            );


        let stockIssueData = [];


        if(stockIssueResult.success){

            stockIssueData =
                Array.isArray(stockIssueResult.data)
                    ? stockIssueResult.data
                    : [];

        }

        else{

            console.error(
                "Stock Issue Load Error:",
                stockIssueResult.error
            );

        }


        // =============================================
        // HISTORY TABLE
        // =============================================

        let historyResult =
            await reportSupabaseRequest(
                "history",
                "GET",
                null,
                "?select=*"
            );


        let historyData = [];


        if(historyResult.success){

            historyData =
                Array.isArray(historyResult.data)
                    ? historyResult.data
                    : [];

        }

        else{

            console.warn(
                "History table could not be loaded:",
                historyResult.error
            );

        }


        // =============================================
        // CREATE COMMON HISTORY
        // =============================================

        history = [];


        // ---------------------------------------------
        // STOCK IN
        // ---------------------------------------------

        for(
            let i = 0;
            i < stockInData.length;
            i++
        ){

            let record =
                stockInData[i];


            history.push({

                id:
                    record.id,

                date:
                    record.date || "",

                time:
                    record.time || "",

                itemCode:
                    record.item_code ||
                    record.itemCode ||
                    "",

                itemName:
                    record.item_name ||
                    record.itemName ||
                    "",

                unit:
                    record.unit ||
                    "",

                source:
                    record.source ||
                    "",

                supplier:
                    record.supplier ||
                    "",

                location:
                    record.location ||
                    "",

                department:
                    record.department ||
                    "",

                type:
                    "Stock In",

                quantity:
                    Number(
                        record.quantity || 0
                    ),

                unitCost:
                    Number(
                        record.unit_cost ||
                        record.unitCost ||
                        record.cost ||
                        0
                    ),

                totalCost:
                    Number(
                        record.total_cost ||
                        record.totalCost ||
                        (
                            Number(
                                record.quantity || 0
                            ) *
                            Number(
                                record.unit_cost ||
                                record.unitCost ||
                                record.cost ||
                                0
                            )
                        )
                    ),

                sourceTable:
                    "stock_in"

            });

        }


        // ---------------------------------------------
        // STOCK ISSUE
        // ---------------------------------------------

        for(
            let i = 0;
            i < stockIssueData.length;
            i++
        ){

            let record =
                stockIssueData[i];


            history.push({

                id:
                    record.id,

                date:
                    record.date || "",

                time:
                    record.time || "",

                itemCode:
                    record.item_code ||
                    record.itemCode ||
                    "",

                itemName:
                    record.item_name ||
                    record.itemName ||
                    "",

                unit:
                    record.unit ||
                    "",

                source:
                    record.source ||
                    "",

                supplier:
                    record.supplier ||
                    "",

                location:
                    record.location ||
                    "",

                department:
                    record.department ||
                    "",

                type:
                    "Stock Issue",

                quantity:
                    Number(
                        record.quantity || 0
                    ),

                unitCost:
                    Number(
                        record.unit_cost ||
                        record.unitCost ||
                        0
                    ),

                totalCost:
                    Number(
                        record.total_cost ||
                        record.totalCost ||
                        0
                    ),

                sourceTable:
                    "stock_issue"

            });

        }


        // ---------------------------------------------
        // IF HISTORY TABLE HAS DATA
        // USE IT AS ADDITIONAL SOURCE ONLY WHEN
        // STOCK TABLES ARE EMPTY
        // ---------------------------------------------

        if(
            history.length == 0 &&
            historyData.length > 0
        ){

            for(
                let i = 0;
                i < historyData.length;
                i++
            ){

                let record =
                    historyData[i];


                history.push({

                    id:
                        record.id,

                    date:
                        record.date || "",

                    time:
                        record.time || "",

                    itemCode:
                        record.item_code ||
                        record.itemCode ||
                        "",

                    itemName:
                        record.item_name ||
                        record.itemName ||
                        "",

                    unit:
                        record.unit ||
                        "",

                    source:
                        record.source ||
                        "",

                    supplier:
                        record.supplier ||
                        "",

                    location:
                        record.location ||
                        "",

                    department:
                        record.department ||
                        "",

                    type:
                        record.type || "",

                    quantity:
                        Number(
                            record.quantity || 0
                        ),

                    unitCost:
                        Number(
                            record.unit_cost ||
                            record.unitCost ||
                            0
                        ),

                    totalCost:
                        Number(
                            record.total_cost ||
                            record.totalCost ||
                            0
                        ),

                    sourceTable:
                        "history"

                });

            }

        }


        // =============================================
        // SORT HISTORY
        // =============================================

        history.sort(
            function(a,b){

                let dateA =
                    String(a.date || "") +
                    " " +
                    String(a.time || "");

                let dateB =
                    String(b.date || "") +
                    " " +
                    String(b.time || "");

                return dateA.localeCompare(
                    dateB
                );

            }
        );


        // =============================================
        // DEMANDS
        // =============================================

        let demandResult =
            await reportSupabaseRequest(
                "demands",
                "GET",
                null,
                "?select=*"
            );


        if(demandResult.success){

            demands =
                Array.isArray(
                    demandResult.data
                )
                    ? demandResult.data
                    : [];

        }

        else{

            demands = [];

            console.warn(
                "Demands table not available."
            );

        }


        // =============================================
        // DEMAND HISTORY
        // =============================================

        let demandHistoryResult =
            await reportSupabaseRequest(
                "demand_history",
                "GET",
                null,
                "?select=*"
            );


        if(
            demandHistoryResult.success
        ){

            demandHistory =
                Array.isArray(
                    demandHistoryResult.data
                )
                    ? demandHistoryResult.data
                    : [];

        }

        else{

            demandHistory = [];

        }


        console.log(
            "Report Items:",
            items.length
        );

        console.log(
            "Report Stock In:",
            stockInData.length
        );

        console.log(
            "Report Stock Out:",
            stockIssueData.length
        );

        console.log(
            "Report History:",
            history.length
        );

        console.log(
            "Report Demands:",
            demands.length
        );

        console.log(
            "================================="
        );

        console.log(
            "Report Data Loaded Successfully"
        );

        console.log(
            "================================="
        );


        return true;

    }

    catch(error){

        console.error(
            "Report Data Error:",
            error
        );

        return false;

    }

}


// =====================================================
// GENERATE REPORT
// =====================================================

async function generateReport(){

    // =============================================
    // LOAD FRESH DATA
    // =============================================

    let loaded =
        await loadReportData();


    if(!loaded){

        alert(
            "Report data could not be loaded from Supabase."
        );

        return;

    }


    let reportType =
        document.getElementById(
            "reportType"
        ).value;


    let fromDate =
        document.getElementById(
            "fromDate"
        ).value;


    let toDate =
        document.getElementById(
            "toDate"
        ).value;


    let itemCode =
        document.getElementById(
            "itemCode"
        ).value
        .trim();


    let departmentElement =
        document.getElementById(
            "department"
        );


    let department =
        departmentElement
            ? departmentElement.value
            : "";


    document.getElementById(
        "reportBody"
    ).innerHTML = "";


    updateReportHeaders(
        reportType
    );


    // =============================================
    // REPORT TITLE
    // =============================================

    let reportTitle =
        "STORE REPORT";


    if(reportType == "stockIn"){

        reportTitle =
            "STOCK IN REPORT";

    }

    else if(reportType == "stockOut"){

        reportTitle =
            "STOCK OUT REPORT";

    }

    else if(reportType == "currentStock"){

        reportTitle =
            "CURRENT STOCK REPORT";

    }

    else if(reportType == "cost"){

        reportTitle =
            "COST REPORT";

    }

    else if(reportType == "demand"){

        reportTitle =
            "MONTHLY DEMAND REPORT";

    }


    document.getElementById(
        "printReportTitle"
    ).innerHTML =
        reportTitle;


    // =============================================
    // PRINT DATE
    // =============================================

    let today =
        new Date();


    document.getElementById(
        "printDate"
    ).innerHTML =

        today.getDate() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getFullYear();


    // =============================================
    // SUMMARY
    // =============================================

    let totalEntries = 0;

    let totalQuantity = 0;

    let totalCost = 0;


    // =================================================
    // STOCK IN
    // =================================================

    if(reportType == "stockIn"){

        for(
            let i = 0;
            i < history.length;
            i++
        ){

            let record =
                history[i];


            if(
                record.type !=
                "Stock In"
            ){

                continue;

            }


            if(
                fromDate &&
                String(record.date) <
                fromDate
            ){

                continue;

            }


            if(
                toDate &&
                String(record.date) >
                toDate
            ){

                continue;

            }


            if(
                itemCode &&
                String(
                    record.itemCode || ""
                ).trim() !=
                itemCode
            ){

                continue;

            }


            if(
                department &&
                String(
                    record.department || ""
                ).trim() !=
                department
            ){

                continue;

            }


            totalEntries++;


            totalQuantity +=
                Number(
                    record.quantity || 0
                );


            totalCost +=
                Number(
                    record.totalCost || 0
                );


            addStockInRow(
                record,
                i
            );

        }

    }


    // =================================================
    // STOCK OUT
    // =================================================

    else if(reportType == "stockOut"){

        for(
            let i = 0;
            i < history.length;
            i++
        ){

            let record =
                history[i];


            if(
                record.type !=
                "Stock Issue"
            ){

                continue;

            }


            if(
                fromDate &&
                String(record.date) <
                fromDate
            ){

                continue;

            }


            if(
                toDate &&
                String(record.date) >
                toDate
            ){

                continue;

            }


            if(
                itemCode &&
                String(
                    record.itemCode || ""
                ).trim() !=
                itemCode
            ){

                continue;

            }


            if(
                department &&
                String(
                    record.department || ""
                ).trim() !=
                department
            ){

                continue;

            }


            totalEntries++;


            totalQuantity +=
                Number(
                    record.quantity || 0
                );


            addStockOutRow(
                record,
                i
            );

        }

    }


    // =================================================
    // ALL TRANSACTIONS
    // =================================================

    else if(reportType == "all"){

        for(
            let i = 0;
            i < history.length;
            i++
        ){

            let record =
                history[i];


            if(
                fromDate &&
                String(record.date) <
                fromDate
            ){

                continue;

            }


            if(
                toDate &&
                String(record.date) >
                toDate
            ){

                continue;

            }


            if(
                itemCode &&
                String(
                    record.itemCode || ""
                ).trim() !=
                itemCode
            ){

                continue;

            }


            if(
                department &&
                String(
                    record.department || ""
                ).trim() !=
                department
            ){

                continue;

            }


            totalEntries++;


            totalQuantity +=
                Number(
                    record.quantity || 0
                );


            totalCost +=
                Number(
                    record.totalCost || 0
                );


            addAllTransactionRow(
                record,
                i
            );

        }

    }


    // =================================================
    // CURRENT STOCK
    // =================================================

    else if(reportType == "currentStock"){

        for(
            let i = 0;
            i < items.length;
            i++
        ){

            let item =
                items[i];


            if(
                itemCode &&
                String(
                    item.code || ""
                ).trim() !=
                itemCode
            ){

                continue;

            }


            let currentStock =
                calculateCurrentStock(
                    item.code
                );


            let minimumStock =
                Number(
                    item.minimumStock ||
                    item.minimum_stock ||
                    0
                );


            let status =
                "OK";


            if(
                currentStock <=
                minimumStock
            ){

                status =
                    "LOW STOCK";

            }


            totalEntries++;


            totalQuantity +=
                currentStock;


            addCurrentStockRow(
                item,
                currentStock,
                minimumStock,
                status
            );

        }

    }


    // =================================================
    // COST REPORT
    // =================================================

    else if(reportType == "cost"){

        let costData = {};


        for(
            let i = 0;
            i < history.length;
            i++
        ){

            let record =
                history[i];


            if(
                record.type !=
                "Stock In"
            ){

                continue;

            }


            if(
                fromDate &&
                String(record.date) <
                fromDate
            ){

                continue;

            }


            if(
                toDate &&
                String(record.date) >
                toDate
            ){

                continue;

            }


            if(
                itemCode &&
                String(
                    record.itemCode || ""
                ).trim() !=
                itemCode
            ){

                continue;

            }


            let code =
                String(
                    record.itemCode || ""
                ).trim();


            if(
                !costData[code]
            ){

                costData[code] = {

                    itemCode:
                        code,

                    itemName:
                        record.itemName || "",

                    quantity:
                        0,

                    totalCost:
                        0

                };

            }


            costData[code].quantity +=
                Number(
                    record.quantity || 0
                );


            costData[code].totalCost +=
                Number(
                    record.totalCost || 0
                );

        }


        for(
            let code in costData
        ){

            let record =
                costData[code];


            totalEntries++;


            totalQuantity +=
                record.quantity;


            totalCost +=
                record.totalCost;


            addCostRow(
                record
            );

        }

    }


    // =================================================
    // MONTHLY DEMAND
    // =================================================

    else if(reportType == "demand"){

        let demandData = {};


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


            if(
                itemCode &&
                code != itemCode
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
                    demand.demand ||
                    demand.finalDemand ||
                    demand.final_demand ||
                    demand.quantity ||
                    0
                );


            demandData[code].pendingDemand +=
                Number(
                    demand.pendingDemand ||
                    demand.pending_demand ||
                    0
                );


            demandData[code].pendingPO +=
                Number(
                    demand.pendingPO ||
                    demand.pending_po ||
                    demand.po ||
                    0
                );

        }


        for(
            let code in demandData
        ){

            let record =
                demandData[code];


            totalEntries++;


            totalQuantity +=
                record.demand;


            addDemandRow(
                record
            );

        }

    }


    // =================================================
    // SHOW SUMMARY
    // =================================================

    document.getElementById(
        "totalEntries"
    ).innerHTML =
        totalEntries;


    document.getElementById(
        "reportQuantity"
    ).innerHTML =
        totalQuantity.toLocaleString();


    document.getElementById(
        "reportCost"
    ).innerHTML =
        totalCost.toFixed(2);


    console.log(
        "Report Generated:",
        reportType
    );

}


// =====================================================
// UPDATE TABLE HEADERS
// =====================================================

function updateReportHeaders(
    reportType
){

    let reportHead =
        document.getElementById(
            "reportHead"
        );


    if(reportType == "stockIn"){

        reportHead.innerHTML = `

            <tr>

                <th>Date</th>

                <th>Time</th>

                <th>Item Code</th>

                <th>Item Name</th>

                <th>Quantity</th>

                <th>Unit Cost</th>

                <th>Total Cost</th>

                <th class="deleteColumn">
                    Action
                </th>

            </tr>

        `;

    }


    else if(reportType == "stockOut"){

        reportHead.innerHTML = `

            <tr>

                <th>Date</th>

                <th>Time</th>

                <th>Item Code</th>

                <th>Item Name</th>

                <th>Department</th>

                <th>Quantity</th>

                <th class="deleteColumn">
                    Action
                </th>

            </tr>

        `;

    }


    else if(reportType == "currentStock"){

        reportHead.innerHTML = `

            <tr>

                <th>Item Code</th>

                <th>Item Name</th>

                <th>Unit</th>

                <th>Current Stock</th>

                <th>Minimum Stock</th>

                <th>Stock Status</th>

            </tr>

        `;

    }


    else if(reportType == "cost"){

        reportHead.innerHTML = `

            <tr>

                <th>Item Code</th>

                <th>Item Name</th>

                <th>Quantity</th>

                <th>Average Cost</th>

                <th>Total Cost</th>

            </tr>

        `;

    }


    else if(reportType == "demand"){

        reportHead.innerHTML = `

            <tr>

                <th>Item Code</th>

                <th>Item Name</th>

                <th>Demand</th>

                <th>Pending Demand</th>

                <th>Pending PO</th>

            </tr>

        `;

    }


    else{

        reportHead.innerHTML = `

            <tr>

                <th>Date</th>

                <th>Time</th>

                <th>Type</th>

                <th>Item Code</th>

                <th>Item Name</th>

                <th>Department</th>

                <th>Quantity</th>

                <th>Unit Cost</th>

                <th>Total Cost</th>

                <th class="deleteColumn">
                    Action
                </th>

            </tr>

        `;

    }

}


// =====================================================
// CURRENT STOCK
// =====================================================

function calculateCurrentStock(
    code
){

    let stock = 0;


    // =============================================
    // OPENING STOCK
    // =============================================

    for(
        let i = 0;
        i < items.length;
        i++
    ){

        if(
            String(
                items[i].code || ""
            ).trim() ==
            String(code || "").trim()
        ){

            stock =
                Number(
                    items[i].openingStock ||
                    items[i].opening_stock ||
                    0
                );

            break;

        }

    }


    // =============================================
    // TRANSACTIONS
    // =============================================

    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(
            String(
                record.itemCode || ""
            ).trim() !=
            String(code || "").trim()
        ){

            continue;

        }


        let quantity =
            Number(
                record.quantity || 0
            );


        if(
            record.type ==
            "Stock In"
        ){

            stock += quantity;

        }


        if(
            record.type ==
            "Stock Issue"
        ){

            stock -= quantity;

        }

    }


    return stock;

}


// =====================================================
// STOCK IN ROW
// =====================================================

function addStockInRow(
    record,
    index
){

    let row =
        document.createElement("tr");


    row.innerHTML = `

        <td>${record.date || ""}</td>

        <td>${record.time || ""}</td>

        <td>${record.itemCode || ""}</td>

        <td>${record.itemName || ""}</td>

        <td>${record.quantity || 0}</td>

        <td>${record.unitCost || "-"}</td>

        <td>${record.totalCost || "-"}</td>

        <td class="deleteColumn">

            <button
                class="deleteButton"
                onclick="deleteTransaction(${index})"
            >

                🗑️ Delete

            </button>

        </td>

    `;


    document
        .getElementById(
            "reportBody"
        )
        .appendChild(row);

}


// =====================================================
// STOCK OUT ROW
// =====================================================

function addStockOutRow(
    record,
    index
){

    let row =
        document.createElement("tr");


    row.innerHTML = `

        <td>${record.date || ""}</td>

        <td>${record.time || ""}</td>

        <td>${record.itemCode || ""}</td>

        <td>${record.itemName || ""}</td>

        <td>${record.department || "-"}</td>

        <td>${record.quantity || 0}</td>

        <td class="deleteColumn">

            <button
                class="deleteButton"
                onclick="deleteTransaction(${index})"
            >

                🗑️ Delete

            </button>

        </td>

    `;


    document
        .getElementById(
            "reportBody"
        )
        .appendChild(row);

}


// =====================================================
// ALL TRANSACTION ROW
// =====================================================

function addAllTransactionRow(
    record,
    index
){

    let row =
        document.createElement("tr");


    row.innerHTML = `

        <td>${record.date || ""}</td>

        <td>${record.time || ""}</td>

        <td>${record.type || ""}</td>

        <td>${record.itemCode || ""}</td>

        <td>${record.itemName || ""}</td>

        <td>${record.department || "-"}</td>

        <td>${record.quantity || 0}</td>

        <td>${record.unitCost || "-"}</td>

        <td>${record.totalCost || "-"}</td>

        <td class="deleteColumn">

            <button
                class="deleteButton"
                onclick="deleteTransaction(${index})"
            >

                🗑️ Delete

            </button>

        </td>

    `;


    document
        .getElementById(
            "reportBody"
        )
        .appendChild(row);

}


// =====================================================
// CURRENT STOCK ROW
// =====================================================

function addCurrentStockRow(
    item,
    currentStock,
    minimumStock,
    status
){

    let row =
        document.createElement("tr");


    row.innerHTML = `

        <td>${item.code || ""}</td>

        <td>${item.itemName || item.item_name || ""}</td>

        <td>${item.unit || ""}</td>

        <td>${currentStock}</td>

        <td>${minimumStock}</td>

        <td>${status}</td>

    `;


    document
        .getElementById(
            "reportBody"
        )
        .appendChild(row);

}


// =====================================================
// COST ROW
// =====================================================

function addCostRow(
    record
){

    let row =
        document.createElement("tr");


    let averageCost = 0;


    if(
        Number(record.quantity) > 0
    ){

        averageCost =
            Number(record.totalCost) /
            Number(record.quantity);

    }


    row.innerHTML = `

        <td>${record.itemCode}</td>

        <td>${record.itemName}</td>

        <td>${record.quantity}</td>

        <td>${averageCost.toFixed(2)}</td>

        <td>${Number(
            record.totalCost
        ).toFixed(2)}</td>

    `;


    document
        .getElementById(
            "reportBody"
        )
        .appendChild(row);

}


// =====================================================
// DEMAND ROW
// =====================================================

function addDemandRow(
    record
){

    let row =
        document.createElement("tr");


    row.innerHTML = `

        <td>${record.itemCode}</td>

        <td>${record.itemName}</td>

        <td>${record.demand}</td>

        <td>${record.pendingDemand}</td>

        <td>${record.pendingPO}</td>

    `;


    document
        .getElementById(
            "reportBody"
        )
        .appendChild(row);

}


// =====================================================
// DELETE TRANSACTION FROM SUPABASE
// =====================================================

async function deleteTransaction(
    index
){

    if(
        index < 0 ||
        index >= history.length
    ){

        alert(
            "Transaction not found."
        );

        return;

    }


    let record =
        history[index];


    let confirmDelete =
        confirm(

            "Are you sure you want to delete this transaction?\n\n" +

            "Item: " +
            (
                record.itemName ||
                ""
            ) +

            "\nQuantity: " +
            (
                record.quantity ||
                0
            ) +

            "\nType: " +
            (
                record.type ||
                ""
            )

        );


    if(!confirmDelete){

        return;

    }


    // =============================================
    // DELETE FROM ORIGINAL SUPABASE TABLE
    // =============================================

    let table =
        record.sourceTable;


    let id =
        record.id;


    if(
        !table ||
        !id
    ){

        alert(
            "This transaction does not have a Supabase ID."
        );

        return;

    }


    let result =
        await reportSupabaseRequest(

            table,

            "DELETE",

            null,

            "?id=eq." +
            encodeURIComponent(id)

        );


    if(
        !result.success
    ){

        console.error(
            "Delete Error:",
            result.error
        );


        alert(
            "Delete failed.\n\n" +
            JSON.stringify(
                result.error
            )
        );

        return;

    }


    alert(
        "Transaction deleted successfully."
    );


    // =============================================
    // RELOAD REPORT
    // =============================================

    await generateReport();

}


// =====================================================
// CLEAR REPORT
// =====================================================

function clearReport(){

    document.getElementById(
        "reportType"
    ).value =
        "all";


    document.getElementById(
        "fromDate"
    ).value =
        "";


    document.getElementById(
        "toDate"
    ).value =
        "";


    document.getElementById(
        "itemCode"
    ).value =
        "";


    let department =
        document.getElementById(
            "department"
        );


    if(department){

        department.value = "";

    }


    document.getElementById(
        "reportBody"
    ).innerHTML =
        "";


    document.getElementById(
        "totalEntries"
    ).innerHTML =
        "0";


    document.getElementById(
        "reportQuantity"
    ).innerHTML =
        "0";


    document.getElementById(
        "reportCost"
    ).innerHTML =
        "0";


    document.getElementById(
        "printReportTitle"
    ).innerHTML =
        "STORE REPORT";


    document.getElementById(
        "printDate"
    ).innerHTML =
        "";


    updateReportHeaders(
        "all"
    );

}


// =====================================================
// PRINT REPORT
// =====================================================

function printReport(){

    window.print();

}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function(){

        console.log(
            "Reports Page Started"
        );


        // پہلے data load کریں

        await loadReportData();


        console.log(
            "Reports Ready"
        );

    }
);
