// =====================================
// COST MANAGEMENT
// SUPABASE VERSION
// MONTHLY LAST BALANCE
// AVAILABLE QUANTITY = LAST BALANCE
// =====================================


// =====================================
// SUPABASE DATA
// =====================================

let items = [];
let stockInHistory = [];
let stockOutHistory = [];
let costHistory = [];
let demandHistory = [];


// =====================================
// LOAD ALL DATA FROM SUPABASE
// =====================================

async function loadCostDataFromSupabase(){

    console.log("=====================================");
    console.log("LOADING COST DATA FROM SUPABASE");
    console.log("=====================================");

    try{

        // =================================
        // ITEMS
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


        // =================================
        // NUMERIC ITEM SORT
        // =================================

        items.sort(function(a,b){

            let codeA =
                String(a.code || "").trim();

            let codeB =
                String(b.code || "").trim();

            let numberA =
                parseInt(
                    codeA.replace(/\D/g,""),
                    10
                );

            let numberB =
                parseInt(
                    codeB.replace(/\D/g,""),
                    10
                );

            if(isNaN(numberA)){
                numberA = Infinity;
            }

            if(isNaN(numberB)){
                numberB = Infinity;
            }

            return numberA - numberB;

        });


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

        if(!stockInResult.success){

            console.error(
                "Stock In Load Error:",
                stockInResult.error
            );

            throw stockInResult.error;
        }

        stockInHistory =
            stockInResult.data || [];


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

        if(!stockOutResult.success){

            console.error(
                "Stock Out Load Error:",
                stockOutResult.error
            );

            throw stockOutResult.error;
        }

        stockOutHistory =
            stockOutResult.data || [];


        // =================================
        // COST HISTORY
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

        }else{

            console.error(
                "Demand History Load Error:",
                demandResult.error
            );

            demandHistory = [];

        }


        // =================================
        // YEARS
        // =================================

        loadYears();


        // =================================
        // SHOW ALL
        // =================================

        showAllCost();


        console.log(
            "SUPABASE COST DATA LOADED"
        );

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
// GET ITEM CODE
// =====================================

function getItemCode(item){

    if(!item){
        return "";
    }

    return String(
        item.code ??
        item.item_code ??
        item.itemCode ??
        item.id ??
        ""
    ).trim();

}


// =====================================
// GET RECORD ITEM CODE
// =====================================

function getRecordItemCode(record){

    if(!record){
        return "";
    }

    return String(

        record.item_code ??
        record.itemCode ??
        record.code ??
        record.item_id ??
        record.itemId ??
        ""

    ).trim();

}


// =====================================
// GET RECORD QUANTITY
// =====================================

function getRecordQuantity(record){

    if(!record){
        return 0;
    }

    let value =
        record.quantity ??
        record.qty ??
        record.stock_in_qty ??
        record.stock_out_qty ??
        record.issue_qty ??
        record.stock_quantity ??
        0;

    return Number(value || 0);

}


// =====================================
// GET STOCK IN
// =====================================

function getStockIn(itemCode){

    let total = 0;

    let target =
        String(itemCode || "").trim();


    for(
        let i = 0;
        i < stockInHistory.length;
        i++
    ){

        let record =
            stockInHistory[i];

        let code =
            getRecordItemCode(record);


        if(code !== target){
            continue;
        }


        total +=
            getRecordQuantity(record);

    }


    return total;

}


// =====================================
// GET STOCK OUT
// =====================================

function getStockOut(itemCode){

    let total = 0;

    let target =
        String(itemCode || "").trim();


    for(
        let i = 0;
        i < stockOutHistory.length;
        i++
    ){

        let record =
            stockOutHistory[i];

        let code =
            getRecordItemCode(record);


        if(code !== target){
            continue;
        }


        total +=
            getRecordQuantity(record);

    }


    return total;

}


// =====================================
// GET OPENING STOCK
// SUPPORTS:
// opening_stock
// opening_Stock
// openingStock
// =====================================

function getOpeningStock(item){

    if(!item){
        return 0;
    }

    let value =
        item.opening_stock ??
        item.opening_Stock ??
        item.openingStock ??
        0;

    return Number(value || 0);

}


// =====================================
// GET CURRENT STOCK
// =====================================

function getCurrentStock(item){

    if(!item){
        return 0;
    }

    let opening =
        getOpeningStock(item);

    let stockIn =
        getStockIn(
            getItemCode(item)
        );

    let stockOut =
        getStockOut(
            getItemCode(item)
        );

    let balance =
        opening +
        stockIn -
        stockOut;


    if(balance < 0){
        balance = 0;
    }


    return balance;

}


// =====================================
// NORMALIZE DATE
// =====================================

function normalizeDateValue(value){

    if(!value){
        return "";
    }

    let text =
        String(value).trim();


    // =================================
    // YYYY-MM-DD
    // =================================

    let dateOnly =
        text.match(
            /^(\d{4}-\d{2}-\d{2})/
        );


    if(dateOnly){

        return dateOnly[1];

    }


    // =================================
    // DD-MM-YYYY
    // =================================

    let dmy =
        text.match(
            /^(\d{2})-(\d{2})-(\d{4})/
        );


    if(dmy){

        return (
            dmy[3] +
            "-" +
            dmy[2] +
            "-" +
            dmy[1]
        );

    }


    // =================================
    // DD/MM/YYYY
    // =================================

    let slash =
        text.match(
            /^(\d{2})\/(\d{2})\/(\d{4})/
        );


    if(slash){

        return (
            slash[3] +
            "-" +
            slash[2] +
            "-" +
            slash[1]
        );

    }


    // =================================
    // ISO / DATE OBJECT
    // =================================

    let parsed =
        new Date(text);


    if(!isNaN(parsed.getTime())){

        let year =
            parsed.getFullYear();

        let month =
            String(
                parsed.getMonth() + 1
            ).padStart(2,"0");

        let day =
            String(
                parsed.getDate()
            ).padStart(2,"0");

        return (
            year +
            "-" +
            month +
            "-" +
            day
        );

    }


    return "";

}


// =====================================
// GET RECORD DATE
// SUPPORT MANY POSSIBLE FIELD NAMES
// =====================================

function getRecordDate(record){

    if(!record){
        return "";
    }

    let value =

        record.date ??
        record.stock_date ??
        record.stockDate ??
        record.issue_date ??
        record.issueDate ??
        record.transaction_date ??
        record.transactionDate ??
        record.in_date ??
        record.out_date ??
        record.created_at ??
        record.createdAt ??
        "";


    return normalizeDateValue(value);

}


// =====================================
// GET RECORD TIME
// =====================================

function getRecordTime(record){

    if(!record){
        return "00:00:00";
    }

    let time = String(

        record.time ??
        record.stock_time ??
        record.stockTime ??
        record.issue_time ??
        record.issueTime ??
        ""

    ).trim();


    if(!time){
        return "00:00:00";
    }


    if(
        /^\d{2}:\d{2}$/.test(time)
    ){

        return time + ":00";

    }


    let match =
        time.match(
            /(\d{2}:\d{2}(?::\d{2})?)/
        );


    if(match){

        let result =
            match[1];

        if(result.length === 5){
            result += ":00";
        }

        return result;

    }


    return "00:00:00";

}


// =====================================
// GET DEMAND DATE
// =====================================

function getDemandDate(record){

    if(!record){
        return "";
    }

    return (

        record.demand_date ??
        record.demandDate ??
        record.generate_date ??
        record.generateDate ??
        record.date ??
        ""

    );

}


// =====================================
// GET DEMAND MONTH
// =====================================

function getDemandMonth(record){

    if(!record){
        return "";
    }


    let value =

        record.demand_month ??
        record.demandMonth ??
        "";


    let text =
        String(value || "").trim();


    // =================================
    // YYYY-MM
    // =================================

    if(
        /^\d{4}-\d{2}/.test(text)
    ){

        return text.substring(0,7);

    }


    // =================================
    // FALLBACK
    // =================================

    let fallback =

        record.generate_date ??
        record.generateDate ??
        record.date ??
        "";


    let date =
        String(
            fallback || ""
        ).trim();


    if(
        /^\d{4}-\d{2}/.test(date)
    ){

        return date.substring(0,7);

    }


    return "";

}


// =====================================
// GET DEMAND RECORD FOR MONTH
// =====================================

function getDemandRecordForMonth(
    selectedMonth
){

    if(!selectedMonth){
        return null;
    }


    let targetMonth =
        String(
            selectedMonth
        ).substring(0,7);


    let matches = [];


    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let record =
            demandHistory[i];


        let demandMonth =
            getDemandMonth(record);


        if(
            demandMonth ===
            targetMonth
        ){

            matches.push(record);

        }

    }


    if(matches.length === 0){
        return null;
    }


    // =================================
    // LATEST DEMAND RECORD
    // =================================

    matches.sort(function(a,b){

        let idA =
            Number(a.id || 0);

        let idB =
            Number(b.id || 0);


        if(
            idA &&
            idB &&
            idA !== idB
        ){

            return idB - idA;

        }


        let dateA =
            String(
                getDemandDate(a) || ""
            );


        let dateB =
            String(
                getDemandDate(b) || ""
            );


        return dateB.localeCompare(dateA);

    });


    return matches[0];

}


// =====================================
// CHECK WHETHER RECORD IS BEFORE
// DEMAND DATE
// =====================================

function recordIsBeforeOrEqualDemandDate(
    record,
    demandDateValue
){

    let recordDate =
        getRecordDate(record);


    let demandText =
        String(
            demandDateValue || ""
        ).trim();


    let demandDate =
        normalizeDateValue(
            demandText
        );


    if(
        !recordDate ||
        !demandDate
    ){

        return false;

    }


    // =================================
    // RECORD BEFORE DEMAND DATE
    // =================================

    if(recordDate < demandDate){
        return true;
    }


    // =================================
    // RECORD AFTER DEMAND DATE
    // =================================

    if(recordDate > demandDate){
        return false;
    }


    // =================================
    // SAME DATE
    // =================================

    // اگر demand_date میں time نہیں ہے
    // تو پورا دن شامل ہوگا

    let demandHasTime =
        /T\d{2}:\d{2}/.test(
            demandText
        ) ||
        /\s\d{2}:\d{2}/.test(
            demandText
        );


    if(!demandHasTime){

        return true;

    }


    // =================================
    // EXACT TIME
    // =================================

    let demandTime =
        "23:59:59";


    let timeMatch =
        demandText.match(
            /(\d{2}:\d{2}(?::\d{2})?)/
        );


    if(timeMatch){

        demandTime =
            timeMatch[1];

        if(
            demandTime.length === 5
        ){

            demandTime += ":00";

        }

    }


    let recordTime =
        getRecordTime(record);


    return (
        recordTime <=
        demandTime
    );

}


// =====================================
// GET BALANCE AT DEMAND DATE
//
// Opening Stock
// + Stock In ON / BEFORE Demand Date
// - Stock Out ON / BEFORE Demand Date
// =====================================

function getBalanceAtDate(
    item,
    demandDateValue
){

    if(!item){
        return 0;
    }


    if(!demandDateValue){

        return getCurrentStock(item);

    }


    let itemCode =
        getItemCode(item);


    let balance =
        getOpeningStock(item);


    // =================================
    // STOCK IN
    // =================================

    for(
        let i = 0;
        i < stockInHistory.length;
        i++
    ){

        let record =
            stockInHistory[i];


        let code =
            getRecordItemCode(record);


        if(code !== itemCode){
            continue;
        }


        if(
            recordIsBeforeOrEqualDemandDate(
                record,
                demandDateValue
            )
        ){

            balance +=
                getRecordQuantity(record);

        }

    }


    // =================================
    // STOCK OUT
    // =================================

    for(
        let i = 0;
        i < stockOutHistory.length;
        i++
    ){

        let record =
            stockOutHistory[i];


        let code =
            getRecordItemCode(record);


        if(code !== itemCode){
            continue;
        }


        if(
            recordIsBeforeOrEqualDemandDate(
                record,
                demandDateValue
            )
        ){

            balance -=
                getRecordQuantity(record);

        }

    }


    // =================================
    // NEVER SHOW NEGATIVE
    // =================================

    if(balance < 0){
        balance = 0;
    }


    return balance;

}


// =====================================
// GET MONTHLY DISPLAY QUANTITY
//
// MONTH SELECTED:
//     LAST BALANCE
//
// NO MONTH:
//     CURRENT STOCK
// =====================================

function getDisplayQuantity(
    item,
    selectedMonth
){

    // =================================
    // NO MONTH
    // =================================

    if(!selectedMonth){

        return getCurrentStock(item);

    }


    // =================================
    // FIND SELECTED MONTH DEMAND
    // =================================

    let demandRecord =
        getDemandRecordForMonth(
            selectedMonth
        );


    if(!demandRecord){

        console.warn(
            "No Demand Record Found:",
            selectedMonth,
            getItemCode(item)
        );

        return 0;

    }


    // =================================
    // GET DEMAND DATE
    // =================================

    let demandDate =
        getDemandDate(
            demandRecord
        );


    if(!demandDate){

        console.warn(
            "Demand Date Missing:",
            selectedMonth
        );

        return 0;

    }


    // =================================
    // LAST BALANCE
    // =================================

    let balance =
        getBalanceAtDate(
            item,
            demandDate
        );


    console.log(
        "LAST BALANCE:",
        getItemCode(item),
        selectedMonth,
        demandDate,
        balance
    );


    return balance;

}


// =====================================
// GET PURCHASE RATES
// =====================================

function getPurchaseRates(itemCode, cutoffDate = null) {

    const rates = stockInHistory
        .filter(record => {

            const code =
                record.item_code ??
                record.itemCode ??
                record.code ??
                record.item_id ??
                record.itemId;

            if (String(code) !== String(itemCode)) {
                return false;
            }

            const rate = Number(
                record.unit_cost ??
                record.unitCost ??
                record.rate ??
                record.purchase_rate ??
                record.purchaseRate ??
                0
            );

            if (!rate || rate <= 0) {
                return false;
            }

            // -----------------------------------------
            // اگر historical date دی گئی ہے
            // تو صرف اس date تک کے Stock In لیں
            // -----------------------------------------
            if (cutoffDate) {

                const recordDate = getRecordDate(record);

                if (!recordDate) {
                    return false;
                }

                const demandDate = normalizeDateValue(cutoffDate);
                const stockDate = normalizeDateValue(recordDate);

                if (!demandDate || !stockDate) {
                    return false;
                }

                // Demand Date کے بعد کا rate نہیں لینا
                if (stockDate > demandDate) {
                    return false;
                }
            }

            return true;
        })
        .map(record => {

            const recordDate = getRecordDate(record);
            const recordTime = getRecordTime(record);

            const rate = Number(
                record.unit_cost ??
                record.unitCost ??
                record.rate ??
                record.purchase_rate ??
                record.purchaseRate ??
                0
            );

            return {
                rate: rate,
                date: normalizeDateValue(recordDate),
                time: recordTime || "00:00:00",
                timestamp:
                    normalizeDateValue(recordDate) +
                    " " +
                    (recordTime || "00:00:00")
            };
        });

    // Latest date/time پہلے
    rates.sort((a, b) => {

        if (a.timestamp < b.timestamp) return 1;
        if (a.timestamp > b.timestamp) return -1;

        return 0;
    });

    return rates;
}

// =====================================
// GET OPENING RATE
// =====================================

function getOpeningRate(item){

    return Number(
        item.opening_cost ??
        item.openingCost ??
        0
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
// GET APPROVED DEMAND
// =====================================

function getDemandForItem(
    itemCode,
    selectedMonth,
    selectedYear
){

    let total = 0;


    let targetCode =
        String(
            itemCode || ""
        ).trim();


    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let record =
            demandHistory[i];


        let demandMonth =
            getDemandMonth(record);


        // =================================
        // MONTH FILTER
        // =================================

        if(
            selectedMonth &&
            demandMonth !==
            String(
                selectedMonth
            ).substring(0,7)
        ){

            continue;

        }


        // =================================
        // YEAR FILTER
        // =================================

        if(
            selectedYear &&
            demandMonth.substring(0,4) !==
            String(selectedYear)
        ){

            continue;

        }


        // =================================
        // DEMAND ITEMS
        // =================================

        let demandItems =

            record.demand_items ??
            record.demandItems ??
            record.items ??
            record.demands ??
            [];


        if(
            typeof demandItems ===
            "string"
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
            !Array.isArray(
                demandItems
            )
        ){

            continue;

        }


        // =================================
        // FIND ITEM
        // =================================

        for(
            let j = 0;
            j < demandItems.length;
            j++
        ){

            let demandItem =
                demandItems[j];


            let code =
                String(

                    demandItem.itemCode ??
                    demandItem.item_code ??
                    demandItem.code ??
                    demandItem.itemId ??
                    demandItem.item_id ??
                    ""

                ).trim();


            if(code !== targetCode){
                continue;
            }


            let approvedQty =

                demandItem.finalDemand ??
                demandItem.final_demand ??
                demandItem.approvedQty ??
                demandItem.approved_qty ??
                demandItem.approvedDemandQty ??
                demandItem.approved_demand_qty ??
                0;


            if(
                typeof approvedQty ===
                "string"
            ){

                let match =
                    approvedQty.match(
                        /-?\d+(?:\.\d+)?/
                    );


                approvedQty =
                    match
                    ? Number(match[0])
                    : 0;

            }else{

                approvedQty =
                    Number(
                        approvedQty || 0
                    );

            }


            total +=
                approvedQty;

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


    function addYear(year){

        year =
            String(
                year || ""
            ).trim();


        if(
            /^\d{4}$/.test(year) &&
            !years.includes(year)
        ){

            years.push(year);

        }

    }


    // STOCK IN

    for(
        let i = 0;
        i < stockInHistory.length;
        i++
    ){

        addYear(
            getRecordDate(
                stockInHistory[i]
            ).substring(0,4)
        );

    }


    // STOCK OUT

    for(
        let i = 0;
        i < stockOutHistory.length;
        i++
    ){

        addYear(
            getRecordDate(
                stockOutHistory[i]
            ).substring(0,4)
        );

    }


    // DEMAND

    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        addYear(
            getDemandMonth(
                demandHistory[i]
            ).substring(0,4)
        );

    }


    // COST HISTORY

    for(
        let i = 0;
        i < costHistory.length;
        i++
    ){

        addYear(
            costHistory[i].year
        );

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

function showCostTable(selectedMonth = "", selectedYear = "") {

    const tbody = document.getElementById("costTableBody");

    if (!tbody) {
        console.error("costTableBody not found");
        return;
    }

    tbody.innerHTML = "";

    let totalStockCost = 0;
    let totalDemandCost = 0;

    // -----------------------------------------
    // Selected month کی Demand نکالیں
    // -----------------------------------------
    let selectedDemandRecord = null;
    let selectedDemandDate = null;

    if (selectedMonth) {

        selectedDemandRecord =
            getDemandRecordForMonth(selectedMonth);

        if (selectedDemandRecord) {

            selectedDemandDate =
                getDemandDate(selectedDemandRecord);
        }
    }

    items.forEach((item, index) => {

        const itemCode =
            item.code ??
            item.item_code ??
            item.itemCode ??
            "";

        // -----------------------------------------
        // Available Quantity
        // -----------------------------------------
        let availableQty;

        if (selectedMonth && selectedDemandDate) {

            // Selected month کا Last Balance
            availableQty =
                getBalanceAtDate(
                    item,
                    selectedDemandDate
                );

        } else {

            // Current stock
            availableQty =
                getCurrentStock(item);
        }

        availableQty = Number(availableQty) || 0;

        // -----------------------------------------
        // Latest Rate
        // -----------------------------------------
        let latestRate = 0;

        if (selectedMonth && selectedDemandDate) {

            // Historical Latest Rate
            const historicalRates =
                getPurchaseRates(
                    itemCode,
                    selectedDemandDate
                );

            if (historicalRates.length > 0) {

                latestRate =
                    Number(historicalRates[0].rate) || 0;
            }

        } else {

            // Current Latest Rate
            const currentRates =
                getPurchaseRates(itemCode);

            if (currentRates.length > 0) {

                latestRate =
                    Number(currentRates[0].rate) || 0;
            }
        }

        // -----------------------------------------
        // Opening Cost fallback
        // -----------------------------------------
        if (!latestRate || latestRate <= 0) {

            latestRate =
                Number(getOpeningRate(item)) || 0;
        }

        // -----------------------------------------
        // Approved Demand
        // -----------------------------------------
        const approvedDemand =
            Number(
                getDemandForItem(
                    itemCode,
                    selectedMonth,
                    selectedYear
                )
            ) || 0;

        // -----------------------------------------
        // Costs
        // -----------------------------------------
        const availableCost =
            availableQty * latestRate;

        const demandCost =
            approvedDemand * latestRate;

        totalStockCost += availableCost;
        totalDemandCost += demandCost;

        // -----------------------------------------
        // Row
        // -----------------------------------------
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.category ?? "-"}</td>

            <td>${item.id ?? (index + 1)}</td>

            <td>${item.item_name ?? "-"}</td>

            <td>${getSupplier(item)}</td>

            <td>
                Rs. ${Number(getOpeningRate(item) || 0).toFixed(2)}
            </td>

            <td>
                Rs. ${getMinRate(itemCode).toFixed(2)}
            </td>

            <td>
                Rs. ${getMaxRate(itemCode).toFixed(2)}
            </td>

            <td>
                Rs. ${latestRate.toFixed(2)}
            </td>

            <td>
                ${availableQty.toFixed(2)}
                ${item.unit ?? ""}
            </td>

            <td>
                ${approvedDemand.toFixed(2)}
                ${item.unit ?? ""}
            </td>

            <td>
                Rs. ${availableCost.toFixed(2)}
            </td>

            <td>
                Rs. ${demandCost.toFixed(2)}
            </td>
        `;

        tbody.appendChild(tr);
    });

    // -----------------------------------------
    // Footer totals
    // -----------------------------------------
    const footerStockCost =
        document.getElementById("footerStockCost");

    const footerDemandCost =
        document.getElementById("footerDemandCost");

    if (footerStockCost) {
        footerStockCost.textContent =
            "Rs. " + totalStockCost.toFixed(2);
    }

    if (footerDemandCost) {
        footerDemandCost.textContent =
            "Rs. " + totalDemandCost.toFixed(2);
    }
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
        Object.keys(data).sort();


    let supplierTotal = 0;


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
// ADD COST HISTORY
// =====================================

async function addCostHistory(){

    let monthElement =
        document.getElementById(
            "reportMonth"
        );


    let selectedMonth =
        monthElement
        ? monthElement.value
        : "";


    if(!selectedMonth){

        alert(
            "براہ کرم پہلے Month منتخب کریں۔"
        );

        return;

    }


    let demandRecord =
        getDemandRecordForMonth(
            selectedMonth
        );


    if(!demandRecord){

        alert(
            "اس Month کی Demand History موجود نہیں ہے۔"
        );

        return;

    }


    let demandDate =
        getDemandDate(
            demandRecord
        );


    if(!demandDate){

        alert(
            "اس Month کی Demand Date موجود نہیں ہے۔"
        );

        return;

    }


    let monthParts =
        String(
            selectedMonth
        ).split("-");


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


    let monthName =
        monthNames[
            Number(monthParts[1]) - 1
        ] ||
        selectedMonth;


    let confirmSave =
        confirm(

            monthName +
            " " +
            monthParts[0] +
            " کی Cost History save کریں؟\n\n" +

            "Last Balance Date: " +
            String(demandDate).substring(0,19)

        );


    if(!confirmSave){
        return;
    }


    // =================================
    // SNAPSHOT
    // =================================

    let historyItems = [];

    let totalItems = 0;
    let totalStockCost = 0;
    let totalDemandQty = 0;
    let totalDemandCost = 0;


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let item =
            items[i];


        let code =
            getItemCode(item);


        if(!code){
            continue;
        }


        // =================================
        // LAST BALANCE
        // =================================

        let lastBalance =
            getBalanceAtDate(
                item,
                demandDate
            );


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

                ""

            );


        // =================================
        // COST
        // =================================

        let availableCost =
            lastBalance *
            latestRate;


        let approvedDemandCost =
            approvedDemand *
            latestRate;


        // =================================
        // TOTALS
        // =================================

        totalItems++;

        totalStockCost +=
            availableCost;

        totalDemandQty +=
            approvedDemand;

        totalDemandCost +=
            approvedDemandCost;


        // =================================
        // HISTORY ITEM
        // =================================

        historyItems.push({

            code:
                code,

            item_code:
                code,

            item_name:
                item.item_name || "",

            category:
                item.category || "Other",

            supplier:
                getSupplier(item),

            unit:
                item.unit || "",

            opening_rate:
                openingRate,

            opening_cost:
                openingRate,

            min_rate:
                rates.minRate,

            max_rate:
                rates.maxRate,

            latest_rate:
                latestRate,

            available_quantity:
                lastBalance,

            last_balance:
                lastBalance,

            approved_demand:
                approvedDemand,

            available_cost:
                availableCost,

            approved_demand_cost:
                approvedDemandCost,

            demand_date:
                demandDate

        });

    }


    // =================================
    // PAYLOAD
    // =================================

    let payload = {

        month:
            selectedMonth,

        month_name:
            monthName,

        year:
            Number(monthParts[0]),

        total_items:
            totalItems,

        total_stock_cost:
            totalStockCost,

        approved_demand_qty:
            totalDemandQty,

        total_demand_cost:
            totalDemandCost,

        saved_date:
            new Date().toISOString(),

        items:
            historyItems

    };


    console.log(
        "Cost History Payload:",
        payload
    );


    try{

        // =================================
        // CHECK EXISTING
        // =================================

        let existingResult =
            await supabaseRequest(

                "cost_history",

                "GET",

                null,

                "?select=id&month=eq." +
                encodeURIComponent(
                    selectedMonth
                )

            );


        if(
            !existingResult.success
        ){

            throw existingResult.error;

        }


        let existingRows =
            existingResult.data || [];


        let saveResult;


        // =================================
        // UPDATE
        // =================================

        if(
            existingRows.length > 0
        ){

            let existingId =
                existingRows[0].id;


            saveResult =
                await supabaseRequest(

                    "cost_history",

                    "PATCH",

                    payload,

                    "?id=eq." +
                    encodeURIComponent(
                        existingId
                    )

                );

        }

        // =================================
        // INSERT
        // =================================

        else{

            saveResult =
                await supabaseRequest(

                    "cost_history",

                    "POST",

                    payload

                );

        }


        if(
            !saveResult.success
        ){

            throw saveResult.error;

        }


        // =================================
        // REFRESH HISTORY
        // =================================

        let refreshResult =
            await supabaseRequest(

                "cost_history",

                "GET",

                null,

                "?select=*"

            );


        if(
            refreshResult.success
        ){

            costHistory =
                refreshResult.data || [];

            loadYears();

        }


        alert(

            monthName +
            " " +
            monthParts[0] +
            " کی Cost History کامیابی سے محفوظ ہو گئی ہے۔\n\n" +

            "Last Balance Date: " +
            String(demandDate).substring(0,19)

        );


    }catch(error){

        console.error(
            "Add Cost History Error:",
            error
        );


        alert(
            "Cost History save نہیں ہو سکی۔\n\nConsole میں error check کریں۔"
        );

    }

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


    let excelData = [];


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
            String(
                item.item_name || ""
            );


        let category =
            item.category ||
            "Other";


        let supplier =
            getSupplier(item);


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
        // SAME DISPLAY QUANTITY
        // =================================

        let availableQty =
            getDisplayQuantity(
                item,
                selectedMonth
            );


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


        let approvedDemand =
            getDemandForItem(

                code,

                selectedMonth,

                selectedYear

            );


        let availableCost =
            availableQty *
            latestRate;


        let approvedDemandCost =
            approvedDemand *
            latestRate;


        totalItems++;

        totalAvailableQty +=
            availableQty;

        totalDemandQty +=
            approvedDemand;

        totalStockCost +=
            availableCost;

        totalDemandCost +=
            approvedDemandCost;


        if(
            !categoryTotals[category]
        ){

            categoryTotals[category] = 0;

        }


        categoryTotals[category] +=
            availableCost;


        if(
            !supplierTotals[supplier]
        ){

            supplierTotals[supplier] = 0;

        }


        supplierTotals[supplier] +=
            availableCost;


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


    if(totalItems === 0){

        alert(
            "کوئی Cost data موجود نہیں ہے۔"
        );

        return;

    }


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


    // =================================
    // CATEGORY SUMMARY
    // =================================

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
            ? amount / totalStockCost
            : 0;


        excelData.push([

            category,
            amount,
            percentage

        ]);

    }


    excelData.push([

        "TOTAL",
        totalStockCost,
        1

    ]);


    // =================================
    // SUPPLIER SUMMARY
    // =================================

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
            ? amount / totalStockCost
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


    // =================================
    // WORKSHEET
    // =================================

    let worksheet =
        XLSX.utils.aoa_to_sheet(
            excelData
        );


    worksheet["!merges"] = [

        {
            s:{r:0,c:0},
            e:{r:0,c:11}
        },

        {
            s:{r:1,c:0},
            e:{r:1,c:11}
        }

    ];


    // =================================
    // HEADER
    // =================================

    let mainHeaderRow = 6;


    for(
        let c = 0;
        c <= 11;
        c++
    ){

        let address =
            XLSX.utils.encode_cell({

                r:mainHeaderRow,
                c:c

            });


        if(
            worksheet[address]
        ){

            worksheet[address].s = {

                fill:{
                    patternType:"solid",
                    fgColor:{
                        rgb:"12355B"
                    }
                },

                font:{
                    bold:true,
                    color:{
                        rgb:"FFFFFF"
                    }
                },

                alignment:{
                    horizontal:"center",
                    vertical:"center",
                    wrapText:true
                },

                border:{
                    top:{
                        style:"thin",
                        color:{
                            rgb:"FFFFFF"
                        }
                    },
                    bottom:{
                        style:"thin",
                        color:{
                            rgb:"FFFFFF"
                        }
                    },
                    left:{
                        style:"thin",
                        color:{
                            rgb:"FFFFFF"
                        }
                    },
                    right:{
                        style:"thin",
                        color:{
                            rgb:"FFFFFF"
                        }
                    }
                }

            };

        }

    }


    // =================================
    // ITEM ROWS
    // =================================

    let firstItemRow = 7;

    let lastItemRow =
        totalRowIndex - 1;


    for(
        let r = firstItemRow;
        r <= lastItemRow;
        r++
    ){

        let quantityAddress =
            XLSX.utils.encode_cell({

                r:r,
                c:8

            });


        let currentStock =
            Number(
                worksheet[
                    quantityAddress
                ]?.v || 0
            );


        let requiredStock =
            Number(
                worksheet[
                    XLSX.utils.encode_cell({
                        r:r,
                        c:9
                    })
                ]?.v || 0
            );


        let fillColor =
            "D5F5E3";


        let fontColor =
            "1E8449";


        if(
            currentStock <=
            requiredStock * 0.5
        ){

            fillColor =
                "E74C3C";

            fontColor =
                "FFFFFF";

        }

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
                quantityAddress
            ]
        ){

            worksheet[
                quantityAddress
            ].s = {

                fill:{
                    patternType:"solid",
                    fgColor:{
                        rgb:fillColor
                    }
                },

                font:{
                    bold:true,
                    color:{
                        rgb:fontColor
                    }
                },

                alignment:{
                    horizontal:"center",
                    vertical:"center"
                },

                border:{
                    top:{
                        style:"thin",
                        color:{
                            rgb:"CCCCCC"
                        }
                    },
                    bottom:{
                        style:"thin",
                        color:{
                            rgb:"CCCCCC"
                        }
                    },
                    left:{
                        style:"thin",
                        color:{
                            rgb:"CCCCCC"
                        }
                    },
                    right:{
                        style:"thin",
                        color:{
                            rgb:"CCCCCC"
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

                    r:r,
                    c:c

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

                    top:{
                        style:"thin",
                        color:{
                            rgb:"CCCCCC"
                        }
                    },

                    bottom:{
                        style:"thin",
                        color:{
                            rgb:"CCCCCC"
                        }
                    },

                    left:{
                        style:"thin",
                        color:{
                            rgb:"CCCCCC"
                        }
                    },

                    right:{
                        style:"thin",
                        color:{
                            rgb:"CCCCCC"
                        }
                    }

                };

            }

        }

    }


    // =================================
    // TOTAL STYLE
    // =================================

    for(
        let c = 0;
        c <= 11;
        c++
    ){

        let address =
            XLSX.utils.encode_cell({

                r:totalRowIndex,
                c:c

            });


        if(
            worksheet[address]
        ){

            worksheet[address].s = {

                fill:{
                    patternType:"solid",
                    fgColor:{
                        rgb:"E8EEF5"
                    }
                },

                font:{
                    bold:true
                },

                alignment:{
                    horizontal:"center",
                    vertical:"center"
                },

                border:{
                    top:{
                        style:"thin",
                        color:{
                            rgb:"777777"
                        }
                    },
                    bottom:{
                        style:"thin",
                        color:{
                            rgb:"777777"
                        }
                    },
                    left:{
                        style:"thin",
                        color:{
                            rgb:"777777"
                        }
                    },
                    right:{
                        style:"thin",
                        color:{
                            rgb:"777777"
                        }
                    }
                }

            };

        }

    }


    // =================================
    // NUMBER FORMATS
    // =================================

    for(
        let r = 7;
        r <= totalRowIndex;
        r++
    ){

        for(
            let c = 4;
            c <= 7;
            c++
        ){

            let address =
                XLSX.utils.encode_cell({

                    r:r,
                    c:c

                });


            if(
                worksheet[address]
            ){

                worksheet[address].z =
                    "#,##0.00";

            }

        }


        for(
            let c = 8;
            c <= 9;
            c++
        ){

            let address =
                XLSX.utils.encode_cell({

                    r:r,
                    c:c

                });


            if(
                worksheet[address]
            ){

                worksheet[address].z =
                    "#,##0.00";

            }

        }


        for(
            let c = 10;
            c <= 11;
            c++
        ){

            let address =
                XLSX.utils.encode_cell({

                    r:r,
                    c:c

                });


            if(
                worksheet[address]
            ){

                worksheet[address].z =
                    '"Rs. " #,##0.00';

            }

        }

    }


    // =================================
    // WIDTH
    // =================================

    worksheet["!cols"] = [

        {wch:18},
        {wch:14},
        {wch:30},
        {wch:25},
        {wch:15},
        {wch:15},
        {wch:15},
        {wch:15},
        {wch:20},
        {wch:20},
        {wch:20},
        {wch:25}

    ];


    worksheet["!freeze"] = {
        xSplit:0,
        ySplit:7
    };


    // =================================
    // WORKBOOK
    // =================================

    let workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(

        workbook,
        worksheet,
        "Cost Report"

    );


    // =================================
    // FILE NAME
    // =================================

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


    XLSX.writeFile(

        workbook,
        fileName

    );


    alert(
        "Cost Report کی Excel (.xlsx) file کامیابی سے بن گئی ہے۔"
    );

}
