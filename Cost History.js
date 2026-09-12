// =====================================================
// COST HISTORY
// SUPABASE CONNECTED VERSION
// VIEW + EDIT + DELETE
// =====================================================


// =====================================================
// SUPABASE CONFIG
// =====================================================

const SUPABASE_URL =
    "https://tncmmkyrpzlkupdnkyqm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_e6j_EkJescicSS3nOOnscg_INwxeukT";

const COST_HISTORY_TABLE =
    "cost_history";


// =====================================================
// DATA
// =====================================================

let items = [];

let stockInHistory = [];

let stockOutHistory = [];

let demandHistory = [];

let costHistory = [];


// =====================================================
// SUPABASE REQUEST
// =====================================================

async function supabaseRequest(
    table,
    method = "GET",
    body = null,
    query = ""
){

    try{

        const options = {

            method: method,

            headers:{
                "apikey": SUPABASE_KEY,
                "Authorization":
                    "Bearer " + SUPABASE_KEY,

                "Content-Type":
                    "application/json",

                "Prefer":
                    "return=representation"
            }

        };


        if(body !== null){

            options.body =
                JSON.stringify(body);

        }


        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/" +
                table +
                query,
                options
            );


        const text =
            await response.text();


        let data = null;


        try{

            data =
                text
                ? JSON.parse(text)
                : null;

        }
        catch(error){

            data = text;

        }


        if(!response.ok){

            console.error(
                "Supabase Error:",
                table,
                data
            );

            return {

                success:false,

                error:data

            };

        }


        return {

            success:true,

            data:data

        };

    }
    catch(error){

        console.error(
            "Supabase Request Error:",
            error
        );

        return {

            success:false,

            error:error.message

        };

    }

}


// =====================================================
// NUMBER HELPER
// =====================================================

function num(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return 0;

    }


    if(typeof value === "number"){

        return value;

    }


    let cleaned =
        String(value)
        .replace(/[^0-9.-]/g,"");


    return Number(cleaned) || 0;

}


// =====================================================
// ITEM CODE
// =====================================================

function getItemCode(item){

    return String(

        item.code ??
        item.item_code ??
        item.itemCode ??
        item.id ??
        ""

    ).trim();

}


// =====================================================
// ITEM NAME
// =====================================================

function getItemName(item){

    return (

        item.item_name ??
        item.itemName ??
        item.name ??
        ""

    );

}


// =====================================================
// LOAD ALL DATA
// =====================================================

async function loadCostHistoryData(){

    try{

        setLoading(
            "Loading Cost History from Supabase..."
        );


        // =============================================
        // ITEMS
        // =============================================

        const itemResult =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?select=*"
            );


        if(!itemResult.success){

            throw new Error(
                "Items load failed"
            );

        }


        items =
            itemResult.data || [];


        // =============================================
        // NUMERIC ITEM CODE SORT
        // =============================================

        items.sort(function(a,b){

            const codeA =
                parseInt(
                    String(
                        a.code ??
                        a.item_code ??
                        a.id ??
                        ""
                    )
                    .replace(/\D/g,"")
                ) || 0;


            const codeB =
                parseInt(
                    String(
                        b.code ??
                        b.item_code ??
                        b.id ??
                        ""
                    )
                    .replace(/\D/g,"")
                ) || 0;


            return codeA - codeB;

        });


        // =============================================
        // STOCK IN
        // =============================================

        const stockInResult =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*"
            );


        if(stockInResult.success){

            stockInHistory =
                stockInResult.data || [];

        }
        else{

            stockInHistory = [];

            console.error(
                "Stock In Error:",
                stockInResult.error
            );

        }


        // =============================================
        // STOCK OUT
        // =============================================

        const stockOutResult =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*"
            );


        if(stockOutResult.success){

            stockOutHistory =
                stockOutResult.data || [];

        }
        else{

            stockOutHistory = [];

            console.error(
                "Stock Out Error:",
                stockOutResult.error
            );

        }


        // =============================================
        // DEMAND HISTORY
        // =============================================

        const demandResult =
            await supabaseRequest(
                "demand_history",
                "GET",
                null,
                "?select=*&order=id.asc"
            );


        if(demandResult.success){

            demandHistory =
                demandResult.data || [];

        }
        else{

            demandHistory = [];

            console.error(
                "Demand History Error:",
                demandResult.error
            );

        }


        // =============================================
        // COST HISTORY
        // =============================================

        const costResult =
            await supabaseRequest(
                COST_HISTORY_TABLE,
                "GET",
                null,
                "?select=*&order=month.desc"
            );


        if(!costResult.success){

            throw new Error(
                "Cost History table load failed: " +
                JSON.stringify(
                    costResult.error
                )
            );

        }


        costHistory =
            costResult.data || [];


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
            "Demand History:",
            demandHistory.length
        );

        console.log(
            "Cost History:",
            costHistory.length
        );


        loadHistoryYears();

        showCostHistory();

        setLoading("");

    }
    catch(error){

        console.error(
            "Cost History Load Error:",
            error
        );


        setLoading(
            "❌ Cost History load failed"
        );


        alert(
            "Cost History Supabase سے load نہیں ہو سکی۔\n\n" +
            error.message
        );

    }

}


// =====================================================
// LOADING MESSAGE
// =====================================================

function setLoading(message){

    const element =
        document.getElementById(
            "loadingMessage"
        );


    if(!element){

        return;

    }


    element.textContent =
        message;


    if(message === ""){

        element.style.display =
            "none";

    }
    else{

        element.style.display =
            "block";

    }

}


// =====================================================
// CURRENT MONTH
// =====================================================

function getCurrentMonth(){

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2,"0");


    return {

        year:year,

        month:month,

        key:
            year + "-" + month

    };

}


// =====================================================
// MONTH NAME
// =====================================================

function getMonthName(month){

    const months = [

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


    let number =
        Number(month);


    if(number >= 1 && number <= 12){

        return months[number - 1];

    }


    return month;

}


// =====================================================
// GET RECORD MONTH
// =====================================================

function getRecordMonth(record){

    if(
        record.month &&
        /^\d{4}-\d{2}$/.test(
            String(record.month)
        )
    ){

        return String(
            record.month
        );

    }


    if(
        record.year &&
        record.month
    ){

        return (

            String(record.year) +
            "-" +
            String(
                record.month
            ).padStart(2,"0")

        );

    }


    return "";

}


// =====================================================
// GET STOCK ITEM CODE
// =====================================================

function getStockItemCode(record){

    return String(

        record.item_code ??
        record.itemCode ??
        record.code ??
        ""

    ).trim();

}


// =====================================================
// GET STOCK DATE
// =====================================================

function getStockDate(record){

    return (

        record.date ??
        record.transaction_date ??
        record.transactionDate ??
        ""

    );

}


// =====================================================
// GET STOCK TIME
// =====================================================

function getStockTime(record){

    return (

        record.time ??
        record.transaction_time ??
        record.transactionTime ??
        ""

    );

}


// =====================================================
// GET LATEST RATE
// =====================================================

function getLatestRate(itemCode){

    const code =
        String(itemCode).trim();


    let latest = null;


    for(
        let i = 0;
        i < stockInHistory.length;
        i++
    ){

        const record =
            stockInHistory[i];


        if(
            getStockItemCode(record) !==
            code
        ){

            continue;

        }


        if(
            latest === null
        ){

            latest = record;

            continue;

        }


        const currentDate =
            String(
                getStockDate(record)
            );


        const currentTime =
            String(
                getStockTime(record)
            );


        const latestDate =
            String(
                getStockDate(latest)
            );


        const latestTime =
            String(
                getStockTime(latest)
            );


        if(
            currentDate + currentTime >
            latestDate + latestTime
        ){

            latest = record;

        }

    }


    if(!latest){

        return 0;

    }


    return num(

        latest.unit_cost ??
        latest.unitCost ??
        0

    );

}


// =====================================================
// CURRENT STOCK
// =====================================================

function getCurrentStock(item){

    const code =
        getItemCode(item);


    // ---------------------------------------------
    // IMPORTANT:
    // Supabase column is opening_Stock
    // ---------------------------------------------

    let stock =
        num(

            item.opening_Stock ??
            item.openingStock ??
            item.opening_stock ??
            0

        );


    // =============================================
    // STOCK IN
    // =============================================

    for(
        let i = 0;
        i < stockInHistory.length;
        i++
    ){

        const record =
            stockInHistory[i];


        if(
            getStockItemCode(record) ===
            code
        ){

            stock += num(
                record.quantity
            );

        }

    }


    // =============================================
    // STOCK OUT
    // =============================================

    for(
        let i = 0;
        i < stockOutHistory.length;
        i++
    ){

        const record =
            stockOutHistory[i];


        if(
            getStockItemCode(record) ===
            code
        ){

            stock -= num(
                record.quantity
            );

        }

    }


    if(stock < 0){

        stock = 0;

    }


    return stock;

}


// =====================================================
// GET DEMAND MONTH
// =====================================================

function getDemandMonth(record){

    return String(

        record.demand_month ??
        record.demandMonth ??
        record.month ??
        ""

    ).trim();

}


// =====================================================
// GET DEMAND ITEMS
// =====================================================

function getDemandItems(record){

    let data =

        record.demand_items ??
        record.demandItems ??
        record.items ??
        record.demands ??
        [];


    if(typeof data === "string"){

        try{

            data =
                JSON.parse(data);

        }
        catch(error){

            data = [];

        }

    }


    if(!Array.isArray(data)){

        return [];

    }


    return data;

}


// =====================================================
// GET DEMAND ITEM CODE
// =====================================================

function getDemandItemCode(item){

    return String(

        item.itemCode ??
        item.item_code ??
        item.code ??
        item.itemId ??
        item.item_id ??
        ""

    ).trim();

}


// =====================================================
// GET DEMAND QUANTITY
// =====================================================

function getDemandQuantity(item){

    const value =

        item.final_demand ??
        item.finalDemand ??
        item.approved_qty ??
        item.approvedQty ??
        item.approvedDemandQty ??
        item.approved_demand_qty ??
        item.demand_qty ??
        item.demandQty ??
        item.demand_quantity ??
        item.demandQuantity ??
        item.quantity ??
        item.qty ??
        item.demand ??
        0;


    return num(value);

}


// =====================================================
// MONTHLY DEMAND
// =====================================================

function getMonthlyDemand(
    itemCode,
    month
){

    const code =
        String(itemCode).trim();


    let total = 0;


    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        const record =
            demandHistory[i];


        const demandMonth =
            getDemandMonth(record);


        if(
            demandMonth !==
            month
        ){

            continue;

        }


        const demandItems =
            getDemandItems(record);


        for(
            let j = 0;
            j < demandItems.length;
            j++
        ){

            const demandItem =
                demandItems[j];


            if(
                getDemandItemCode(
                    demandItem
                ) === code
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


// =====================================================
// CREATE MONTHLY COST RECORD
// =====================================================

function createMonthlyCostRecord(
    month
){

    let totalStockCost = 0;

    let totalDemandQty = 0;

    let totalDemandCost = 0;

    let itemDetails = [];


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        const item =
            items[i];


        const code =
            getItemCode(item);


        if(!code){

            continue;

        }


        // =============================================
        // CURRENT STOCK
        // =============================================

        const availableQuantity =
            getCurrentStock(item);


        // =============================================
        // LATEST RATE
        // =============================================

        const rate =
            getLatestRate(code);


        // =============================================
        // STOCK COST
        // =============================================

        const availableStockCost =
            availableQuantity *
            rate;


        // =============================================
        // DEMAND
        // =============================================

        const approvedDemandQty =
            getMonthlyDemand(
                code,
                month
            );


        const approvedDemandCost =
            approvedDemandQty *
            rate;


        // =============================================
        // TOTALS
        // =============================================

        totalStockCost +=
            availableStockCost;


        totalDemandQty +=
            approvedDemandQty;


        totalDemandCost +=
            approvedDemandCost;


        // =============================================
        // ITEM DETAIL
        // =============================================

        itemDetails.push({

            category:
                item.category || "",

            code:
                code,

            itemCode:
                code,

            itemName:
                getItemName(item),

            specification:
                item.specification || "",

            source:
                item.source || "",

            supplier:
                item.supplier || "",

            unit:
                item.unit || "",

            rate:
                rate,

            availableQuantity:
                availableQuantity,

            availableStockCost:
                availableStockCost,

            approvedDemandQty:
                approvedDemandQty,

            approvedDemandCost:
                approvedDemandCost

        });

    }


    const parts =
        month.split("-");


    const year =
        Number(parts[0]);


    const monthNumber =
        parts[1];


    const monthName =
        getMonthName(
            monthNumber
        );


    return {

        month:
            month,

        month_name:
            monthName,

        year:
            year,

        total_items:
            itemDetails.length,

        total_stock_cost:
            Number(
                totalStockCost.toFixed(2)
            ),

        approved_demand_qty:
            Number(
                totalDemandQty.toFixed(2)
            ),

        total_demand_cost:
            Number(
                totalDemandCost.toFixed(2)
            ),

        saved_date:
            new Date().toISOString(),

        items:
            itemDetails

    };

}


// =====================================================
// SAVE MONTHLY COST
// =====================================================

async function saveMonthlyCost(
    month,
    showMessage = true
){

    if(!month){

        alert(
            "Please select a month."
        );

        return;

    }


    try{

        setLoading(
            "Saving Cost History..."
        );


        const record =
            createMonthlyCostRecord(
                month
            );


        // =============================================
        // CHECK EXISTING RECORD
        // =============================================

        const existingResult =
            await supabaseRequest(

                COST_HISTORY_TABLE,

                "GET",

                null,

                "?select=id,month&month=eq." +
                encodeURIComponent(month)

            );


        if(!existingResult.success){

            throw new Error(
                JSON.stringify(
                    existingResult.error
                )
            );

        }


        const existing =
            existingResult.data || [];


        let result;


        // =============================================
        // UPDATE
        // =============================================

        if(existing.length > 0){

            const id =
                existing[0].id;


            result =
                await supabaseRequest(

                    COST_HISTORY_TABLE,

                    "PATCH",

                    record,

                    "?id=eq." + id

                );

        }

        // =============================================
        // INSERT
        // =============================================

        else{

            result =
                await supabaseRequest(

                    COST_HISTORY_TABLE,

                    "POST",

                    record

                );

        }


        if(!result.success){

            throw new Error(
                JSON.stringify(
                    result.error
                )
            );

        }


        // =============================================
        // RELOAD
        // =============================================

        await reloadCostHistory();


        if(showMessage){

            alert(
                "Cost History successfully Supabase میں save ہو گئی۔"
            );

        }

    }
    catch(error){

        console.error(
            "Save Cost Error:",
            error
        );


        alert(
            "Cost History save نہیں ہوئی۔\n\n" +
            error.message
        );

    }
    finally{

        setLoading("");

    }

}


// =====================================================
// SAVE CURRENT MONTH
// =====================================================

async function saveCurrentCostHistory(){

    const current =
        getCurrentMonth();


    await saveMonthlyCost(
        current.key,
        true
    );

}


// =====================================================
// AUTO SAVE CURRENT MONTH
// =====================================================

async function autoSaveCurrentMonth(){

    const current =
        getCurrentMonth();


    // ---------------------------------------------
    // IMPORTANT:
    // اگر current month already موجود ہے
    // تو اسے automatically overwrite نہیں کریں گے۔
    // ---------------------------------------------

    const existing =
        costHistory.find(
            function(record){

                return (
                    getRecordMonth(record) ===
                    current.key
                );

            }
        );


    if(existing){

        return;

    }


    await saveMonthlyCost(
        current.key,
        false
    );

}


// =====================================================
// RELOAD COST HISTORY
// =====================================================

async function reloadCostHistory(){

    const result =
        await supabaseRequest(

            COST_HISTORY_TABLE,

            "GET",

            null,

            "?select=*&order=month.desc"

        );


    if(!result.success){

        throw new Error(
            JSON.stringify(
                result.error
            )
        );

    }


    costHistory =
        result.data || [];


    loadHistoryYears();

    showCostHistory();

}


// =====================================================
// LOAD YEARS
// =====================================================

function loadHistoryYears(){

    const select =
        document.getElementById(
            "historyYear"
        );


    if(!select){

        return;

    }


    const currentValue =
        select.value;


    select.innerHTML =
        '<option value="">All Years</option>';


    const years = [];


    for(
        let i = 0;
        i < costHistory.length;
        i++
    ){

        const record =
            costHistory[i];


        const month =
            getRecordMonth(record);


        const year =
            month
            ? month.substring(0,4)
            : String(
                record.year || ""
            );


        if(
            year &&
            !years.includes(year)
        ){

            years.push(year);

        }

    }


    years.sort(
        function(a,b){
            return Number(b) -
                   Number(a);
        }
    );


    for(
        let i = 0;
        i < years.length;
        i++
    ){

        const option =
            document.createElement(
                "option"
            );


        option.value =
            years[i];


        option.textContent =
            years[i];


        select.appendChild(
            option
        );

    }


    if(
        years.includes(
            currentValue
        )
    ){

        select.value =
            currentValue;

    }

}


// =====================================================
// SHOW COST HISTORY
// =====================================================

function showCostHistory(){

    const body =
        document.getElementById(
            "historyBody"
        );


    if(!body){

        return;

    }


    body.innerHTML = "";


    const monthSelect =
        document.getElementById(
            "historyMonth"
        );


    const yearSelect =
        document.getElementById(
            "historyYear"
        );


    const selectedMonth =
        monthSelect
        ? monthSelect.value
        : "";


    const selectedYear =
        yearSelect
        ? yearSelect.value
        : "";


    let filteredHistory =
        costHistory.filter(
            function(record){

                const month =
                    getRecordMonth(
                        record
                    );


                if(!month){

                    return false;

                }


                const parts =
                    month.split("-");


                const year =
                    parts[0];


                const monthNumber =
                    parts[1];


                if(
                    selectedMonth &&
                    monthNumber !==
                    selectedMonth
                ){

                    return false;

                }


                if(
                    selectedYear &&
                    year !==
                    selectedYear
                ){

                    return false;

                }


                return true;

            }
        );


    // =============================================
    // SORT NEWEST FIRST
    // =============================================

    filteredHistory.sort(
        function(a,b){

            return getRecordMonth(b)
                   .localeCompare(
                       getRecordMonth(a)
                   );

        }
    );


    // =============================================
    // NO RECORDS
    // =============================================

    if(
        filteredHistory.length === 0
    ){

        const row =
            document.createElement(
                "tr"
            );


        const cell =
            document.createElement(
                "td"
            );


        cell.colSpan = 8;


        cell.textContent =
            "No Cost History Found";


        row.appendChild(
            cell
        );


        body.appendChild(
            row
        );


        updateSummary([]);


        return;

    }


    // =============================================
    // ADD ROWS
    // =============================================

    for(
        let i = 0;
        i < filteredHistory.length;
        i++
    ){

        addHistoryRow(
            filteredHistory[i]
        );

    }


    updateSummary(
        filteredHistory
    );

}


// =====================================================
// ADD HISTORY ROW
// =====================================================

function addHistoryRow(record){

    const body =
        document.getElementById(
            "historyBody"
        );


    const row =
        document.createElement(
            "tr"
        );


    const month =
        getRecordMonth(
            record
        );


    const parts =
        month.split("-");


    const year =
        parts[0];


    const monthNumber =
        parts[1];


    const monthName =
        record.month_name ||
        record.monthName ||
        getMonthName(
            monthNumber
        );


    // =============================================
    // YEAR
    // =============================================

    addCell(
        row,
        year
    );


    // =============================================
    // MONTH
    // =============================================

    addCell(
        row,
        monthName
    );


    // =============================================
    // TOTAL ITEMS
    // =============================================

    addCell(
        row,
        num(
            record.total_items ??
            record.totalItems ??
            0
        )
    );


    // =============================================
    // STOCK COST
    // =============================================

    addCell(
        row,
        num(
            record.total_stock_cost ??
            record.totalStockCost ??
            record.availableStockCost ??
            0
        ).toFixed(2)
    );


    // =============================================
    // DEMAND QTY
    // =============================================

    addCell(
        row,
        num(
            record.approved_demand_qty ??
            record.approvedDemandQty ??
            0
        ).toFixed(2)
    );


    // =============================================
    // DEMAND COST
    // =============================================

    addCell(
        row,
        num(
            record.total_demand_cost ??
            record.totalDemandCost ??
            record.approvedDemandCost ??
            0
        ).toFixed(2)
    );


    // =============================================
    // SAVED DATE
    // =============================================

    const savedDate =
        record.saved_date ||
        record.savedDate ||
        "";


    let displayDate =
        "-";


    if(savedDate){

        const date =
            new Date(
                savedDate
            );


        if(!isNaN(date.getTime())){

            displayDate =
                date.toLocaleString(
                    "en-GB"
                );

        }
        else{

            displayDate =
                savedDate;

        }

    }


    addCell(
        row,
        displayDate
    );


    // =============================================
    // ACTION
    // =============================================

    const actionCell =
        document.createElement(
            "td"
        );


    const actionDiv =
        document.createElement(
            "div"
        );


    actionDiv.className =
        "action-buttons";


    // ---------------------------------------------
    // VIEW
    // ---------------------------------------------

    const viewButton =
        document.createElement(
            "button"
        );


    viewButton.type =
        "button";


    viewButton.textContent =
        "👁️ View";


    viewButton.onclick =
        function(){

            viewCostDetails(
                month
            );

        };


    // ---------------------------------------------
    // EDIT
    // ---------------------------------------------

    const editButton =
        document.createElement(
            "button"
        );


    editButton.type =
        "button";


    editButton.textContent =
        "✏️ Edit";


    editButton.onclick =
        function(){

            editCostHistory(
                record.id
            );

        };


    // ---------------------------------------------
    // DELETE
    // ---------------------------------------------

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.type =
        "button";


    deleteButton.textContent =
        "🗑️ Delete";


    deleteButton.onclick =
        function(){

            deleteCostHistory(
                record.id,
                month
            );

        };


    actionDiv.appendChild(
        viewButton
    );


    actionDiv.appendChild(
        editButton
    );


    actionDiv.appendChild(
        deleteButton
    );


    actionCell.appendChild(
        actionDiv
    );


    row.appendChild(
        actionCell
    );


    body.appendChild(
        row
    );

}


// =====================================================
// ADD CELL
// =====================================================

function addCell(
    row,
    value
){

    const cell =
        document.createElement(
            "td"
        );


    cell.textContent =
        value;


    row.appendChild(
        cell
    );

}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary(
    records
){

    let stockCost = 0;

    let demandQty = 0;

    let demandCost = 0;


    for(
        let i = 0;
        i < records.length;
        i++
    ){

        const record =
            records[i];


        stockCost +=
            num(
                record.total_stock_cost ??
                record.totalStockCost ??
                record.availableStockCost ??
                0
            );


        demandQty +=
            num(
                record.approved_demand_qty ??
                record.approvedDemandQty ??
                0
            );


        demandCost +=
            num(
                record.total_demand_cost ??
                record.totalDemandCost ??
                record.approvedDemandCost ??
                0
            );

    }


    document.getElementById(
        "totalMonths"
    ).textContent =
        records.length;


    document.getElementById(
        "totalStockCost"
    ).textContent =
        stockCost.toFixed(2);


    document.getElementById(
        "totalDemandCost"
    ).textContent =
        demandCost.toFixed(2);


    document.getElementById(
        "footerStockCost"
    ).textContent =
        stockCost.toFixed(2);


    document.getElementById(
        "footerDemandQty"
    ).textContent =
        demandQty.toFixed(2);


    document.getElementById(
        "footerDemandCost"
    ).textContent =
        demandCost.toFixed(2);

}


// =====================================================
// SHOW ALL
// =====================================================

function showAllHistory(){

    const search =
        document.getElementById(
            "historySearch"
        );


    const month =
        document.getElementById(
            "historyMonth"
        );


    const year =
        document.getElementById(
            "historyYear"
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


    showCostHistory();

}


// =====================================================
// SEARCH FILTER
// =====================================================

function filterCostHistory(){

    const searchInput =
        document.getElementById(
            "historySearch"
        );


    if(!searchInput){

        return;

    }


    const search =
        searchInput.value
        .trim()
        .toLowerCase();


    const rows =
        document.querySelectorAll(
            "#historyBody tr"
        );


    rows.forEach(
        function(row){

            const text =
                row.textContent
                .toLowerCase();


            if(
                text.includes(search)
            ){

                row.style.display =
                    "";

            }
            else{

                row.style.display =
                    "none";

            }

        }
    );

}


// =====================================================
// EDIT COST HISTORY
// =====================================================

async function editCostHistory(
    recordId
){

    const record =
        costHistory.find(
            function(item){

                return String(
                    item.id
                ) ===
                String(recordId);

            }
        );


    if(!record){

        alert(
            "Cost History record نہیں ملا۔"
        );

        return;

    }


    const month =
        getRecordMonth(
            record
        );


    const currentStockCost =
        num(
            record.total_stock_cost ??
            record.totalStockCost ??
            0
        );


    const currentDemandQty =
        num(
            record.approved_demand_qty ??
            record.approvedDemandQty ??
            0
        );


    const currentDemandCost =
        num(
            record.total_demand_cost ??
            record.totalDemandCost ??
            0
        );


    // =============================================
    // STOCK COST
    // =============================================

    const stockCostInput =
        prompt(

            "Available Stock Cost:\n\n" +
            "Month: " + month,

            currentStockCost

        );


    if(stockCostInput === null){

        return;

    }


    const stockCost =
        Number(
            stockCostInput
        );


    if(
        !Number.isFinite(stockCost) ||
        stockCost < 0
    ){

        alert(
            "Stock Cost درست number ہونا چاہیے۔"
        );

        return;

    }


    // =============================================
    // DEMAND QTY
    // =============================================

    const demandQtyInput =
        prompt(

            "Approved Demand Quantity:",

            currentDemandQty

        );


    if(demandQtyInput === null){

        return;

    }


    const demandQty =
        Number(
            demandQtyInput
        );


    if(
        !Number.isFinite(demandQty) ||
        demandQty < 0
    ){

        alert(
            "Demand Quantity درست number ہونا چاہیے۔"
        );

        return;

    }


    // =============================================
    // DEMAND COST
    // =============================================

    const demandCostInput =
        prompt(

            "Approved Demand Cost:",

            currentDemandCost

        );


    if(demandCostInput === null){

        return;

    }


    const demandCost =
        Number(
            demandCostInput
        );


    if(
        !Number.isFinite(demandCost) ||
        demandCost < 0
    ){

        alert(
            "Demand Cost درست number ہونا چاہیے۔"
        );

        return;

    }


    // =============================================
    // UPDATE SUPABASE
    // =============================================

    try{

        setLoading(
            "Updating Cost History..."
        );


        const updateData = {

            total_stock_cost:
                Number(
                    stockCost.toFixed(2)
                ),

            approved_demand_qty:
                Number(
                    demandQty.toFixed(2)
                ),

            total_demand_cost:
                Number(
                    demandCost.toFixed(2)
                ),

            saved_date:
                new Date().toISOString()

        };


        const result =
            await supabaseRequest(

                COST_HISTORY_TABLE,

                "PATCH",

                updateData,

                "?id=eq." +
                encodeURIComponent(
                    recordId
                )

            );


        if(!result.success){

            throw new Error(
                JSON.stringify(
                    result.error
                )
            );

        }


        await reloadCostHistory();


        alert(
            "Cost History successfully update ہو گئی۔"
        );

    }
    catch(error){

        console.error(
            error
        );


        alert(
            "Update failed.\n\n" +
            error.message
        );

    }
    finally{

        setLoading("");

    }

}


// =====================================================
// DELETE COST HISTORY
// =====================================================

async function deleteCostHistory(
    recordId,
    month
){

    const confirmDelete =
        confirm(

            "کیا آپ واقعی " +
            month +
            " کی Cost History delete کرنا چاہتے ہیں؟\n\n" +
            "یہ record Supabase سے بھی delete ہو گا۔"

        );


    if(!confirmDelete){

        return;

    }


    try{

        setLoading(
            "Deleting Cost History..."
        );


        const result =
            await supabaseRequest(

                COST_HISTORY_TABLE,

                "DELETE",

                null,

                "?id=eq." +
                encodeURIComponent(
                    recordId
                )

            );


        if(!result.success){

            throw new Error(
                JSON.stringify(
                    result.error
                )
            );

        }


        await reloadCostHistory();


        alert(
            "Cost History successfully delete ہو گئی۔"
        );

    }
    catch(error){

        console.error(
            error
        );


        alert(
            "Delete failed.\n\n" +
            error.message
        );

    }
    finally{

        setLoading("");

    }

}


// =====================================================
// VIEW DETAILS
// =====================================================

function viewCostDetails(
    month
){

    localStorage.setItem(
        "selectedCostHistoryMonth",
        month
    );


    window.location.href =
        "Cost History Details.html";

}


// =====================================================
// BACK TO COST
// =====================================================

function backToCost(){

    window.location.href =
        "Cost .html";

}


// =====================================================
// YEAR HISTORY
// =====================================================

function openYearHistory(){

    window.location.href =
        "Cost Year History.html";

}


// =====================================================
// DASHBOARD
// =====================================================

function goDashboard(){

    window.location.href =
        "Dashboard.html";

}


// =====================================================
// PRINT
// =====================================================

function printCostHistory(){

    const table =
        document.getElementById(
            "costHistoryTable"
        );


    if(!table){

        alert(
            "Cost History table نہیں ملی۔"
        );

        return;

    }


    const printWindow =
        window.open(
            "",
            "",
            "width=1400,height=900"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups for printing."
        );

        return;

    }


    const tableClone =
        table.cloneNode(true);


    // Remove Action column
    const rows =
        tableClone.querySelectorAll(
            "tr"
        );


    rows.forEach(
        function(row){

            if(row.cells.length > 0){

                row.deleteCell(
                    row.cells.length - 1
                );

            }

        }
    );


    const html = `

<!DOCTYPE html>

<html>

<head>

<title>Cost History</title>

<style>

body{
    font-family:Arial,sans-serif;
    padding:20px;
}

h2,
h1{
    text-align:center;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}

th,
td{
    border:1px solid #777;
    padding:7px;
    text-align:center;
}

th{
    background:#12355b;
    color:white;
}

@media print{

    @page{
        size:A4 landscape;
        margin:10mm;
    }

}

</style>

</head>

<body>

<h2>
MECAS ENGINEERING PVT LIMITED SUNDAR
</h2>

<h1>
COST HISTORY
</h1>

${tableClone.outerHTML}

</body>

</html>

`;


    printWindow.document.open();

    printWindow.document.write(
        html
    );

    printWindow.document.close();


    printWindow.focus();


    setTimeout(
        function(){

            printWindow.print();

        },
        500
    );

}


// =====================================================
// PAGE START
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function(){

        await loadCostHistoryData();

        // ---------------------------------------------
        // Current month automatic record
        // صرف تب بنے گا جب current month موجود نہ ہو
        // ---------------------------------------------

        await autoSaveCurrentMonth();

    }
);


// =====================================================
// REFRESH WHEN PAGE VISIBLE
// =====================================================

document.addEventListener(
    "visibilitychange",
    async function(){

        if(
            document.visibilityState ===
            "visible"
        ){

            await loadCostHistoryData();

        }

    }
);


console.log(
    "✅ Cost History Supabase JS loaded successfully."
);
