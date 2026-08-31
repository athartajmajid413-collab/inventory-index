// =====================================================
// REPORTS SYSTEM
// MECAS ENGINEERING PVT LIMITED SUNDAR
// SUPABASE VERSION
// =====================================================

let items = [];
let history = [];
let demands = [];
let demandHistory = [];


// =====================================================
// LOAD REPORT DATA FROM SUPABASE
// =====================================================

async function loadReportData(){

    console.log("=================================");
    console.log("Loading Report Data from Supabase...");
    console.log("=================================");

    try{

        // -------------------------------
        // ITEMS
        // -------------------------------

        let itemsResult =
            await supabaseRequest("items");

        if(itemsResult.success){

            items =
                itemsResult.data || [];

        }
        else{

            console.error(
                "Items Load Error:",
                itemsResult.error
            );

            items = [];

        }


        // -------------------------------
        // STOCK IN
        // -------------------------------

        let stockInResult =
            await supabaseRequest(
                "stock_in"
            );

        let stockIn = [];

        if(stockInResult.success){

            stockIn =
                stockInResult.data || [];

        }
        else{

            console.error(
                "Stock In Load Error:",
                stockInResult.error
            );

        }


        // -------------------------------
        // STOCK ISSUE
        // -------------------------------

        let stockIssueResult =
            await supabaseRequest(
                "stock_issue"
            );

        let stockIssue = [];

        if(stockIssueResult.success){

            stockIssue =
                stockIssueResult.data || [];

        }
        else{

            console.error(
                "Stock Issue Load Error:",
                stockIssueResult.error
            );

        }


        // =================================================
        // CONVERT STOCK IN TO HISTORY FORMAT
        // =================================================

        let stockInHistory = [];

        for(let i = 0; i < stockIn.length; i++){

            let record =
                stockIn[i];

            stockInHistory.push({

                id:
                    record.id,

                date:
                    record.date || "",

                time:
                    record.time || "",

                itemCode:
                    record.item_code || record.itemCode || "",

                itemName:
                    record.item_name || record.itemName || "",

                unit:
                    record.unit || "",

                source:
                    record.source || "",

                supplier:
                    record.supplier || "",

                location:
                    record.location || "",

                department:
                    record.department || "",

                type:
                    "Stock In",

                quantity:
                    Number(record.quantity || 0),

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
                        (
                            Number(record.quantity || 0) *
                            Number(
                                record.unit_cost ||
                                record.unitCost ||
                                0
                            )
                        )
                    )

            });

        }


        // =================================================
        // CONVERT STOCK ISSUE TO HISTORY FORMAT
        // =================================================

        let stockIssueHistory = [];

        for(let i = 0; i < stockIssue.length; i++){

            let record =
                stockIssue[i];

            stockIssueHistory.push({

                id:
                    record.id,

                date:
                    record.date || "",

                time:
                    record.time || "",

                itemCode:
                    record.item_code || record.itemCode || "",

                itemName:
                    record.item_name || record.itemName || "",

                unit:
                    record.unit || "",

                source:
                    record.source || "",

                supplier:
                    record.supplier || "",

                location:
                    record.location || "",

                department:
                    record.department || "",

                type:
                    "Stock Issue",

                quantity:
                    Number(record.quantity || 0),

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
                    )

            });

        }


        // =================================================
        // COMBINE HISTORY
        // =================================================

        history =
            stockInHistory.concat(
                stockIssueHistory
            );


        console.log(
            "Report Items:",
            items
        );

        console.log(
            "Report Stock In:",
            stockInHistory
        );

        console.log(
            "Report Stock Out:",
            stockIssueHistory
        );

        console.log(
            "Report History:",
            history
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

    // -----------------------------------------------
    // LOAD FRESH SUPABASE DATA
    // -----------------------------------------------

    let loaded =
        await loadReportData();


    if(!loaded){

        alert(
            "Report data load failed. Please check Supabase."
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
        ).value.trim();

    let department =
        document.getElementById(
            "department"
        ).value;


    document.getElementById(
        "reportBody"
    ).innerHTML = "";


    updateReportHeaders(
        reportType
    );


    // =================================================
    // REPORT TITLE
    // =================================================

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


    // =================================================
    // PRINT DATE
    // =================================================

    let today =
        new Date();


    document.getElementById(
        "printDate"
    ).innerHTML =
        today.toLocaleDateString();


    // =================================================
    // SUMMARY
    // =================================================

    let totalEntries = 0;

    let totalQuantity = 0;

    let totalCost = 0;


    // =================================================
    // STOCK IN
    // =================================================

    if(reportType == "stockIn"){

        for(let i = 0; i < history.length; i++){

            let record =
                history[i];


            if(record.type != "Stock In"){

                continue;

            }


            if(
                fromDate &&
                record.date < fromDate
            ){

                continue;

            }


            if(
                toDate &&
                record.date > toDate
            ){

                continue;

            }


            if(
                itemCode &&
                String(
                    record.itemCode
                ).trim() != itemCode
            ){

                continue;

            }


            if(
                department &&
                String(
                    record.department || ""
                ).trim() != department
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

        for(let i = 0; i < history.length; i++){

            let record =
                history[i];


            if(
                record.type != "Stock Issue"
            ){

                continue;

            }


            if(
                fromDate &&
                record.date < fromDate
            ){

                continue;

            }


            if(
                toDate &&
                record.date > toDate
            ){

                continue;

            }


            if(
                itemCode &&
                String(
                    record.itemCode
                ).trim() != itemCode
            ){

                continue;

            }


            if(
                department &&
                String(
                    record.department || ""
                ).trim() != department
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

        for(let i = 0; i < history.length; i++){

            let record =
                history[i];


            if(
                fromDate &&
                record.date < fromDate
            ){

                continue;

            }


            if(
                toDate &&
                record.date > toDate
            ){

                continue;

            }


            if(
                itemCode &&
                String(
                    record.itemCode
                ).trim() != itemCode
            ){

                continue;

            }


            if(
                department &&
                String(
                    record.department || ""
                ).trim() != department
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

        for(let i = 0; i < items.length; i++){

            let item =
                items[i];


            if(
                itemCode &&
                String(
                    item.code
                ).trim() != itemCode
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
                currentStock <= minimumStock
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


        for(let i = 0; i < history.length; i++){

            let record =
                history[i];


            if(
                record.type != "Stock In"
            ){

                continue;

            }


            if(
                fromDate &&
                record.date < fromDate
            ){

                continue;

            }


            if(
                toDate &&
                record.date > toDate
            ){

                continue;

            }


            if(
                itemCode &&
                String(
                    record.itemCode
                ).trim() != itemCode
            ){

                continue;

            }


            let code =
                String(
                    record.itemCode
                ).trim();


            if(!costData[code]){

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


        for(let code in costData){

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
    // DEMAND
    // =================================================

    else if(reportType == "demand"){

        // Demand is still read from localStorage
        // until demand table is connected.

        demands =
            JSON.parse(
                localStorage.getItem(
                    "demands"
                )
            ) || [];


        let demandData = {};


        for(let i = 0; i < demands.length; i++){

            let demand =
                demands[i];


            let code =
                String(
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


            if(!demandData[code]){

                demandData[code] = {

                    itemCode:
                        code,

                    itemName:
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
                    demand.quantity ||
                    0
                );


            demandData[code].pendingDemand +=
                Number(
                    demand.pendingDemand ||
                    0
                );


            demandData[code].pendingPO +=
                Number(
                    demand.pendingPO ||
                    demand.po ||
                    0
                );

        }


        for(let code in demandData){

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
    // SUMMARY
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
        totalCost.toLocaleString(
            undefined,
            {
                minimumFractionDigits:2
            }
        );

}


// =====================================================
// UPDATE HEADERS
// =====================================================

function updateReportHeaders(reportType){

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

function calculateCurrentStock(code){

    let stock = 0;


    // Opening Stock

    for(let i = 0; i < items.length; i++){

        if(
            String(
                items[i].code
            ).trim() ==
            String(code).trim()
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


    // Transactions

    for(let i = 0; i < history.length; i++){

        let record =
            history[i];


        if(
            String(
                record.itemCode
            ).trim() !=
            String(code).trim()
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

            stock +=
                quantity;

        }


        if(
            record.type ==
            "Stock Issue"
        ){

            stock -=
                quantity;

        }

    }


    return stock;

}


// =====================================================
// STOCK IN ROW
// =====================================================

function addStockInRow(record,index){

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

function addStockOutRow(record,index){

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

function addAllTransactionRow(record,index){

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

function addCostRow(record){

    let row =
        document.createElement("tr");


    let averageCost = 0;


    if(record.quantity > 0){

        averageCost =
            record.totalCost /
            record.quantity;

    }


    row.innerHTML = `

        <td>${record.itemCode}</td>

        <td>${record.itemName}</td>

        <td>${record.quantity}</td>

        <td>${averageCost.toFixed(2)}</td>

        <td>${record.totalCost.toFixed(2)}</td>

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

function addDemandRow(record){

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
// DELETE TRANSACTION
// =====================================================

async function deleteTransaction(index){

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
            (record.itemName || "") +
            "\nQuantity: " +
            (record.quantity || 0) +
            "\nType: " +
            (record.type || "")
        );


    if(!confirmDelete){

        return;

    }


    // =================================================
    // DELETE FROM SUPABASE
    // =================================================

    let table =
        record.type ==
        "Stock In"
            ? "stock_in"
            : "stock_issue";


    if(!record.id){

        alert(
            "This transaction has no Supabase ID."
        );

        return;

    }


    let result =
        await supabaseRequest(
            table,
            "DELETE",
            null,
            "?id=eq." +
            encodeURIComponent(
                record.id
            )
        );


    if(!result.success){

        console.error(
            "Delete Error:",
            result.error
        );

        alert(
            "Delete failed. Please check Supabase."
        );

        return;

    }


    alert(
        "Transaction deleted successfully."
    );


    await generateReport();

}


// =====================================================
// CLEAR
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


    document.getElementById(
        "department"
    ).value =
        "";


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
// PRINT
// =====================================================

function printReport(){

    window.print();

}


// =====================================================
// START
// =====================================================

console.log(
    "Reports.js loaded successfully."
);

updateReportHeaders(
    "all"
);
