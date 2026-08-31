// =====================================================
// MONTHLY DEMAND
// SUPABASE VERSION
// Compatible with Monthly Demand.html
// =====================================================


// =====================================================
// DATA
// =====================================================

let items = [];

let history = [];

let demandHistory = [];

let demandEdits =
    JSON.parse(
        localStorage.getItem("demandEdits")
    ) || {};


// Selected items
let selectedDemandItems = [];


// =====================================================
// LOAD DATA FROM SUPABASE
// =====================================================

async function loadMonthlyDemandData(){

    console.log("=====================================");
    console.log("LOADING MONTHLY DEMAND DATA");
    console.log("=====================================");


    // =================================================
    // ITEMS
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
            "Items Load Error:",
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
    // STOCK IN
    // =================================================

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


        history =
            stockIn.map(function(record){

                return {

                    type:
                        "Stock In",

                    itemCode:
                        record.item_code,

                    itemName:
                        record.item_name,

                    quantity:
                        Number(
                            record.quantity || 0
                        ),

                    unitCost:
                        Number(
                            record.unit_cost ||
                            record.latest_rate ||
                            record.rate ||
                            0
                        ),

                    date:
                        record.date,

                    time:
                        record.time,

                    source:
                        record.source,

                    supplier:
                        record.supplier,

                    location:
                        record.location,

                    firstRate:
                        Number(
                            record.first_rate || 0
                        ),

                    secondRate:
                        Number(
                            record.second_rate || 0
                        )

                };

            });

    }
    else{

        console.error(
            "Stock In Load Error:",
            stockInResult.error
        );

    }


    // =================================================
    // STOCK OUT
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
                    record.item_code,

                itemName:
                    record.item_name,

                quantity:
                    Number(
                        record.quantity || 0
                    ),

                date:
                    record.date,

                time:
                    record.time,

                source:
                    record.source,

                supplier:
                    record.supplier,

                location:
                    record.location,

                department:
                    record.department

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
    // DEMAND HISTORY
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
    // LOG
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


    showAllItems();

}


// =====================================================
// CURRENT MONTH
// =====================================================

function getCurrentMonth(){

    let today =
        new Date();


    return {

        year:
            today.getFullYear(),

        month:
            today.getMonth()

    };

}


// =====================================================
// RECORD DATE
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
// ITEM BY CODE
// =====================================================

function getItemByCode(code){

    let searchCode =
        String(
            code || ""
        ).trim();


    return items.find(function(item){

        return String(
            item.code || ""
        ).trim() === searchCode;

    }) || null;

}


// =====================================================
// AVERAGE CONSUMPTION
// =====================================================

function calculateAverageConsumption(itemCode){

    let monthlyTotals = {};


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
            ).trim() !==
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
            ).padStart(
                2,
                "0"
            );


        monthlyTotals[key] =
            (
                monthlyTotals[key] || 0
            ) +
            Number(
                record.quantity || 0
            );

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


    let stockIn = 0;

    let stockOut = 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(
            String(
                record.itemCode || ""
            ).trim() !==
            String(
                item.code || ""
            ).trim()
        ){

            continue;

        }


        if(
            record.type ===
            "Stock In"
        ){

            stockIn +=
                Number(
                    record.quantity || 0
                );

        }


        if(
            record.type ===
            "Stock Issue"
        ){

            stockOut +=
                Number(
                    record.quantity || 0
                );

        }

    }


    return Math.max(
        openingStock +
        stockIn -
        stockOut,
        0
    );

}


// =====================================================
// LATEST PURCHASE
// =====================================================

function getLatestPurchase(itemCode){

    let latest = null;


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
            ).trim() !==
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


        if(
            !latest ||
            date >
            getRecordDate(latest)
        ){

            latest =
                record;

        }

    }


    return latest;

}


// =====================================================
// LATEST RATE
// =====================================================

function getLatestRate(item){

    let latestPurchase =
        getLatestPurchase(
            item.code
        );


    if(latestPurchase){

        return Number(
            latestPurchase.unitCost ||
            latestPurchase.latestRate ||
            latestPurchase.rate ||
            0
        );

    }


    return Number(
        item.latestRate ||
        item.latest_rate ||
        item.opening_cost ||
        item.openingCost ||
        item.cost ||
        0
    );

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


    console.log(
        "Selected Item:",
        item
    );

}


// =====================================================
// ADD DEMAND
// =====================================================

function addDemand(){

    let input =
        document.getElementById(
            "itemCode"
        );


    let monthInput =
        document.getElementById(
            "month"
        );


    let code =
        input ?
        input.value.trim() :
        "";


    let month =
        monthInput ?
        monthInput.value :
        "";


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
            "Item Code not found: " +
            code
        );

        return;

    }


    if(month !== ""){

        localStorage.setItem(
            "selectedDemandMonth",
            month
        );

    }


    // Find checkbox

    let checkbox =
        document.querySelector(
            '.demand-select[data-code="' +
            CSS.escape(code) +
            '"]'
        );


    if(checkbox){

        checkbox.checked = true;

    }


    if(
        !selectedDemandItems.includes(code)
    ){

        selectedDemandItems.push(code);

    }


    alert(
        "Item added to Demand: " +
        code
    );


    input.value = "";

}


// =====================================================
// SELECT ALL
// =====================================================

function selectAllItems(){

    selectedDemandItems = [];


    document
        .querySelectorAll(
            ".demand-select"
        )
        .forEach(function(checkbox){

            checkbox.checked = true;


            let code =
                checkbox.dataset.code;


            if(code){

                selectedDemandItems.push(
                    code
                );

            }

        });


    console.log(
        "Selected Items:",
        selectedDemandItems.length
    );

}


// =====================================================
// UNSELECT ALL
// =====================================================

function unselectAllItems(){

    selectedDemandItems = [];


    document
        .querySelectorAll(
            ".demand-select"
        )
        .forEach(function(checkbox){

            checkbox.checked = false;

        });

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
            "Demand table body not found."
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


        let average =
            calculateAverageConsumption(
                item.code
            );


        // 3 MONTH STOCK

        let requiredStock =
            average * 3;


        let currentStock =
            getCurrentStock(item);


        let demandQuantity =
            calculateDemandQuantity(
                requiredStock,
                currentStock
            );


        let edit =
            demandEdits[
                item.code
            ];


        let finalDemand =
            demandQuantity;


        let remarks =
            "";


        if(edit){

            if(
                typeof edit ===
                "object"
            ){

                finalDemand =
                    Number(
                        edit.finalDemand ??
                        demandQuantity
                    );


                remarks =
                    edit.remarks ||
                    "";

            }
            else{

                finalDemand =
                    Number(
                        edit || 0
                    );

            }

        }


        let latestPurchase =
            getLatestPurchase(
                item.code
            );


        let latestRate =
            getLatestRate(item);


        let latestDate =
            latestPurchase ?
            (
                latestPurchase.date ||
                "-"
            ) :
            "-";


        let firstRate =
            latestPurchase ?
            Number(
                latestPurchase.firstRate ||
                0
            ) :
            0;


        let secondRate =
            latestPurchase ?
            Number(
                latestPurchase.secondRate ||
                0
            ) :
            0;


        let row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

<td>

<input
    type="checkbox"
    class="demand-select"
    data-code="${escapeHtml(item.code || "")}"
>

</td>


<td>
${escapeHtml(item.category || "-")}
</td>


<td>
${escapeHtml(item.code || "-")}
</td>


<td>
${escapeHtml(
    item.itemName ||
    item.item_name ||
    "-"
)}
</td>


<td>
${escapeHtml(
    item.specification ||
    "-"
)}
</td>


<td>
${escapeHtml(
    item.source ||
    "-"
)}
</td>


<td>
${escapeHtml(
    item.supplier ||
    "-"
)}
</td>


<td>
${escapeHtml(
    latestDate
)}
</td>


<td>
Rs. ${firstRate.toFixed(2)}
</td>


<td>
Rs. ${secondRate.toFixed(2)}
</td>


<td>
Rs. ${latestRate.toFixed(2)}
</td>


<td>
${escapeHtml(
    item.unit ||
    "-"
)}
</td>


<td>
${escapeHtml(
    item.packingQty ||
    item.packing_qty ||
    "-"
)}
</td>


<td>
${escapeHtml(
    item.packedUnit ||
    item.packed_unit ||
    "-"
)}
</td>


<td>
${average.toFixed(2)}
</td>


<td>
${requiredStock > 0 ?
    (
        currentStock /
        average
    ).toFixed(2)
    :
    "0.00"
}
</td>


<td>
${currentStock.toFixed(2)}
</td>


<td>
${demandQuantity.toFixed(2)}
</td>


<td>

<input
    type="number"
    min="0"
    value="${finalDemand}"
    data-code="${escapeHtml(item.code || "")}"
    class="final-demand-input"
>

</td>


<td>

<input
    type="text"
    value="${escapeHtml(remarks)}"
    data-code="${escapeHtml(item.code || "")}"
    class="remarks-input"
>

</td>


<td>

<button
    type="button"
    onclick="removeDemandItem('${escapeHtml(item.code || "")}')"
>
Remove
</button>

</td>

`;


        body.appendChild(row);

    }


    // =================================================
    // CHECKBOX EVENTS
    // =================================================

    document
        .querySelectorAll(
            ".demand-select"
        )
        .forEach(function(checkbox){

            checkbox.addEventListener(
                "change",
                function(){

                    let code =
                        checkbox.dataset.code;


                    if(
                        checkbox.checked
                    ){

                        if(
                            !selectedDemandItems.includes(
                                code
                            )
                        ){

                            selectedDemandItems.push(
                                code
                            );

                        }

                    }
                    else{

                        selectedDemandItems =
                            selectedDemandItems.filter(
                                function(itemCode){

                                    return itemCode !== code;

                                }
                            );

                    }

                }
            );

        });


    // =================================================
    // FINAL DEMAND
    // =================================================

    document
        .querySelectorAll(
            ".final-demand-input"
        )
        .forEach(function(input){

            input.addEventListener(
                "change",
                function(){

                    saveDemandEdit(
                        input.dataset.code,
                        input.value
                    );

                }
            );

        });


    // =================================================
    // REMARKS
    // =================================================

    document
        .querySelectorAll(
            ".remarks-input"
        )
        .forEach(function(input){

            input.addEventListener(
                "change",
                function(){

                    saveRemarksEdit(
                        input.dataset.code,
                        input.value
                    );

                }
            );

        });


    console.log(
        "Monthly Demand Items:",
        items.length
    );

}


// =====================================================
// REMOVE DEMAND ITEM
// =====================================================

function removeDemandItem(code){

    let checkbox =
        document.querySelector(
            '.demand-select[data-code="' +
            CSS.escape(code) +
            '"]'
        );


    if(checkbox){

        checkbox.checked = false;

    }


    selectedDemandItems =
        selectedDemandItems.filter(
            function(itemCode){

                return itemCode !== code;

            }
        );

}


// =====================================================
// SAVE DEMAND EDIT
// =====================================================

function saveDemandEdit(
    code,
    value
){

    if(!demandEdits[code]){

        demandEdits[code] = {};

    }


    demandEdits[code].finalDemand =
        Number(
            value || 0
        );


    localStorage.setItem(
        "demandEdits",
        JSON.stringify(
            demandEdits
        )
    );

}


// =====================================================
// SAVE REMARKS
// =====================================================

function saveRemarksEdit(
    code,
    value
){

    if(!demandEdits[code]){

        demandEdits[code] = {};

    }


    demandEdits[code].remarks =
        value;


    localStorage.setItem(
        "demandEdits",
        JSON.stringify(
            demandEdits
        )
    );

}


// =====================================================
// GENERATE DEMAND
// =====================================================

async function generateDemand(){

    console.log(
        "====================================="
    );

    console.log(
        "GENERATE DEMAND STARTED"
    );

    console.log(
        "====================================="
    );


    // =================================================
    // GET MONTH
    // =================================================

    let monthInput =
        document.getElementById(
            "month"
        );


    let demandMonth =
        monthInput ?
        monthInput.value :
        "";


    if(!demandMonth){

        let today =
            new Date();


        demandMonth =
            today.getFullYear() +
            "-" +
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

    }


    // =================================================
    // GET SELECTED ITEMS
    // =================================================

    let checkboxes =
        document.querySelectorAll(
            ".demand-select:checked"
        );


    let selectedCodes = [];


    checkboxes.forEach(
        function(checkbox){

            selectedCodes.push(
                checkbox.dataset.code
            );

        }
    );


    // =================================================
    // IF NOTHING SELECTED
    // =================================================

    if(selectedCodes.length === 0){

        let confirmAll =
            confirm(
                "کوئی item select نہیں ہے۔\n\nکیا تمام items کی Demand Generate کرنی ہے؟"
            );


        if(!confirmAll){

            return;

        }


        document
            .querySelectorAll(
                ".demand-select"
            )
            .forEach(
                function(checkbox){

                    checkbox.checked = true;

                    selectedCodes.push(
                        checkbox.dataset.code
                    );

                }
            );

    }


    // =================================================
    // BUILD DEMAND ITEMS
    // =================================================

    let demandItems = [];


    for(
        let i = 0;
        i < selectedCodes.length;
        i++
    ){

        let code =
            selectedCodes[i];


        let item =
            getItemByCode(code);


        if(!item){

            continue;

        }


        let average =
            calculateAverageConsumption(
                item.code
            );


        let requiredStock =
            average * 3;


        let currentStock =
            getCurrentStock(item);


        let demandQty =
            calculateDemandQuantity(
                requiredStock,
                currentStock
            );


        let finalInput =
            document.querySelector(
                '.final-demand-input[data-code="' +
                CSS.escape(item.code) +
                '"]'
            );


        let remarksInput =
            document.querySelector(
                '.remarks-input[data-code="' +
                CSS.escape(item.code) +
                '"]'
            );


        let finalDemand =
            finalInput ?
            Number(
                finalInput.value || 0
            ) :
            demandQty;


        let remarks =
            remarksInput ?
            remarksInput.value :
            "";


        let latestPurchase =
            getLatestPurchase(
                item.code
            );


        let latestRate =
            getLatestRate(item);


        let demandItem = {

            category:
                item.category || "",

            itemCode:
                item.code || "",

            itemName:
                item.itemName ||
                item.item_name ||
                "",

            specification:
                item.specification ||
                "",

            source:
                item.source ||
                "",

            supplier:
                item.supplier ||
                "",

            latestPurchaseDate:
                latestPurchase ?
                latestPurchase.date :
                "",

            firstRate:
                latestPurchase ?
                Number(
                    latestPurchase.firstRate ||
                    0
                ) :
                0,

            secondRate:
                latestPurchase ?
                Number(
                    latestPurchase.secondRate ||
                    0
                ) :
                0,

            latestRate:
                latestRate,

            unit:
                item.unit ||
                "",

            packingQty:
                item.packingQty ||
                item.packing_qty ||
                "",

            packedUnit:
                item.packedUnit ||
                item.packed_unit ||
                "",

            average:
                average,

            stockMonths:
                average > 0 ?
                currentStock / average :
                0,

            stockLevel:
                Number(
                    item.minimumStock ??
                    item.minimum_stock ??
                    0
                ),

            requiredStock:
                requiredStock,

            currentStock:
                currentStock,

            demandQuantity:
                demandQty,

            finalDemand:
                finalDemand,

            remarks:
                remarks

        };


        demandItems.push(
            demandItem
        );

    }


    if(demandItems.length === 0){

        alert(
            "Demand کے لیے کوئی item نہیں ملا۔"
        );

        return;

    }


    // =================================================
    // DEMAND NUMBER
    // =================================================

    let demandNo =
        "DEM-" +
        Date.now();


    let today =
        new Date();


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


    // =================================================
    // INSERT
    // =================================================

    let result =
        await supabaseRequest(
            "demand_history",
            "POST",
            demandRecord
        );


    console.log(
        "SUPABASE INSERT RESULT:",
        result
    );


    // =================================================
    // ERROR
    // =================================================

    if(!result.success){

        console.error(
            "❌ DEMAND SAVE ERROR:",
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


    // =================================================
    // SUCCESS
    // =================================================

    console.log(
        "✅ DEMAND SAVED SUCCESSFULLY"
    );


    let savedRecord =
        (
            result.data &&
            result.data.length > 0
        )
        ?
        result.data[0]
        :
        demandRecord;


    demandHistory.unshift(
        savedRecord
    );


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


    // =================================================
    // SUCCESS MESSAGE
    // =================================================

    alert(

        "✅ Monthly Demand Successfully Generated!\n\n" +

        "Demand No: " +
        demandNo +

        "\nDemand Month: " +
        demandMonth +

        "\nTotal Items: " +
        demandItems.length

    );


    console.log(
        "Demand History Count:",
        demandHistory.length
    );

}


// =====================================================
// OLD FUNCTION SUPPORT
// =====================================================

async function saveGeneratedDemand(){

    await generateDemand();

}


// =====================================================
// PRINT SELECTED DEMAND
// =====================================================

function printSelectedDemand(){

    let checkboxes =
        document.querySelectorAll(
            ".demand-select:checked"
        );


    if(checkboxes.length === 0){

        alert(
            "Please select at least one item."
        );

        return;

    }


    let selectedCodes = [];


    checkboxes.forEach(
        function(checkbox){

            selectedCodes.push(
                checkbox.dataset.code
            );

        }
    );


    let selectedItems =
        items.filter(
            function(item){

                return selectedCodes.includes(
                    String(
                        item.code || ""
                    )
                );

            }
        );


    printDemandItems(
        selectedItems
    );

}


// =====================================================
// PRINT DEMAND
// =====================================================

function printDemand(){

    let checkboxes =
        document.querySelectorAll(
            ".demand-select"
        );


    let selectedCodes = [];


    checkboxes.forEach(
        function(checkbox){

            if(checkbox.checked){

                selectedCodes.push(
                    checkbox.dataset.code
                );

            }

        }
    );


    let selectedItems;


    if(selectedCodes.length > 0){

        selectedItems =
            items.filter(
                function(item){

                    return selectedCodes.includes(
                        String(
                            item.code || ""
                        )
                    );

                }
            );

    }
    else{

        selectedItems =
            items;

    }


    printDemandItems(
        selectedItems
    );

}


// =====================================================
// PRINT ITEMS
// =====================================================

function printDemandItems(
    printItems
){

    if(
        !printItems ||
        printItems.length === 0
    ){

        alert(
            "Print کے لیے کوئی item نہیں ہے۔"
        );

        return;

    }


    let printWindow =
        window.open(
            "",
            "",
            "width=1400,height=900"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups for this website."
        );

        return;

    }


    let today =
        new Date()
        .toLocaleDateString(
            "en-GB"
        );


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


    let html = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Monthly Demand</title>

<style>

*{
    box-sizing:border-box;
}

body{
    font-family:Arial,sans-serif;
    padding:15px;
}

h2{
    text-align:center;
    color:#12355b;
}

h1{
    text-align:center;
}

.info{
    display:flex;
    justify-content:space-between;
    border:1px solid #777;
    padding:10px;
    margin:15px 0;
}

table{
    width:100%;
    border-collapse:collapse;
    font-size:9px;
}

th{
    background:#12355b;
    color:white;
    border:1px solid #555;
    padding:5px;
}

td{
    border:1px solid #999;
    padding:4px;
    text-align:center;
}

.approval{
    display:flex;
    justify-content:space-between;
    margin-top:50px;
}

@media print{

    @page{
        size:A4 landscape;
        margin:8mm;
    }

    body{
        padding:0;
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
${escapeHtml(demandMonth)}
</span>

<span>
<strong>Print Date:</strong>
${escapeHtml(today)}
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
        i < printItems.length;
        i++
    ){

        let item =
            printItems[i];


        let average =
            calculateAverageConsumption(
                item.code
            );


        let requiredStock =
            average * 3;


        let currentStock =
            getCurrentStock(item);


        let demandQty =
            calculateDemandQuantity(
                requiredStock,
                currentStock
            );


        let edit =
            demandEdits[
                item.code
            ];


        let finalDemand =
            demandQty;


        let remarks =
            "";


        if(edit){

            if(
                typeof edit ===
                "object"
            ){

                finalDemand =
                    Number(
                        edit.finalDemand ??
                        demandQty
                    );

                remarks =
                    edit.remarks ||
                    "";

            }
            else{

                finalDemand =
                    Number(
                        edit
                    );

            }

        }


        let latestPurchase =
            getLatestPurchase(
                item.code
            );


        let latestRate =
            getLatestRate(item);


        html += `

<tr>

<td>
${escapeHtml(item.category || "-")}
</td>

<td>
${escapeHtml(item.code || "-")}
</td>

<td>
${escapeHtml(
    item.itemName ||
    item.item_name ||
    "-"
)}
</td>

<td>
${escapeHtml(
    item.specification ||
    "-"
)}
</td>

<td>
${escapeHtml(
    item.source ||
    "-"
)}
</td>

<td>
${escapeHtml(
    item.supplier ||
    "-"
)}
</td>

<td>
${escapeHtml(
    latestPurchase ?
    latestPurchase.date :
    "-"
)}
</td>

<td>
${latestPurchase ?
    Number(
        latestPurchase.firstRate || 0
    ).toFixed(2)
    :
    "0.00"
}
</td>

<td>
${latestPurchase ?
    Number(
        latestPurchase.secondRate || 0
    ).toFixed(2)
    :
    "0.00"
}
</td>

<td>
${latestRate.toFixed(2)}
</td>

<td>
${escapeHtml(
    item.unit ||
    "-"
)}
</td>

<td>
${escapeHtml(
    item.packingQty ||
    item.packing_qty ||
    "-"
)}
</td>

<td>
${escapeHtml(
    item.packedUnit ||
    item.packed_unit ||
    "-"
)}
</td>

<td>
${average.toFixed(2)}
</td>

<td>
${average > 0 ?
    (
        currentStock /
        average
    ).toFixed(2)
    :
    "0.00"
}
</td>

<td>
${currentStock.toFixed(2)}
</td>

<td>
${demandQty.toFixed(2)}
</td>

<td>
${finalDemand.toFixed(2)}
</td>

<td>
${escapeHtml(remarks)}
</td>

</tr>

`;

    }


    html += `

</tbody>

</table>

<div class="approval">

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
// ESCAPE HTML
// =====================================================

function escapeHtml(value){

    if(value === null ||
       value === undefined){

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
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

        // Set current month automatically

        let monthInput =
            document.getElementById(
                "month"
            );


        if(
            monthInput &&
            !monthInput.value
        ){

            let today =
                new Date();


            monthInput.value =
                today.getFullYear() +
                "-" +
                String(
                    today.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );

        }


        loadMonthlyDemandData();

    }
);
