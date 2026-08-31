// =====================================================
// MONTHLY DEMAND
// SUPABASE VERSION
// =====================================================


// =====================================================
// DATA
// =====================================================

let items = [];
let stockIn = [];
let stockOut = [];
let demandHistory = [];

let selectedItems = {};


// =====================================================
// LOAD DATA FROM SUPABASE
// =====================================================

async function loadMonthlyDemandData(){

    console.log("=====================================");
    console.log("LOADING MONTHLY DEMAND DATA");
    console.log("=====================================");


    // -------------------------------------
    // ITEMS
    // -------------------------------------

    let itemResult =
        await supabaseRequest(
            "items",
            "GET",
            null,
            "?select=*"
        );


    if(!itemResult.success){

        console.error(
            "Items Load Error:",
            itemResult.error
        );

        alert("Items data load نہیں ہو سکا۔");

        return;

    }


    items =
        itemResult.data || [];


    // -------------------------------------
    // STOCK IN
    // -------------------------------------

    let stockInResult =
        await supabaseRequest(
            "stock_in",
            "GET",
            null,
            "?select=*"
        );


    if(stockInResult.success){

        stockIn =
            stockInResult.data || [];

    }
    else{

        console.error(
            "Stock In Load Error:",
            stockInResult.error
        );

        stockIn = [];

    }


    // -------------------------------------
    // STOCK OUT / ISSUE
    // -------------------------------------

    let stockOutResult =
        await supabaseRequest(
            "stock_issue",
            "GET",
            null,
            "?select=*"
        );


    if(stockOutResult.success){

        stockOut =
            stockOutResult.data || [];

    }
    else{

        console.error(
            "Stock Issue Load Error:",
            stockOutResult.error
        );

        stockOut = [];

    }


    // -------------------------------------
    // DEMAND HISTORY
    // -------------------------------------

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

    }
    else{

        console.error(
            "Demand History Load Error:",
            demandResult.error
        );

        demandHistory = [];

    }


    console.log(
        "Items:",
        items.length
    );

    console.log(
        "Stock In:",
        stockIn.length
    );

    console.log(
        "Stock Out:",
        stockOut.length
    );

    console.log(
        "Demand History:",
        demandHistory.length
    );

    console.log("=====================================");


    showAllItems();

}


// =====================================================
// GET ITEM BY CODE
// =====================================================

function getItemByCode(code){

    let searchCode =
        String(code || "")
        .trim()
        .toLowerCase();


    return items.find(function(item){

        return String(
            item.code || ""
        )
        .trim()
        .toLowerCase()
        ===
        searchCode;

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
        record.transaction_date ||
        record.transactionDate ||
        record.entry_date ||
        record.entryDate ||
        record.generate_date ||
        record.generateDate ||
        "";


    if(!value){

        return null;

    }


    let date =
        new Date(value);


    if(!isNaN(date.getTime())){

        return date;

    }


    // DD/MM/YYYY

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
// GET STOCK IN ITEM CODE
// =====================================================

function getStockInCode(record){

    return String(
        record.item_code ||
        record.itemCode ||
        record.code ||
        ""
    )
    .trim();

}


// =====================================================
// GET STOCK OUT ITEM CODE
// =====================================================

function getStockOutCode(record){

    return String(
        record.item_code ||
        record.itemCode ||
        record.code ||
        ""
    )
    .trim();

}


// =====================================================
// GET STOCK IN QUANTITY
// =====================================================

function getStockInQuantity(record){

    return Number(
        record.quantity ||
        record.qty ||
        0
    );

}


// =====================================================
// GET STOCK OUT QUANTITY
// =====================================================

function getStockOutQuantity(record){

    return Number(
        record.quantity ||
        record.qty ||
        0
    );

}


// =====================================================
// GET STOCK IN RATE
// =====================================================

function getStockInRate(record){

    return Number(
        record.unit_cost ??
        record.unitCost ??
        record.latest_rate ??
        record.latestRate ??
        record.rate ??
        record.cost ??
        0
    );

}


// =====================================================
// CURRENT STOCK
// =====================================================

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


    let totalIn = 0;

    let totalOut = 0;


    // -------------------------------------
    // STOCK IN
    // -------------------------------------

    for(
        let i = 0;
        i < stockIn.length;
        i++
    ){

        let record =
            stockIn[i];


        if(
            getStockInCode(record)
            ===
            String(item.code || "").trim()
        ){

            totalIn +=
                getStockInQuantity(record);

        }

    }


    // -------------------------------------
    // STOCK OUT
    // -------------------------------------

    for(
        let i = 0;
        i < stockOut.length;
        i++
    ){

        let record =
            stockOut[i];


        if(
            getStockOutCode(record)
            ===
            String(item.code || "").trim()
        ){

            totalOut +=
                getStockOutQuantity(record);

        }

    }


    return Math.max(
        openingStock +
        totalIn -
        totalOut,
        0
    );

}


// =====================================================
// MONTHLY CONSUMPTION
// =====================================================

function calculateAverageConsumption(itemCode){

    let monthlyTotals = {};


    for(
        let i = 0;
        i < stockOut.length;
        i++
    ){

        let record =
            stockOut[i];


        if(
            getStockOutCode(record)
            !==
            String(itemCode || "").trim()
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
            )
            .padStart(2,"0");


        monthlyTotals[key] =
            (
                monthlyTotals[key] || 0
            )
            +
            getStockOutQuantity(record);

    }


    let values =
        Object.values(
            monthlyTotals
        );


    if(values.length === 0){

        return 0;

    }


    let total =
        values.reduce(
            function(a,b){

                return a + b;

            },
            0
        );


    return total / values.length;

}


// =====================================================
// GET PURCHASE HISTORY
// =====================================================

function getPurchaseHistory(itemCode){

    let list = [];


    for(
        let i = 0;
        i < stockIn.length;
        i++
    ){

        let record =
            stockIn[i];


        if(
            getStockInCode(record)
            ===
            String(itemCode || "").trim()
        ){

            list.push(record);

        }

    }


    list.sort(
        function(a,b){

            let dateA =
                getRecordDate(a);

            let dateB =
                getRecordDate(b);


            if(!dateA) return 1;

            if(!dateB) return -1;


            return dateB - dateA;

        }
    );


    return list;

}


// =====================================================
// GET RATES
// =====================================================

function getRates(itemCode){

    let purchases =
        getPurchaseHistory(itemCode);


    let firstRate = 0;
    let secondRate = 0;
    let latestRate = 0;

    let latestDate = "-";

    let latestRecord = null;


    if(purchases.length > 0){

        latestRecord =
            purchases[0];


        latestRate =
            getStockInRate(
                latestRecord
            );


        latestDate =
            latestRecord.date ||
            latestRecord.transaction_date ||
            "-";


        if(purchases.length > 1){

            secondRate =
                getStockInRate(
                    purchases[1]
                );

        }


        if(purchases.length > 2){

            firstRate =
                getStockInRate(
                    purchases[2]
                );

        }
        else if(purchases.length === 2){

            firstRate =
                getStockInRate(
                    purchases[1]
                );

        }

    }
    else{

        latestRate =
            Number(
                itemLatestRate(itemCode)
            );

    }


    return {

        firstRate:
            firstRate,

        secondRate:
            secondRate,

        latestRate:
            latestRate,

        latestDate:
            latestDate,

        latestRecord:
            latestRecord

    };

}


// =====================================================
// ITEM LATEST RATE
// =====================================================

function itemLatestRate(itemCode){

    let item =
        getItemByCode(itemCode);


    if(!item){

        return 0;

    }


    return Number(
        item.latest_rate ??
        item.latestRate ??
        item.unit_cost ??
        item.unitCost ??
        item.cost ??
        item.opening_cost ??
        item.openingCost ??
        0
    );

}


// =====================================================
// SOURCE
// =====================================================

function getItemSource(item){

    return (
        item.source ||
        item.source_supplier ||
        item.sourceSupplier ||
        "-"
    );

}


// =====================================================
// SUPPLIER
// =====================================================

function getItemSupplier(item){

    return (
        item.supplier ||
        item.supplier_name ||
        item.supplierName ||
        "-"
    );

}


// =====================================================
// PACKING QTY
// =====================================================

function getPackingQty(item){

    return (
        item.packing_qty ??
        item.packingQty ??
        item.packing_quantity ??
        item.packingQuantity ??
        "-"
    );

}


// =====================================================
// PACKED UNIT
// =====================================================

function getPackedUnit(item){

    return (
        item.packed_unit ||
        item.packedUnit ||
        item.packing_unit ||
        item.packingUnit ||
        "-"
    );

}


// =====================================================
// STOCK MONTHS
// =====================================================

function calculateStockMonths(
    currentStock,
    average
){

    if(
        !average ||
        average <= 0
    ){

        return 0;

    }


    return currentStock / average;

}


// =====================================================
// DEMAND QUANTITY
// =====================================================

function calculateDemandQuantity(
    requiredStock,
    currentStock
){

    return Math.max(
        requiredStock -
        currentStock,
        0
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


    if(code === ""){

        return;

    }


    let item =
        getItemByCode(code);


    if(!item){

        return;

    }

}


// =====================================================
// SHOW ALL ITEMS
// =====================================================

function showAllItems(){

    let body =
        document.getElementById(
            "demandBody"
        );


    if(!body){

        console.error(
            "demandBody not found."
        );

        return;

    }


    body.innerHTML = "";


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


        let average =
            calculateAverageConsumption(
                code
            );


        let currentStock =
            getCurrentStock(item);


        // 3 MONTH STOCK

        let requiredStock =
            average * 3;


        let demandQuantity =
            calculateDemandQuantity(
                requiredStock,
                currentStock
            );


        let stockMonths =
            calculateStockMonths(
                currentStock,
                average
            );


        let rates =
            getRates(code);


        let latestDate =
            rates.latestDate;


        let approvedQty =
            demandQuantity;


        let remarks =
            "";


        let saved =
            selectedItems[code];


        if(saved){

            if(
                saved.approvedQty !==
                undefined
            ){

                approvedQty =
                    Number(
                        saved.approvedQty
                    );

            }


            if(
                saved.remarks !==
                undefined
            ){

                remarks =
                    saved.remarks;

            }

        }


        let row =
            document.createElement(
                "tr"
            );


        // =================================================
        // SELECT
        // =================================================

        let selectCell =
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
            "item-select";

        checkbox.dataset.code =
            code;


        checkbox.checked =
            !!(
                selectedItems[code] &&
                selectedItems[code].selected
            );


        checkbox.addEventListener(
            "change",
            function(){

                if(
                    !selectedItems[code]
                ){

                    selectedItems[code] = {};

                }


                selectedItems[code].selected =
                    checkbox.checked;

            }
        );


        selectCell.appendChild(
            checkbox
        );


        row.appendChild(
            selectCell
        );


        // =================================================
        // CATEGORY
        // =================================================

        row.appendChild(
            createCell(
                item.category || "-"
            )
        );


        // =================================================
        // ITEM CODE
        // =================================================

        row.appendChild(
            createCell(
                code || "-"
            )
        );


        // =================================================
        // ITEM NAME
        // =================================================

        row.appendChild(
            createCell(
                item.item_name ||
                item.itemName ||
                "-"
            )
        );


        // =================================================
        // SPECIFICATION
        // =================================================

        row.appendChild(
            createCell(
                item.specification ||
                "-"
            )
        );


        // =================================================
        // SOURCE
        // =================================================

        row.appendChild(
            createCell(
                getItemSource(item)
            )
        );


        // =================================================
        // SUPPLIER
        // =================================================

        row.appendChild(
            createCell(
                getItemSupplier(item)
            )
        );


        // =================================================
        // LATEST PURCHASE DATE
        // =================================================

        row.appendChild(
            createCell(
                latestDate
            )
        );


        // =================================================
        // 1ST RATE
        // =================================================

        row.appendChild(
            createCell(
                "Rs. " +
                rates.firstRate.toFixed(2)
            )
        );


        // =================================================
        // 2ND RATE
        // =================================================

        row.appendChild(
            createCell(
                "Rs. " +
                rates.secondRate.toFixed(2)
            )
        );


        // =================================================
        // LATEST RATE
        // =================================================

        row.appendChild(
            createCell(
                "Rs. " +
                rates.latestRate.toFixed(2)
            )
        );


        // =================================================
        // UNIT
        // =================================================

        row.appendChild(
            createCell(
                item.unit ||
                item.uom ||
                "-"
            )
        );


        // =================================================
        // PACKING QTY
        // =================================================

        row.appendChild(
            createCell(
                getPackingQty(item)
            )
        );


        // =================================================
        // PACKED UNIT
        // =================================================

        row.appendChild(
            createCell(
                getPackedUnit(item)
            )
        );


        // =================================================
        // CONSUMPTION / AVERAGE
        // =================================================

        row.appendChild(
            createCell(
                average.toFixed(2)
            )
        );


        // =================================================
        // STOCK MONTHS
        // =================================================

        row.appendChild(
            createCell(
                stockMonths.toFixed(2)
            )
        );


        // =================================================
        // CURRENT STOCK
        // =================================================

        let currentStockCell =
            createCell(
                currentStock.toFixed(2)
            );


        if(
            currentStock <= 0
        ){

            currentStockCell.style.backgroundColor =
                "#ffcccc";

        }
        else if(
            average > 0 &&
            stockMonths <= 1
        ){

            currentStockCell.style.backgroundColor =
                "#fff2cc";

        }


        row.appendChild(
            currentStockCell
        );


        // =================================================
        // DEMAND QUANTITY
        // =================================================

        row.appendChild(
            createCell(
                demandQuantity.toFixed(2)
            )
        );


        // =================================================
        // APPROVED QTY
        // =================================================

        let approvedCell =
            document.createElement(
                "td"
            );


        let approvedInput =
            document.createElement(
                "input"
            );


        approvedInput.type =
            "number";

        approvedInput.min =
            "0";

        approvedInput.value =
            approvedQty;


        approvedInput.className =
            "approved-qty-input";

        approvedInput.dataset.code =
            code;


        approvedInput.addEventListener(
            "change",
            function(){

                if(
                    !selectedItems[code]
                ){

                    selectedItems[code] = {};

                }


                selectedItems[code].approvedQty =
                    Number(
                        approvedInput.value || 0
                    );

            }
        );


        approvedCell.appendChild(
            approvedInput
        );


        row.appendChild(
            approvedCell
        );


        // =================================================
        // REMARKS
        // =================================================

        let remarksCell =
            document.createElement(
                "td"
            );


        let remarksInput =
            document.createElement(
                "input"
            );


        remarksInput.type =
            "text";

        remarksInput.value =
            remarks;

        remarksInput.className =
            "remarks-input";

        remarksInput.dataset.code =
            code;


        remarksInput.addEventListener(
            "change",
            function(){

                if(
                    !selectedItems[code]
                ){

                    selectedItems[code] = {};

                }


                selectedItems[code].remarks =
                    remarksInput.value;

            }
        );


        remarksCell.appendChild(
            remarksInput
        );


        row.appendChild(
            remarksCell
        );


        // =================================================
        // ACTION
        // =================================================

        let actionCell =
            document.createElement(
                "td"
            );


        let selectButton =
            document.createElement(
                "button"
            );


        selectButton.type =
            "button";

        selectButton.innerHTML =
            checkbox.checked ?
            "☑ Selected" :
            "Select";


        selectButton.onclick =
            function(){

                checkbox.checked =
                    !checkbox.checked;


                if(
                    !selectedItems[code]
                ){

                    selectedItems[code] = {};

                }


                selectedItems[code].selected =
                    checkbox.checked;


                selectButton.innerHTML =
                    checkbox.checked ?
                    "☑ Selected" :
                    "Select";

            };


        actionCell.appendChild(
            selectButton
        );


        row.appendChild(
            actionCell
        );


        body.appendChild(
            row
        );

    }


    console.log(
        "Monthly Demand Items:",
        items.length
    );

}


// =====================================================
// CREATE TABLE CELL
// =====================================================

function createCell(value){

    let cell =
        document.createElement(
            "td"
        );


    cell.textContent =
        value === undefined ||
        value === null
        ?
        "-"
        :
        value;


    return cell;

}


// =====================================================
// SELECT ALL
// =====================================================

function selectAllItems(){

    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let code =
            String(
                items[i].code || ""
            ).trim();


        if(
            !selectedItems[code]
        ){

            selectedItems[code] = {};

        }


        selectedItems[code].selected =
            true;

    }


    document
        .querySelectorAll(
            ".item-select"
        )
        .forEach(
            function(box){

                box.checked =
                    true;

            }
        );


    document
        .querySelectorAll(
            "td button"
        )
        .forEach(
            function(button){

                if(
                    button.innerHTML ===
                    "Select"
                ){

                    button.innerHTML =
                        "☑ Selected";

                }

            }
        );

}


// =====================================================
// UNSELECT ALL
// =====================================================

function unselectAllItems(){

    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let code =
            String(
                items[i].code || ""
            ).trim();


        if(
            !selectedItems[code]
        ){

            selectedItems[code] = {};

        }


        selectedItems[code].selected =
            false;

    }


    document
        .querySelectorAll(
            ".item-select"
        )
        .forEach(
            function(box){

                box.checked =
                    false;

            }
        );


    document
        .querySelectorAll(
            "td button"
        )
        .forEach(
            function(button){

                if(
                    button.innerHTML ===
                    "☑ Selected"
                ){

                    button.innerHTML =
                        "Select";

                }

            }
        );

}


// =====================================================
// ADD DEMAND
// =====================================================

function addDemand(){

    let codeInput =
        document.getElementById(
            "itemCode"
        );


    let monthInput =
        document.getElementById(
            "month"
        );


    if(!codeInput){

        alert(
            "Item Code field نہیں ملا۔"
        );

        return;

    }


    let code =
        codeInput.value.trim();


    if(code === ""){

        alert(
            "Please enter Item Code."
        );

        return;

    }


    let item =
        getItemByCode(code);


    if(!item){

        alert(
            "Item Code نہیں ملا: " +
            code
        );

        return;

    }


    let demandMonth =
        monthInput ?
        monthInput.value :
        "";


    if(
        !demandMonth
    ){

        let today =
            new Date();


        demandMonth =
            today.getFullYear() +
            "-" +
            String(
                today.getMonth() + 1
            )
            .padStart(2,"0");

    }


    if(
        !selectedItems[code]
    ){

        selectedItems[code] = {};

    }


    selectedItems[code].selected =
        true;


    selectedItems[code].demandMonth =
        demandMonth;


    showAllItems();


    codeInput.value =
        "";


    alert(
        "Item Demand میں add ہو گیا ہے۔"
    );

}


// =====================================================
// GET SELECTED ITEMS
// =====================================================

function getSelectedDemandItems(){

    let result = [];


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


        if(
            !selectedItems[code] ||
            !selectedItems[code].selected
        ){

            continue;

        }


        let average =
            calculateAverageConsumption(
                code
            );


        let requiredStock =
            average * 3;


        let currentStock =
            getCurrentStock(item);


        let demandQuantity =
            calculateDemandQuantity(
                requiredStock,
                currentStock
            );


        let stockMonths =
            calculateStockMonths(
                currentStock,
                average
            );


        let rates =
            getRates(code);


        let approvedInput =
            document.querySelector(
                '.approved-qty-input[data-code="' +
                escapeSelector(code) +
                '"]'
            );


        let remarksInput =
            document.querySelector(
                '.remarks-input[data-code="' +
                escapeSelector(code) +
                '"]'
            );


        let approvedQty =
            approvedInput
            ?
            Number(
                approvedInput.value || 0
            )
            :
            demandQuantity;


        let remarks =
            remarksInput
            ?
            remarksInput.value
            :
            "";


        result.push({

            category:
                item.category || "",

            itemCode:
                code,

            itemName:
                item.item_name ||
                item.itemName ||
                "",

            specification:
                item.specification ||
                "",

            source:
                getItemSource(item),

            supplier:
                getItemSupplier(item),

            latestPurchaseDate:
                rates.latestDate,

            firstRate:
                rates.firstRate,

            secondRate:
                rates.secondRate,

            latestRate:
                rates.latestRate,

            unit:
                item.unit ||
                item.uom ||
                "",

            packingQty:
                getPackingQty(item),

            packedUnit:
                getPackedUnit(item),

            average:
                average,

            stockMonths:
                stockMonths,

            stockLevel:
                Number(
                    item.minimum_stock ??
                    item.minimumStock ??
                    0
                ),

            requiredStock:
                requiredStock,

            currentStock:
                currentStock,

            demandQuantity:
                demandQuantity,

            approvedQty:
                approvedQty,

            remarks:
                remarks

        });

    }


    return result;

}


// =====================================================
// ESCAPE SELECTOR
// =====================================================

function escapeSelector(value){

    if(
        window.CSS &&
        CSS.escape
    ){

        return CSS.escape(
            value
        );

    }


    return String(value)
        .replace(
            /([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g,
            "\\$1"
        );

}


// =====================================================
// GENERATE DEMAND
// =====================================================

async function generateDemand(){

    let demandItems =
        getSelectedDemandItems();


    if(
        demandItems.length === 0
    ){

        alert(
            "Please پہلے کم از کم ایک item Select کریں۔"
        );

        return;

    }


    let monthInput =
        document.getElementById(
            "month"
        );


    let today =
        new Date();


    let demandMonth =
        monthInput &&
        monthInput.value
        ?
        monthInput.value
        :
        today.getFullYear() +
        "-" +
        String(
            today.getMonth() + 1
        )
        .padStart(2,"0");


    let demandNo =
        "DEM-" +
        Date.now();


    let generateDate =
        today
        .toISOString()
        .split("T")[0];


    // =================================================
    // SUPABASE RECORD
    // =================================================

    let demandRecord = {

        demand_no:
            demandNo,

        demand_month:
            demandMonth,

        generate_date:
            generateDate,

        date:
            generateDate,

        items:
            demandItems,

        demand_items:
            demandItems,

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

    console.log(
        "====================================="
    );


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
    // LOCAL STORAGE BACKUP
    // =================================================

    localStorage.setItem(
        "demandHistory",
        JSON.stringify(
            demandHistory
        )
    );


    localStorage.setItem(
        "generatedDemandMonth",
        demandMonth
    );


    localStorage.setItem(
        "generatedDemandCount",
        String(
            demandItems.length
        )
    );


    alert(

        "✅ Monthly Demand Successfully Generated!\n\n" +

        "Demand No: " +
        demandNo +

        "\nDemand Month: " +
        demandMonth +

        "\nTotal Selected Items: " +
        demandItems.length

    );


    // =================================================
    // UNSELECT AFTER GENERATE
    // =================================================

    for(
        let i = 0;
        i < demandItems.length;
        i++
    ){

        let code =
            demandItems[i].itemCode;


        if(
            selectedItems[code]
        ){

            selectedItems[code].selected =
                false;

        }

    }


    showAllItems();

}


// =====================================================
// PRINT SELECTED DEMAND
// =====================================================

function printSelectedDemand(){

    let demandItems =
        getSelectedDemandItems();


    if(
        demandItems.length === 0
    ){

        alert(
            "Please پہلے item select کریں۔"
        );

        return;

    }


    let monthInput =
        document.getElementById(
            "month"
        );


    let demandMonth =
        monthInput &&
        monthInput.value
        ?
        monthInput.value
        :
        "-";


    let printWindow =
        window.open(
            "",
            "",
            "width=1500,height=900"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups for this website."
        );

        return;

    }


    let html = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Monthly Demand</title>

<style>

body{
    font-family:Arial,sans-serif;
    padding:15px;
}

h2,h1{
    text-align:center;
}

table{
    width:100%;
    border-collapse:collapse;
    font-size:9px;
}

th{
    background:#12355b;
    color:white;
    padding:5px;
}

td{
    border:1px solid #999;
    padding:4px;
    text-align:center;
}

.info{
    margin:15px 0;
    border:1px solid #999;
    padding:10px;
    display:flex;
    justify-content:space-between;
}

@media print{

    @page{
        size:A4 landscape;
        margin:7mm;
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

<div class="info">

<span>
<strong>Demand Month:</strong>
${demandMonth}
</span>

<span>
<strong>Print Date:</strong>
${new Date().toLocaleDateString("en-GB")}
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
<th>Stock Months</th>
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
        i < demandItems.length;
        i++
    ){

        let item =
            demandItems[i];


        html += `

<tr>

<td>${item.category}</td>
<td>${item.itemCode}</td>
<td>${item.itemName}</td>
<td>${item.specification}</td>
<td>${item.source}</td>
<td>${item.supplier}</td>
<td>${item.latestPurchaseDate}</td>
<td>${Number(item.firstRate).toFixed(2)}</td>
<td>${Number(item.secondRate).toFixed(2)}</td>
<td>${Number(item.latestRate).toFixed(2)}</td>
<td>${item.unit}</td>
<td>${item.packingQty}</td>
<td>${item.packedUnit}</td>
<td>${Number(item.average).toFixed(2)}</td>
<td>${Number(item.stockMonths).toFixed(2)}</td>
<td>${Number(item.currentStock).toFixed(2)}</td>
<td>${Number(item.demandQuantity).toFixed(2)}</td>
<td>${Number(item.approvedQty).toFixed(2)}</td>
<td>${item.remarks}</td>

</tr>

`;

    }


    html += `

</tbody>

</table>

<br><br>

<div style="display:flex;justify-content:space-between;">

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


    printWindow.document.open();

    printWindow.document.write(
        html
    );

    printWindow.document.close();


    setTimeout(
        function(){

            printWindow.focus();

            printWindow.print();

        },
        500
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
