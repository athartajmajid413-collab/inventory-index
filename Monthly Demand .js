// =====================================
// MONTHLY DEMAND
// SUPABASE VERSION
// =====================================


// =====================================
// DATA
// =====================================

let items = [];

let history = [];

let demandHistory = [];

let demandEdits =
    JSON.parse(
        localStorage.getItem("demandEdits")
    ) || {};


// =====================================
// LOAD DATA FROM SUPABASE
// =====================================

async function loadMonthlyDemandData(){

    console.log("=====================================");
    console.log("LOADING MONTHLY DEMAND DATA");
    console.log("=====================================");


    // =====================================
    // LOAD ITEMS
    // =====================================

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


    // =====================================
    // LOAD STOCK IN
    // =====================================

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
                            record.unit_cost || 0
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
                        record.location

                };

            });

    }


    // =====================================
    // LOAD STOCK ISSUE
    // =====================================

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


    // =====================================
    // LOAD DEMAND HISTORY
    // =====================================

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


// =====================================
// CURRENT MONTH
// =====================================

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


// =====================================
// RECORD DATE
// =====================================

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


// =====================================
// GET ITEM
// =====================================

function getItemByCode(code){

    return items.find(function(item){

        return String(
            item.code || ""
        ).trim() === String(
            code || ""
        ).trim();

    }) || null;

}


// =====================================
// MONTHLY CONSUMPTION
// =====================================

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
            ).padStart(2,"0");


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


// =====================================
// CURRENT STOCK
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


    let current =
        openingStock +
        stockIn -
        stockOut;


    return Math.max(
        current,
        0
    );

}


// =====================================
// LATEST PURCHASE
// =====================================

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


// =====================================
// DEMAND QUANTITY
// =====================================

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


// =====================================
// SHOW ALL ITEMS
// =====================================

function showAllItems(){

    let body =
        document.getElementById(
            "demandBody"
        );


    if(!body){

        body =
            document.getElementById(
                "monthlyDemandBody"
            );

    }


    if(!body){

        console.error(
            "Demand table body not found."
        );

        return;

    }


    body.innerHTML = "";


    let totalDemand = 0;


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

            if(typeof edit === "object"){

                finalDemand =
                    Number(
                        edit.finalDemand ??
                        edit.demandQty ??
                        demandQuantity
                    );


                remarks =
                    edit.remarks ||
                    "";

            }
            else{

                finalDemand =
                    Number(edit);

            }

        }


        totalDemand +=
            Number(
                finalDemand || 0
            );


        let latestPurchase =
            getLatestPurchase(
                item.code
            );


        let latestRate =
            latestPurchase ?

            Number(
                latestPurchase.unitCost || 0
            ) :

            Number(
                item.latestRate ||
                item.opening_cost ||
                item.openingCost ||
                item.cost ||
                0
            );


        let latestDate =
            latestPurchase ?
            (
                latestPurchase.date ||
                "-"
            ) :
            "-";


        let row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

<td>
${item.category || "-"}
</td>

<td>
${item.code || "-"}
</td>

<td>
${item.itemName || item.item_name || "-"}
</td>

<td>
${item.specification || "-"}
</td>

<td>
${item.source || "-"}
/
${item.supplier || "-"}
</td>

<td>
${latestDate}
</td>

<td>
Rs. ${latestRate.toFixed(2)}
</td>

<td>
${item.unit || "-"}
</td>

<td>
${item.packingQty || item.packing_qty || "-"}
</td>

<td>
${item.packedUnit || item.packed_unit || "-"}
</td>

<td>
${average.toFixed(2)}
</td>

<td>
${Number(
    item.minimumStock ??
    item.minimum_stock ??
    0
).toFixed(2)}
</td>

<td>
${requiredStock.toFixed(2)}
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
    data-code="${item.code}"
    class="final-demand-input"
>

</td>

<td>

<input
    type="text"
    value="${remarks}"
    data-code="${item.code}"
    class="remarks-input"
>

</td>

`;


        body.appendChild(row);

    }


    // =====================================
    // SAVE EDIT BUTTON EVENTS
    // =====================================

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


    console.log(
        "Total Demand:",
        totalDemand
    );

}


// =====================================
// SAVE DEMAND EDIT
// =====================================

function saveDemandEdit(
    code,
    value
){

    if(!demandEdits[code]){

        demandEdits[code] = {};

    }


    demandEdits[code].finalDemand =
        Number(value || 0);


    localStorage.setItem(
        "demandEdits",
        JSON.stringify(
            demandEdits
        )
    );

}


// =====================================
// SAVE REMARKS
// =====================================

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


// =====================================
// GENERATE DEMAND
// =====================================

async function saveGeneratedDemand(){

    let body =
        document.getElementById(
            "demandBody"
        );


    if(!body){

        body =
            document.getElementById(
                "monthlyDemandBody"
            );

    }


    if(!body){

        alert(
            "Demand table نہیں ملی۔"
        );

        return;

    }


    let rows =
        body.querySelectorAll("tr");


    if(rows.length === 0){

        alert(
            "Demand کے لیے کوئی item نہیں ہے۔"
        );

        return;

    }


    let today =
        new Date();


    let year =
        today.getFullYear();


    let month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    let demandMonth =
        year +
        "-" +
        month;


    let demandNo =
        "DEM-" +
        Date.now();


    let demandItems = [];


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let item =
            items[i];


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
            latestPurchase ?

            Number(
                latestPurchase.unitCost || 0
            ) :

            Number(
                item.latestRate ||
                item.opening_cost ||
                item.openingCost ||
                item.cost ||
                0
            );


        demandItems.push({

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

        });

    }


    // =====================================
    // SUPABASE RECORD
    // =====================================

    let demandRecord = {

        demand_no:
            demandNo,

        demand_month:
            demandMonth,

        generate_date:
            today.toISOString()
            .split("T")[0],

        date:
            today.toISOString()
            .split("T")[0],

        items:
            demandItems,

        demand_items:
            demandItems,

        status:
            "Generated"

    };


    console.log(
        "Saving Demand to Supabase:",
        demandRecord
    );


    // =====================================
    // INSERT
    // =====================================

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
            JSON.stringify(result.error)
        );


        return;

    }


    console.log(
        "✅ Demand Saved:",
        result.data
    );


    // =====================================
    // LOCAL MEMORY UPDATE
    // =====================================

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


    // =====================================
    // OLD LOCAL STORAGE ALSO KEEP
    // =====================================

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

        "Monthly Demand Successfully Generated!\n\n" +

        "Demand No: " +
        demandNo +

        "\nMonth: " +
        demandMonth +

        "\nTotal Items: " +
        demandItems.length

    );

}


// =====================================
// PRINT CURRENT DEMAND
// =====================================

function printDemand(){

    let body =
        document.getElementById(
            "demandBody"
        );


    if(!body){

        body =
            document.getElementById(
                "monthlyDemandBody"
            );

    }


    if(!body){

        alert(
            "Demand table نہیں ملی۔"
        );

        return;

    }


    window.print();

}


// =====================================
// REFRESH DATA
// =====================================

async function refreshMonthlyDemand(){

    await loadMonthlyDemandData();

}


// =====================================
// PAGE LOAD
// =====================================

window.addEventListener(
    "load",
    function(){

        loadMonthlyDemandData();

    }
);
