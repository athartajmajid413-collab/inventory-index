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


    items = result.data || [];


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
        document.createElement("option");


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
            item.code;


        option.textContent =
            item.code +
            " - " +
            (
                item.item_name ||
                item.itemName ||
                ""
            );


        select.appendChild(
            option
        );

    }


    let saved =
        localStorage.getItem(
            "dashboardSelectedItem"
        );


    if(saved){

        for(
            let i = 0;
            i < items.length;
            i++
        ){

            if(
                String(
                    items[i].code
                ).trim()
                ===
                String(saved).trim()
            ){

                select.value =
                    saved;

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


    // STOCK IN YEARS

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


    // STOCK OUT YEARS

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


    // DEMAND YEARS

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


    if(yearArray.length == 0){

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

    let type =
        document.getElementById(
            "periodType"
        ).value;


    let month =
        document.getElementById(
            "monthSelect"
        );


    let monthLabel =
        document.getElementById(
            "monthLabel"
        );


    if(type == "year"){

        month.style.display =
            "none";


        monthLabel.style.display =
            "none";

    }
    else{

        month.style.display =
            "inline-block";


        monthLabel.style.display =
            "inline-block";

    }

}


// =====================================
// DATE MATCH
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


    let yearSelect =
        document.getElementById(
            "yearSelect"
        );


    let monthSelect =
        document.getElementById(
            "monthSelect"
        );


    let periodType =
        document.getElementById(
            "periodType"
        );


    if(
        !yearSelect ||
        !monthSelect ||
        !periodType
    ){

        return false;

    }


    let selectedYear =
        Number(
            yearSelect.value
        );


    let selectedMonth =
        Number(
            monthSelect.value
        );


    if(
        date.getFullYear()
        !=
        selectedYear
    ){

        return false;

    }


    if(
        periodType.value
        ==
        "year"
    ){

        return true;

    }


    return (
        date.getMonth() + 1
        ==
        selectedMonth
    );

}


// =====================================
// ITEM CODE HELPER
// =====================================

function getRecordItemCode(record){

    return String(
        record.item_code ||
        record.itemCode ||
        ""
    ).trim();

}


// =====================================
// ITEM NAME HELPER
// =====================================

function getRecordItemName(record){

    return (
        record.item_name ||
        record.itemName ||
        "-"
    );

}


// =====================================
// DEMAND VALUE
// =====================================

function getDemandValue(record){

    return Number(
        record.finalDemand ||
        record.final_demand ||
        record.approvedQty ||
        record.approved_qty ||
        record.quantity ||
        record.demandQuantity ||
        record.demand_quantity ||
        0
    );

}


// =====================================
// GET DEMAND FOR ITEM
// =====================================

function getDemandForItem(itemCode){

    let total =
        0;


    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let record =
            demandHistory[i];


        // ---------------------------------
        // DEMAND ITEMS
        // ---------------------------------

        let list =
            record.demand_items ||
            record.demandItems ||
            record.items ||
            [];


        // اگر JSON string ہو

        if(
            typeof list ===
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


        if(
            Array.isArray(list)
        ){

            for(
                let j = 0;
                j < list.length;
                j++
            ){

                let demandItem =
                    list[j];


                let code =
                    String(
                        demandItem.code ||
                        demandItem.item_code ||
                        demandItem.itemCode ||
                        ""
                    ).trim();


                if(
                    code
                    !=
                    String(
                        itemCode
                    ).trim()
                ){

                    continue;

                }


                let demandDate =
                    record.date ||
                    record.generate_date ||
                    demandItem.date;


                if(
                    dateMatches(
                        demandDate
                    )
                ){

                    total +=
                        getDemandValue(
                            demandItem
                        );

                }

            }

        }

    }


    return total;

}


// =====================================
// CREATE GRAPH DATA
// =====================================

function createGraphData(){

    let selectedCode =
        document.getElementById(
            "itemSelect"
        ).value;


    let selectedItems =
        [];


    if(
        selectedCode
        ==
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
                String(
                    items[i].code
                ).trim()
                ==
                String(
                    selectedCode
                ).trim()
            ){

                selectedItems.push(
                    items[i]
                );

                break;

            }

        }

    }


    let result =
        [];


    for(
        let i = 0;
        i < selectedItems.length;
        i++
    ){

        let item =
            selectedItems[i];


        let stockIn =
            0;


        let stockOut =
            0;


        let cost =
            0;


        // =================================
        // STOCK IN
        // =================================

        for(
            let j = 0;
            j < stockInData.length;
            j++
        ){

            let record =
                stockInData[j];


            let code =
                getRecordItemCode(
                    record
                );


            if(
                code
                !=
                String(
                    item.code
                ).trim()
            ){

                continue;

            }


            if(
                !dateMatches(
                    record.date
                )
            ){

                continue;

            }


            let qty =
                Number(
                    record.quantity ||
                    0
                );


            let unitCost =
                Number(
                    record.unit_cost ||
                    record.unitCost ||
                    0
                );


            stockIn +=
                qty;


            cost +=
                qty *
                unitCost;

        }


        // =================================
        // STOCK OUT
        // =================================

        for(
            let j = 0;
            j < stockOutData.length;
            j++
        ){

            let record =
                stockOutData[j];


            let code =
                getRecordItemCode(
                    record
                );


            if(
                code
                !=
                String(
                    item.code
                ).trim()
            ){

                continue;

            }


            if(
                !dateMatches(
                    record.date
                )
            ){

                continue;

            }


            stockOut +=
                Number(
                    record.quantity ||
                    0
                );

        }


        // =================================
        // DEMAND
        // =================================

        let demand =
            getDemandForItem(
                item.code
            );


        result.push({

            code:
                item.code,

            name:
                item.item_name ||
                item.itemName ||
                "-",

            unit:
                item.unit ||
                "-",

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

function createPeriodData(){

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


    let type =
        document.getElementById(
            "periodType"
        ).value;


    let year =
        Number(
            document.getElementById(
                "yearSelect"
            ).value
        );


    let selectedCode =
        document.getElementById(
            "itemSelect"
        ).value;


    function itemAllowed(code){

        if(
            selectedCode
            ==
            "all"
        ){

            return true;

        }


        return (
            String(code).trim()
            ==
            String(
                selectedCode
            ).trim()
        );

    }


    // =================================
    // MONTH WISE
    // =================================

    if(
        type
        ==
        "month"
    ){

        let month =
            Number(
                document.getElementById(
                    "monthSelect"
                ).value
            );


        let days =
            new Date(
                year,
                month,
                0
            ).getDate();


        for(
            let day = 1;
            day <= days;
            day++
        ){

            labels.push(
                day
            );


            let inQty =
                0;


            let outQty =
                0;


            let demandQty =
                0;


            let purchaseCost =
                0;


            // =================================
            // STOCK IN
            // =================================

            for(
                let i = 0;
                i < stockInData.length;
                i++
            ){

                let record =
                    stockInData[i];


                if(
                    !record.date ||
                    !itemAllowed(
                        getRecordItemCode(
                            record
                        )
                    )
                ){

                    continue;

                }


                let date =
                    new Date(
                        record.date
                    );


                if(
                    date.getFullYear()
                    ==
                    year
                    &&
                    date.getMonth() + 1
                    ==
                    month
                    &&
                    date.getDate()
                    ==
                    day
                ){

                    let qty =
                        Number(
                            record.quantity ||
                            0
                        );


                    let unitCost =
                        Number(
                            record.unit_cost ||
                            record.unitCost ||
                            0
                        );


                    inQty +=
                        qty;


                    purchaseCost +=
                        qty *
                        unitCost;

                }

            }


            // =================================
            // STOCK OUT
            // =================================

            for(
                let i = 0;
                i < stockOutData.length;
                i++
            ){

                let record =
                    stockOutData[i];


                if(
                    !record.date ||
                    !itemAllowed(
                        getRecordItemCode(
                            record
                        )
                    )
                ){

                    continue;

                }


                let date =
                    new Date(
                        record.date
                    );


                if(
                    date.getFullYear()
                    ==
                    year
                    &&
                    date.getMonth() + 1
                    ==
                    month
                    &&
                    date.getDate()
                    ==
                    day
                ){

                    outQty +=
                        Number(
                            record.quantity ||
                            0
                        );

                }

            }


            // =================================
            // DEMAND
            // =================================

            for(
                let i = 0;
                i < demandHistory.length;
                i++
            ){

                let record =
                    demandHistory[i];


                let recordDate =
                    record.date ||
                    record.generate_date;


                if(!recordDate){

                    continue;

                }


                let date =
                    new Date(
                        recordDate
                    );


                if(
                    date.getFullYear()
                    !=
                    year
                    ||
                    date.getMonth() + 1
                    !=
                    month
                    ||
                    date.getDate()
                    !=
                    day
                ){

                    continue;

                }


                let list =
                    record.demand_items ||
                    record.demandItems ||
                    record.items ||
                    [];


                if(
                    typeof list ===
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


                if(
                    Array.isArray(list)
                ){

                    for(
                        let j = 0;
                        j < list.length;
                        j++
                    ){

                        let demandItem =
                            list[j];


                        let code =
                            String(
                                demandItem.code ||
                                demandItem.item_code ||
                                demandItem.itemCode ||
                                ""
                            ).trim();


                        if(
                            itemAllowed(
                                code
                            )
                        ){

                            demandQty +=
                                getDemandValue(
                                    demandItem
                                );

                        }

                    }

                }

            }


            stockIn.push(
                inQty
            );


            stockOut.push(
                outQty
            );


            demand.push(
                demandQty
            );


            cost.push(
                purchaseCost
            );

        }

    }


    // =================================
    // YEAR WISE
    // =================================

    else{

        let months = [

            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"

        ];


        for(
            let month = 1;
            month <= 12;
            month++
        ){

            labels.push(
                months[
                    month - 1
                ]
            );


            let inQty =
                0;


            let outQty =
                0;


            let demandQty =
                0;


            let purchaseCost =
                0;


            // STOCK IN

            for(
                let i = 0;
                i < stockInData.length;
                i++
            ){

                let record =
                    stockInData[i];


                if(
                    !record.date ||
                    !itemAllowed(
                        getRecordItemCode(
                            record
                        )
                    )
                ){

                    continue;

                }


                let date =
                    new Date(
                        record.date
                    );


                if(
                    date.getFullYear()
                    ==
                    year
                    &&
                    date.getMonth() + 1
                    ==
                    month
                ){

                    let qty =
                        Number(
                            record.quantity ||
                            0
                        );


                    let unitCost =
                        Number(
                            record.unit_cost ||
                            record.unitCost ||
                            0
                        );


                    inQty +=
                        qty;


                    purchaseCost +=
                        qty *
                        unitCost;

                }

            }


            // STOCK OUT

            for(
                let i = 0;
                i < stockOutData.length;
                i++
            ){

                let record =
                    stockOutData[i];


                if(
                    !record.date ||
                    !itemAllowed(
                        getRecordItemCode(
                            record
                        )
                    )
                ){

                    continue;

                }


                let date =
                    new Date(
                        record.date
                    );


                if(
                    date.getFullYear()
                    ==
                    year
                    &&
                    date.getMonth() + 1
                    ==
                    month
                ){

                    outQty +=
                        Number(
                            record.quantity ||
                            0
                        );

                }

            }


            // DEMAND

            for(
                let i = 0;
                i < demandHistory.length;
                i++
            ){

                let record =
                    demandHistory[i];


                let recordDate =
                    record.date ||
                    record.generate_date;


                if(!recordDate){

                    continue;

                }


                let date =
                    new Date(
                        recordDate
                    );


                if(
                    date.getFullYear()
                    !=
                    year
                    ||
                    date.getMonth() + 1
                    !=
                    month
                ){

                    continue;

                }


                let list =
                    record.demand_items ||
                    record.demandItems ||
                    record.items ||
                    [];


                if(
                    typeof list ===
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


                if(
                    Array.isArray(list)
                ){

                    for(
                        let j = 0;
                        j < list.length;
                        j++
                    ){

                        let demandItem =
                            list[j];


                        let code =
                            String(
                                demandItem.code ||
                                demandItem.item_code ||
                                demandItem.itemCode ||
                                ""
                            ).trim();


                        if(
                            itemAllowed(
                                code
                            )
                        ){

                            demandQty +=
                                getDemandValue(
                                    demandItem
                                );

                        }

                    }

                }

            }


            stockIn.push(
                inQty
            );


            stockOut.push(
                outQty
            );


            demand.push(
                demandQty
            );


            cost.push(
                purchaseCost
            );

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
            data[i].stockIn;


        totalOut +=
            data[i].stockOut;


        totalDemand +=
            data[i].demand;


        totalCost +=
            data[i].cost;

    }


    document.getElementById(
        "summaryStockIn"
    ).innerHTML =
        totalIn.toLocaleString();


    document.getElementById(
        "summaryStockOut"
    ).innerHTML =
        totalOut.toLocaleString();


    document.getElementById(
        "summaryDemand"
    ).innerHTML =
        totalDemand.toLocaleString();


    document.getElementById(
        "summaryCost"
    ).innerHTML =
        "Rs. " +
        totalCost.toLocaleString(
            undefined,
            {
                minimumFractionDigits:2
            }
        );

}


// =====================================
// ITEM INFO
// =====================================

function updateItemInfo(){

    let selected =
        document.getElementById(
            "itemSelect"
        ).value;


    let info =
        document.getElementById(
            "itemInfo"
        );


    if(
        selected
        ==
        "all"
    ){

        info.innerHTML =
            "📊 Showing <b>ALL ITEMS</b> — complete store data";

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
            String(
                items[i].code
            ).trim()
            ==
            String(
                selected
            ).trim()
        ){

            item =
                items[i];

            break;

        }

    }


    if(item){

        info.innerHTML =
            "✅ Selected Item: <b>" +
            item.code +
            "</b> — " +
            (
                item.item_name ||
                item.itemName ||
                "-"
            ) +
            " | Unit: " +
            (
                item.unit ||
                "-"
            );

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
            data[i].stockIn.toFixed(2) +
            "</td>" +

            "<td>" +
            data[i].stockOut.toFixed(2) +
            "</td>" +

            "<td>" +
            data[i].demand.toFixed(2) +
            "</td>" +

            "<td>" +
            "Rs. " +
            data[i].cost.toLocaleString(
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
// UPDATE GRAPHS
// =====================================

function updateGraphs(){

    if(
        !document.getElementById(
            "itemSelect"
        ).value
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

    }


    if(quantityChart){

        quantityChart.destroy();

    }


    if(costChart){

        costChart.destroy();

    }


    if(periodChart){

        periodChart.destroy();

    }


    // =================================
    // GRAPH 1
    // =================================

    stockDemandChart =
        new Chart(

            document.getElementById(
                "stockDemandChart"
            ),

            {

                type:
                    "bar",

                data:{

                    labels:
                        data.map(
                            x =>
                                x.name
                        ),

                    datasets:[

                        {

                            label:
                                "Stock In",

                            data:
                                data.map(
                                    x =>
                                        x.stockIn
                                )

                        },

                        {

                            label:
                                "Demand",

                            data:
                                data.map(
                                    x =>
                                        x.demand
                                )

                        },

                        {

                            label:
                                "Stock Out",

                            data:
                                data.map(
                                    x =>
                                        x.stockOut
                                )

                        }

                    ]

                },

                options:{

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

                        }

                    },

                    scales:{

                        x:{

                            ticks:{

                                autoSkip:
                                    false,

                                maxRotation:
                                    60,

                                minRotation:
                                    30

                            }

                        },

                        y:{

                            beginAtZero:
                                true

                        }

                    }

                }

            }

        );


    // =================================
    // GRAPH 2
    // =================================

    quantityChart =
        new Chart(

            document.getElementById(
                "quantityChart"
            ),

            {

                type:
                    "line",

                data:{

                    labels:
                        data.map(
                            x =>
                                x.name
                        ),

                    datasets:[

                        {

                            label:
                                "Stock In",

                            data:
                                data.map(
                                    x =>
                                        x.stockIn
                                ),

                            tension:
                                .3

                        },

                        {

                            label:
                                "Demand",

                            data:
                                data.map(
                                    x =>
                                        x.demand
                                ),

                            tension:
                                .3

                        },

                        {

                            label:
                                "Stock Out",

                            data:
                                data.map(
                                    x =>
                                        x.stockOut
                                ),

                            tension:
                                .3

                        }

                    ]

                },

                options:{

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins:{

                        legend:{

                            position:
                                "top"

                        }

                    }

                }

            }

        );


    // =================================
    // GRAPH 3 COST
    // =================================

    costChart =
        new Chart(

            document.getElementById(
                "costChart"
            ),

            {

                type:
                    "bar",

                data:{

                    labels:
                        data.map(
                            x =>
                                x.name
                        ),

                    datasets:[

                        {

                            label:
                                "Purchase Cost",

                            data:
                                data.map(
                                    x =>
                                        x.cost
                                )

                        }

                    ]

                },

                options:{

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins:{

                        legend:{

                            position:
                                "top"

                        },

                        tooltip:{

                            callbacks:{

                                label:
                                    function(
                                        context
                                    ){

                                        return (
                                            "Rs. " +
                                            Number(
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


    // =================================
    // GRAPH 4 PERIOD
    // =================================

    periodChart =
        new Chart(

            document.getElementById(
                "periodChart"
            ),

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

                        legend:{

                            position:
                                "top"

                        },

                        tooltip:{

                            callbacks:{

                                label:
                                    function(
                                        context
                                    ){

                                        if(
                                            context.dataset.label
                                            ==
                                            "Purchase Cost"
                                        ){

                                            return (
                                                "Purchase Cost: Rs. " +
                                                Number(
                                                    context.raw
                                                ).toLocaleString()
                                            );

                                        }


                                        return (
                                            context.dataset.label +
                                            ": " +
                                            Number(
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
