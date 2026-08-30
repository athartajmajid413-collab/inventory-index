// =====================================
// COST MANAGEMENT JS
// SUPABASE VERSION
// MECAS ENGINEERING PVT LIMITED SUNDAR
// =====================================

let items = [];
let history = [];

let demandHistory =
    JSON.parse(
        localStorage.getItem("demandHistory")
    ) || [];

let costHistory = [];


// =====================================
// GET CURRENT MONTH
// =====================================

function getCurrentMonth(){

    let today = new Date();

    let year =
        today.getFullYear();

    let month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    return year + "-" + month;

}


// =====================================
// MONTH NAME
// =====================================

function getMonthName(month){

    if(!month){
        return "-";
    }

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

    return (
        monthNames[
            Number(parts[1]) - 1
        ]
        +
        " "
        +
        parts[0]
    );

}


// =====================================
// GET ITEM CODE
// =====================================

function getItemCode(item){

    if(!item){
        return "";
    }

    return String(
        item.code ??
        item.item_code ??
        ""
    ).trim();

}


// =====================================
// GET ITEM NAME
// =====================================

function getItemName(item){

    if(!item){
        return "-";
    }

    return (
        item.itemName ??
        item.item_name ??
        "-"
    );

}


// =====================================
// GET OPENING STOCK
// =====================================

function getOpeningStock(item){

    if(!item){
        return 0;
    }

    return Number(
        item.openingStock ??
        item.opening_stock ??
        0
    );

}


// =====================================
// GET UNIT
// =====================================

function getUnit(item){

    if(!item){
        return "";
    }

    return (
        item.unit ||
        ""
    );

}


// =====================================
// GET CATEGORY
// =====================================

function getCategory(item){

    if(!item){
        return "Other";
    }

    return (
        item.category ||
        "Other"
    );

}


// =====================================
// GET SUPPLIER
// =====================================

function getSupplier(item){

    if(!item){
        return "-";
    }

    return (
        item.supplier ??
        item.supplierName ??
        item.supplier_name ??
        "-"
    );

}


// =====================================
// LOAD ALL COST DATA
// =====================================

async function refreshCostData(){

    console.log(
        "Loading Cost Data from Supabase..."
    );


    // =================================
    // ITEMS
    // =================================

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

        console.log(
            "Cost Items Loaded:",
            items.length
        );

    }else{

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
            "?select=*&order=date.asc,time.asc"
        );


    if(stockInResult.success){

        history =
            stockInResult.data || [];

        console.log(
            "Stock In Loaded:",
            history.length
        );

    }else{

        console.error(
            "Stock In Load Error:",
            stockInResult.error
        );

        history = [];

    }


    // =================================
    // STOCK OUT
    // =================================

    let stockOutResult =
        await supabaseRequest(
            "stock_issues",
            "GET",
            null,
            "?select=*&order=date.asc,time.asc"
        );


    if(stockOutResult.success){

        let stockOutData =
            stockOutResult.data || [];


        console.log(
            "Stock Out Loaded:",
            stockOutData.length
        );


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

    }else{

        console.error(
            "Stock Out Load Error:",
            stockOutResult.error
        );

    }


    // =================================
    // DEMAND HISTORY
    // =================================

    demandHistory =
        JSON.parse(
            localStorage.getItem(
                "demandHistory"
            )
        ) || [];


    // =================================
    // COST HISTORY
    // =================================

    await loadCostHistory();

}


// =====================================
// LOAD COST HISTORY
// =====================================

async function loadCostHistory(){

    let result =
        await supabaseRequest(
            "cost_history",
            "GET",
            null,
            "?select=*&order=month.asc"
        );


    if(!result.success){

        console.error(
            "Cost History Load Error:",
            result.error
        );

        costHistory = [];

        return false;
    }


    costHistory =
        result.data || [];


    console.log(
        "Cost History Loaded:",
        costHistory.length
    );


    return true;

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
            record.type !==
            "Stock In"
        ){

            continue;
        }


        let code =
            String(
                record.item_code ??
                record.itemCode ??
                ""
            ).trim();


        if(
            code ===
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
            record.type !==
            "Stock Issue"
        ){

            continue;
        }


        let code =
            String(
                record.itemCode ??
                record.item_code ??
                ""
            ).trim();


        if(
            code ===
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
// =====================================

function getCurrentStock(item){

    if(!item){
        return 0;
    }


    let openingStock =
        getOpeningStock(item);


    let stockIn =
        getStockIn(
            getItemCode(item)
        );


    let stockOut =
        getStockOut(
            getItemCode(item)
        );


    return Math.max(
        0,
        openingStock +
        stockIn -
        stockOut
    );

}


// =====================================
// GET PURCHASE RATES
// =====================================

function getPurchaseRates(itemCode){

    let rates = [];

    let latestRecord = null;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(
            record.type !==
            "Stock In"
        ){

            continue;
        }


        let code =
            String(
                record.item_code ??
                record.itemCode ??
                ""
            ).trim();


        if(
            code !==
            String(
                itemCode || ""
            ).trim()
        ){

            continue;
        }


        let rate =
            Number(
                record.unit_cost ??
                record.unitCost ??
                0
            );


        if(rate <= 0){
            continue;
        }


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


    let latestRate = 0;


    if(latestRecord){

        latestRate =
            Number(
                latestRecord.unit_cost ??
                latestRecord.unitCost ??
                0
            );

    }


    return {

        minRate:
            rates.length
            ? Math.min(...rates)
            : 0,

        maxRate:
            rates.length
            ? Math.max(...rates)
            : 0,

        latestRate:
            latestRate

    };

}


// =====================================
// OPENING RATE
// =====================================

function getOpeningRate(item){

    if(!item){
        return 0;
    }


    return Number(

        item.openingCost ??
        item.opening_cost ??
        item.openingRate ??
        item.opening_rate ??
        item.unitCost ??
        item.unit_cost ??
        item.cost ??
        0

    );

}


// =====================================
// DEMAND QUANTITY
// =====================================

function getDemandQuantity(
    demandItem
){

    if(!demandItem){
        return 0;
    }


    return Number(

        demandItem.finalDemand ??
        demandItem.final_demand ??
        demandItem.approvedQty ??
        demandItem.approved_qty ??
        demandItem.demandQuantity ??
        demandItem.demand_quantity ??
        demandItem.demandQty ??
        demandItem.demand_qty ??
        demandItem.quantity ??
        0

    );

}


// =====================================
// GET DEMAND
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
                record.demandMonth ??
                record.demand_month ??
                ""
            );


        if(
            selectedMonth &&
            demandMonth !==
            selectedMonth
        ){

            continue;
        }


        if(
            selectedYear &&
            demandMonth.substring(0,4) !==
            String(selectedYear)
        ){

            continue;
        }


        let demandItems =
            record.demandItems ??
            record.demand_items ??
            record.items ??
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

                    demandItem.code ??
                    demandItem.itemCode ??
                    demandItem.item_code ??
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
// CREATE MONTHLY COST RECORD
// =====================================

function createMonthlyCostRecord(
    month
){

    let totalItems = 0;

    let totalStockCost = 0;

    let totalDemandQty = 0;

    let totalDemandCost = 0;

    let itemDetails = [];


    // =================================
    // ALL ITEMS
    // =================================

    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let item =
            items[i];


        let code =
            getItemCode(item);


        let availableQty =
            getCurrentStock(item);


        let rates =
            getPurchaseRates(code);


        let rate =
            rates.latestRate;


        if(rate <= 0){

            rate =
                getOpeningRate(item);

        }


        let availableStockCost =
            availableQty *
            rate;


        let approvedDemandQty =
            getDemandForItem(
                code,
                month,
                ""
            );


        let approvedDemandCost =
            approvedDemandQty *
            rate;


        totalItems++;

        totalStockCost +=
            availableStockCost;

        totalDemandQty +=
            approvedDemandQty;

        totalDemandCost +=
            approvedDemandCost;


        itemDetails.push({

            category:
                getCategory(item),

            code:
                code || "-",

            itemName:
                getItemName(item),

            specification:
                item.specification ??
                "-",

            source:
                item.source ??
                "-",

            rate:
                rate,

            availableQuantity:
                availableQty,

            availableStockCost:
                availableStockCost,

            approvedDemandQty:
                approvedDemandQty,

            approvedDemandCost:
                approvedDemandCost

        });

    }


    let today =
        new Date();


    let saveDate =
        today.toISOString()
        .split("T")[0];


    return {

        month:
            month,

        month_name:
            getMonthName(month),

        year:
            month.substring(0,4),

        total_items:
            totalItems,

        available_stock_cost:
            totalStockCost,

        approved_demand_qty:
            totalDemandQty,

        approved_demand_cost:
            totalDemandCost,

        items:
            itemDetails,

        saved_date:
            saveDate

    };

}


// =====================================
// SAVE MONTHLY COST TO SUPABASE
// =====================================

async function saveMonthlyCost(
    month,
    showMessage
){

    console.log(
        "Saving Cost History:",
        month
    );


    let newRecord =
        createMonthlyCostRecord(
            month
        );


    // =================================
    // CHECK EXISTING RECORD
    // =================================

    let existingResult =
        await supabaseRequest(

            "cost_history",

            "GET",

            null,

            "?month=eq." +
            encodeURIComponent(month) +
            "&select=id"

        );


    if(!existingResult.success){

        console.error(
            "Cost History Check Error:",
            existingResult.error
        );

        alert(
            "Cost History check nahi ho saki!\n\n" +
            JSON.stringify(
                existingResult.error
            )
        );

        return false;
    }


    // =================================
    // UPDATE
    // =================================

    if(
        existingResult.data &&
        existingResult.data.length > 0
    ){

        let id =
            existingResult.data[0].id;


        let updateResult =
            await supabaseRequest(

                "cost_history",

                "PATCH",

                newRecord,

                "?id=eq." +
                id

            );


        if(!updateResult.success){

            console.error(
                "Cost History Update Error:",
                updateResult.error
            );

            alert(
                "Cost History update nahi hui!\n\n" +
                JSON.stringify(
                    updateResult.error
                )
            );

            return false;
        }


        console.log(
            "Cost History Updated:",
            month
        );

    }


    // =================================
    // INSERT
    // =================================

    else{

        let insertResult =
            await supabaseRequest(

                "cost_history",

                "POST",

                newRecord

            );


        if(!insertResult.success){

            console.error(
                "Cost History Insert Error:",
                insertResult.error
            );

            alert(
                "Cost History save nahi hui!\n\n" +
                JSON.stringify(
                    insertResult.error
                )
            );

            return false;
        }


        console.log(
            "Cost History Inserted:",
            month
        );

    }


    // =================================
    // RELOAD SUPABASE DATA
    // =================================

    await loadCostHistory();


    loadYears();


    if(showMessage){

        alert(
            "Cost History successfully saved!\n\n" +
            getMonthName(month)
        );

    }


    showCostHistoryFromCostPage();


    return true;

}


// =====================================
// AUTO SAVE CURRENT MONTH
// =====================================

async function autoSaveCurrentMonth(){

    let currentMonth =
        getCurrentMonth();


    await saveMonthlyCost(
        currentMonth,
        false
    );

}


// =====================================
// MANUAL SAVE CURRENT COST
// =====================================

async function saveCurrentCostHistory(){

    let currentMonth =
        getCurrentMonth();


    await saveMonthlyCost(
        currentMonth,
        true
    );

}


// =====================================
// SHOW COST HISTORY
// =====================================

function showCostHistoryFromCostPage(){

    // Cost History page function
    // available ho to use karein

    if(
        typeof showCostHistory ===
        "function"
    ){

        try{

            showCostHistory();

        }catch(error){

            console.log(
                "Cost History display skipped:",
                error
            );

        }

    }

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

        let year =
            String(
                history[i].date || ""
            ).substring(
                0,
                4
            );


        if(
            year &&
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
                demandHistory[i].demandMonth ||
                ""
            );


        let year =
            month.substring(
                0,
                4
            );


        if(
            year &&
            !years.includes(year)
        ){

            years.push(year);

        }

    }


    // COST HISTORY YEARS

    for(
        let i = 0;
        i < costHistory.length;
        i++
    ){

        let year =
            String(
                costHistory[i].year ||
                ""
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


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let item =
            items[i];


        let code =
            getItemCode(item);


        let itemName =
            getItemName(item);


        let category =
            getCategory(item);


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


        // STOCK

        let availableQty =
            getCurrentStock(item);


        // RATES

        let rates =
            getPurchaseRates(
                code
            );


        let openingRate =
            getOpeningRate(item);


        let latestRate =
            rates.latestRate;


        if(latestRate <= 0){

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
            getUnit(item),

            approvedDemand.toFixed(2) +
            " " +
            getUnit(item),

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


        body.appendChild(row);

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
        Object.keys(
            data
        ).sort();


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


        row.appendChild(cell1);

        row.appendChild(cell2);


        body.appendChild(row);

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
        Object.keys(
            data
        ).sort();


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


        row.appendChild(cell1);

        row.appendChild(cell2);

        row.appendChild(cell3);


        body.appendChild(row);

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

        title =
            "COST MANAGEMENT - " +
            getMonthName(month);

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
// OPEN COST HISTORY
// =====================================

function openCostHistory(){

    window.location.href =
        "Cost History.html";

}


// =====================================
// PAGE START
// =====================================

(async function(){

    await refreshCostData();

    loadYears();

    showAllCost();

    // =================================
    // AUTO SAVE CURRENT MONTH
    // =================================

    await autoSaveCurrentMonth();

})();
