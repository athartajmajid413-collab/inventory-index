// =====================================
// COST MANAGEMENT
// SUPABASE VERSION
// =====================================

// =====================================
// SUPABASE DATA
// =====================================

let items = [];

let stockInHistory = [];

let stockOutHistory = [];

let costHistory = [];


// =====================================
// LOAD ALL DATA FROM SUPABASE
// =====================================

async function loadCostDataFromSupabase(){

    console.log("=====================================");
    console.log("LOADING COST DATA FROM SUPABASE");
    console.log("=====================================");


    try{

        // =================================
        // LOAD MASTER ITEMS
        // =================================

        let itemsResult =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?select=*"
            );


        if(!itemsResult.success){

            console.error(
                "Items Load Error:",
                itemsResult.error
            );

            throw itemsResult.error;
        }


        items =
            itemsResult.data || [];


        console.log(
            "Supabase Items:",
            items
        );


        // =================================
        // LOAD STOCK IN
        // =================================

        let stockInResult =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*"
            );


        if(!stockInResult.success){

            console.error(
                "Stock In Load Error:",
                stockInResult.error
            );

            throw stockInResult.error;
        }


        stockInHistory =
            stockInResult.data || [];


        console.log(
            "Supabase Stock In:",
            stockInHistory
        );


        // =================================
        // LOAD STOCK OUT
        // =================================

        let stockOutResult =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*"
            );


        if(!stockOutResult.success){

            console.error(
                "Stock Out Load Error:",
                stockOutResult.error
            );

            throw stockOutResult.error;
        }


        stockOutHistory =
            stockOutResult.data || [];


        console.log(
            "Supabase Stock Out:",
            stockOutHistory
        );


        // =================================
        // LOAD COST HISTORY
        // =================================

        let costResult =
            await supabaseRequest(
                "cost_history",
                "GET",
                null,
                "?select=*"
            );


        if(!costResult.success){

            console.error(
                "Cost History Load Error:",
                costResult.error
            );

            throw costResult.error;
        }


        costHistory =
            costResult.data || [];


        console.log(
            "Supabase Cost History:",
            costHistory
        );


        console.log(
            "====================================="
        );

        console.log(
            "SUPABASE COST DATA LOADED"
        );

        console.log(
            "Items:",
            items.length
        );

        console.log(
            "Stock In:",
            stockInHistory.length
        );

        console.log(
            "Stock Out:",
            stockOutHistory.length
        );

        console.log(
            "Cost History:",
            costHistory.length
        );

        console.log(
            "=====================================");


        // =================================
        // LOAD YEARS
        // =================================

        loadYears();


        // =================================
        // SHOW COST
        // =================================

        showAllCost();


    }catch(error){

        console.error(
            "Cost Data Load Error:",
            error
        );


        alert(
            "Supabase سے Cost data load نہیں ہو سکا۔\n\nConsole میں error check کریں۔"
        );

    }

}


// =====================================
// GET STOCK IN
// =====================================

function getStockIn(itemCode){

    let total = 0;


    for(
        let i = 0;
        i < stockInHistory.length;
        i++
    ){

        let record =
            stockInHistory[i];


        let code =
            String(
                record.item_code || ""
            ).trim();


        if(
            code ===
            String(itemCode || "").trim()
        ){

            total +=
                Number(
                    record.quantity || 0
                );

        }

    }


    return total;

}


// =====================================
// GET STOCK OUT
// =====================================

function getStockOut(itemCode){

    let total = 0;


    for(
        let i = 0;
        i < stockOutHistory.length;
        i++
    ){

        let record =
            stockOutHistory[i];


        let code =
            String(
                record.item_code || ""
            ).trim();


        if(
            code ===
            String(itemCode || "").trim()
        ){

            total +=
                Number(
                    record.quantity || 0
                );

        }

    }


    return total;

}


// =====================================
// GET CURRENT STOCK
// Opening + In - Out
// =====================================

function getCurrentStock(item){

    if(!item){

        return 0;

    }


    let openingStock =
        Number(
            item.opening_stock || 0
        );


    let stockIn =
        getStockIn(
            item.code
        );


    let stockOut =
        getStockOut(
            item.code
        );


    let stock =
        openingStock +
        stockIn -
        stockOut;


    if(stock < 0){

        stock = 0;

    }


    return stock;

}


// =====================================
// GET PURCHASE RATES
// =====================================

function getPurchaseRates(itemCode){

    let rates = [];

    let latestRecord = null;


    for(
        let i = 0;
        i < stockInHistory.length;
        i++
    ){

        let record =
            stockInHistory[i];


        let code =
            String(
                record.item_code || ""
            ).trim();


        if(
            code !==
            String(itemCode || "").trim()
        ){

            continue;

        }


        let rate =
            Number(
                record.unit_cost || 0
            );


        if(rate <= 0){

            continue;

        }


        rates.push(rate);


        // =================================
        // FIND LATEST
        // =================================

        if(latestRecord === null){

            latestRecord =
                record;

        }else{

            let currentDateTime =
                String(
                    record.date || ""
                ) +
                String(
                    record.time || ""
                );


            let latestDateTime =
                String(
                    latestRecord.date || ""
                ) +
                String(
                    latestRecord.time || ""
                );


            if(
                currentDateTime >
                latestDateTime
            ){

                latestRecord =
                    record;

            }

        }

    }


    let latestRate = 0;


    if(latestRecord){

        latestRate =
            Number(
                latestRecord.unit_cost || 0
            );

    }


    return {

        minRate:
            rates.length > 0
            ? Math.min(...rates)
            : 0,

        maxRate:
            rates.length > 0
            ? Math.max(...rates)
            : 0,

        latestRate:
            latestRate

    };

}


// =====================================
// GET OPENING RATE
// =====================================

function getOpeningRate(item){

    return Number(
        item.opening_cost || 0
    );

}


// =====================================
// GET SUPPLIER
// =====================================

function getSupplier(item){

    return (
        item.supplier ||
        "-"
    );

}


// =====================================
// GET DEMAND FROM COST HISTORY
// =====================================

function getDemandForItem(
    itemCode,
    selectedMonth,
    selectedYear
){

    let total = 0;


    for(
        let i = 0;
        i < costHistory.length;
        i++
    ){

        let record =
            costHistory[i];


        // =================================
        // MONTH FILTER
        // =================================

        if(
            selectedMonth &&
            record.month !== selectedMonth
        ){

            continue;

        }


        // =================================
        // YEAR FILTER
        // =================================

        if(
            selectedYear &&
            String(record.year) !==
            String(selectedYear)
        ){

            continue;

        }


        let demandItems =
            record.items || [];


        if(
            typeof demandItems === "string"
        ){

            try{

                demandItems =
                    JSON.parse(
                        demandItems
                    );

            }catch(error){

                demandItems = [];

            }

        }


        if(
            !Array.isArray(demandItems)
        ){

            continue;

        }


        for(
            let j = 0;
            j < demandItems.length;
            j++
        ){

            let demandItem =
                demandItems[j];


            let code =
                String(
                    demandItem.code ||
                    demandItem.itemCode ||
                    ""
                ).trim();


            if(
                code ===
                String(itemCode || "").trim()
            ){

                total +=
                    Number(
                        demandItem.approvedDemandQty ||
                        demandItem.approved_demand_qty ||
                        0
                    );

            }

        }

    }


    return total;

}


// =====================================
// LOAD YEARS
// =====================================

function loadYears(){

    let yearSelect =
        document.getElementById(
            "reportYear"
        );


    if(!yearSelect){

        return;

    }


    let years = [];


    // =================================
    // ITEM / STOCK YEARS
    // =================================

    for(
        let i = 0;
        i < stockInHistory.length;
        i++
    ){

        let date =
            String(
                stockInHistory[i].date || ""
            );


        let year =
            date.substring(0,4);


        if(
            year &&
            !years.includes(year)
        ){

            years.push(year);

        }

    }


    for(
        let i = 0;
        i < stockOutHistory.length;
        i++
    ){

        let date =
            String(
                stockOutHistory[i].date || ""
            );


        let year =
            date.substring(0,4);


        if(
            year &&
            !years.includes(year)
        ){

            years.push(year);

        }

    }


    // =================================
    // COST HISTORY YEARS
    // =================================

    for(
        let i = 0;
        i < costHistory.length;
        i++
    ){

        let year =
            String(
                costHistory[i].year || ""
            );


        if(
            year &&
            !years.includes(year)
        ){

            years.push(year);

        }

    }


    years.sort();


    yearSelect.innerHTML =
        '<option value="">Select Year</option>';


    for(
        let i = 0;
        i < years.length;
        i++
    ){

        let option =
            document.createElement(
                "option"
            );


        option.value =
            years[i];


        option.textContent =
            years[i];


        yearSelect.appendChild(
            option
        );

    }

}


// =====================================
// SEARCH
// =====================================

function searchCostItem(){

    showCostReport();

}


// =====================================
// SHOW ALL
// =====================================

function showAllCost(){

    let search =
        document.getElementById(
            "costSearch"
        );


    let month =
        document.getElementById(
            "reportMonth"
        );


    let year =
        document.getElementById(
            "reportYear"
        );


    if(search){

        search.value = "";

    }


    if(month){

        month.value = "";

    }


    if(year){

        year.value = "";

    }


    showCostTable(
        "",
        ""
    );

}


// =====================================
// SHOW COST REPORT
// =====================================

function showCostReport(){

    let month =
        document.getElementById(
            "reportMonth"
        );


    let year =
        document.getElementById(
            "reportYear"
        );


    showCostTable(

        month
        ? month.value
        : "",

        year
        ? year.value
        : ""

    );

}


// =====================================
// SHOW COST TABLE
// =====================================

function showCostTable(
    selectedMonth,
    selectedYear
){

    let body =
        document.getElementById(
            "costBody"
        );


    if(!body){

        return;

    }


    body.innerHTML = "";


    let searchInput =
        document.getElementById(
            "costSearch"
        );


    let searchText =
        searchInput
        ? String(
            searchInput.value || ""
          )
          .trim()
          .toLowerCase()
        : "";


    let totalItems = 0;

    let totalAvailableQty = 0;

    let totalDemandQty = 0;

    let totalStockCost = 0;

    let totalDemandCost = 0;

    let categoryTotals = {};

    let supplierTotals = {};


    // =================================
    // LOOP MASTER ITEMS
    // =================================

    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let item =
            items[i];


        let code =
            String(
                item.code || ""
            ).trim();


        let itemName =
            String(
                item.item_name || ""
            );


        let category =
            item.category ||
            "Other";


        let supplier =
            getSupplier(item);


        // =================================
        // SEARCH
        // =================================

        if(searchText){

            let searchData = (

                code +
                " " +
                itemName +
                " " +
                category +
                " " +
                supplier

            ).toLowerCase();


            if(
                !searchData.includes(
                    searchText
                )
            ){

                continue;

            }

        }


        // =================================
        // CURRENT STOCK
        // =================================

        let availableQty =
            getCurrentStock(item);


        // =================================
        // RATES
        // =================================

        let rates =
            getPurchaseRates(code);


        let openingRate =
            getOpeningRate(item);


        let latestRate =
            rates.latestRate;


        if(latestRate <= 0){

            latestRate =
                openingRate;

        }


        // =================================
        // DEMAND
        // =================================

        let approvedDemand =
            getDemandForItem(

                code,

                selectedMonth,

                selectedYear

            );


        // =================================
        // COST
        // =================================

        let availableCost =
            availableQty *
            latestRate;


        let approvedDemandCost =
            approvedDemand *
            latestRate;


        // =================================
        // TOTALS
        // =================================

        totalItems++;

        totalAvailableQty +=
            availableQty;

        totalDemandQty +=
            approvedDemand;

        totalStockCost +=
            availableCost;

        totalDemandCost +=
            approvedDemandCost;


        // =================================
        // CATEGORY
        // =================================

        if(
            !categoryTotals[category]
        ){

            categoryTotals[category] = 0;

        }


        categoryTotals[category] +=
            availableCost;


        // =================================
        // SUPPLIER
        // =================================

        if(
            !supplierTotals[supplier]
        ){

            supplierTotals[supplier] = 0;

        }


        supplierTotals[supplier] +=
            availableCost;


        // =================================
        // ROW
        // =================================

        let row =
            document.createElement(
                "tr"
            );


        let values = [

            category,

            code || "-",

            itemName || "-",

            supplier,

            "Rs. " +
            openingRate.toFixed(2),

            "Rs. " +
            rates.minRate.toFixed(2),

            "Rs. " +
            rates.maxRate.toFixed(2),

            "Rs. " +
            latestRate.toFixed(2),

            availableQty.toFixed(2) +
            " " +
            (
                item.unit || ""
            ),

            approvedDemand.toFixed(2) +
            " " +
            (
                item.unit || ""
            ),

            "Rs. " +
            availableCost.toFixed(2),

            "Rs. " +
            approvedDemandCost.toFixed(2)

        ];


        for(
            let j = 0;
            j < values.length;
            j++
        ){

            let cell =
                document.createElement(
                    "td"
                );


            cell.textContent =
                values[j];


            row.appendChild(
                cell
            );

        }


        body.appendChild(
            row
        );

    }


    // =================================
    // SUMMARY
    // =================================

    setCostText(
        "totalItems",
        totalItems
    );


    setCostText(
        "grandStockCost",
        "Rs. " +
        totalStockCost.toFixed(2)
    );


    setCostText(
        "grandDemandCost",
        "Rs. " +
        totalDemandCost.toFixed(2)
    );


    // =================================
    // FOOTER
    // =================================

    setCostText(
        "footerStockCost",
        "Rs. " +
        totalStockCost.toFixed(2)
    );


    setCostText(
        "footerDemandCost",
        "Rs. " +
        totalDemandCost.toFixed(2)
    );


    // =================================
    // SUMMARY TABLES
    // =================================

    buildCategorySummary(
        categoryTotals,
        totalStockCost
    );


    buildSupplierSummary(
        supplierTotals,
        totalStockCost
    );

}


// =====================================
// SET TEXT
// =====================================

function setCostText(
    id,
    value
){

    let element =
        document.getElementById(
            id
        );


    if(element){

        element.textContent =
            value;

    }

}


// =====================================
// CATEGORY SUMMARY
// =====================================

function buildCategorySummary(
    data,
    total
){

    let body =
        document.getElementById(
            "categorySummaryBody"
        );


    if(!body){

        return;

    }


    body.innerHTML = "";


    let categories =
        Object.keys(data).sort();


    for(
        let i = 0;
        i < categories.length;
        i++
    ){

        let category =
            categories[i];


        let amount =
            data[category];


        let percentage =
            total > 0
            ? (
                amount /
                total
              ) * 100
            : 0;


        let row =
            document.createElement(
                "tr"
            );


        let cell1 =
            document.createElement(
                "td"
            );


        cell1.textContent =
            category;


        let cell2 =
            document.createElement(
                "td"
            );


        cell2.textContent =
            percentage.toFixed(2) +
            "%";


        row.appendChild(
            cell1
        );


        row.appendChild(
            cell2
        );


        body.appendChild(
            row
        );

    }


    setCostText(
        "categoryTotalPercentage",
        total > 0
        ? "100%"
        : "0%"
    );

}


// =====================================
// SUPPLIER SUMMARY
// =====================================

function buildSupplierSummary(
    data,
    total
){

    let body =
        document.getElementById(
            "supplierBody"
        );


    if(!body){

        return;

    }


    body.innerHTML = "";


    let suppliers =
        Object.keys(data).sort();


    let supplierTotal =
        0;


    for(
        let i = 0;
        i < suppliers.length;
        i++
    ){

        let supplier =
            suppliers[i];


        let amount =
            data[supplier];


        supplierTotal +=
            amount;


        let percentage =
            total > 0
            ? (
                amount /
                total
              ) * 100
            : 0;


        let row =
            document.createElement(
                "tr"
            );


        let cell1 =
            document.createElement(
                "td"
            );


        cell1.textContent =
            supplier;


        let cell2 =
            document.createElement(
                "td"
            );


        cell2.textContent =
            "Rs. " +
            amount.toFixed(2);


        let cell3 =
            document.createElement(
                "td"
            );


        cell3.textContent =
            percentage.toFixed(2) +
            "%";


        row.appendChild(
            cell1
        );


        row.appendChild(
            cell2
        );


        row.appendChild(
            cell3
        );


        body.appendChild(
            row
        );

    }


    setCostText(
        "supplierTotalCost",
        "Rs. " +
        supplierTotal.toFixed(2)
    );


    setCostText(
        "supplierTotalPercentage",
        total > 0
        ? "100%"
        : "0%"
    );

}


// =====================================
// PRINT COST REPORT
// =====================================

function printCostReport(){

    let table =
        document.getElementById(
            "costTable"
        );


    if(!table){

        alert(
            "Cost table not found!"
        );

        return;

    }


    let monthElement =
        document.getElementById(
            "reportMonth"
        );


    let yearElement =
        document.getElementById(
            "reportYear"
        );


    let month =
        monthElement
        ? monthElement.value
        : "";


    let year =
        yearElement
        ? yearElement.value
        : "";


    let title =
        "COST MANAGEMENT";


    if(month){

        let parts =
            month.split("-");


        let monthNames = [

            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"

        ];


        title =
            "COST MANAGEMENT - " +
            monthNames[
                Number(parts[1]) - 1
            ] +
            " " +
            parts[0];

    }


    if(year){

        title =
            "COST MANAGEMENT - YEAR " +
            year;

    }


    let categoryTable =
        document.getElementById(
            "categoryTable"
        );


    let supplierTable =
        document.getElementById(
            "supplierTable"
        );


    let printWindow =
        window.open(
            "",
            "",
            "width=1500,height=900"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups for printing."
        );

        return;

    }


    printWindow.document.write(`

<html>

<head>

<title>
${title}
</title>

<style>

body{
    font-family:Arial,sans-serif;
    padding:15px;
}

h1,h2{
    text-align:center;
    color:#12355b;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-bottom:30px;
    font-size:9px;
}

th{
    background:#12355b;
    color:white;
    padding:6px;
    border:1px solid #777;
}

td{
    padding:6px;
    border:1px solid #777;
    text-align:center;
}

tfoot td{
    font-weight:bold;
    background:#e8eef5;
}

@media print{

    @page{

        size:A4 landscape;

        margin:8mm;
    }

}

</style>

</head>

<body>

<h2>
MECAS ENGINEERING PVT LIMITED SUNDAR
</h2>

<h1>
${title}
</h1>

<p>
Report Date:
${new Date().toLocaleDateString("en-GB")}
</p>

<h2>
Item Cost Details
</h2>

${table.outerHTML}

${
    categoryTable
    ?
    "<h2>Category Summary</h2>" +
    categoryTable.outerHTML
    :
    ""
}

${
    supplierTable
    ?
    "<h2>Supplier Cost Summary</h2>" +
    supplierTable.outerHTML
    :
    ""
}

</body>

</html>

`);


    printWindow.document.close();

    printWindow.focus();


    setTimeout(
        function(){

            printWindow.print();

        },
        300
    );

}


// =====================================
// OPEN COST HISTORY
// =====================================

function openCostHistory(){

    window.location.href =
        "Cost History.html";

}


// =====================================
// PAGE START
// =====================================

window.addEventListener(
    "load",
    function(){

        loadCostDataFromSupabase();

    }
);
// =====================================
// EXPORT COST REPORT TO XLSX
// WITH COLORS
// =====================================

function exportCostToExcel(){

    if(
        !items ||
        items.length === 0
    ){

        alert(
            "Export کرنے کے لیے Cost data موجود نہیں ہے۔"
        );

        return;

    }


    // =====================================
    // GET FILTERS
    // =====================================

    let searchElement =
        document.getElementById(
            "costSearch"
        );

    let monthElement =
        document.getElementById(
            "reportMonth"
        );

    let yearElement =
        document.getElementById(
            "reportYear"
        );


    let searchText =
        searchElement
        ? String(
            searchElement.value || ""
        )
        .trim()
        .toLowerCase()
        : "";


    let selectedMonth =
        monthElement
        ? monthElement.value
        : "";


    let selectedYear =
        yearElement
        ? yearElement.value
        : "";


    // =====================================
    // EXCEL DATA
    // =====================================

    let excelData = [];


    // =====================================
    // COMPANY
    // =====================================

    excelData.push([
        "MECAS ENGINEERING PVT LIMITED SUNDAR"
    ]);


    excelData.push([
        "COST MANAGEMENT"
    ]);


    excelData.push([
        "Report Date",
        new Date().toLocaleDateString("en-GB")
    ]);


    excelData.push([
        "Month",
        selectedMonth || "All"
    ]);


    excelData.push([
        "Year",
        selectedYear || "All"
    ]);


    excelData.push([]);


    // =====================================
    // HEADERS
    // =====================================

    excelData.push([

        "Category",
        "ID #",
        "Item",
        "Supplier",
        "Opening Cost",
        "Min Rate",
        "Max Rate",
        "Latest Rate",
        "Available Quantity",
        "Approved Demand",
        "Available Cost",
        "Approved Demand Cost"

    ]);


    // =====================================
    // TOTALS
    // =====================================

    let totalItems = 0;

    let totalAvailableQty = 0;

    let totalDemandQty = 0;

    let totalStockCost = 0;

    let totalDemandCost = 0;


    // =====================================
    // CATEGORY
    // =====================================

    let categoryTotals = {};


    // =====================================
    // SUPPLIER
    // =====================================

    let supplierTotals = {};


    // =====================================
    // LOOP ITEMS
    // =====================================

    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let item =
            items[i];


        let code =
            String(
                item.code || ""
            ).trim();


        let itemName =
            String(
                item.item_name || ""
            );


        let category =
            item.category ||
            "Other";


        let supplier =
            getSupplier(item);


        // =================================
        // SEARCH FILTER
        // =================================

        if(searchText){

            let searchData = (

                code +
                " " +
                itemName +
                " " +
                category +
                " " +
                supplier

            ).toLowerCase();


            if(
                !searchData.includes(
                    searchText
                )
            ){

                continue;

            }

        }


        // =================================
        // STOCK
        // =================================

        let availableQty =
            getCurrentStock(item);


        // =================================
        // RATES
        // =================================

        let rates =
            getPurchaseRates(code);


        let openingRate =
            getOpeningRate(item);


        let latestRate =
            rates.latestRate;


        if(latestRate <= 0){

            latestRate =
                openingRate;

        }


        // =================================
        // DEMAND
        // =================================

        let approvedDemand =
            getDemandForItem(

                code,

                selectedMonth,

                selectedYear

            );


        // =================================
        // COST
        // =================================

        let availableCost =
            availableQty *
            latestRate;


        let approvedDemandCost =
            approvedDemand *
            latestRate;


        // =================================
        // TOTALS
        // =================================

        totalItems++;

        totalAvailableQty +=
            availableQty;

        totalDemandQty +=
            approvedDemand;

        totalStockCost +=
            availableCost;

        totalDemandCost +=
            approvedDemandCost;


        // =================================
        // CATEGORY TOTAL
        // =================================

        if(
            !categoryTotals[category]
        ){

            categoryTotals[category] =
                0;

        }


        categoryTotals[category] +=
            availableCost;


        // =================================
        // SUPPLIER TOTAL
        // =================================

        if(
            !supplierTotals[supplier]
        ){

            supplierTotals[supplier] =
                0;

        }


        supplierTotals[supplier] +=
            availableCost;


        // =================================
        // ADD ROW
        // =================================

        excelData.push([

            category,

            code || "-",

            itemName || "-",

            supplier,

            openingRate,

            rates.minRate,

            rates.maxRate,

            latestRate,

            availableQty,

            approvedDemand,

            availableCost,

            approvedDemandCost

        ]);

    }


    // =====================================
    // NO DATA
    // =====================================

    if(totalItems === 0){

        alert(
            "کوئی Cost data موجود نہیں ہے۔"
        );

        return;

    }


    // =====================================
    // TOTAL ROW
    // =====================================

    let totalRowIndex =
        excelData.length;


    excelData.push([

        "TOTAL",

        "",

        "",

        "",

        "",

        "",

        "",

        "",

        totalAvailableQty,

        totalDemandQty,

        totalStockCost,

        totalDemandCost

    ]);


    // =====================================
    // CATEGORY SUMMARY
    // =====================================

    let categoryStart =
        excelData.length + 2;


    excelData.push([]);


    excelData.push([
        "CATEGORY SUMMARY"
    ]);


    excelData.push([
        "Category",
        "Available Cost",
        "Cost %"
    ]);


    let categories =
        Object.keys(
            categoryTotals
        ).sort();


    for(
        let i = 0;
        i < categories.length;
        i++
    ){

        let category =
            categories[i];


        let amount =
            categoryTotals[category];


        let percentage =
            totalStockCost > 0
            ? (
                amount /
                totalStockCost
            ) * 100
            : 0;


        excelData.push([

            category,

            amount,

            percentage / 100

        ]);

    }


    excelData.push([

        "TOTAL",

        totalStockCost,

        1

    ]);


    // =====================================
    // SUPPLIER SUMMARY
    // =====================================

    excelData.push([]);

    excelData.push([
        "SUPPLIER COST SUMMARY"
    ]);


    excelData.push([

        "Supplier",
        "Available Cost",
        "Cost %"

    ]);


    let suppliers =
        Object.keys(
            supplierTotals
        ).sort();


    for(
        let i = 0;
        i < suppliers.length;
        i++
    ){

        let supplier =
            suppliers[i];


        let amount =
            supplierTotals[supplier];


        let percentage =
            totalStockCost > 0
            ? (
                amount /
                totalStockCost
            )
            : 0;


        excelData.push([

            supplier,

            amount,

            percentage

        ]);

    }


    excelData.push([

        "TOTAL",

        totalStockCost,

        1

    ]);


    // =====================================
    // CREATE WORKSHEET
    // =====================================

    let worksheet =
        XLSX.utils.aoa_to_sheet(
            excelData
        );


    // =====================================
    // MERGE COMPANY TITLE
    // =====================================

    worksheet["!merges"] = [

        {
            s: {
                r: 0,
                c: 0
            },

            e: {
                r: 0,
                c: 11
            }
        },

        {
            s: {
                r: 1,
                c: 0
            },

            e: {
                r: 1,
                c: 11
            }
        }

    ];


    // =====================================
    // HEADER ROW
    // Row 7
    // =====================================

    let mainHeaderRow = 6;


    for(
        let c = 0;
        c <= 11;
        c++
    ){

        let address =
            XLSX.utils.encode_cell({

                r:
                    mainHeaderRow,

                c:
                    c

            });


        if(
            worksheet[address]
        ){

            worksheet[address].s = {

                fill: {

                    patternType:
                        "solid",

                    fgColor: {

                        rgb:
                            "12355B"

                    }

                },

                font: {

                    bold:
                        true,

                    color: {

                        rgb:
                            "FFFFFF"

                    }

                },

                alignment: {

                    horizontal:
                        "center",

                    vertical:
                        "center",

                    wrapText:
                        true

                },

                border: {

                    top: {
                        style: "thin",
                        color: {
                            rgb: "FFFFFF"
                        }
                    },

                    bottom: {
                        style: "thin",
                        color: {
                            rgb: "FFFFFF"
                        }
                    },

                    left: {
                        style: "thin",
                        color: {
                            rgb: "FFFFFF"
                        }
                    },

                    right: {
                        style: "thin",
                        color: {
                            rgb: "FFFFFF"
                        }
                    }

                }

            };

        }

    }


    // =====================================
    // ITEM ROW COLORS
    // =====================================

    let firstItemRow =
        7;


    let lastItemRow =
        totalRowIndex - 1;


    for(
        let r =
            firstItemRow;

        r <=
            lastItemRow;

        r++
    ){

        let currentStockAddress =
            XLSX.utils.encode_cell({

                r:
                    r,

                c:
                    8

            });


        let currentStock =
            Number(
                worksheet[
                    currentStockAddress
                ]?.v || 0
            );


        // Required stock based on demand
        let requiredStock =
            Number(
                worksheet[
                    XLSX.utils.encode_cell({
                        r: r,
                        c: 9
                    })
                ]?.v || 0
            );


        let fillColor =
            "D5F5E3";


        let fontColor =
            "1E8449";


        // =================================
        // RED = VERY LOW
        // =================================

        if(
            currentStock <=
            requiredStock * 0.5
        ){

            fillColor =
                "E74C3C";

            fontColor =
                "FFFFFF";

        }

        // =================================
        // YELLOW = LOW
        // =================================

        else if(
            currentStock <=
            requiredStock
        ){

            fillColor =
                "F1C40F";

            fontColor =
                "000000";

        }


        if(
            worksheet[
                currentStockAddress
            ]
        ){

            worksheet[
                currentStockAddress
            ].s = {

                fill: {

                    patternType:
                        "solid",

                    fgColor: {

                        rgb:
                            fillColor

                    }

                },

                font: {

                    bold:
                        true,

                    color: {

                        rgb:
                            fontColor

                    }

                },

                alignment: {

                    horizontal:
                        "center",

                    vertical:
                        "center"

                },

                border: {

                    top: {
                        style: "thin",
                        color: {
                            rgb: "CCCCCC"
                        }
                    },

                    bottom: {
                        style: "thin",
                        color: {
                            rgb: "CCCCCC"
                        }
                    },

                    left: {
                        style: "thin",
                        color: {
                            rgb: "CCCCCC"
                        }
                    },

                    right: {
                        style: "thin",
                        color: {
                            rgb: "CCCCCC"
                        }
                    }

                }

            };

        }


        // =================================
        // GENERAL BORDERS
        // =================================

        for(
            let c = 0;
            c <= 11;
            c++
        ){

            let address =
                XLSX.utils.encode_cell({

                    r:
                        r,

                    c:
                        c

                });


            if(
                worksheet[address]
            ){

                if(
                    !worksheet[address].s
                ){

                    worksheet[address].s = {};

                }


                worksheet[address].s.border = {

                    top: {
                        style: "thin",
                        color: {
                            rgb: "CCCCCC"
                        }
                    },

                    bottom: {
                        style: "thin",
                        color: {
                            rgb: "CCCCCC"
                        }
                    },

                    left: {
                        style: "thin",
                        color: {
                            rgb: "CCCCCC"
                        }
                    },

                    right: {
                        style: "thin",
                        color: {
                            rgb: "CCCCCC"
                        }
                    }

                };

            }

        }

    }


    // =====================================
    // TOTAL ROW STYLE
    // =====================================

    for(
        let c = 0;
        c <= 11;
        c++
    ){

        let address =
            XLSX.utils.encode_cell({

                r:
                    totalRowIndex,

                c:
                    c

            });


        if(
            worksheet[address]
        ){

            worksheet[address].s = {

                fill: {

                    patternType:
                        "solid",

                    fgColor: {

                        rgb:
                            "E8EEF5"

                    }

                },

                font: {

                    bold:
                        true

                },

                alignment: {

                    horizontal:
                        "center",

                    vertical:
                        "center"

                },

                border: {

                    top: {
                        style: "thin",
                        color: {
                            rgb: "777777"
                        }
                    },

                    bottom: {
                        style: "thin",
                        color: {
                            rgb: "777777"
                        }
                    },

                    left: {
                        style: "thin",
                        color: {
                            rgb: "777777"
                        }
                    },

                    right: {
                        style: "thin",
                        color: {
                            rgb: "777777"
                        }
                    }

                }

            };

        }

    }


    // =====================================
    // NUMBER FORMATS
    // =====================================

    for(
        let r = 7;
        r <= totalRowIndex;
        r++
    ){

        // Rates
        for(
            let c = 4;
            c <= 7;
            c++
        ){

            let address =
                XLSX.utils.encode_cell({

                    r:
                        r,

                    c:
                        c

                });


            if(
                worksheet[address]
            ){

                worksheet[address].z =
                    '#,##0.00';

            }

        }


        // Quantity
        for(
            let c = 8;
            c <= 9;
            c++
        ){

            let address =
                XLSX.utils.encode_cell({

                    r:
                        r,

                    c:
                        c

                });


            if(
                worksheet[address]
            ){

                worksheet[address].z =
                    '#,##0.00';

            }

        }


        // Cost
        for(
            let c = 10;
            c <= 11;
            c++
        ){

            let address =
                XLSX.utils.encode_cell({

                    r:
                        r,

                    c:
                        c

                });


            if(
                worksheet[address]
            ){

                worksheet[address].z =
                    '"Rs. " #,##0.00';

            }

        }

    }


    // =====================================
    // COLUMN WIDTHS
    // =====================================

    worksheet["!cols"] = [

        {wch: 18},
        {wch: 14},
        {wch: 30},
        {wch: 25},
        {wch: 15},
        {wch: 15},
        {wch: 15},
        {wch: 15},
        {wch: 20},
        {wch: 20},
        {wch: 20},
        {wch: 25}

    ];


    // =====================================
    // FREEZE HEADER
    // =====================================

    worksheet["!freeze"] = {
        xSplit: 0,
        ySplit: 7
    };


    // =====================================
    // CREATE WORKBOOK
    // =====================================

    let workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Cost Report"

    );


    // =====================================
    // FILE NAME
    // =====================================

    let today =
        new Date();


    let dateString =
        today
        .toISOString()
        .split("T")[0];


    let fileName =
        "Cost_Report_" +
        dateString +
        ".xlsx";


    // =====================================
    // DOWNLOAD
    // =====================================

    XLSX.writeFile(

        workbook,

        fileName

    );


    alert(
        "Cost Report کی Excel (.xlsx) file کامیابی سے بن گئی ہے۔"
    );

}
