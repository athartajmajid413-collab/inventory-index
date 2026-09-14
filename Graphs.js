// =====================================
// GRAPHS - SUPABASE VERSION
// MECAS ENGINEERING PVT LIMITED SUNDAR
// =====================================


// =====================================
// GLOBAL DATA
// =====================================

let items = [];
let stockInData = [];
let stockOutData = [];
let demandHistory = [];


// =====================================
// CHART VARIABLES
// =====================================

let stockDemandChart = null;
let quantityChart = null;
let costChart = null;
let periodChart = null;


// =====================================
// BASIC HELPERS
// =====================================

function cleanCode(value){

    return String(
        value ?? ""
    ).trim();

}


function safeNumber(value){

    let n = Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

}


function getItemCode(item){

    return cleanCode(
        item?.code ??
        item?.item_code ??
        item?.itemCode ??
        ""
    );

}


function getItemName(item){

    return (
        item?.item_name ??
        item?.itemName ??
        "-"
    );

}


function getItemUnit(item){

    return (
        item?.unit ??
        "-"
    );

}


// =====================================
// LOAD ITEMS FROM SUPABASE
// =====================================

async function loadItems(){

    let result = await supabaseRequest(
        "items",
        "GET",
        null,
        "?select=*"
    );


    if(!result.success){

        console.error(
            "Items Load Error:",
            result.error
        );

        return;

    }


    items =
        result.data || [];


    // ---------------------------------
    // SORT BY ITEM CODE NUMBER
    // SI1, SI2, SI3 ... SI10
    // ---------------------------------

    items.sort(function(a,b){

        let codeA =
            getItemCode(a);

        let codeB =
            getItemCode(b);


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


        if(numberA !== numberB){

            return numberA - numberB;

        }


        return codeA.localeCompare(
            codeB
        );

    });


    console.log(
        "Graph Items:",
        items
    );

}


// =====================================
// LOAD STOCK IN
// =====================================

async function loadStockIn(){

    let result = await supabaseRequest(
        "stock_in",
        "GET",
        null,
        "?select=*&order=id.asc"
    );


    if(!result.success){

        console.error(
            "Stock In Load Error:",
            result.error
        );

        return;

    }


    stockInData =
        result.data || [];


    console.log(
        "Graph Stock In:",
        stockInData
    );

}


// =====================================
// LOAD STOCK OUT
// =====================================

async function loadStockOut(){

    let result = await supabaseRequest(
        "stock_issue",
        "GET",
        null,
        "?select=*&order=id.asc"
    );


    if(!result.success){

        console.error(
            "Stock Out Load Error:",
            result.error
        );

        return;

    }


    stockOutData =
        result.data || [];


    console.log(
        "Graph Stock Out:",
        stockOutData
    );

}


// =====================================
// LOAD DEMAND HISTORY
// =====================================

async function loadDemandHistory(){

    let result = await supabaseRequest(
        "demand_history",
        "GET",
        null,
        "?select=*&order=id.asc"
    );


    if(!result.success){

        console.error(
            "Demand History Load Error:",
            result.error
        );

        return;

    }


    demandHistory =
        result.data || [];


    console.log(
        "Graph Demand History:",
        demandHistory
    );

}


// =====================================
// LOAD ALL DATA
// =====================================

async function loadAllGraphData(){

    console.log(
        "================================="
    );

    console.log(
        "Loading Graph Data from Supabase..."
    );

    console.log(
        "================================="
    );


    await loadItems();

    await loadStockIn();

    await loadStockOut();

    await loadDemandHistory();


    loadYears();

    changePeriodType();

    updateGraphs();


    console.log(
        "================================="
    );

    console.log(
        "Graph Data Loaded Successfully"
    );

    console.log(
        "================================="
    );

}


// =====================================
// LOAD ITEMS INTO SELECT
// =====================================

function loadItemSelect(){

    let select =
        document.getElementById(
            "itemSelect"
        );


    if(!select){

        return;

    }


    select.innerHTML = "";


    let allOption =
        document.createElement(
            "option"
        );


    allOption.value =
        "all";


    allOption.textContent =
        "📊 All Items";


    select.appendChild(
        allOption
    );


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let item =
            items[i];


        let option =
            document.createElement(
                "option"
            );


        option.value =
            getItemCode(item);


        option.textContent =
            getItemCode(item) +
            " - " +
            getItemName(item);


        select.appendChild(
            option
        );

    }


    let saved =
        localStorage.getItem(
            "dashboardSelectedItem"
        );


    if(saved){

        let savedCode =
            cleanCode(saved);


        for(
            let i = 0;
            i < items.length;
            i++
        ){

            if(
                getItemCode(items[i])
                ===
                savedCode
            ){

                select.value =
                    savedCode;

                break;

            }

        }

    }

}


// =====================================
// LOAD YEARS
// =====================================

function loadYears(){

    let years =
        new Set();


    // ---------------------------------
    // STOCK IN YEARS
    // ---------------------------------

    for(
        let i = 0;
        i < stockInData.length;
        i++
    ){

        if(!stockInData[i].date){

            continue;

        }


        let date =
            new Date(
                stockInData[i].date
            );


        if(!isNaN(date)){

            years.add(
                date.getFullYear()
            );

        }

    }


    // ---------------------------------
    // STOCK OUT YEARS
    // ---------------------------------

    for(
        let i = 0;
        i < stockOutData.length;
        i++
    ){

        if(!stockOutData[i].date){

            continue;

        }


        let date =
            new Date(
                stockOutData[i].date
            );


        if(!isNaN(date)){

            years.add(
                date.getFullYear()
            );

        }

    }


    // ---------------------------------
    // DEMAND YEARS
    // ---------------------------------

    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let record =
            demandHistory[i];


        let dateValue =
            record.date ||
            record.generate_date;


        if(!dateValue){

            continue;

        }


        let date =
            new Date(
                dateValue
            );


        if(!isNaN(date)){

            years.add(
                date.getFullYear()
            );

        }

    }


    let yearSelect =
        document.getElementById(
            "yearSelect"
        );


    if(!yearSelect){

        return;

    }


    yearSelect.innerHTML =
        "";


    let yearArray =
        Array.from(
            years
        ).sort(
            function(a,b){

                return a - b;

            }
        );


    if(
        yearArray.length
        ===
        0
    ){

        yearArray.push(
            new Date().getFullYear()
        );

    }


    for(
        let i = 0;
        i < yearArray.length;
        i++
    ){

        let option =
            document.createElement(
                "option"
            );


        option.value =
            yearArray[i];


        option.textContent =
            yearArray[i];


        yearSelect.appendChild(
            option
        );

    }


    let currentYear =
        new Date().getFullYear();


    if(
        yearArray.includes(
            currentYear
        )
    ){

        yearSelect.value =
            currentYear;

    }


    loadItemSelect();

}


// =====================================
// PERIOD TYPE
// =====================================

function changePeriodType(){

    let typeElement =
        document.getElementById(
            "periodType"
        );


    if(!typeElement){

        return;

    }


    let type =
        typeElement.value;


    let month =
        document.getElementById(
            "monthSelect"
        );


    let monthLabel =
        document.getElementById(
            "monthLabel"
        );


    if(!month){

        return;

    }


    if(type == "year"){

        month.style.display =
            "none";


        if(monthLabel){

            monthLabel.style.display =
                "none";

        }

    }
    else{

        month.style.display =
            "inline-block";


        if(monthLabel){

            monthLabel.style.display =
                "inline-block";

        }

    }

}


// =====================================
// GET RECORD DATE
// =====================================

function getRecordDate(record){

    return (
        record?.date ||
        record?.generate_date ||
        record?.generateDate ||
        null
    );

}


// =====================================
// GET DATE ONLY
// =====================================

function getDateOnly(value){

    if(!value){

        return null;

    }


    let date =
        new Date(value);


    if(isNaN(date)){

        return null;

    }


    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

}


// =====================================
// DEMAND RECORD DATE
// =====================================

function getDemandRecordDate(record){

    return getDateOnly(
        getRecordDate(record)
    );

}


// =====================================
// SELECTED YEAR / MONTH
// =====================================

function getSelectedYear(){

    let element =
        document.getElementById(
            "yearSelect"
        );


    return element
        ? Number(element.value)
        : new Date().getFullYear();

}


function getSelectedMonth(){

    let element =
        document.getElementById(
            "monthSelect"
        );


    return element
        ? Number(element.value)
        : new Date().getMonth() + 1;

}


// =====================================
// SELECTED DEMAND RECORD
// =====================================
//
// Latest demand record in selected month
//
// =====================================

function getSelectedDemandRecord(){

    let selectedYear =
        getSelectedYear();


    let selectedMonth =
        getSelectedMonth();


    let latestRecord =
        null;


    let latestDate =
        null;


    let latestId =
        -Infinity;


    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let record =
            demandHistory[i];


        let date =
            getDemandRecordDate(
                record
            );


        if(!date){

            continue;

        }


        if(
            date.getFullYear()
            !==
            selectedYear
        ){

            continue;

        }


        if(
            date.getMonth() + 1
            !==
            selectedMonth
        ){

            continue;

        }


        let id =
            Number(
                record.id || 0
            );


        if(
            !latestDate ||
            date > latestDate ||
            (
                date.getTime()
                ===
                latestDate.getTime()
                &&
                id > latestId
            )
        ){

            latestRecord =
                record;

            latestDate =
                date;

            latestId =
                id;

        }

    }


    return latestRecord;

}


// =====================================
// GET NEXT DEMAND DATE
// =====================================
//
// Current demand date -> next demand date
//
// =====================================

function getNextDemandDate(currentDate){

    if(!currentDate){

        return null;

    }


    let nextDate =
        null;


    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let record =
            demandHistory[i];


        let date =
            getDemandRecordDate(
                record
            );


        if(!date){

            continue;

        }


        if(
            date <= currentDate
        ){

            continue;

        }


        if(
            !nextDate ||
            date < nextDate
        ){

            nextDate =
                date;

        }

    }


    return nextDate;

}


// =====================================
// GET ACTIVE DEMAND CYCLE
// =====================================
//
// Example:
//
// June Demand     = 10 June
// Next Demand     = 10 July
//
// Cycle:
// 10 June <= date < 10 July
//
// =====================================

function getActiveDemandCycle(){

    let currentDemand =
        getSelectedDemandRecord();


    if(!currentDemand){

        return {

            currentDemand:
                null,

            startDate:
                null,

            endDate:
                null

        };

    }


    let startDate =
        getDemandRecordDate(
            currentDemand
        );


    let endDate =
        getNextDemandDate(
            startDate
        );


    return {

        currentDemand:
            currentDemand,

        startDate:
            startDate,

        endDate:
            endDate

    };

}


// =====================================
// DATE IS INSIDE DEMAND CYCLE
// =====================================

function dateIsInsideDemandCycle(
    dateValue,
    cycle
){

    let date =
        getDateOnly(
            dateValue
        );


    if(!date){

        return false;

    }


    if(
        !cycle.startDate
    ){

        return false;

    }


    let start =
        getDateOnly(
            cycle.startDate
        );


    if(
        date < start
    ){

        return false;

    }


    // ---------------------------------
    // If next demand exists
    // ---------------------------------

    if(
        cycle.endDate
    ){

        let end =
            getDateOnly(
                cycle.endDate
            );


        return date < end;

    }


    // ---------------------------------
    // No next demand yet
    // Current cycle remains open
    // ---------------------------------

    return true;

}


// =====================================
// DATE MATCH - OLD COMPATIBILITY
// =====================================

function dateMatches(dateValue){

    if(!dateValue){

        return false;

    }


    let date =
        new Date(
            dateValue
        );


    if(isNaN(date)){

        return false;

    }


    let year =
        getSelectedYear();


    let month =
        getSelectedMonth();


    let typeElement =
        document.getElementById(
            "periodType"
        );


    let type =
        typeElement
            ? typeElement.value
            : "month";


    if(
        date.getFullYear()
        !==
        year
    ){

        return false;

    }


    if(
        type
        ===
        "year"
    ){

        return true;

    }


    return (
        date.getMonth() + 1
        ===
        month
    );

}


// =====================================
// ITEM CODE HELPER
// =====================================

function getRecordItemCode(record){

    return cleanCode(
        record?.item_code ??
        record?.itemCode ??
        record?.code ??
        ""
    );

}


// =====================================
// ITEM NAME HELPER
// =====================================

function getRecordItemName(record){

    return (
        record?.item_name ??
        record?.itemName ??
        "-"
    );

}


// =====================================
// DEMAND VALUE
// =====================================

function getDemandValue(record){

    if(!record){

        return 0;

    }


    let values = [

        record.finalDemand,

        record.final_demand,

        record.approvedQty,

        record.approved_qty,

        record.quantity,

        record.demandQuantity,

        record.demand_quantity

    ];


    for(
        let i = 0;
        i < values.length;
        i++
    ){

        if(
            values[i] !== undefined &&
            values[i] !== null &&
            values[i] !== ""
        ){

            return safeNumber(
                values[i]
            );

        }

    }


    return 0;

}


// =====================================
// GET DEMAND ITEM LIST
// =====================================

function getDemandItems(record){

    let list =
        record?.demand_items ??
        record?.demandItems ??
        record?.items ??
        [];


    if(
        typeof list
        ===
        "string"
    ){

        try{

            list =
                JSON.parse(
                    list
                );

        }
        catch(error){

            list = [];

        }

    }


    return Array.isArray(list)
        ? list
        : [];

}


// =====================================
// GET DEMAND FOR ITEM
// =====================================
//
// IMPORTANT:
// Only selected month's latest demand
// record is used.
//
// =====================================

function getDemandForItem(itemCode){

    let currentDemand =
        getSelectedDemandRecord();


    if(!currentDemand){

        return 0;

    }


    let wantedCode =
        cleanCode(
            itemCode
        );


    let list =
        getDemandItems(
            currentDemand
        );


    let total =
        0;


    for(
        let i = 0;
        i < list.length;
        i++
    ){

        let demandItem =
            list[i];


        let code =
            cleanCode(
                demandItem.code ??
                demandItem.item_code ??
                demandItem.itemCode ??
                ""
            );


        if(
            code
            !==
            wantedCode
        ){

            continue;

        }


        total +=
            getDemandValue(
                demandItem
            );

    }


    return total;

}


// =====================================
// GET CYCLE STOCK IN
// =====================================

function getCycleStockIn(
    itemCode,
    cycle
){

    let total =
        0;


    let wantedCode =
        cleanCode(
            itemCode
        );


    for(
        let i = 0;
        i < stockInData.length;
        i++
    ){

        let record =
            stockInData[i];


        if(
            getRecordItemCode(record)
            !==
            wantedCode
        ){

            continue;

        }


        if(
            !dateIsInsideDemandCycle(
                record.date,
                cycle
            )
        ){

            continue;

        }


        total +=
            safeNumber(
                record.quantity
            );

    }


    return total;

}


// =====================================
// GET CYCLE STOCK OUT
// =====================================

function getCycleStockOut(
    itemCode,
    cycle
){

    let total =
        0;


    let wantedCode =
        cleanCode(
            itemCode
        );


    for(
        let i = 0;
        i < stockOutData.length;
        i++
    ){

        let record =
            stockOutData[i];


        if(
            getRecordItemCode(record)
            !==
            wantedCode
        ){

            continue;

        }


        if(
            !dateIsInsideDemandCycle(
                record.date,
                cycle
            )
        ){

            continue;

        }


        total +=
            safeNumber(
                record.quantity
            );

    }


    return total;

}


// =====================================
// GET CYCLE PURCHASE COST
// =====================================

function getCyclePurchaseCost(
    itemCode,
    cycle
){

    let total =
        0;


    let wantedCode =
        cleanCode(
            itemCode
        );


    for(
        let i = 0;
        i < stockInData.length;
        i++
    ){

        let record =
            stockInData[i];


        if(
            getRecordItemCode(record)
            !==
            wantedCode
        ){

            continue;

        }


        if(
            !dateIsInsideDemandCycle(
                record.date,
                cycle
            )
        ){

            continue;

        }


        let qty =
            safeNumber(
                record.quantity
            );


        let rate =
            safeNumber(
                record.unit_cost ??
                record.unitCost
            );


        total +=
            qty * rate;

    }


    return total;

}


// =====================================
// CREATE GRAPH DATA
// =====================================

function createGraphData(){

    let select =
        document.getElementById(
            "itemSelect"
        );


    if(!select){

        return [];

    }


    let selectedCode =
        cleanCode(
            select.value
        );


    let selectedItems =
        [];


    if(
        selectedCode
        ===
        "all"
    ){

        selectedItems =
            items.slice();

    }
    else{

        for(
            let i = 0;
            i < items.length;
            i++
        ){

            if(
                getItemCode(items[i])
                ===
                selectedCode
            ){

                selectedItems.push(
                    items[i]
                );

                break;

            }

        }

    }


    let cycle =
        getActiveDemandCycle();


    let result =
        [];


    for(
        let i = 0;
        i < selectedItems.length;
        i++
    ){

        let item =
            selectedItems[i];


        let code =
            getItemCode(item);


        let stockIn =
            getCycleStockIn(
                code,
                cycle
            );


        let stockOut =
            getCycleStockOut(
                code,
                cycle
            );


        let demand =
            getDemandForItem(
                code
            );


        let cost =
            getCyclePurchaseCost(
                code,
                cycle
            );


        result.push({

            code:
                code,

            name:
                getItemName(item),

            unit:
                getItemUnit(item),

            stockIn:
                stockIn,

            stockOut:
                stockOut,

            demand:
                demand,

            cost:
                cost

        });

    }


    return result;

}


// =====================================
// PERIOD DATA
// =====================================
//
// Period graph now follows the active
// Demand Cycle instead of calendar month.
//
// =====================================

function createPeriodData(){

    let cycle =
        getActiveDemandCycle();


    let labels =
        [];


    let stockIn =
        [];


    let stockOut =
        [];


    let demand =
        [];


    let cost =
        [];


    let selectedCode =
        cleanCode(
            document.getElementById(
                "itemSelect"
            )?.value
        );


    if(
        selectedCode
        ===
        "all"
    ){

        // ---------------------------------
        // ALL ITEMS
        // Show cycle totals only
        // ---------------------------------

        let data =
            createGraphData();


        labels.push(
            "Demand Cycle"
        );


        let totalIn =
            0;


        let totalOut =
            0;


        let totalDemand =
            0;


        let totalCost =
            0;


        for(
            let i = 0;
            i < data.length;
            i++
        ){

            totalIn +=
                data[i].stockIn;

            totalOut +=
                data[i].stockOut;

            totalDemand +=
                data[i].demand;

            totalCost +=
                data[i].cost;

        }


        stockIn.push(
            totalIn
        );


        stockOut.push(
            totalOut
        );


        demand.push(
            totalDemand
        );


        cost.push(
            totalCost
        );


        return {

            labels:
                labels,

            stockIn:
                stockIn,

            stockOut:
                stockOut,

            demand:
                demand,

            cost:
                cost

        };

    }


    // ---------------------------------
    // SELECTED ITEM
    // ---------------------------------

    if(
        !cycle.startDate
    ){

        labels.push(
            "No Demand"
        );


        stockIn.push(0);

        stockOut.push(0);

        demand.push(
            getDemandForItem(
                selectedCode
            )
        );

        cost.push(0);


        return {

            labels:
                labels,

            stockIn:
                stockIn,

            stockOut:
                stockOut,

            demand:
                demand,

            cost:
                cost

        };

    }


    let start =
        getDateOnly(
            cycle.startDate
        );


    let end =
        cycle.endDate
            ? getDateOnly(
                cycle.endDate
              )
            : new Date();


    // ---------------------------------
    // Maximum 62 days for readability
    // ---------------------------------

    let dayCount =
        Math.ceil(
            (
                end - start
            )
            /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    if(
        dayCount < 1
    ){

        dayCount = 1;

    }


    // ---------------------------------
    // If cycle is very long,
    // use weekly periods.
    // ---------------------------------

    if(
        dayCount > 45
    ){

        let current =
            new Date(start);


        let weekNo =
            1;


        while(
            current < end
        ){

            let weekStart =
                new Date(current);


            let weekEnd =
                new Date(current);


            weekEnd.setDate(
                weekEnd.getDate()
                +
                7
            );


            if(
                weekEnd > end
            ){

                weekEnd =
                    new Date(end);

            }


            let inQty =
                0;


            let outQty =
                0;


            let purchaseCost =
                0;


            for(
                let i = 0;
                i < stockInData.length;
                i++
            ){

                let record =
                    stockInData[i];


                if(
                    getRecordItemCode(record)
                    !==
                    selectedCode
                ){

                    continue;

                }


                let date =
                    getDateOnly(
                        record.date
                    );


                if(
                    !date
                    ||
                    date < weekStart
                    ||
                    date >= weekEnd
                ){

                    continue;

                }


                let qty =
                    safeNumber(
                        record.quantity
                    );


                let rate =
                    safeNumber(
                        record.unit_cost ??
                        record.unitCost
                    );


                inQty +=
                    qty;


                purchaseCost +=
                    qty * rate;

            }


            for(
                let i = 0;
                i < stockOutData.length;
                i++
            ){

                let record =
                    stockOutData[i];


                if(
                    getRecordItemCode(record)
                    !==
                    selectedCode
                ){

                    continue;

                }


                let date =
                    getDateOnly(
                        record.date
                    );


                if(
                    !date
                    ||
                    date < weekStart
                    ||
                    date >= weekEnd
                ){

                    continue;

                }


                outQty +=
                    safeNumber(
                        record.quantity
                    );

            }


            labels.push(
                "Week " +
                weekNo
            );


            stockIn.push(
                inQty
            );


            stockOut.push(
                outQty
            );


            demand.push(
                weekNo === 1
                    ? getDemandForItem(
                        selectedCode
                      )
                    : 0
            );


            cost.push(
                purchaseCost
            );


            current =
                weekEnd;


            weekNo++;

        }

    }
    else{

        // ---------------------------------
        // DAILY DATA
        // ---------------------------------

        let current =
            new Date(start);


        while(
            current < end
        ){

            let dayStart =
                new Date(current);


            let dayEnd =
                new Date(current);


            dayEnd.setDate(
                dayEnd.getDate()
                +
                1
            );


            let inQty =
                0;


            let outQty =
                0;


            let purchaseCost =
                0;


            for(
                let i = 0;
                i < stockInData.length;
                i++
            ){

                let record =
                    stockInData[i];


                if(
                    getRecordItemCode(record)
                    !==
                    selectedCode
                ){

                    continue;

                }


                let date =
                    getDateOnly(
                        record.date
                    );


                if(
                    !date
                    ||
                    date < dayStart
                    ||
                    date >= dayEnd
                ){

                    continue;

                }


                let qty =
                    safeNumber(
                        record.quantity
                    );


                let rate =
                    safeNumber(
                        record.unit_cost ??
                        record.unitCost
                    );


                inQty +=
                    qty;


                purchaseCost +=
                    qty * rate;

            }


            for(
                let i = 0;
                i < stockOutData.length;
                i++
            ){

                let record =
                    stockOutData[i];


                if(
                    getRecordItemCode(record)
                    !==
                    selectedCode
                ){

                    continue;

                }


                let date =
                    getDateOnly(
                        record.date
                    );


                if(
                    !date
                    ||
                    date < dayStart
                    ||
                    date >= dayEnd
                ){

                    continue;

                }


                outQty +=
                    safeNumber(
                        record.quantity
                    );

            }


            let label =
                (
                    dayStart.getDate()
                ) +
                "/" +
                (
                    dayStart.getMonth() + 1
                );


            labels.push(
                label
            );


            stockIn.push(
                inQty
            );


            stockOut.push(
                outQty
            );


            // Demand is shown only on
            // first day of the cycle
            demand.push(
                dayStart.getTime()
                ===
                start.getTime()
                    ? getDemandForItem(
                        selectedCode
                      )
                    : 0
            );


            cost.push(
                purchaseCost
            );


            current =
                dayEnd;

        }

    }


    return {

        labels:
            labels,

        stockIn:
            stockIn,

        stockOut:
            stockOut,

        demand:
            demand,

        cost:
            cost

    };

}


// =====================================
// SUMMARY
// =====================================

function updateSummary(data){

    let totalIn =
        0;


    let totalOut =
        0;


    let totalDemand =
        0;


    let totalCost =
        0;


    for(
        let i = 0;
        i < data.length;
        i++
    ){

        totalIn +=
            safeNumber(
                data[i].stockIn
            );


        totalOut +=
            safeNumber(
                data[i].stockOut
            );


        totalDemand +=
            safeNumber(
                data[i].demand
            );


        totalCost +=
            safeNumber(
                data[i].cost
            );

    }


    let summaryIn =
        document.getElementById(
            "summaryStockIn"
        );


    let summaryOut =
        document.getElementById(
            "summaryStockOut"
        );


    let summaryDemand =
        document.getElementById(
            "summaryDemand"
        );


    let summaryCost =
        document.getElementById(
            "summaryCost"
        );


    if(summaryIn){

        summaryIn.innerHTML =
            totalIn.toLocaleString(
                undefined,
                {
                    maximumFractionDigits:2
                }
            );

    }


    if(summaryOut){

        summaryOut.innerHTML =
            totalOut.toLocaleString(
                undefined,
                {
                    maximumFractionDigits:2
                }
            );

    }


    if(summaryDemand){

        summaryDemand.innerHTML =
            totalDemand.toLocaleString(
                undefined,
                {
                    maximumFractionDigits:2
                }
            );

    }


    if(summaryCost){

        summaryCost.innerHTML =
            "Rs. " +
            totalCost.toLocaleString(
                undefined,
                {
                    minimumFractionDigits:2
                }
            );

    }

}


// =====================================
// ITEM INFO
// =====================================

function updateItemInfo(){

    let selectedElement =
        document.getElementById(
            "itemSelect"
        );


    let info =
        document.getElementById(
            "itemInfo"
        );


    if(
        !selectedElement ||
        !info
    ){

        return;

    }


    let selected =
        cleanCode(
            selectedElement.value
        );


    let cycle =
        getActiveDemandCycle();


    // ---------------------------------
    // ALL ITEMS
    // ---------------------------------

    if(
        selected
        ===
        "all"
    ){

        if(
            cycle.startDate
        ){

            let startText =
                cycle.startDate.toLocaleDateString();


            let endText =
                cycle.endDate
                    ? cycle.endDate.toLocaleDateString()
                    : "Next Demand Pending";


            info.innerHTML =
                "📊 <b>ALL ITEMS</b> | " +
                "Demand: " +
                startText +
                " → " +
                endText;

        }
        else{

            info.innerHTML =
                "📊 <b>ALL ITEMS</b> | " +
                "Selected month ki Demand abhi available nahi hai.";

        }


        return;

    }


    let item =
        null;


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        if(
            getItemCode(items[i])
            ===
            selected
        ){

            item =
                items[i];

            break;

        }

    }


    if(!item){

        info.innerHTML =
            "";

        return;

    }


    if(
        cycle.startDate
    ){

        let startText =
            cycle.startDate.toLocaleDateString();


        let endText =
            cycle.endDate
                ? cycle.endDate.toLocaleDateString()
                : "Next Demand Pending";


        info.innerHTML =
            "✅ <b>" +
            getItemCode(item) +
            "</b> — " +
            getItemName(item) +
            " | Unit: " +
            getItemUnit(item) +
            " | Demand Cycle: " +
            startText +
            " → " +
            endText;

    }
    else{

        info.innerHTML =
            "⚠️ <b>" +
            getItemCode(item) +
            "</b> — " +
            getItemName(item) +
            " | Selected month ki Demand nahi mili.";

    }

}


// =====================================
// DATA TABLE
// =====================================

function buildDataTable(data){

    let body =
        document.getElementById(
            "graphDataBody"
        );


    if(!body){

        return;

    }


    body.innerHTML =
        "";


    for(
        let i = 0;
        i < data.length;
        i++
    ){

        let row =
            document.createElement(
                "tr"
            );


        row.innerHTML =

            "<td>" +
            data[i].code +
            "</td>" +

            "<td>" +
            data[i].name +
            "</td>" +

            "<td>" +
            data[i].unit +
            "</td>" +

            "<td>" +
            safeNumber(
                data[i].stockIn
            ).toLocaleString(
                undefined,
                {
                    maximumFractionDigits:2
                }
            ) +
            "</td>" +

            "<td>" +
            safeNumber(
                data[i].stockOut
            ).toLocaleString(
                undefined,
                {
                    maximumFractionDigits:2
                }
            ) +
            "</td>" +

            "<td>" +
            safeNumber(
                data[i].demand
            ).toLocaleString(
                undefined,
                {
                    maximumFractionDigits:2
                }
            ) +
            "</td>" +

            "<td>" +
            "Rs. " +
            safeNumber(
                data[i].cost
            ).toLocaleString(
                undefined,
                {
                    minimumFractionDigits:2
                }
            ) +
            "</td>";


        body.appendChild(
            row
        );

    }

}


// =====================================
// CHART OPTIONS
// =====================================

function commonChartOptions(){

    return {

        responsive:
            true,

        maintainAspectRatio:
            false,

        interaction:{

            mode:
                "index",

            intersect:
                false

        },

        plugins:{

            legend:{

                position:
                    "top"

            },

            tooltip:{

                callbacks:{

                    label:
                        function(context){

                            let value =
                                safeNumber(
                                    context.raw
                                );


                            return (
                                context.dataset.label +
                                ": " +
                                value.toLocaleString(
                                    undefined,
                                    {
                                        maximumFractionDigits:2
                                    }
                                )
                            );

                        }

                }

            }

        }

    };

}


// =====================================
// UPDATE GRAPHS
// =====================================

function updateGraphs(){

    let itemSelect =
        document.getElementById(
            "itemSelect"
        );


    if(
        !itemSelect ||
        !itemSelect.value
    ){

        return;

    }


    let data =
        createGraphData();


    let periodData =
        createPeriodData();


    updateSummary(
        data
    );


    updateItemInfo();


    buildDataTable(
        data
    );


    // =================================
    // DESTROY OLD CHARTS
    // =================================

    if(stockDemandChart){

        stockDemandChart.destroy();

        stockDemandChart =
            null;

    }


    if(quantityChart){

        quantityChart.destroy();

        quantityChart =
            null;

    }


    if(costChart){

        costChart.destroy();

        costChart =
            null;

    }


    if(periodChart){

        periodChart.destroy();

        periodChart =
            null;

    }


    // =================================
    // GRAPH 1
    // STOCK IN / DEMAND / STOCK OUT
    // =================================

    let stockDemandCanvas =
        document.getElementById(
            "stockDemandChart"
        );


    if(stockDemandCanvas){

        let chartData =
            data;


        // ---------------------------------
        // For ALL ITEMS show top 20 by
        // activity so graph stays readable
        // ---------------------------------

        if(
            itemSelect.value
            ===
            "all"
        ){

            chartData =
                data
                    .slice()
                    .sort(
                        function(a,b){

                            let aTotal =
                                a.stockIn +
                                a.stockOut +
                                a.demand;


                            let bTotal =
                                b.stockIn +
                                b.stockOut +
                                b.demand;


                            return bTotal - aTotal;

                        }
                    )
                    .slice(
                        0,
                        20
                    );

        }


        stockDemandChart =
            new Chart(

                stockDemandCanvas,

                {

                    type:
                        "bar",

                    data:{

                        labels:
                            chartData.map(
                                function(x){

                                    return (
                                        x.code +
                                        " - " +
                                        x.name
                                    );

                                }
                            ),

                        datasets:[

                            {

                                label:
                                    "Stock In",

                                data:
                                    chartData.map(
                                        function(x){

                                            return x.stockIn;

                                        }
                                    )

                            },

                            {

                                label:
                                    "Monthly Demand",

                                data:
                                    chartData.map(
                                        function(x){

                                            return x.demand;

                                        }
                                    )

                            },

                            {

                                label:
                                    "Stock Out",

                                data:
                                    chartData.map(
                                        function(x){

                                            return x.stockOut;

                                        }
                                    )

                            }

                        ]

                    },

                    options:{

                        ...commonChartOptions(),

                        indexAxis:
                            "y",

                        scales:{

                            x:{

                                beginAtZero:
                                    true

                            },

                            y:{

                                ticks:{

                                    autoSkip:
                                        false

                                }

                            }

                        }

                    }

                }

            );

    }


    // =================================
    // GRAPH 2
    // QUANTITY
    // =================================

    let quantityCanvas =
        document.getElementById(
            "quantityChart"
        );


    if(quantityCanvas){

        let quantityData =
            data;


        if(
            itemSelect.value
            ===
            "all"
        ){

            quantityData =
                data
                    .slice()
                    .sort(
                        function(a,b){

                            let aTotal =
                                a.stockIn +
                                a.stockOut +
                                a.demand;


                            let bTotal =
                                b.stockIn +
                                b.stockOut +
                                b.demand;


                            return bTotal - aTotal;

                        }
                    )
                    .slice(
                        0,
                        20
                    );

        }


        quantityChart =
            new Chart(

                quantityCanvas,

                {

                    type:
                        "line",

                    data:{

                        labels:
                            quantityData.map(
                                function(x){

                                    return x.code;

                                }
                            ),

                        datasets:[

                            {

                                label:
                                    "Stock In",

                                data:
                                    quantityData.map(
                                        function(x){

                                            return x.stockIn;

                                        }
                                    ),

                                tension:
                                    .3

                            },

                            {

                                label:
                                    "Demand",

                                data:
                                    quantityData.map(
                                        function(x){

                                            return x.demand;

                                        }
                                    ),

                                tension:
                                    .3

                            },

                            {

                                label:
                                    "Stock Out",

                                data:
                                    quantityData.map(
                                        function(x){

                                            return x.stockOut;

                                        }
                                    ),

                                tension:
                                    .3

                            }

                        ]

                    },

                    options:{

                        ...commonChartOptions(),

                        scales:{

                            y:{

                                beginAtZero:
                                    true

                            }

                        }

                    }

                }

            );

    }


    // =================================
    // GRAPH 3
    // COST
    // =================================

    let costCanvas =
        document.getElementById(
            "costChart"
        );


    if(costCanvas){

        let costData =
            data;


        if(
            itemSelect.value
            ===
            "all"
        ){

            costData =
                data
                    .slice()
                    .sort(
                        function(a,b){

                            return b.cost - a.cost;

                        }
                    )
                    .slice(
                        0,
                        20
                    );

        }


        costChart =
            new Chart(

                costCanvas,

                {

                    type:
                        "bar",

                    data:{

                        labels:
                            costData.map(
                                function(x){

                                    return x.code;

                                }
                            ),

                        datasets:[

                            {

                                label:
                                    "Purchase Cost",

                                data:
                                    costData.map(
                                        function(x){

                                            return x.cost;

                                        }
                                    )

                            }

                        ]

                    },

                    options:{

                        ...commonChartOptions(),

                        indexAxis:
                            "y",

                        scales:{

                            x:{

                                beginAtZero:
                                    true,

                                ticks:{

                                    callback:
                                        function(value){

                                            return (
                                                "Rs. " +
                                                Number(
                                                    value
                                                ).toLocaleString()
                                            );

                                        }

                                }

                            }

                        },

                        plugins:{

                            ...commonChartOptions()
                                .plugins,

                            tooltip:{

                                callbacks:{

                                    label:
                                        function(context){

                                            return (
                                                "Purchase Cost: Rs. " +
                                                safeNumber(
                                                    context.raw
                                                ).toLocaleString()
                                            );

                                        }

                                }

                            }

                        }

                    }

                }

            );

    }


    // =================================
    // GRAPH 4
    // PERIOD
    // =================================

    let periodCanvas =
        document.getElementById(
            "periodChart"
        );


    if(periodCanvas){

        periodChart =
            new Chart(

                periodCanvas,

                {

                    type:
                        "line",

                    data:{

                        labels:
                            periodData.labels,

                        datasets:[

                            {

                                label:
                                    "Stock In",

                                data:
                                    periodData.stockIn,

                                tension:
                                    .3

                            },

                            {

                                label:
                                    "Demand",

                                data:
                                    periodData.demand,

                                tension:
                                    .3

                            },

                            {

                                label:
                                    "Stock Out",

                                data:
                                    periodData.stockOut,

                                tension:
                                    .3

                            },

                            {

                                label:
                                    "Purchase Cost",

                                data:
                                    periodData.cost,

                                tension:
                                    .3,

                                yAxisID:
                                    "costAxis"

                            }

                        ]

                    },

                    options:{

                        ...commonChartOptions(),

                        scales:{

                            y:{

                                beginAtZero:
                                    true,

                                title:{

                                    display:
                                        true,

                                    text:
                                        "Quantity"

                                }

                            },

                            costAxis:{

                                beginAtZero:
                                    true,

                                position:
                                    "right",

                                grid:{

                                    drawOnChartArea:
                                        false

                                },

                                title:{

                                    display:
                                        true,

                                    text:
                                        "Cost (Rs.)"

                                }

                            }

                        },

                        plugins:{

                            ...commonChartOptions()
                                .plugins,

                            tooltip:{

                                callbacks:{

                                    label:
                                        function(context){

                                            if(
                                                context.dataset.label
                                                ===
                                                "Purchase Cost"
                                            ){

                                                return (
                                                    "Purchase Cost: Rs. " +
                                                    safeNumber(
                                                        context.raw
                                                    ).toLocaleString()
                                                );

                                            }


                                            return (
                                                context.dataset.label +
                                                ": " +
                                                safeNumber(
                                                    context.raw
                                                ).toLocaleString()
                                            );

                                        }

                                }

                            }

                        }

                    }

                }

            );

    }

}


// =====================================
// START GRAPH
// =====================================

async function startGraphs(){

    await loadAllGraphData();

}


// =====================================
// START
// =====================================

startGraphs();
