// =====================================
// STOCK IN - SUPABASE VERSION
// MECAS ENGINEERING PVT LIMITED SUNDAR
// =====================================

let items = [];
let history = [];

let editHistoryId = null;


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

        alert("Items load nahi ho sake!");

        return false;
    }

    items = result.data || [];

    return true;
}


// =====================================
// LOAD STOCK IN HISTORY
// =====================================

async function loadStockInHistory(){

    let result = await supabaseRequest(
        "stock_in",
        "GET",
        null,
        "?select=*&order=date.desc,time.desc"
    );

    if(!result.success){

        console.error(
            "Stock In History Error:",
            result.error
        );

        return false;
    }

    history = result.data || [];

    refreshHistoryTable();

    return true;
}


// =====================================
// SHOW CURRENT STOCK
// IMPORTANT
// HTML oninput="showCurrentStock()"
// =====================================

async function showCurrentStock(){

    let itemCodeElement =
        document.getElementById("itemCode");

    if(!itemCodeElement){
        return;
    }

    let itemCode =
        itemCodeElement.value.trim();


    // EMPTY CODE
    if(itemCode === ""){

        document.getElementById("itemName").value = "";
        document.getElementById("unit").value = "";
        document.getElementById("source").value = "";
        document.getElementById("supplier").value = "";
        document.getElementById("location").value = "";
        document.getElementById("currentStock").value = "";

        return;
    }


    // LOAD ITEMS
    let loaded =
        await loadItems();

    if(!loaded){
        return;
    }


    // FIND ITEM
    let item =
        items.find(function(item){

            return String(
                item.item_code || ""
            ).trim() === itemCode;

        });


    if(!item){

        document.getElementById("itemName").value = "";
        document.getElementById("unit").value = "";
        document.getElementById("source").value = "";
        document.getElementById("supplier").value = "";
        document.getElementById("location").value = "";
        document.getElementById("currentStock").value = "";

        return;
    }


    // =====================================
    // SHOW ITEM INFORMATION
    // =====================================

    document.getElementById("itemName").value =
        item.item_name || "";

    document.getElementById("unit").value =
        item.unit || "";

    document.getElementById("source").value =
        item.source || "";

    document.getElementById("supplier").value =
        item.supplier || "";

    document.getElementById("location").value =
        item.storage_location || "";


    // =====================================
    // CURRENT STOCK
    // =====================================

    let balance =
        await calculateCurrentStock(itemCode);


    document.getElementById("currentStock").value =
        balance;

}


// =====================================
// CALCULATE CURRENT STOCK
// =====================================

async function calculateCurrentStock(itemCode){

    // =====================================
    // LOAD ITEM
    // =====================================

    let item =
        items.find(function(item){

            return String(
                item.item_code || ""
            ).trim() ===
            String(itemCode).trim();

        });


    if(!item){

        return 0;
    }


    // =====================================
    // OPENING STOCK
    // =====================================

    let currentStock =
        Number(
            item.opening_stock || 0
        );


    // =====================================
    // STOCK IN
    // =====================================

    let stockInResult =
        await supabaseRequest(
            "stock_in",
            "GET",
            null,
            "?item_code=eq." +
            encodeURIComponent(itemCode) +
            "&select=quantity"
        );


    if(stockInResult.success){

        let stockInData =
            stockInResult.data || [];


        for(
            let i = 0;
            i < stockInData.length;
            i++
        ){

            currentStock +=
                Number(
                    stockInData[i].quantity || 0
                );

        }

    }


    // =====================================
    // STOCK ISSUE
    // =====================================

    let stockOutResult =
        await supabaseRequest(
            "stock_issue",
            "GET",
            null,
            "?item_code=eq." +
            encodeURIComponent(itemCode) +
            "&select=quantity"
        );


    if(stockOutResult.success){

        let stockOutData =
            stockOutResult.data || [];


        for(
            let i = 0;
            i < stockOutData.length;
            i++
        ){

            currentStock -=
                Number(
                    stockOutData[i].quantity || 0
                );

        }

    }


    return currentStock;

}


// =====================================
// STOCK IN
// HTML onclick="stockIn()"
// =====================================

async function stockIn(){

    let itemCode =
        document.getElementById(
            "itemCode"
        ).value.trim();


    let quantity =
        document.getElementById(
            "quantity"
        ).value;


    let unitCost =
        document.getElementById(
            "unitCost"
        ).value;


    let transactionDate =
        document.getElementById(
            "transactionDate"
        ).value;


    let transactionTime =
        document.getElementById(
            "transactionTime"
        ).value;


    let source =
        document.getElementById(
            "source"
        ).value;


    let supplier =
        document.getElementById(
            "supplier"
        ).value;


    let location =
        document.getElementById(
            "location"
        ).value;


    // =====================================
    // VALIDATION
    // =====================================

    if(itemCode === ""){

        alert("Please Enter Item Code!");

        return;
    }


    if(quantity === ""){

        alert("Please Enter Quantity!");

        return;
    }


    if(Number(quantity) <= 0){

        alert(
            "Quantity must be greater than 0!"
        );

        return;
    }


    if(unitCost === ""){

        alert("Please Enter Unit Cost!");

        return;
    }


    if(Number(unitCost) < 0){

        alert(
            "Unit Cost cannot be negative!"
        );

        return;
    }


    if(transactionDate === ""){

        alert("Please Select Date!");

        return;
    }


    if(transactionTime === ""){

        alert("Please Select Time!");

        return;
    }


    // =====================================
    // LOAD ITEMS
    // =====================================

    let loaded =
        await loadItems();

    if(!loaded){
        return;
    }


    // =====================================
    // FIND ITEM
    // =====================================

    let item =
        items.find(function(item){

            return String(
                item.item_code || ""
            ).trim() ===
            String(itemCode).trim();

        });


    if(!item){

        alert("Item Not Found!");

        return;
    }


    // =====================================
    // CALCULATE COST
    // =====================================

    let qty =
        Number(quantity);


    let cost =
        Number(unitCost);


    let totalCost =
        qty * cost;


    // =====================================
    // DATA FOR SUPABASE
    // =====================================

    let data = {

        date:
            transactionDate,

        time:
            transactionTime,

        item_code:
            itemCode,

        item_name:
            item.item_name || "",

        unit:
            item.unit || "",

        source:
            source || "",

        supplier:
            supplier || "",

        location:
            location || "",

        quantity:
            qty,

        unit_cost:
            cost,

        total_cost:
            totalCost,

        type:
            "Stock In"

    };


    console.log(
        "Stock In Data:",
        data
    );


    // =====================================
    // INSERT
    // =====================================

    if(editHistoryId === null){

        let result =
            await supabaseRequest(
                "stock_in",
                "POST",
                data
            );


        if(!result.success){

            console.error(
                "Stock In Save Error:",
                result.error
            );

            alert(
                "Stock In Save nahi hua!"
            );

            return;
        }


        alert(
            "Stock In Successfully Saved!"
        );

    }


    // =====================================
    // UPDATE
    // =====================================

    else{

        let result =
            await supabaseRequest(
                "stock_in",
                "PATCH",
                data,
                "?id=eq." +
                editHistoryId
            );


        if(!result.success){

            console.error(
                "Stock In Update Error:",
                result.error
            );

            alert(
                "Stock In Update nahi hua!"
            );

            return;
        }


        alert(
            "Stock In Updated Successfully!"
        );

    }


    // =====================================
    // RESET EDIT MODE
    // =====================================

    editHistoryId = null;


    let stockInButton =
        document.getElementById(
            "stockInButton"
        );


    if(stockInButton){

        stockInButton.innerHTML =
            "Stock In";

    }


    // =====================================
    // REFRESH HISTORY
    // =====================================

    await loadStockInHistory();


    // =====================================
    // UPDATE CURRENT STOCK
    // =====================================

    let newBalance =
        await calculateCurrentStock(
            itemCode
        );


    document.getElementById(
        "currentStock"
    ).value =
        newBalance;


    // =====================================
    // CLEAR TRANSACTION FIELDS
    // =====================================

    document.getElementById(
        "quantity"
    ).value = "";


    document.getElementById(
        "unitCost"
    ).value = "";


    document.getElementById(
        "totalCost"
    ).value = "";


    document.getElementById(
        "transactionDate"
    ).value = "";


    document.getElementById(
        "transactionTime"
    ).value = "";


    // ITEM INFORMATION CLEAR NAHI HOGI

}


// =====================================
// REFRESH HISTORY TABLE
// =====================================

function refreshHistoryTable(){

    let historyBody =
        document.getElementById(
            "historyBody"
        );


    if(!historyBody){
        return;
    }


    historyBody.innerHTML = "";


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        addHistoryRow(
            history[i]
        );

    }

}


// =====================================
// ADD HISTORY ROW
// =====================================

function addHistoryRow(record){

    let row =
        document.createElement("tr");


    let values = [

        record.date || "-",

        record.time || "-",

        record.item_code || "-",

        record.item_name || "-",

        record.unit || "-",

        record.source || "-",

        record.supplier || "-",

        record.location || "-",

        Number(
            record.quantity || 0
        ),

        Number(
            record.unit_cost || 0
        ).toFixed(2),

        Number(
            record.total_cost ||
            (
                Number(record.quantity || 0) *
                Number(record.unit_cost || 0)
            )
        ).toFixed(2)

    ];


    // =====================================
    // CELLS
    // =====================================

    for(
        let i = 0;
        i < values.length;
        i++
    ){

        let cell =
            document.createElement("td");


        cell.textContent =
            values[i];


        row.appendChild(cell);

    }


    // =====================================
    // ACTION CELL
    // =====================================

    let actionCell =
        document.createElement("td");


    // =====================================
    // EDIT BUTTON
    // =====================================

    let editButton =
        document.createElement("button");


    editButton.textContent =
        "Edit";


    editButton.onclick =
        async function(){

            editHistoryId =
                record.id;


            document.getElementById(
                "itemCode"
            ).value =
                record.item_code || "";


            document.getElementById(
                "itemName"
            ).value =
                record.item_name || "";


            document.getElementById(
                "unit"
            ).value =
                record.unit || "";


            document.getElementById(
                "source"
            ).value =
                record.source || "";


            document.getElementById(
                "supplier"
            ).value =
                record.supplier || "";


            document.getElementById(
                "location"
            ).value =
                record.location || "";


            document.getElementById(
                "quantity"
            ).value =
                record.quantity || "";


            document.getElementById(
                "unitCost"
            ).value =
                record.unit_cost || "";


            document.getElementById(
                "transactionDate"
            ).value =
                record.date || "";


            document.getElementById(
                "transactionTime"
            ).value =
                record.time || "";


            calculateTotalCost();


            let button =
                document.getElementById(
                    "stockInButton"
                );


            if(button){

                button.innerHTML =
                    "Update Stock In";

            }


            await showCurrentStock();

        };


    // =====================================
    // DELETE BUTTON
    // =====================================

    let deleteButton =
        document.createElement("button");


    deleteButton.textContent =
        "Delete";


    deleteButton.onclick =
        async function(){

            let confirmDelete =
                confirm(
                    "Are you sure you want to delete this Stock In entry?"
                );


            if(!confirmDelete){

                return;
            }


            let result =
                await supabaseRequest(
                    "stock_in",
                    "DELETE",
                    null,
                    "?id=eq." +
                    record.id
                );


            if(!result.success){

                console.error(
                    "Delete Error:",
                    result.error
                );

                alert(
                    "Entry delete nahi hui!"
                );

                return;
            }


            alert(
                "Stock In Entry Deleted Successfully!"
            );


            editHistoryId = null;


            await loadStockInHistory();


            await showCurrentStock();

        };


    actionCell.appendChild(
        editButton
    );


    actionCell.appendChild(
        deleteButton
    );


    row.appendChild(
        actionCell
    );


    let historyBody =
        document.getElementById(
            "historyBody"
        );


    if(historyBody){

        historyBody.appendChild(
            row
        );

    }

}


// =====================================
// TOTAL COST
// =====================================

function calculateTotalCost(){

    let quantityInput =
        document.getElementById(
            "quantity"
        );


    let unitCostInput =
        document.getElementById(
            "unitCost"
        );


    let totalCostInput =
        document.getElementById(
            "totalCost"
        );


    if(
        !quantityInput ||
        !unitCostInput ||
        !totalCostInput
    ){

        return;
    }


    let quantity =
        Number(
            quantityInput.value || 0
        );


    let unitCost =
        Number(
            unitCostInput.value || 0
        );


    totalCostInput.value =
        (
            quantity *
            unitCost
        ).toFixed(2);

}


// =====================================
// FILTER HISTORY
// =====================================

async function filterHistory(){

    let loaded =
        await loadStockInHistory();

    if(!loaded){
        return;
    }


    let search =
        document.getElementById(
            "searchItem"
        );


    let month =
        document.getElementById(
            "monthFilter"
        );


    let year =
        document.getElementById(
            "yearFilter"
        );


    let fromDate =
        document.getElementById(
            "historyFromDate"
        );


    let toDate =
        document.getElementById(
            "historyToDate"
        );


    let searchValue =
        search
        ? search.value.trim().toLowerCase()
        : "";


    let monthValue =
        month
        ? month.value
        : "";


    let yearValue =
        year
        ? year.value
        : "";


    let fromValue =
        fromDate
        ? fromDate.value
        : "";


    let toValue =
        toDate
        ? toDate.value
        : "";


    let historyBody =
        document.getElementById(
            "historyBody"
        );


    if(!historyBody){
        return;
    }


    historyBody.innerHTML = "";


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        // SEARCH

        if(searchValue !== ""){

            let name =
                String(
                    record.item_name || ""
                ).toLowerCase();


            let code =
                String(
                    record.item_code || ""
                ).toLowerCase();


            if(
                !name.includes(searchValue) &&
                !code.includes(searchValue)
            ){

                continue;
            }

        }


        // MONTH

        if(monthValue !== ""){

            let recordMonth =
                String(
                    record.date || ""
                ).substring(5,7);


            if(recordMonth !== monthValue){

                continue;
            }

        }


        // YEAR

        if(yearValue !== ""){

            let recordYear =
                String(
                    record.date || ""
                ).substring(0,4);


            if(recordYear !== yearValue){

                continue;
            }

        }


        // FROM DATE

        if(
            fromValue !== "" &&
            record.date < fromValue
        ){

            continue;
        }


        // TO DATE

        if(
            toValue !== "" &&
            record.date > toValue
        ){

            continue;
        }


        addHistoryRow(record);

    }

}


// =====================================
// LOAD YEARS
// =====================================

async function loadYears(){

    let loaded =
        await loadStockInHistory();

    if(!loaded){
        return;
    }


    let yearFilter =
        document.getElementById(
            "yearFilter"
        );


    if(!yearFilter){
        return;
    }


    let years = [];


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let year =
            String(
                history[i].date || ""
            ).substring(0,4);


        if(
            year &&
            !years.includes(year)
        ){

            years.push(year);

        }

    }


    years.sort();


    yearFilter.innerHTML =
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


        yearFilter.appendChild(
            option
        );

    }

}


// =====================================
// INPUT EVENTS
// =====================================

let quantityInput =
    document.getElementById(
        "quantity"
    );


let unitCostInput =
    document.getElementById(
        "unitCost"
    );


if(quantityInput){

    quantityInput.addEventListener(
        "input",
        calculateTotalCost
    );

}


if(unitCostInput){

    unitCostInput.addEventListener(
        "input",
        calculateTotalCost
    );

}


// =====================================
// INITIAL LOAD
// =====================================

(async function(){

    await loadItems();

    await loadStockInHistory();

    await loadYears();

})();
