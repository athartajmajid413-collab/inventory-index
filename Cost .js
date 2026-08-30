// =====================================
// COST MANAGEMENT JS
// MECAS ENGINEERING PVT LIMITED SUNDAR
// SUPABASE VERSION
// =====================================

let items = [];
let history = [];
let demandHistory = [];


// =====================================
// LOAD DATA FROM SUPABASE
// =====================================

async function loadCostData(){

    console.log("Loading Cost Data...");

    // -------------------------------
    // ITEMS
    // -------------------------------

    let itemsResult =
        await supabaseRequest(
            "items",
            "GET",
            null,
            "?select=*&order=id.asc"
        );

    if(itemsResult.success){

        items =
            itemsResult.data || [];

    }else{

        console.error(
            "Items Load Error:",
            itemsResult.error
        );

        // Backup LocalStorage
        items =
            JSON.parse(
                localStorage.getItem("items")
            ) || [];
    }


    // -------------------------------
    // STOCK IN
    // -------------------------------

    let stockInResult =
        await supabaseRequest(
            "stock_in",
            "GET",
            null,
            "?select=*&order=date.asc,time.asc"
        );

    // -------------------------------
    // STOCK OUT
    // -------------------------------

    let stockOutResult =
        await supabaseRequest(
            "stock_issues",
            "GET",
            null,
            "?select=*&order=date.asc,time.asc"
        );


    history = [];


    // -------------------------------
    // STOCK IN HISTORY
    // -------------------------------

    if(stockInResult.success){

        let stockInData =
            stockInResult.data || [];


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

                quantity:
                    Number(
                        record.quantity || 0
                    ),

                unitCost:
                    Number(
                        record.unit_cost || 0
                    ),

                totalCost:
                    Number(
                        record.total_cost || 0
                    ),

                type:
                    "Stock In"

            });

        }

    }


    // -------------------------------
    // STOCK OUT HISTORY
    // -------------------------------

    if(stockOutResult.success){

        let stockOutData =
            stockOutResult.data || [];


        for(
            let i = 0;
            i < stockOutData.length;
            i++
        ){

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
                    Number(
                        record.quantity || 0
                    ),

                unitCost:
                    Number(
                        record.unit_cost || 0
                    ),

                totalCost:
                    Number(
                        record.total_cost || 0
                    ),

                type:
                    "Stock Issue"

            });

        }

    }


    // -------------------------------
    // SORT HISTORY
    // -------------------------------

    history.sort(
        function(a,b){

            let dateA =
                String(a.date || "") +
                String(a.time || "");

            let dateB =
                String(b.date || "") +
                String(b.time || "");

            return dateA.localeCompare(dateB);

        }
    );


    // -------------------------------
    // DEMAND HISTORY
    // -------------------------------

    demandHistory =
        JSON.parse(
            localStorage.getItem(
                "demandHistory"
            )
        ) || [];


    console.log(
        "Cost Data Loaded:",
        {
            items: items.length,
            history: history.length,
            demandHistory:
                demandHistory.length
        }
    );

}


// =====================================
// REFRESH DATA
// =====================================

async function refreshCostData(){

    await loadCostData();

}


// =====================================
// GET STOCK IN
// =====================================

function getStockIn(itemCode){

    let total = 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            record.type === "Stock In"

            &&

            String(
                record.itemCode || ""
            ).trim()

            ===

            String(
                itemCode || ""
            ).trim()

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
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            record.type === "Stock Issue"

            &&

            String(
                record.itemCode || ""
            ).trim()

            ===

            String(
                itemCode || ""
            ).trim()

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
// CURRENT STOCK
// Opening + In - Out
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
        getStockIn(
            item.code
        );


    let stockOut =
        getStockOut(
            item.code
        );


    let availableQty =
        openingStock +
        stockIn -
        stockOut;


    return availableQty;

}


// =====================================
// GET PURCHASE RATES
// =====================================

function getPurchaseRates(itemCode){

    let rates = [];

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

            record.type === "Stock In"

            &&

            String(
                record.itemCode || ""
            ).trim()

            ===

            String(
                itemCode || ""
            ).trim()

        ){

            let rate =
                Number(
                    record.unitCost || 0
                );


            if(rate > 0){

                rates.push(rate);


                if(
                    latestRecord === null
                ){

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

        }

    }


    let latestRate = 0;


    if(latestRecord){

        latestRate =
            Number(
                latestRecord.unitCost || 0
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

        item.opening_cost ??
        item.openingCost ??
        item.opening_rate ??
        item.openingRate ??
        item.unit_cost ??
        item.unitCost ??
        item.cost ??
        0

    );

}


// =====================================
// GET SUPPLIER
// =====================================

function getSupplier(item){

    if(item.supplier){

        return item.supplier;

    }


    if(item.supplier_name){

        return item.supplier_name;

    }


    if(item.supplierName){

        return item.supplierName;

    }


    return "-";

}


// =====================================
// GET DEMAND QUANTITY
// =====================================

function getDemandQuantity(
    demandItem
){

    return Number(

        demandItem.finalDemand ??

        demandItem.approvedQty ??

        demandItem.demandQuantity ??

        demandItem.demandQty ??

        demandItem.quantity ??

        0

    );

}


// =====================================
// GET DEMAND FOR ITEM
// =====================================

function getDemandForItem(
    itemCode,
    selectedMonth,
    selectedYear
){

    let total = 0;


    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let record =
            demandHistory[i];


        let demandMonth =
            String(
                record.demandMonth || ""
            );


        if(

            selectedMonth

            &&

            demandMonth !==
            selectedMonth

        ){

            continue;

        }


        if(

            selectedYear

            &&

            demandMonth.substring(0,4)

            !==

            String(selectedYear)

        ){

            continue;

        }


        let demandItems =
            record.demandItems
            ||
            record.items
            ||
            [];


        if(
            !Array.isArray(
                demandItems
            )
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

                    demandItem.code
                    ??
                    demandItem.itemCode
                    ??
                    ""

                ).trim();


            if(

                code ===

                String(
                    itemCode || ""
                ).trim()

            ){

                total +=
                    getDemandQuantity(
                        demandItem
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


    // HISTORY YEARS

    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let date =
            String(
                history[i].date || ""
            );


        let year =
            date.substring(
                0,
                4
            );


        if(

            year

            &&

            !years.includes(year)

        ){

            years.push(year);

        }

    }


    // DEMAND YEARS

    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let month =
            String(
                demandHistory[i]
                    .demandMonth || ""
            );


        let year =
            month.substring(
                0,
                4
            );


        if(

            year

            &&

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

async function showAllCost(){

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


    await refreshCostData();


    showCostTable(
        "",
        ""
    );

}


// =====================================
// SHOW COST REPORT
// =====================================

async function showCostReport(){

    await refreshCostData();


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
    // LOOP ITEMS
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
            item.item_name ??
            item.itemName ??
            "";


        let category =
            item.category ||
            "Other";


        let supplier =
            getSupplier(item);


        // SEARCH

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


        // AVAILABLE

        let availableQty =
            getCurrentStock(
                item
            );


        // RATES

        let rates =
            getPurchaseRates(
                code
            );


        let openingRate =
            getOpeningRate(
                item
            );


        let latestRate =
            rates.latestRate;


        if(
            latestRate <= 0
        ){

            latestRate =
                openingRate;

        }


        // DEMAND

        let approvedDemand =
            getDemandForItem(

                code,

                selectedMonth,

                selectedYear

            );


        // COST

        let availableCost =
            availableQty *
            latestRate;


        let approvedDemandCost =
            approvedDemand *
            latestRate;


        // TOTALS

        totalItems++;

        totalAvailableQty +=
            availableQty;

        totalDemandQty +=
            approvedDemand;

        totalStockCost +=
            availableCost;

        totalDemandCost +=
            approvedDemandCost;


        // CATEGORY

        if(
            !categoryTotals[category]
        ){

            categoryTotals[category] =
                0;

        }


        categoryTotals[category] +=
            availableCost;


        // SUPPLIER

        if(
            !supplierTotals[supplier]
        ){

            supplierTotals[supplier] =
                0;

        }


        supplierTotals[supplier] +=
            availableCost;


        // ROW

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


    // SUMMARY

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


    // FOOTER

    setCostText(
        "footerAvailableQty",
        totalAvailableQty.toFixed(2)
    );


    setCostText(
        "footerDemandQty",
        totalDemandQty.toFixed(2)
    );


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
        document.getElementById(id);


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

<title>${title}</title>

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
// COST HISTORY
// =====================================

function openCostHistory(){

    window.location.href =
        "Cost History.html";

}


// =====================================
// PAGE START
// =====================================

(async function(){

    await loadCostData();

    loadYears();

    showCostTable(
        "",
        ""
    );

})();
