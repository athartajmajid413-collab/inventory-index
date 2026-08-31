// =====================================================
// REPORTS SYSTEM - SUPABASE VERSION
// MECAS ENGINEERING PVT LIMITED SUNDAR
// =====================================================

// =====================================================
// GLOBAL DATA
// =====================================================

let items = [];
let stockInData = [];
let stockOutData = [];
let demands = [];
let demandHistory = [];


// =====================================================
// LOAD ALL DATA FROM SUPABASE
// =====================================================

async function loadReportData(){

    console.log("=================================");
    console.log("Loading Report Data from Supabase...");
    console.log("=================================");

    try{

        // =============================================
        // ITEMS
        // =============================================

        let itemsResult =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?select=*&order=id.asc"
            );


        if(!itemsResult.success){

            console.error(
                "Items Load Error:",
                itemsResult.error
            );

            alert(
                "Items data load نہیں ہو سکا۔"
            );

            return false;

        }


        items =
            itemsResult.data || [];


        console.log(
            "Report Items:",
            items.length
        );


        // =============================================
        // STOCK IN
        // =============================================

        let stockInResult =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*&order=id.asc"
            );


        if(!stockInResult.success){

            console.error(
                "Stock In Load Error:",
                stockInResult.error
            );

            alert(
                "Stock In data load نہیں ہو سکا۔"
            );

            return false;

        }


        stockInData =
            stockInResult.data || [];


        console.log(
            "Report Stock In:",
            stockInData.length
        );


        // =============================================
        // STOCK OUT
        // =============================================

        let stockOutResult =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*&order=id.asc"
            );


        if(!stockOutResult.success){

            console.error(
                "Stock Out Load Error:",
                stockOutResult.error
            );

            alert(
                "Stock Out data load نہیں ہو سکا۔"
            );

            return false;

        }


        stockOutData =
            stockOutResult.data || [];


        console.log(
            "Report Stock Out:",
            stockOutData.length
        );


        // =============================================
        // DEMAND HISTORY
        // =============================================

        let demandResult =
            await supabaseRequest(
                "demand_history",
                "GET",
                null,
                "?select=*&order=id.asc"
            );


        if(demandResult.success){

            demandHistory =
                demandResult.data || [];

            console.log(
                "Report Demand History:",
                demandHistory.length
            );

        }
        else{

            console.warn(
                "Demand History could not be loaded:",
                demandResult.error
            );

            demandHistory = [];

        }


        console.log("=================================");
        console.log("Report Data Loaded Successfully");
        console.log("=================================");

        return true;

    }
    catch(error){

        console.error(
            "Report Data Error:",
            error
        );

        alert(
            "Report data load کرتے وقت error آیا۔"
        );

        return false;

    }

}


// =====================================================
// DATE FILTER
// =====================================================

function dateAllowed(date, fromDate, toDate){

    if(!date){

        return false;

    }


    let value =
        String(date).substring(0,10);


    if(
        fromDate &&
        value < fromDate
    ){

        return false;

    }


    if(
        toDate &&
        value > toDate
    ){

        return false;

    }


    return true;

}


// =====================================================
// ITEM FILTER
// =====================================================

function itemAllowed(code, selectedCode){

    if(!selectedCode){

        return true;

    }


    return (
        String(code || "").trim() ==
        String(selectedCode || "").trim()
    );

}


// =====================================================
// DEPARTMENT FILTER
// =====================================================

function departmentAllowed(
    recordDepartment,
    selectedDepartment
){

    if(!selectedDepartment){

        return true;

    }


    return (
        String(recordDepartment || "")
        .trim()
        .toLowerCase() ==
        String(selectedDepartment || "")
        .trim()
        .toLowerCase()
    );

}


// =====================================================
// GET ITEM
// =====================================================

function getItemByCode(code){

    for(let i = 0; i < items.length; i++){

        if(
            String(items[i].code || "").trim() ==
            String(code || "").trim()
        ){

            return items[i];

        }

    }


    return null;

}


// =====================================================
// CALCULATE CURRENT STOCK
// =====================================================

function calculateCurrentStock(code){

    let stock = 0;


    // =============================================
    // OPENING STOCK
    // =============================================

    let item =
        getItemByCode(code);


    if(item){

        stock =
            Number(
                item.opening_stock || 0
            );

    }


    // =============================================
    // STOCK IN
    // =============================================

    for(let i = 0; i < stockInData.length; i++){

        let record =
            stockInData[i];


        if(
            String(record.item_code || "").trim() !=
            String(code || "").trim()
        ){

            continue;

        }


        stock +=
            Number(
                record.quantity || 0
            );

    }


    // =============================================
    // STOCK OUT
    // =============================================

    for(let i = 0; i < stockOutData.length; i++){

        let record =
            stockOutData[i];


        if(
            String(record.item_code || "").trim() !=
            String(code || "").trim()
        ){

            continue;

        }


        stock -=
            Number(
                record.quantity || 0
            );

    }


    return stock;

}


// =====================================================
// GENERATE REPORT
// =====================================================

async function generateReport(){

    // Reload latest Supabase data

    let loaded =
        await loadReportData();


    if(!loaded){

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


    // Clear table

    document.getElementById(
        "reportBody"
    ).innerHTML = "";


    // Update headers

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


    let printDate =
        today.getDate() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getFullYear();


    document.getElementById(
        "printDate"
    ).innerHTML =
        printDate;


    // =============================================
    // SUMMARY
    // =============================================

    let totalEntries = 0;
    let totalQuantity = 0;
    let totalCost = 0;


    // =================================================
    // STOCK IN REPORT
    // =================================================

    if(reportType == "stockIn"){

        for(let i = 0; i < stockInData.length; i++){

            let record =
                stockInData[i];


            if(
                !dateAllowed(
                    record.date,
                    fromDate,
                    toDate
                )
            ){

                continue;

            }


            if(
                !itemAllowed(
                    record.item_code,
                    itemCode
                )
            ){

                continue;

            }


            if(
                !departmentAllowed(
                    record.department,
                    department
                )
            ){

                continue;

            }


            totalEntries++;


            let quantity =
                Number(
                    record.quantity || 0
                );


            let totalRecordCost =
                Number(
                    record.total_cost || 0
                );


            totalQuantity +=
                quantity;


            totalCost +=
                totalRecordCost;


            addStockInRow(
                record
            );

        }

    }


    // =================================================
    // STOCK OUT REPORT
    // =================================================

    else if(reportType == "stockOut"){

        for(let i = 0; i < stockOutData.length; i++){

            let record =
                stockOutData[i];


            if(
                !dateAllowed(
                    record.date,
                    fromDate,
                    toDate
                )
            ){

                continue;

            }


            if(
                !itemAllowed(
                    record.item_code,
                    itemCode
                )
            ){

                continue;

            }


            if(
                !departmentAllowed(
                    record.department,
                    department
                )
            ){

                continue;

            }


            totalEntries++;


            totalQuantity +=
                Number(
                    record.quantity || 0
                );


            addStockOutRow(
                record
            );

        }

    }


    // =================================================
    // ALL TRANSACTIONS
    // =================================================

    else if(reportType == "all"){

        // =============================================
        // STOCK IN
        // =============================================

        for(let i = 0; i < stockInData.length; i++){

            let record =
                stockInData[i];


            if(
                !dateAllowed(
                    record.date,
                    fromDate,
                    toDate
                )
            ){

                continue;

            }


            if(
                !itemAllowed(
                    record.item_code,
                    itemCode
                )
            ){

                continue;

            }


            if(
                !departmentAllowed(
                    record.department,
                    department
                )
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
                    record.total_cost || 0
                );


            addAllTransactionRow(
                record,
                "Stock In"
            );

        }


        // =============================================
        // STOCK OUT
        // =============================================

        for(let i = 0; i < stockOutData.length; i++){

            let record =
                stockOutData[i];


            if(
                !dateAllowed(
                    record.date,
                    fromDate,
                    toDate
                )
            ){

                continue;

            }


            if(
                !itemAllowed(
                    record.item_code,
                    itemCode
                )
            ){

                continue;

            }


            if(
                !departmentAllowed(
                    record.department,
                    department
                )
            ){

                continue;

            }


            totalEntries++;


            totalQuantity +=
                Number(
                    record.quantity || 0
                );


            addAllTransactionRow(
                record,
                "Stock Issue"
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
                !itemAllowed(
                    item.code,
                    itemCode
                )
            ){

                continue;

            }


            let currentStock =
                calculateCurrentStock(
                    item.code
                );


            let minimumStock =
                Number(
                    item.minimum_stock || 0
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


        for(let i = 0; i < stockInData.length; i++){

            let record =
                stockInData[i];


            if(
                !dateAllowed(
                    record.date,
                    fromDate,
                    toDate
                )
            ){

                continue;

            }


            if(
                !itemAllowed(
                    record.item_code,
                    itemCode
                )
            ){

                continue;

            }


            let code =
                String(
                    record.item_code || ""
                ).trim();


            if(!costData[code]){

                costData[code] = {

                    itemCode:
                        code,

                    itemName:
                        record.item_name || "",

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
                    record.total_cost || 0
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
    // MONTHLY DEMAND
    // =================================================

    else if(reportType == "demand"){

        let demandData = {};


        // =============================================
        // DEMAND HISTORY
        // =============================================

        for(let i = 0; i < demandHistory.length; i++){

            let historyRecord =
                demandHistory[i];


            let list =
                historyRecord.demand_items ||
                historyRecord.items ||
                [];


            // Supabase JSON field can sometimes be string

            if(
                typeof list == "string"
            ){

                try{

                    list =
                        JSON.parse(list);

                }
                catch(error){

                    list = [];

                }

            }


            if(
                !Array.isArray(list)
            ){

                continue;

            }


            for(let j = 0; j < list.length; j++){

                let demand =
                    list[j];


                let code =
                    String(
                        demand.code ||
                        demand.itemCode ||
                        demand.item_code ||
                        ""
                    ).trim();


                if(
                    !itemAllowed(
                        code,
                        itemCode
                    )
                ){

                    continue;

                }


                let name =
                    demand.itemName ||
                    demand.item_name ||
                    demand.name ||
                    "";


                if(!demandData[code]){

                    demandData[code] = {

                        itemCode:
                            code,

                        itemName:
                            name,

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
                        demand.finalDemand ||
                        demand.approvedQty ||
                        demand.demandQuantity ||
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

        }


        // =============================================
        // SHOW DEMAND
        // =============================================

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
        totalCost.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


// =====================================================
// UPDATE TABLE HEADERS
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
// STOCK IN ROW
// =====================================================

function addStockInRow(record){

    let row =
        document.createElement("tr");


    row.innerHTML = `

        <td>${record.date || ""}</td>

        <td>${record.time || ""}</td>

        <td>${record.item_code || ""}</td>

        <td>${record.item_name || ""}</td>

        <td>${record.quantity || 0}</td>

        <td>${record.unit_cost || "-"}</td>

        <td>${record.total_cost || "-"}</td>

        <td class="deleteColumn">

            <button
                class="deleteButton"
                onclick="deleteStockIn(${record.id})"
            >
                🗑️ Delete
            </button>

        </td>

    `;


    document
        .getElementById("reportBody")
        .appendChild(row);

}


// =====================================================
// STOCK OUT ROW
// =====================================================

function addStockOutRow(record){

    let row =
        document.createElement("tr");


    row.innerHTML = `

        <td>${record.date || ""}</td>

        <td>${record.time || ""}</td>

        <td>${record.item_code || ""}</td>

        <td>${record.item_name || ""}</td>

        <td>${record.department || "-"}</td>

        <td>${record.quantity || 0}</td>

        <td class="deleteColumn">

            <button
                class="deleteButton"
                onclick="deleteStockOut(${record.id})"
            >
                🗑️ Delete
            </button>

        </td>

    `;


    document
        .getElementById("reportBody")
        .appendChild(row);

}


// =====================================================
// ALL TRANSACTION ROW
// =====================================================

function addAllTransactionRow(
    record,
    type
){

    let row =
        document.createElement("tr");


    let unitCost =
        type == "Stock In"
        ? (record.unit_cost || "-")
        : "-";


    let totalCost =
        type == "Stock In"
        ? (record.total_cost || "-")
        : "-";


    let deleteButton = "";


    if(type == "Stock In"){

        deleteButton = `

            <button
                class="deleteButton"
                onclick="deleteStockIn(${record.id})"
            >
                🗑️ Delete
            </button>

        `;

    }
    else{

        deleteButton = `

            <button
                class="deleteButton"
                onclick="deleteStockOut(${record.id})"
            >
                🗑️ Delete
            </button>

        `;

    }


    row.innerHTML = `

        <td>${record.date || ""}</td>

        <td>${record.time || ""}</td>

        <td>${type}</td>

        <td>${record.item_code || ""}</td>

        <td>${record.item_name || ""}</td>

        <td>${record.department || "-"}</td>

        <td>${record.quantity || 0}</td>

        <td>${unitCost}</td>

        <td>${totalCost}</td>

        <td class="deleteColumn">

            ${deleteButton}

        </td>

    `;


    document
        .getElementById("reportBody")
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

        <td>${item.item_name || ""}</td>

        <td>${item.unit || ""}</td>

        <td>${currentStock}</td>

        <td>${minimumStock}</td>

        <td>${status}</td>

    `;


    document
        .getElementById("reportBody")
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
        .getElementById("reportBody")
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
        .getElementById("reportBody")
        .appendChild(row);

}


// =====================================================
// DELETE STOCK IN
// =====================================================

async function deleteStockIn(id){

    if(!id){

        alert(
            "Stock In record ID نہیں ملا۔"
        );

        return;

    }


    let record =
        null;


    for(let i = 0; i < stockInData.length; i++){

        if(
            String(stockInData[i].id) ==
            String(id)
        ){

            record =
                stockInData[i];

            break;

        }

    }


    if(!record){

        alert(
            "Stock In transaction نہیں ملی۔"
        );

        return;

    }


    let confirmDelete =
        confirm(

            "Are you sure you want to delete this Stock In transaction?\n\n" +

            "Item: " +
            (record.item_name || "") +

            "\nQuantity: " +
            (record.quantity || 0)

        );


    if(!confirmDelete){

        return;

    }


    let result =
        await supabaseRequest(
            "stock_in",
            "DELETE",
            null,
            "?id=eq." + id
        );


    if(!result.success){

        console.error(
            "Stock In Delete Error:",
            result.error
        );

        alert(
            "Stock In delete نہیں ہو سکا۔"
        );

        return;

    }


    alert(
        "Stock In transaction deleted successfully."
    );


    await generateReport();

}


// =====================================================
// DELETE STOCK OUT
// =====================================================

async function deleteStockOut(id){

    if(!id){

        alert(
            "Stock Out record ID نہیں ملا۔"
        );

        return;

    }


    let record =
        null;


    for(let i = 0; i < stockOutData.length; i++){

        if(
            String(stockOutData[i].id) ==
            String(id)
        ){

            record =
                stockOutData[i];

            break;

        }

    }


    if(!record){

        alert(
            "Stock Out transaction نہیں ملی۔"
        );

        return;

    }


    let confirmDelete =
        confirm(

            "Are you sure you want to delete this Stock Out transaction?\n\n" +

            "Item: " +
            (record.item_name || "") +

            "\nQuantity: " +
            (record.quantity || 0)

        );


    if(!confirmDelete){

        return;

    }


    let result =
        await supabaseRequest(
            "stock_issue",
            "DELETE",
            null,
            "?id=eq." + id
        );


    if(!result.success){

        console.error(
            "Stock Out Delete Error:",
            result.error
        );

        alert(
            "Stock Out delete نہیں ہو سکا۔"
        );

        return;

    }


    alert(
        "Stock Out transaction deleted successfully."
    );


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
// PRINT REPORT
// =====================================================

function printReport(){

    window.print();

}


// =====================================================
// START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function(){

        updateReportHeaders("all");

        await loadReportData();

    }
);
