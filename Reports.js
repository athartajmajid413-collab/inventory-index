// =====================================================
// REPORTS SYSTEM
// =====================================================


// =====================================================
// LOAD DATA
// =====================================================

let items =
    JSON.parse(localStorage.getItem("items")) || [];

let history =
    JSON.parse(localStorage.getItem("history")) || [];

let demands =
    JSON.parse(localStorage.getItem("demands")) || [];

let demandHistory =
    JSON.parse(localStorage.getItem("demandHistory")) || [];


// =====================================================
// GENERATE REPORT
// =====================================================

function generateReport(){

    // Reload latest data
    items =
        JSON.parse(localStorage.getItem("items")) || [];

    history =
        JSON.parse(localStorage.getItem("history")) || [];

    demands =
        JSON.parse(localStorage.getItem("demands")) || [];

    demandHistory =
        JSON.parse(localStorage.getItem("demandHistory")) || [];


    let reportType =
        document.getElementById("reportType").value;

    let fromDate =
        document.getElementById("fromDate").value;

    let toDate =
        document.getElementById("toDate").value;

    let itemCode =
        document.getElementById("itemCode").value.trim();

    let department =
        document.getElementById("department").value;


    document.getElementById("reportBody").innerHTML = "";


    updateReportHeaders(reportType);


    // =================================================
    // REPORT TITLE
    // =================================================

    let reportTitle = "STORE REPORT";


    if(reportType == "stockIn"){

        reportTitle = "STOCK IN REPORT";

    }

    else if(reportType == "stockOut"){

        reportTitle = "STOCK OUT REPORT";

    }

    else if(reportType == "currentStock"){

        reportTitle = "CURRENT STOCK REPORT";

    }

    else if(reportType == "cost"){

        reportTitle = "COST REPORT";

    }

    else if(reportType == "demand"){

        reportTitle = "MONTHLY DEMAND REPORT";

    }


    document.getElementById("printReportTitle").innerHTML =
        reportTitle;


    // =================================================
    // PRINT DATE
    // =================================================

    let today = new Date();


    let printDate =
        today.getDate() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getFullYear();


    document.getElementById("printDate").innerHTML =
        printDate;


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

            let record = history[i];


            if(record.type != "Stock In"){

                continue;

            }


            if(
                fromDate != "" &&
                record.date < fromDate
            ){

                continue;

            }


            if(
                toDate != "" &&
                record.date > toDate
            ){

                continue;

            }


            if(
                itemCode != "" &&
                String(record.itemCode).trim() != itemCode
            ){

                continue;

            }


            if(
                department != "" &&
                record.department != department
            ){

                continue;

            }


            totalEntries++;

            totalQuantity +=
                Number(record.quantity || 0);

            totalCost +=
                Number(record.totalCost || 0);


            addStockInRow(record, i);

        }

    }


    // =================================================
    // STOCK OUT
    // =================================================

    else if(reportType == "stockOut"){

        for(let i = 0; i < history.length; i++){

            let record = history[i];


            if(record.type != "Stock Issue"){

                continue;

            }


            if(
                fromDate != "" &&
                record.date < fromDate
            ){

                continue;

            }


            if(
                toDate != "" &&
                record.date > toDate
            ){

                continue;

            }


            if(
                itemCode != "" &&
                String(record.itemCode).trim() != itemCode
            ){

                continue;

            }


            if(
                department != "" &&
                record.department != department
            ){

                continue;

            }


            totalEntries++;

            totalQuantity +=
                Number(record.quantity || 0);


            addStockOutRow(record, i);

        }

    }


    // =================================================
    // ALL TRANSACTIONS
    // =================================================

    else if(reportType == "all"){

        for(let i = 0; i < history.length; i++){

            let record = history[i];


            if(
                fromDate != "" &&
                record.date < fromDate
            ){

                continue;

            }


            if(
                toDate != "" &&
                record.date > toDate
            ){

                continue;

            }


            if(
                itemCode != "" &&
                String(record.itemCode).trim() != itemCode
            ){

                continue;

            }


            if(
                department != "" &&
                record.department != department
            ){

                continue;

            }


            totalEntries++;

            totalQuantity +=
                Number(record.quantity || 0);

            totalCost +=
                Number(record.totalCost || 0);


            addAllTransactionRow(record, i);

        }

    }


    // =================================================
    // CURRENT STOCK
    // =================================================

    else if(reportType == "currentStock"){

        for(let i = 0; i < items.length; i++){

            let item = items[i];


            if(
                itemCode != "" &&
                String(item.code).trim() != itemCode
            ){

                continue;

            }


            let currentStock =
                calculateCurrentStock(item.code);


            let minimumStock =
                Number(item.minimumStock || 0);


            let status = "OK";


            if(currentStock <= minimumStock){

                status = "LOW STOCK";

            }


            totalEntries++;

            totalQuantity += currentStock;


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

            let record = history[i];


            if(record.type != "Stock In"){

                continue;

            }


            if(
                fromDate != "" &&
                record.date < fromDate
            ){

                continue;

            }


            if(
                toDate != "" &&
                record.date > toDate
            ){

                continue;

            }


            if(
                itemCode != "" &&
                String(record.itemCode).trim() != itemCode
            ){

                continue;

            }


            let code =
                String(record.itemCode).trim();


            if(!costData[code]){

                costData[code] = {

                    itemCode: code,

                    itemName:
                        record.itemName || "",

                    quantity: 0,

                    totalCost: 0

                };

            }


            costData[code].quantity +=
                Number(record.quantity || 0);


            costData[code].totalCost +=
                Number(record.totalCost || 0);

        }


        for(let code in costData){

            let record =
                costData[code];


            totalEntries++;

            totalQuantity +=
                record.quantity;

            totalCost +=
                record.totalCost;


            addCostRow(record);

        }

    }


    // =================================================
    // MONTHLY DEMAND
    // =================================================

    else if(reportType == "demand"){

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
                itemCode != "" &&
                code != itemCode
            ){

                continue;

            }


            if(!demandData[code]){

                demandData[code] = {

                    itemCode: code,

                    itemName:
                        demand.itemName ||
                        demand.name ||
                        "",

                    demand: 0,

                    pendingDemand: 0,

                    pendingPO: 0

                };

            }


            demandData[code].demand +=
                Number(
                    demand.demand ||
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


            addDemandRow(record);

        }

    }


    // =================================================
    // SHOW SUMMARY
    // =================================================

    document.getElementById("totalEntries").innerHTML =
        totalEntries;


    document.getElementById("reportQuantity").innerHTML =
        totalQuantity;


    document.getElementById("reportCost").innerHTML =
        totalCost.toFixed(2);

}



// =====================================================
// UPDATE TABLE HEADERS
// =====================================================

function updateReportHeaders(reportType){

    let reportHead =
        document.getElementById("reportHead");


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
// CALCULATE CURRENT STOCK
// =====================================================

function calculateCurrentStock(code){

    let stock = 0;


    // Opening Stock

    for(let i = 0; i < items.length; i++){

        if(
            String(items[i].code).trim() ==
            String(code).trim()
        ){

            stock =
                Number(items[i].openingStock || 0);

            break;

        }

    }


    // Transactions

    for(let i = 0; i < history.length; i++){

        let record =
            history[i];


        if(
            String(record.itemCode).trim() !=
            String(code).trim()
        ){

            continue;

        }


        let quantity =
            Number(record.quantity || 0);


        if(record.type == "Stock In"){

            stock += quantity;

        }


        if(record.type == "Stock Issue"){

            stock -= quantity;

        }

    }


    return stock;

}



// =====================================================
// STOCK IN ROW
// =====================================================

function addStockInRow(record, index){

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
        .getElementById("reportBody")
        .appendChild(row);

}



// =====================================================
// STOCK OUT ROW
// =====================================================

function addStockOutRow(record, index){

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
        .getElementById("reportBody")
        .appendChild(row);

}



// =====================================================
// ALL TRANSACTION ROW
// =====================================================

function addAllTransactionRow(record, index){

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

        <td>${item.itemName || ""}</td>

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
// DELETE ONE TRANSACTION
// =====================================================

function deleteTransaction(index){

    // Check index

    if(
        index < 0 ||
        index >= history.length
    ){

        alert("Transaction not found.");

        return;

    }


    let record =
        history[index];


    // Confirmation

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


    // Delete transaction

    history.splice(index, 1);


    // Save updated history

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );


    // Show message

    alert(
        "Transaction deleted successfully."
    );


    // Generate report again

    generateReport();

}



// =====================================================
// CLEAR REPORT FILTERS
// =====================================================

function clearReport(){

    document.getElementById("reportType").value =
        "all";


    document.getElementById("fromDate").value =
        "";


    document.getElementById("toDate").value =
        "";


    document.getElementById("itemCode").value =
        "";


    document.getElementById("department").value =
        "";


    document.getElementById("reportBody").innerHTML =
        "";


    document.getElementById("totalEntries").innerHTML =
        "0";


    document.getElementById("reportQuantity").innerHTML =
        "0";


    document.getElementById("reportCost").innerHTML =
        "0";


    document.getElementById("printReportTitle").innerHTML =
        "STORE REPORT";


    document.getElementById("printDate").innerHTML =
        "";


    updateReportHeaders("all");

}



// =====================================================
// PRINT REPORT
// =====================================================

function printReport(){

    window.print();

}