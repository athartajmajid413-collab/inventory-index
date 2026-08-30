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

    console.log("Loading Items from Supabase...");

    let result = await supabaseRequest(
        "items",
        "GET",
        null,
        "?select=*&order=id.asc"
    );

    if(!result.success){

        console.error(
            "Items Load Error:",
            result.error
        );

        alert(
            "Items load nahi ho sake!"
        );

        return false;
    }

    items = result.data || [];

    console.log(
        "Items loaded:",
        items.length
    );

    return true;
}


// =====================================
// FIND ITEM BY CODE
// =====================================

function findItemByCode(itemCode){

    let searchCode =
        String(itemCode || "")
        .trim()
        .toLowerCase();

    return items.find(function(item){

        return String(
            item.code || ""
        )
        .trim()
        .toLowerCase() === searchCode;

    });

}


// =====================================
// LOAD STOCK IN HISTORY
// =====================================

async function loadStockInHistory(){

    let result = await supabaseRequest(
        "history",
        "GET",
        null,
        "?type=eq.Stock%20In&select=*&order=date.desc,time.desc"
    );

    if(!result.success){

        console.error(
            "History Load Error:",
            result.error
        );

        return false;
    }

    history = result.data || [];

    refreshHistoryTable();

    return true;
}


// =====================================
// STOCK IN
// =====================================

async function stockIn(){

    // =====================================
    // LOAD ITEMS
    // =====================================

    let loaded =
        await loadItems();

    if(!loaded){

        return;
    }


    // =====================================
    // GET FORM VALUES
    // =====================================

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
        ).value.trim();


    let supplier =
        document.getElementById(
            "supplier"
        ).value.trim();


    let location =
        document.getElementById(
            "location"
        ).value.trim();


    // =====================================
    // VALIDATION
    // =====================================

    if(itemCode == ""){

        alert(
            "Please Enter Item Code!"
        );

        return;
    }


    if(quantity == ""){

        alert(
            "Please Enter Quantity!"
        );

        return;
    }


    if(Number(quantity) <= 0){

        alert(
            "Quantity must be greater than 0!"
        );

        return;
    }


    if(unitCost == ""){

        alert(
            "Please Enter Unit Cost!"
        );

        return;
    }


    if(Number(unitCost) < 0){

        alert(
            "Unit Cost cannot be negative!"
        );

        return;
    }


    if(transactionDate == ""){

        alert(
            "Please Select Date!"
        );

        return;
    }


    if(transactionTime == ""){

        alert(
            "Please Select Time!"
        );

        return;
    }


    // =====================================
    // FIND ITEM
    // =====================================

    let item =
        findItemByCode(
            itemCode
        );


    if(!item){

        alert(
            "Item Not Found!\n\n" +
            "Supabase Items table mein ye Item Code mojood nahi hai:\n" +
            itemCode
        );

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
    // DATA
    // =====================================

    let data = {

        date:
            transactionDate,

        time:
            transactionTime,

        item_code:
            item.code,

        item_name:
            item.item_name || "",

        unit:
            item.unit || "",

        source:
            source || item.source || "",

        supplier:
            supplier || item.supplier || "",

        location:
            location ||
            item.storage_location ||
            "",

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
    // NEW STOCK IN
    // =====================================

    if(editHistoryId === null){

        // =================================
        // SAVE IN STOCK_IN TABLE
        // =================================

        let stockInResult =
            await supabaseRequest(
                "stock_in",
                "POST",
                data
            );


        if(!stockInResult.success){

            console.error(
                "Stock In Save Error:",
                stockInResult.error
            );

            alert(
                "Stock In save nahi hua!\n\n" +
                JSON.stringify(
                    stockInResult.error
                )
            );

            return;
        }


        // =================================
        // SAVE IN HISTORY TABLE
        // =================================

        let historyResult =
            await supabaseRequest(
                "history",
                "POST",
                data
            );


        if(!historyResult.success){

            console.error(
                "History Save Error:",
                historyResult.error
            );

            alert(
                "Stock In save ho gaya lekin History mein save nahi hua!\n\n" +
                JSON.stringify(
                    historyResult.error
                )
            );

            return;
        }


        alert(
            "Stock In Successfully Saved!"
        );

    }


    // =====================================
    // UPDATE EXISTING ENTRY
    // =====================================

    else{

        // =================================
        // UPDATE HISTORY
        // =================================

        let historyResult =
            await supabaseRequest(
                "history",
                "PATCH",
                data,
                "?id=eq." +
                editHistoryId
            );


        if(!historyResult.success){

            console.error(
                "History Update Error:",
                historyResult.error
            );

            alert(
                "History Update nahi hui!\n\n" +
                JSON.stringify(
                    historyResult.error
                )
            );

            return;
        }


        // =================================
        // FIND STOCK_IN RECORD
        // =================================

        let oldHistory =
            history.find(function(record){

                return String(
                    record.id
                ) === String(
                    editHistoryId
                );

            });


        if(oldHistory){

            let stockInSearch =
                await supabaseRequest(
                    "stock_in",
                    "GET",
                    null,
                    "?item_code=eq." +
                    encodeURIComponent(
                        oldHistory.item_code
                    ) +
                    "&date=eq." +
                    encodeURIComponent(
                        oldHistory.date
                    ) +
                    "&time=eq." +
                    encodeURIComponent(
                        oldHistory.time
                    ) +
                    "&quantity=eq." +
                    oldHistory.quantity +
                    "&select=id"
                );


            if(
                stockInSearch.success &&
                stockInSearch.data.length > 0
            ){

                let stockInId =
                    stockInSearch.data[0].id;


                let stockInUpdate =
                    await supabaseRequest(
                        "stock_in",
                        "PATCH",
                        data,
                        "?id=eq." +
                        stockInId
                    );


                if(!stockInUpdate.success){

                    console.error(
                        "Stock In Update Error:",
                        stockInUpdate.error
                    );

                    alert(
                        "History update ho gayi lekin Stock In update nahi hui!"
                    );

                    return;
                }

            }

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
    // CURRENT STOCK
    // =====================================

    document.getElementById(
        "currentStock"
    ).value =
        await calculateCurrentStock(
            item.code
        );


    // =====================================
    // CLEAR FORM
    // =====================================

    clearTransactionForm();

}


// =====================================
// SHOW ITEM INFORMATION
// =====================================

async function showCurrentStock(){

    let itemCodeInput =
        document.getElementById(
            "itemCode"
        );


    if(!itemCodeInput){

        return;
    }


    let itemCode =
        itemCodeInput.value.trim();


    // =====================================
    // EMPTY
    // =====================================

    if(itemCode == ""){

        document.getElementById(
            "itemName"
        ).value = "";

        document.getElementById(
            "unit"
        ).value = "";

        document.getElementById(
            "source"
        ).value = "";

        document.getElementById(
            "supplier"
        ).value = "";

        document.getElementById(
            "location"
        ).value = "";

        document.getElementById(
            "currentStock"
        ).value = "";

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
        findItemByCode(
            itemCode
        );


    if(!item){

        document.getElementById(
            "itemName"
        ).value = "";

        document.getElementById(
            "unit"
        ).value = "";

        document.getElementById(
            "source"
        ).value = "";

        document.getElementById(
            "supplier"
        ).value = "";

        document.getElementById(
            "location"
        ).value = "";

        document.getElementById(
            "currentStock"
        ).value = "";

        return;
    }


    // =====================================
    // SHOW ITEM
    // =====================================

    document.getElementById(
        "itemName"
    ).value =
        item.item_name || "";


    document.getElementById(
        "unit"
    ).value =
        item.unit || "";


    document.getElementById(
        "source"
    ).value =
        item.source || "";


    document.getElementById(
        "supplier"
    ).value =
        item.supplier || "";


    document.getElementById(
        "location"
    ).value =
        item.storage_location || "";


    // =====================================
    // CURRENT STOCK
    // =====================================

    let balance =
        await calculateCurrentStock(
            item.code
        );


    document.getElementById(
        "currentStock"
    ).value =
        balance;

}


// =====================================
// CALCULATE CURRENT STOCK
// =====================================

async function calculateCurrentStock(
    itemCode
){

    // =====================================
    // LOAD ITEMS
    // =====================================

    let loaded =
        await loadItems();


    if(!loaded){

        return 0;
    }


    let item =
        findItemByCode(
            itemCode
        );


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
            encodeURIComponent(
                itemCode
            ) +
            "&select=quantity"
        );


    if(stockInResult.success){

        for(
            let i = 0;
            i < stockInResult.data.length;
            i++
        ){

            currentStock +=
                Number(
                    stockInResult.data[i]
                    .quantity || 0
                );

        }

    }


    // =====================================
    // STOCK OUT
    // =====================================

    let stockOutResult =
        await supabaseRequest(
            "stock_issue",
            "GET",
            null,
            "?item_code=eq." +
            encodeURIComponent(
                itemCode
            ) +
            "&select=quantity"
        );


    if(stockOutResult.success){

        for(
            let i = 0;
            i < stockOutResult.data.length;
            i++
        ){

            currentStock -=
                Number(
                    stockOutResult.data[i]
                    .quantity || 0
                );

        }

    }


    return currentStock;

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
        document.createElement(
            "tr"
        );


    let values = [

        record.date || "-",

        record.time || "-",

        record.item_code || "-",

        record.item_name || "-",

        record.unit || "-",

        record.source || "-",

        record.supplier || "-",

        record.location || "-",

        record.quantity || 0,

        Number(
            record.unit_cost || 0
        ).toFixed(2),

        Number(
            record.total_cost || 0
        ).toFixed(2)

    ];


    for(
        let i = 0;
        i < values.length;
        i++
    ){

        let cell =
            document.createElement(
                "td"
            );


        cell.textContent =
            values[i];


        row.appendChild(
            cell
        );

    }


    // =====================================
    // ACTION CELL
    // =====================================

    let actionCell =
        document.createElement(
            "td"
        );


    // =====================================
    // EDIT
    // =====================================

    let editButton =
        document.createElement(
            "button"
        );


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
                "totalCost"
            ).value =
                Number(
                    record.total_cost || 0
                ).toFixed(2);


            document.getElementById(
                "transactionDate"
            ).value =
                record.date || "";


            document.getElementById(
                "transactionTime"
            ).value =
                record.time || "";


            document.getElementById(
                "stockInButton"
            ).innerHTML =
                "Update Stock In";


            await showCurrentStock();

        };


    // =====================================
    // DELETE
    // =====================================

    let deleteButton =
        document.createElement(
            "button"
        );


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


            // =================================
            // DELETE HISTORY
            // =================================

            let historyResult =
                await supabaseRequest(
                    "history",
                    "DELETE",
                    null,
                    "?id=eq." +
                    record.id
                );


            if(!historyResult.success){

                console.error(
                    "History Delete Error:",
                    historyResult.error
                );

                alert(
                    "History entry delete nahi hui!"
                );

                return;
            }


            // =================================
            // DELETE STOCK IN
            // =================================

            let stockInSearch =
                await supabaseRequest(
                    "stock_in",
                    "GET",
                    null,
                    "?item_code=eq." +
                    encodeURIComponent(
                        record.item_code
                    ) +
                    "&date=eq." +
                    encodeURIComponent(
                        record.date
                    ) +
                    "&time=eq." +
                    encodeURIComponent(
                        record.time
                    ) +
                    "&quantity=eq." +
                    record.quantity +
                    "&select=id"
                );


            if(
                stockInSearch.success &&
                stockInSearch.data.length > 0
            ){

                let stockInId =
                    stockInSearch.data[0].id;


                await supabaseRequest(
                    "stock_in",
                    "DELETE",
                    null,
                    "?id=eq." +
                    stockInId
                );

            }


            alert(
                "Stock In Entry Deleted Successfully!"
            );


            await loadStockInHistory();


            let currentCode =
                document.getElementById(
                    "itemCode"
                ).value.trim();


            if(currentCode != ""){

                document.getElementById(
                    "currentStock"
                ).value =
                    await calculateCurrentStock(
                        currentCode
                    );

            }

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
// CLEAR FORM
// =====================================

function clearTransactionForm(){

    let ids = [

        "itemCode",
        "itemName",
        "unit",
        "source",
        "supplier",
        "location",
        "quantity",
        "unitCost",
        "totalCost",
        "transactionDate",
        "transactionTime"

    ];


    for(
        let i = 0;
        i < ids.length;
        i++
    ){

        let element =
            document.getElementById(
                ids[i]
            );


        if(element){

            element.value = "";

        }

    }

}


// =====================================
// FILTER HISTORY
// =====================================

async function filterHistory(){

    await loadStockInHistory();


    let searchElement =
        document.getElementById(
            "searchItem"
        );


    let monthElement =
        document.getElementById(
            "monthFilter"
        );


    let yearElement =
        document.getElementById(
            "yearFilter"
        );


    let fromDateElement =
        document.getElementById(
            "historyFromDate"
        );


    let toDateElement =
        document.getElementById(
            "historyToDate"
        );


    let search =
        searchElement
        ? searchElement.value
            .trim()
            .toLowerCase()
        : "";


    let month =
        monthElement
        ? monthElement.value
        : "";


    let year =
        yearElement
        ? yearElement.value
        : "";


    let fromDate =
        fromDateElement
        ? fromDateElement.value
        : "";


    let toDate =
        toDateElement
        ? toDateElement.value
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

        if(search != ""){

            let name =
                String(
                    record.item_name || ""
                ).toLowerCase();


            let code =
                String(
                    record.item_code || ""
                ).toLowerCase();


            if(
                !name.includes(search) &&
                !code.includes(search)
            ){

                continue;
            }

        }


        // MONTH

        if(month != ""){

            let recordMonth =
                String(
                    record.date || ""
                ).substring(
                    5,
                    7
                );


            if(recordMonth != month){

                continue;
            }

        }


        // YEAR

        if(year != ""){

            let recordYear =
                String(
                    record.date || ""
                ).substring(
                    0,
                    4
                );


            if(recordYear != year){

                continue;
            }

        }


        // FROM DATE

        if(
            fromDate != "" &&
            record.date < fromDate
        ){

            continue;
        }


        // TO DATE

        if(
            toDate != "" &&
            record.date > toDate
        ){

            continue;
        }


        addHistoryRow(
            record
        );

    }

}


// =====================================
// LOAD YEARS
// =====================================

async function loadYears(){

    await loadStockInHistory();


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

document.addEventListener(
    "DOMContentLoaded",
    function(){

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

    }
);


// =====================================
// INITIAL LOAD
// =====================================

(async function(){

    await loadItems();

    await loadStockInHistory();

    await loadYears();

})();
