// =====================================================
// MONTHLY DEMAND
// SUPABASE CONNECTED VERSION
// ORIGINAL TABLE ORDER PRESERVED
// =====================================================


// =====================================================
// DATA
// =====================================================

let items = [];

let history = [];

let demandEdits =
    JSON.parse(
        localStorage.getItem("demandEdits")
    ) || {};

let stockMonths =
    JSON.parse(
        localStorage.getItem("stockMonths")
    ) || {};

let demandHistory = [];


// =====================================================
// LOAD ALL DATA FROM SUPABASE
// =====================================================

async function loadMonthlyDemandData(){

    console.log("=====================================");
    console.log("LOADING MONTHLY DEMAND DATA");
    console.log("=====================================");


    // =================================================
    // LOAD ITEMS
    // =================================================

    let itemResult =
        await supabaseRequest(
            "items",
            "GET",
            null,
            "?select=*"
        );


    if(!itemResult.success){

        console.error(
            "❌ Items Load Error:",
            itemResult.error
        );

        alert(
            "Master List data load نہیں ہو سکا۔"
        );

        return;

    }


    items =
        itemResult.data || [];


    // =================================================
    // LOAD STOCK IN
    // =================================================

    history = [];


    let stockInResult =
        await supabaseRequest(
            "stock_in",
            "GET",
            null,
            "?select=*"
        );


    if(stockInResult.success){

        let stockIn =
            stockInResult.data || [];


        stockIn.forEach(function(record){

            history.push({

                type:
                    "Stock In",

                itemCode:
                    record.item_code ||
                    record.itemCode ||
                    "",

                itemName:
                    record.item_name ||
                    record.itemName ||
                    "",

                quantity:
                    Number(
                        record.quantity || 0
                    ),

                unitCost:
                    Number(
                        record.unit_cost ||
                        record.unitCost ||
                        0
                    ),

                date:
                    record.date ||
                    record.transaction_date ||
                    "",

                time:
                    record.time ||
                    record.transaction_time ||
                    "",

                source:
                    record.source ||
                    "",

                supplier:
                    record.supplier ||
                    "",

                location:
                    record.location ||
                    ""

            });

        });

    }
    else{

        console.error(
            "Stock In Load Error:",
            stockInResult.error
        );

    }


    // =================================================
    // LOAD STOCK ISSUE
    // =================================================

    let stockOutResult =
        await supabaseRequest(
            "stock_issue",
            "GET",
            null,
            "?select=*"
        );


    if(stockOutResult.success){

        let stockOut =
            stockOutResult.data || [];


        stockOut.forEach(function(record){

            history.push({

                type:
                    "Stock Issue",

                itemCode:
                    record.item_code ||
                    record.itemCode ||
                    "",

                itemName:
                    record.item_name ||
                    record.itemName ||
                    "",

                quantity:
                    Number(
                        record.quantity || 0
                    ),

                date:
                    record.date ||
                    record.transaction_date ||
                    "",

                time:
                    record.time ||
                    record.transaction_time ||
                    "",

                source:
                    record.source ||
                    "",

                supplier:
                    record.supplier ||
                    "",

                location:
                    record.location ||
                    "",

                department:
                    record.department ||
                    ""

            });

        });

    }
    else{

        console.error(
            "Stock Issue Load Error:",
            stockOutResult.error
        );

    }


    // =================================================
    // LOAD DEMAND HISTORY
    // =================================================

    let demandResult =
        await supabaseRequest(
            "demand_history",
            "GET",
            null,
            "?select=*&order=id.desc"
        );


    if(demandResult.success){

        demandHistory =
            demandResult.data || [];

        console.log(
            "✅ Demand History Loaded:",
            demandHistory.length
        );

    }
    else{

        console.error(
            "Demand History Load Error:",
            demandResult.error
        );

        demandHistory = [];

    }


    // =================================================
    // CONSOLE CHECK
    // =================================================

    console.log(
        "Items:",
        items.length
    );

    console.log(
        "History:",
        history.length
    );

    console.log(
        "Demand History:",
        demandHistory.length
    );

    console.log("=====================================");


    // =================================================
    // SHOW TABLE
    // =================================================

    showAllItems();

}


// =====================================================
// GET ITEM BY CODE
// =====================================================

function getItemByCode(code){

    return items.find(function(item){

        return String(
            item.code || ""
        ).trim()
        ===
        String(
            code || ""
        ).trim();

    }) || null;

}


// =====================================================
// GET RECORD DATE
// =====================================================

function getRecordDate(record){

    if(!record){

        return null;

    }


    let value =
        record.date ||
        record.transactionDate ||
        record.transaction_date ||
        record.entryDate ||
        "";


    if(!value){

        return null;

    }


    let date =
        new Date(value);


    if(!isNaN(date.getTime())){

        return date;

    }


    let parts =
        String(value).split("/");


    if(parts.length === 3){

        let day =
            Number(parts[0]);

        let month =
            Number(parts[1]) - 1;

        let year =
            Number(parts[2]);


        if(
            !isNaN(day) &&
            !isNaN(month) &&
            !isNaN(year)
        ){

            return new Date(
                year,
                month,
                day
            );

        }

    }


    return null;

}


// =====================================================
// CURRENT STOCK
// =====================================================

function getCurrentStock(item){

    let currentStock =
        Number(
            item.openingStock ??
            item.opening_stock ??
            0
        );


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        let recordCode =
            String(
                record.itemCode || ""
            ).trim();


        let itemCode =
            String(
                item.code || ""
            ).trim();


        if(
            recordCode !==
            itemCode
        ){

            continue;

        }


        if(
            record.type ===
            "Stock In"
        ){

            currentStock +=
                Number(
                    record.quantity || 0
                );

        }


        if(
            record.type ===
            "Stock Issue"
        ){

            currentStock -=
                Number(
                    record.quantity || 0
                );

        }

    }


    if(currentStock < 0){

        currentStock = 0;

    }


    return currentStock;

}


// =====================================================
// AVERAGE CONSUMPTION
// =====================================================

function calculateAverageConsumption(
    itemCode
){

    let monthData = {};


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


        if(
            String(
                record.itemCode || ""
            ).trim()
            !==
            String(
                itemCode || ""
            ).trim()
        ){

            continue;

        }


        let date =
            getRecordDate(record);


        if(!date){

            continue;

        }


        let key =
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(2,"0");


        if(
            !monthData[key]
        ){

            monthData[key] = 0;

        }


        monthData[key] +=
            Number(
                record.quantity || 0
            );

    }


    let months =
        Object.keys(
            monthData
        );


    if(
        months.length === 0
    ){

        return 0;

    }


    let total = 0;


    for(
        let i = 0;
        i < months.length;
        i++
    ){

        total +=
            monthData[
                months[i]
            ];

    }


    return total /
        months.length;

}


// =====================================================
// MINIMUM STOCK
// LAST 3 MONTHS STOCK ISSUE
// =====================================================

function calculateMinimumStock(
    itemCode
){

    let monthData = {};


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


        if(
            String(
                record.itemCode || ""
            ).trim()
            !==
            String(
                itemCode || ""
            ).trim()
        ){

            continue;

        }


        let date =
            getRecordDate(record);


        if(!date){

            continue;

        }


        let month =
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(2,"0");


        if(
            !monthData[month]
        ){

            monthData[month] = 0;

        }


        monthData[month] +=
            Number(
                record.quantity || 0
            );

    }


    let months =
        Object.keys(
            monthData
        );


    months.sort();


    let lastThree =
        months.slice(-3);


    if(
        lastThree.length === 0
    ){

        return 0;

    }


    let total = 0;


    for(
        let i = 0;
        i < lastThree.length;
        i++
    ){

        total +=
            monthData[
                lastThree[i]
            ];

    }


    return total /
        lastThree.length;

}


// =====================================================
// PURCHASE RATES
// =====================================================

function getPurchaseRates(
    itemCode
){

    let purchases = [];


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


        if(
            String(
                record.itemCode || ""
            ).trim()
            !==
            String(
                itemCode || ""
            ).trim()
        ){

            continue;

        }


        purchases.push(
            record
        );

    }


    purchases.sort(
        function(a,b){

            let dateA =
                String(
                    a.date || ""
                ) +
                String(
                    a.time || ""
                );


            let dateB =
                String(
                    b.date || ""
                ) +
                String(
                    b.time || ""
                );


            return dateA.localeCompare(
                dateB
            );

        }
    );


    if(
        purchases.length === 0
    ){

        return {

            firstRate: "-",

            secondRate: "-",

            latestRate: "-",

            latestDate: "-"

        };

    }


    let first =
        purchases[
            purchases.length - 3
        ];


    let second =
        purchases[
            purchases.length - 2
        ];


    let latest =
        purchases[
            purchases.length - 1
        ];


    return {

        firstRate:
            first
            ? Number(
                first.unitCost || 0
            ).toFixed(2)
            : "-",

        secondRate:
            second
            ? Number(
                second.unitCost || 0
            ).toFixed(2)
            : "-",

        latestRate:
            latest
            ? Number(
                latest.unitCost || 0
            ).toFixed(2)
            : "-",

        latestDate:
            latest
            ? latest.date
            : "-"

    };

}


// =====================================================
// SHOW ALL ITEMS
// =====================================================

function showAllItems(){

    let demandBody =
        document.getElementById(
            "demandBody"
        );


    if(!demandBody){

        console.error(
            "Demand body not found."
        );

        return;

    }


    demandBody.innerHTML = "";


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let item =
            items[i];


        let row =
            document.createElement(
                "tr"
            );


        // =================================================
        // 0 SELECT
        // =================================================

        let cell0 =
            document.createElement(
                "td"
            );


        let checkbox =
            document.createElement(
                "input"
            );


        checkbox.type =
            "checkbox";


        checkbox.className =
            "demandCheck";


        checkbox.dataset.index =
            i;


        cell0.appendChild(
            checkbox
        );


        row.appendChild(
            cell0
        );


        // =================================================
        // 1 CATEGORY
        // =================================================

        let cell1 =
            document.createElement(
                "td"
            );


        cell1.innerHTML =
            item.category || "-";


        row.appendChild(
            cell1
        );


        // =================================================
        // 2 ITEM CODE
        // =================================================

        let cell2 =
            document.createElement(
                "td"
            );


        cell2.innerHTML =
            item.code || "-";


        row.appendChild(
            cell2
        );


        // =================================================
        // 3 ITEM NAME
        // =================================================

        let cell3 =
            document.createElement(
                "td"
            );


        cell3.innerHTML =
            item.itemName ||
            item.item_name ||
            "-";


        row.appendChild(
            cell3
        );


        // =================================================
        // 4 SPECIFICATION
        // =================================================

        let cell4 =
            document.createElement(
                "td"
            );


        cell4.innerHTML =
            item.specification || "-";


        row.appendChild(
            cell4
        );


        // =================================================
        // 5 SOURCE
        // =================================================

        let cell5 =
            document.createElement(
                "td"
            );


        cell5.innerHTML =
            item.source || "-";


        row.appendChild(
            cell5
        );


        // =================================================
        // 6 SUPPLIER
        // =================================================

        let cell6 =
            document.createElement(
                "td"
            );


        cell6.innerHTML =
            item.supplier || "-";


        row.appendChild(
            cell6
        );


        // =================================================
        // PURCHASE DATA
        // =================================================

        let purchaseInfo =
            getPurchaseRates(
                item.code
            );


        // =================================================
        // 7 LATEST PURCHASE DATE
        // =================================================

        let cell7 =
            document.createElement(
                "td"
            );


        cell7.innerHTML =
            purchaseInfo.latestDate;


        row.appendChild(
            cell7
        );


        // =================================================
        // 8 FIRST RATE
        // =================================================

        let cell8 =
            document.createElement(
                "td"
            );


        cell8.innerHTML =
            purchaseInfo.firstRate;


        row.appendChild(
            cell8
        );


        // =================================================
        // 9 SECOND RATE
        // =================================================

        let cell9 =
            document.createElement(
                "td"
            );


        cell9.innerHTML =
            purchaseInfo.secondRate;


        row.appendChild(
            cell9
        );


        // =================================================
        // 10 LATEST RATE
        // =================================================

        let cell10 =
            document.createElement(
                "td"
            );


        cell10.innerHTML =
            purchaseInfo.latestRate;


        row.appendChild(
            cell10
        );


        // =================================================
        // 11 UNIT
        // =================================================

        let cell11 =
            document.createElement(
                "td"
            );


        cell11.innerHTML =
            item.unit || "-";


        row.appendChild(
            cell11
        );


        // =================================================
        // 12 PACKING QTY
        // =================================================

        let cell12 =
            document.createElement(
                "td"
            );


        cell12.innerHTML =
            item.packingQty ??
            item.packing_qty ??
            "-";


        row.appendChild(
            cell12
        );


        // =================================================
        // 13 PACKED UNIT
        // =================================================

        let cell13 =
            document.createElement(
                "td"
            );


        cell13.innerHTML =
            item.packedUnit ??
            item.packed_unit ??
            "-";


        row.appendChild(
            cell13
        );


        // =================================================
        // 14 CONSUMPTION / AVERAGE
        // =================================================

        let averageConsumption =
            calculateAverageConsumption(
                item.code
            );


        let cell14 =
            document.createElement(
                "td"
            );


        cell14.innerHTML =
            averageConsumption.toFixed(2);


        row.appendChild(
            cell14
        );


        // =================================================
        // 15 STOCK MONTHS
        // EDITABLE
        // =================================================

        let savedStockMonth =
            stockMonths[
                String(item.code)
            ];


        if(
            savedStockMonth === undefined ||
            savedStockMonth === null ||
            savedStockMonth === ""
        ){

            savedStockMonth = 3;

        }


        let cell15 =
            document.createElement(
                "td"
            );


        let stockMonthInput =
            document.createElement(
                "input"
            );


        stockMonthInput.type =
            "number";


        stockMonthInput.step =
            "0.5";


        stockMonthInput.min =
            "0";


        stockMonthInput.value =
            savedStockMonth;


        stockMonthInput.style.width =
            "80px";


        stockMonthInput.style.padding =
            "6px";


        stockMonthInput.title =
            "Enter required stock months";


        stockMonthInput.onchange =
            function(){

                let value =
                    Number(
                        this.value
                    );


                if(
                    isNaN(value) ||
                    value < 0
                ){

                    value = 0;

                    this.value = 0;

                }


                stockMonths[
                    String(item.code)
                ] = value;


                localStorage.setItem(
                    "stockMonths",
                    JSON.stringify(
                        stockMonths
                    )
                );


                showAllItems();

            };


        cell15.appendChild(
            stockMonthInput
        );


        row.appendChild(
            cell15
        );


        // =================================================
        // CURRENT STOCK
        // =================================================

        let cell16 =
            document.createElement(
                "td"
            );


        let currentStock =
            getCurrentStock(
                item
            );


        cell16.innerHTML =
            currentStock.toFixed(2);


        // =================================================
        // MINIMUM STOCK
        // =================================================

        let minimumStock =
            calculateMinimumStock(
                item.code
            );


        // =================================================
        // REQUIRED STOCK
        // =================================================

        let requiredStock =
            averageConsumption *
            Number(
                savedStockMonth
            );


        // =================================================
        // DEMAND QUANTITY
        // =================================================

        let demandQuantity =
            requiredStock -
            currentStock;


        if(
            demandQuantity < 0
        ){

            demandQuantity = 0;

        }


        // =================================================
        // CURRENT STOCK COLOR
        // =================================================

        if(
            currentStock <=
            minimumStock
        ){

            cell16.style.backgroundColor =
                "#e74c3c";

            cell16.style.color =
                "white";

            cell16.style.fontWeight =
                "bold";

        }
        else if(
            currentStock <=
            requiredStock
        ){

            cell16.style.backgroundColor =
                "#f1c40f";

            cell16.style.color =
                "#000";

            cell16.style.fontWeight =
                "bold";

        }
        else{

            cell16.style.backgroundColor =
                "#d5f5e3";

            cell16.style.color =
                "#1e8449";

            cell16.style.fontWeight =
                "bold";

        }


        row.appendChild(
            cell16
        );


        // =================================================
        // 17 DEMAND QUANTITY
        // =================================================

        let cell17 =
            document.createElement(
                "td"
            );


        cell17.innerHTML =
            demandQuantity.toFixed(2);


        row.appendChild(
            cell17
        );


        // =================================================
        // 18 APPROVED QTY
        // =================================================

        let packingQty =
            Number(
                item.packingQty ??
                item.packing_qty ??
                0
            );


        let approvedQty =
            demandQuantity;


        if(
            packingQty > 0 &&
            demandQuantity > 0
        ){

            approvedQty =
                Math.ceil(
                    demandQuantity /
                    packingQty
                ) *
                packingQty;

        }


        let cell18 =
            document.createElement(
                "td"
            );


        cell18.innerHTML =
            approvedQty.toFixed(2);


        row.appendChild(
            cell18
        );


        // =================================================
        // 19 REMARKS
        // =================================================

        let cell19 =
            document.createElement(
                "td"
            );


        cell19.innerHTML =
            "-";


        row.appendChild(
            cell19
        );


        // =================================================
        // LOAD SAVED EDIT
        // =================================================

        let savedEdit =
            demandEdits[
                String(item.code)
            ];


        if(savedEdit){

            cell18.innerHTML =
                Number(
                    savedEdit.finalDemand ??
                    approvedQty
                ).toFixed(2);


            cell19.innerHTML =
                savedEdit.remarks ||
                "-";

        }


        // =================================================
        // 20 ACTION
        // =================================================

        let cell20 =
            document.createElement(
                "td"
            );


        let editButton =
            document.createElement(
                "button"
            );


        editButton.innerHTML =
            "Edit Approved";


        editButton.type =
            "button";


        editButton.onclick =
            function(){

                let approved =
                    prompt(
                        "Enter Approved Qty:",
                        cell18.innerHTML
                    );


                if(
                    approved === null
                ){

                    return;

                }


                approved =
                    Number(
                        approved
                    );


                if(
                    isNaN(approved) ||
                    approved < 0
                ){

                    alert(
                        "Please enter a valid Approved Qty!"
                    );

                    return;

                }


                let remarks =
                    prompt(
                        "Enter Remarks:",
                        cell19.innerHTML === "-"
                        ? ""
                        : cell19.innerHTML
                    );


                if(
                    remarks === null
                ){

                    return;

                }


                cell18.innerHTML =
                    approved.toFixed(2);


                cell19.innerHTML =
                    remarks || "-";


                demandEdits[
                    String(item.code)
                ] = {

                    finalDemand:
                        approved,

                    remarks:
                        remarks

                };


                localStorage.setItem(
                    "demandEdits",
                    JSON.stringify(
                        demandEdits
                    )
                );


                alert(
                    "Approved Qty saved successfully!"
                );

            };


        cell20.appendChild(
            editButton
        );


        row.appendChild(
            cell20
        );


        // =================================================
        // ADD ROW
        // =================================================

        demandBody.appendChild(
            row
        );

    }


    console.log(
        "✅ Monthly Demand Table:",
        items.length,
        "items"
    );

}


// =====================================================
// SELECT ALL
// =====================================================

function selectAllItems(){

    let checkboxes =
        document.querySelectorAll(
            ".demandCheck"
        );


    for(
        let i = 0;
        i < checkboxes.length;
        i++
    ){

        checkboxes[i].checked =
            true;

    }

}


// =====================================================
// UNSELECT ALL
// =====================================================

function unselectAllItems(){

    let checkboxes =
        document.querySelectorAll(
            ".demandCheck"
        );


    for(
        let i = 0;
        i < checkboxes.length;
        i++
    ){

        checkboxes[i].checked =
            false;

    }

}


// =====================================================
// GENERATE DEMAND
// =====================================================

function generateDemand(){

    let checkboxes =
        document.querySelectorAll(
            ".demandCheck"
        );


    let selectedCount = 0;


    for(
        let i = 0;
        i < checkboxes.length;
        i++
    ){

        if(
            checkboxes[i].checked
        ){

            selectedCount++;

        }

    }


    if(
        selectedCount === 0
    ){

        alert(
            "Please select at least one item!"
        );

        return;

    }


    let demandMonth =
        document.getElementById(
            "month"
        ).value;


    if(
        demandMonth === ""
    ){

        alert(
            "Please select Demand Month!"
        );

        return;

    }


    let confirmGenerate =
        confirm(
            "Generate Demand for " +
            selectedCount +
            " selected item(s)?"
        );


    if(
        !confirmGenerate
    ){

        return;

    }


    saveGeneratedDemand();

}


// =====================================================
// SAVE GENERATED DEMAND
// SUPABASE
// =====================================================

async function saveGeneratedDemand(){

    let checkboxes =
        document.querySelectorAll(
            ".demandCheck"
        );


    let selectedItems = [];


    for(
        let i = 0;
        i < checkboxes.length;
        i++
    ){

        if(
            !checkboxes[i].checked
        ){

            continue;

        }


        let row =
            checkboxes[i]
            .closest("tr");


        let cells =
            row.querySelectorAll(
                "td"
            );


        let demandItem = {

            category:
                cells[1].innerText,

            itemCode:
                cells[2].innerText,

            itemName:
                cells[3].innerText,

            specification:
                cells[4].innerText,

            source:
                cells[5].innerText,

            supplier:
                cells[6].innerText,

            latestPurchaseDate:
                cells[7].innerText,

            firstRate:
                cells[8].innerText,

            secondRate:
                cells[9].innerText,

            latestRate:
                cells[10].innerText,

            unit:
                cells[11].innerText,

            packingQty:
                cells[12].innerText,

            packedUnit:
                cells[13].innerText,

            average:
                cells[14].innerText,

            stockMonth:
                cells[15]
                .querySelector("input")
                .value,

            currentStock:
                cells[16].innerText,

            demandQuantity:
                cells[17].innerText,

            approvedQty:
                cells[18].innerText,

            remarks:
                cells[19].innerText

        };


        selectedItems.push(
            demandItem
        );

    }


    if(
        selectedItems.length === 0
    ){

        alert(
            "Please select at least one item!"
        );

        return;

    }


    let demandMonth =
        document.getElementById(
            "month"
        ).value;


    if(
        demandMonth === ""
    ){

        alert(
            "Please select Demand Month!"
        );

        return;

    }


    // =================================================
    // DEMAND NUMBER
    // =================================================

    let demandNumber =
        "DEM-" +
        Date.now();


    let today =
        new Date();


    let generateDate =
        today
        .toISOString()
        .split("T")[0];


    // =================================================
    // DEMAND RECORD
    // =================================================

    let demandRecord = {

        demand_no:
            demandNumber,

        demand_month:
            demandMonth,

        generate_date:
            generateDate,

        date:
            generateDate,

        items:
            selectedItems,

        demand_items:
            selectedItems,

        status:
            "Generated"

    };


    console.log(
        "====================================="
    );

    console.log(
        "SAVING DEMAND TO SUPABASE"
    );

    console.log(
        demandRecord
    );


    // =================================================
    // SAVE TO SUPABASE
    // =================================================

    let result =
        await supabaseRequest(
            "demand_history",
            "POST",
            demandRecord
        );


    if(!result.success){

        console.error(
            "❌ Demand Save Error:",
            result.error
        );


        alert(
            "Demand Supabase میں save نہیں ہوئی۔\n\n" +
            JSON.stringify(
                result.error
            )
        );


        return;

    }


    console.log(
        "✅ Demand Saved:",
        result.data
    );


    // =================================================
    // LOCAL DEMAND HISTORY BACKUP
    // =================================================

    let localDemandHistory =
        JSON.parse(
            localStorage.getItem(
                "demandHistory"
            )
        ) || [];


    localDemandHistory.unshift(
        demandRecord
    );


    localStorage.setItem(
        "demandHistory",
        JSON.stringify(
            localDemandHistory
        )
    );


    // =================================================
    // OTHER LOCAL DATA
    // =================================================

    localStorage.setItem(
        "generatedDemandMonth",
        demandMonth
    );


    localStorage.setItem(
        "generatedDemandCount",
        String(
            selectedItems.length
        )
    );


    // =================================================
    // CLEAR APPROVED EDIT
    // =================================================

    for(
        let i = 0;
        i < selectedItems.length;
        i++
    ){

        let code =
            String(
                selectedItems[i].itemCode
            );


        delete demandEdits[
            code
        ];

    }


    localStorage.setItem(
        "demandEdits",
        JSON.stringify(
            demandEdits
        )
    );


    // =================================================
    // UPDATE MEMORY
    // =================================================

    if(
        result.data &&
        result.data.length > 0
    ){

        demandHistory.unshift(
            result.data[0]
        );

    }
    else{

        demandHistory.unshift(
            demandRecord
        );

    }


    // =================================================
    // MESSAGE
    // =================================================

    alert(

        "Demand Generated Successfully!\n\n" +

        "Demand No: " +
        demandNumber +

        "\nDemand Month: " +
        demandMonth +

        "\nSelected Items: " +
        selectedItems.length

    );


    console.log(
        "====================================="
    );

}


// =====================================================
// ADD DEMAND
// =====================================================

function addDemand(){

    let code =
        document.getElementById(
            "itemCode"
        ).value.trim();


    let month =
        document.getElementById(
            "month"
        ).value;


    if(
        code === ""
    ){

        alert(
            "Please enter Item Code!"
        );

        return;

    }


    if(
        month === ""
    ){

        alert(
            "Please select Demand Month!"
        );

        return;

    }


    let item =
        getItemByCode(
            code
        );


    if(!item){

        alert(
            "Item Code not found!"
        );

        return;

    }


    // Table already contains all master items.
    // Therefore no duplicate row is created.

    alert(
        "Item already exists in the Monthly Demand list."
    );

}


// =====================================================
// SHOW ITEM INFO
// =====================================================

function showItemInfo(){

    let input =
        document.getElementById(
            "itemCode"
        );


    if(!input){

        return;

    }


    let code =
        input.value.trim();


    if(
        code === ""
    ){

        input.style.border = "";

        return;

    }


    let item =
        getItemByCode(
            code
        );


    if(item){

        input.style.border =
            "2px solid #16a085";

    }
    else{

        input.style.border =
            "2px solid #e74c3c";

    }

}


// =====================================================
// PRINT SELECTED DEMAND
// =====================================================

function printSelectedDemand(){

    let checkboxes =
        document.querySelectorAll(
            ".demandCheck"
        );


    let selectedRows = [];


    for(
        let i = 0;
        i < checkboxes.length;
        i++
    ){

        if(
            checkboxes[i].checked
        ){

            selectedRows.push(
                checkboxes[i]
                .closest("tr")
            );

        }

    }


    if(
        selectedRows.length === 0
    ){

        alert(
            "Please select at least one item to print!"
        );

        return;

    }


    let today =
        new Date();


    let printDate =
        today.toLocaleDateString(
            "en-GB"
        );


    let demandMonth =
        document.getElementById(
            "month"
        ).value;


    let formattedDemandMonth =
        "-";


    if(demandMonth){

        let parts =
            demandMonth.split("-");


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


        formattedDemandMonth =
            monthNames[
                Number(
                    parts[1]
                ) - 1
            ] +
            " " +
            parts[0];

    }


    let printWindow =
        window.open(
            "",
            "",
            "width=1400,height=800"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups for printing."
        );

        return;

    }


    let printContent = `

<html>

<head>

<title>Monthly Demand</title>

<style>

body{
    font-family:Arial,sans-serif;
    padding:20px;
}

h2,
h1{
    text-align:center;
}

.info-section{
    display:flex;
    justify-content:space-between;
    margin-top:15px;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}

th{
    background:#12355b;
    color:white;
    padding:7px;
}

td{
    border:1px solid #999;
    padding:7px;
}

.current-stock-low{
    background-color:#e74c3c !important;
    color:white !important;
    font-weight:bold;
}

.current-stock-yellow{
    background-color:#f1c40f !important;
    color:#000 !important;
    font-weight:bold;
}

.current-stock-normal{
    background-color:#d5f5e3 !important;
    color:#1e8449 !important;
    font-weight:bold;
}

.approval-section{
    display:flex;
    justify-content:space-between;
    margin-top:40px;
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
MONTHLY DEMAND
</h1>

<div class="info-section">

<span>
<strong>Demand Month:</strong>
${formattedDemandMonth}
</span>

<span>
<strong>Print Date:</strong>
${printDate}
</span>

</div>

<table>

<thead>

<tr>

<th>Category</th>
<th>Item Code</th>
<th>Item Name</th>
<th>Specification</th>
<th>Source</th>
<th>Supplier</th>
<th>Latest Purchase Date</th>
<th>1st Rate</th>
<th>2nd Rate</th>
<th>Latest Rate</th>
<th>Unit</th>
<th>Packing Qty</th>
<th>Packed Unit</th>
<th>Consumption / Average</th>
<th>Stock Month</th>
<th>Current Stock</th>
<th>Demand Quantity</th>
<th>Approved Qty</th>
<th>Remarks</th>

</tr>

</thead>

<tbody>

`;


    for(
        let i = 0;
        i < selectedRows.length;
        i++
    ){

        let cells =
            selectedRows[i]
            .querySelectorAll("td");


        printContent +=
            "<tr>";


        for(
            let j = 1;
            j <= 19;
            j++
        ){

            let className = "";


            if(
                j === 16
            ){

                let currentStock =
                    Number(
                        cells[j].innerText
                    );


                let itemCode =
                    cells[2].innerText;


                let minimumStock =
                    calculateMinimumStock(
                        itemCode
                    );


                let average =
                    Number(
                        cells[14].innerText
                    );


                let stockMonth =
                    Number(
                        cells[15]
                        .querySelector("input")
                        .value
                    );


                let requiredStock =
                    average *
                    stockMonth;


                if(
                    currentStock <=
                    minimumStock
                ){

                    className =
                        "current-stock-low";

                }
                else if(
                    currentStock <=
                    requiredStock
                ){

                    className =
                        "current-stock-yellow";

                }
                else{

                    className =
                        "current-stock-normal";

                }

            }


            let value =
                cells[j].innerHTML;


            if(
                j === 15
            ){

                value =
                    cells[j]
                    .querySelector("input")
                    .value;

            }


            printContent +=

                "<td class='" +
                className +
                "'>" +
                value +
                "</td>";

        }


        printContent +=
            "</tr>";

    }


    printContent += `

</tbody>

</table>

<div class="approval-section">

<span>
Prepared By: __________________
</span>

<span>
Verified By: __________________
</span>

<span>
Approved By: __________________
</span>

</div>

</body>

</html>

`;


    printWindow.document.write(
        printContent
    );


    printWindow.document.close();


    printWindow.focus();


    setTimeout(
        function(){

            printWindow.print();

        },
        300
    );

}


// =====================================================
// REFRESH
// =====================================================

async function refreshMonthlyDemand(){

    await loadMonthlyDemandData();

}


// =====================================================
// PAGE LOAD
// =====================================================

window.addEventListener(
    "load",
    function(){

        loadMonthlyDemandData();

    }
);

// =====================================================
// EXPORT MONTHLY DEMAND TO EXCEL
// =====================================================

function exportDemandToExcel(){

    let table =
        document.querySelector("table");

    if(!table){

        alert(
            "Monthly Demand table not found!"
        );

        return;

    }


    let rows =
        table.querySelectorAll("tr");


    if(rows.length === 0){

        alert(
            "No data available to export!"
        );

        return;

    }


    let csv = [];


    for(
        let i = 0;
        i < rows.length;
        i++
    ){

        let cells =
            rows[i].querySelectorAll(
                "th, td"
            );


        let row = [];


        for(
            let j = 0;
            j < cells.length;
            j++
        ){

            let value =
                cells[j].innerText
                .replace(/\n/g, " ")
                .replace(/"/g, '""')
                .trim();


            row.push(
                '"' + value + '"'
            );

        }


        csv.push(
            row.join(",")
        );

    }


    let csvContent =
        "\uFEFF" +
        csv.join("\n");


    let blob =
        new Blob(
            [csvContent],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    let url =
        URL.createObjectURL(
            blob
        );


    let link =
        document.createElement("a");


    link.href =
        url;


    let today =
        new Date();


    let date =
        today.getFullYear() +
        "-" +
        String(
            today.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            today.getDate()
        ).padStart(2, "0");


    link.download =
        "Monthly_Demand_" +
        date +
        ".csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    alert(
        "Monthly Demand exported to Excel successfully!"
    );

}
