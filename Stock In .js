// =====================================
// STOCK IN DATA
// =====================================

let items =
    JSON.parse(localStorage.getItem("items")) || [];

let history =
    JSON.parse(localStorage.getItem("history")) || [];

let editHistoryIndex = -1;


// =====================================
// REFRESH DATA
// =====================================

function refreshStockInData(){

    items =
        JSON.parse(localStorage.getItem("items")) || [];

    history =
        JSON.parse(localStorage.getItem("history")) || [];
}


// =====================================
// STOCK IN
// =====================================

function stockIn(){

    refreshStockInData();

    let itemCode =
        document.getElementById("itemCode").value.trim();

    let quantity =
        document.getElementById("quantity").value;

    let unitCost =
        document.getElementById("unitCost").value;

    let transactionDate =
        document.getElementById("transactionDate").value;

    let transactionTime =
        document.getElementById("transactionTime").value;

    let source =
        document.getElementById("source").value;

    let supplier =
        document.getElementById("supplier").value;

    let location =
        document.getElementById("location").value;


    // =====================================
    // VALIDATION
    // =====================================

    if(itemCode == ""){

        alert("Please Enter Item Code!");

        return;
    }


    if(quantity == ""){

        alert("Please Enter Quantity!");

        return;
    }


    if(Number(quantity) <= 0){

        alert("Quantity must be greater than 0!");

        return;
    }


    if(unitCost == ""){

        alert("Please Enter Unit Cost!");

        return;
    }


    if(Number(unitCost) < 0){

        alert("Unit Cost cannot be negative!");

        return;
    }


    if(transactionDate == ""){

        alert("Please Select Date!");

        return;
    }


    if(transactionTime == ""){

        alert("Please Select Time!");

        return;
    }


    // =====================================
    // FIND ITEM
    // =====================================

    let item =
        items.find(function(item){

            return String(item.code || "").trim() ==
                   String(itemCode).trim();

        });


    if(!item){

        alert("Item Not Found!");

        return;
    }


    // =====================================
    // CALCULATE TOTAL COST
    // =====================================

    let qty =
        Number(quantity);

    let cost =
        Number(unitCost);

    let totalCost =
        qty * cost;


    // =====================================
    // RECORD
    // =====================================

    let record = {

        date:
            transactionDate,

        time:
            transactionTime,

        itemCode:
            itemCode,

        itemName:
            item.itemName || "",

        unit:
            item.unit || "",

        source:
            source,

        supplier:
            supplier,

        location:
            location,

        type:
            "Stock In",

        quantity:
            qty,

        unitCost:
            cost,

        totalCost:
            totalCost

    };


    // =====================================
    // SAVE / EDIT
    // =====================================

    if(editHistoryIndex == -1){

        history.push(record);

        alert(
            "Stock In Successfully!"
        );

    }
    else{

        history[editHistoryIndex] =
            record;

        alert(
            "Stock In Updated Successfully!"
        );

    }


    // =====================================
    // SAVE HISTORY
    // =====================================

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );


    // =====================================
    // RESET EDIT MODE
    // =====================================

    editHistoryIndex = -1;


    let stockInButton =
        document.getElementById(
            "stockInButton"
        );

    if(stockInButton){

        stockInButton.innerHTML =
            "Stock In";
    }


    // =====================================
    // REFRESH HISTORY TABLE
    // =====================================

    refreshHistoryTable();


    // =====================================
    // CLEAR ENTRY FIELDS
    // =====================================

    clearTransactionForm();


    // =====================================
    // CURRENT BALANCE
    // =====================================

    let newBalance =
        calculateCurrentStock(
            item.code
        );


    let currentStockInput =
        document.getElementById(
            "currentStock"
        );

    if(currentStockInput){

        currentStockInput.value =
            newBalance;
    }

}


// =====================================
// SHOW ITEM INFORMATION
// =====================================

function showCurrentStock(){

    refreshStockInData();

    let itemCodeInput =
        document.getElementById(
            "itemCode"
        );

    if(!itemCodeInput){
        return;
    }


    let itemCode =
        itemCodeInput.value.trim();


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
    // FIND ITEM
    // =====================================

    let item =
        items.find(function(item){

            return String(item.code || "").trim() ==
                   itemCode;

        });


    if(item){

        document.getElementById(
            "itemName"
        ).value =
            item.itemName || "";


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
            item.storageLocation ||
            item.location ||
            "";


        document.getElementById(
            "currentStock"
        ).value =
            calculateCurrentStock(
                item.code
            );

    }
    else{

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

    }

}


// =====================================
// CALCULATE CURRENT STOCK
// =====================================

function calculateCurrentStock(itemCode){

    let item =
        items.find(function(item){

            return String(item.code || "").trim() ==
                   String(itemCode || "").trim();

        });


    if(!item){

        return 0;
    }


    let currentStock =
        Number(item.openingStock || 0);


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(
            String(record.itemCode || "").trim() !=
            String(itemCode || "").trim()
        ){

            continue;
        }


        // STOCK IN

        if(
            record.type ==
            "Stock In"
        ){

            currentStock +=
                Number(
                    record.quantity || 0
                );

        }


        // STOCK ISSUE

        if(
            record.type ==
            "Stock Issue"
        ){

            currentStock -=
                Number(
                    record.quantity || 0
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

        if(
            history[i].type ==
            "Stock In"
        ){

            addHistoryRow(
                history[i]
            );

        }

    }

}


// =====================================
// HISTORY ROW
// =====================================

function addHistoryRow(record){

    let row =
        document.createElement("tr");


    // =================================
    // DATE
    // =================================

    let cell1 =
        document.createElement("td");

    cell1.textContent =
        record.date || "-";

    row.appendChild(cell1);


    // =================================
    // TIME
    // =================================

    let cell2 =
        document.createElement("td");

    cell2.textContent =
        record.time || "-";

    row.appendChild(cell2);


    // =================================
    // ITEM CODE
    // =================================

    let cell3 =
        document.createElement("td");

    cell3.textContent =
        record.itemCode || "-";

    row.appendChild(cell3);


    // =================================
    // ITEM NAME
    // =================================

    let cell4 =
        document.createElement("td");

    cell4.textContent =
        record.itemName || "-";

    row.appendChild(cell4);


    // =================================
    // UNIT
    // =================================

    let cell5 =
        document.createElement("td");

    cell5.textContent =
        record.unit || "-";

    row.appendChild(cell5);


    // =================================
    // SOURCE
    // =================================

    let cell6 =
        document.createElement("td");

    cell6.textContent =
        record.source || "-";

    row.appendChild(cell6);


    // =================================
    // SUPPLIER
    // =================================

    let cell7 =
        document.createElement("td");

    cell7.textContent =
        record.supplier || "-";

    row.appendChild(cell7);


    // =================================
    // LOCATION
    // =================================

    let cell8 =
        document.createElement("td");

    cell8.textContent =
        record.location || "-";

    row.appendChild(cell8);


    // =================================
    // QUANTITY
    // =================================

    let cell9 =
        document.createElement("td");

    cell9.textContent =
        Number(
            record.quantity || 0
        );

    row.appendChild(cell9);


    // =================================
    // UNIT COST
    // =================================

    let cell10 =
        document.createElement("td");

    cell10.textContent =
        Number(
            record.unitCost || 0
        ).toFixed(2);

    row.appendChild(cell10);


    // =================================
    // TOTAL COST
    // =================================

    let cell11 =
        document.createElement("td");

    let calculatedTotal =
        Number(record.quantity || 0) *
        Number(record.unitCost || 0);

    cell11.textContent =
        calculatedTotal.toFixed(2);

    row.appendChild(cell11);


    // =================================
    // ACTION
    // =================================

    let cell12 =
        document.createElement("td");


    // EDIT BUTTON

    let editButton =
        document.createElement("button");

    editButton.textContent =
        "Edit";


    // DELETE BUTTON

    let deleteButton =
        document.createElement("button");

    deleteButton.textContent =
        "Delete";


    // =================================
    // EDIT
    // =================================

    editButton.onclick =
        function(){

            editHistoryIndex =
                history.indexOf(record);


            document.getElementById(
                "itemCode"
            ).value =
                record.itemCode || "";


            document.getElementById(
                "itemName"
            ).value =
                record.itemName || "";


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
                record.unitCost || "";


            // RECALCULATE TOTAL COST

            calculateTotalCost();


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


            showCurrentStock();

        };


    // =================================
    // DELETE
    // =================================

    deleteButton.onclick =
        function(){

            let confirmDelete =
                confirm(
                    "Are you sure you want to delete this Stock In entry?"
                );


            if(!confirmDelete){

                return;
            }


            let index =
                history.indexOf(record);


            if(index != -1){

                history.splice(
                    index,
                    1
                );


                localStorage.setItem(
                    "history",
                    JSON.stringify(history)
                );

            }


            refreshStockInData();

            refreshHistoryTable();


            // UPDATE CURRENT BALANCE
            let currentCode =
                document.getElementById(
                    "itemCode"
                ).value.trim();


            if(currentCode != ""){

                document.getElementById(
                    "currentStock"
                ).value =
                    calculateCurrentStock(
                        currentCode
                    );
            }


            alert(
                "Stock In Entry Deleted Successfully!"
            );

        };


    cell12.appendChild(
        editButton
    );

    cell12.appendChild(
        deleteButton
    );


    row.appendChild(
        cell12
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
// HISTORY FILTER
// =====================================

function filterHistory(){

    refreshStockInData();


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


    let searchItem =
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


        // ONLY STOCK IN

        if(
            record.type !=
            "Stock In"
        ){

            continue;
        }


        // =================================
        // SEARCH
        // =================================

        if(searchItem != ""){

            let itemName =
                String(
                    record.itemName || ""
                ).toLowerCase();

            let itemCode =
                String(
                    record.itemCode || ""
                ).toLowerCase();


            if(
                !itemName.includes(searchItem) &&
                !itemCode.includes(searchItem)
            ){

                continue;
            }

        }


        // =================================
        // MONTH
        // =================================

        if(month != ""){

            let recordMonth =
                String(
                    record.date || ""
                ).substring(5,7);


            if(recordMonth != month){

                continue;
            }

        }


        // =================================
        // YEAR
        // =================================

        if(year != ""){

            let recordYear =
                String(
                    record.date || ""
                ).substring(0,4);


            if(recordYear != year){

                continue;
            }

        }


        // =================================
        // FROM DATE
        // =================================

        if(
            fromDate != "" &&
            record.date < fromDate
        ){

            continue;
        }


        // =================================
        // TO DATE
        // =================================

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

function loadYears(){

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

        if(
            history[i].type !=
            "Stock In"
        ){

            continue;
        }


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


    // KEEP FIRST OPTION

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
// TOTAL COST CALCULATION
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


    let totalCost =
        quantity *
        unitCost;


    totalCostInput.value =
        totalCost.toFixed(2);

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
// CLEAR TRANSACTION FORM
// =====================================

function clearTransactionForm(){

    document.getElementById(
        "itemCode"
    ).value = "";


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


    // IMPORTANT:
    // Current Balance is NOT cleared here.
    // It is updated after Stock In is saved.

}


// =====================================
// CLEAR HISTORY FILTERS
// =====================================

function clearHistoryFilters(){

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


    if(search){
        search.value = "";
    }

    if(month){
        month.value = "";
    }

    if(year){
        year.value = "";
    }

    if(fromDate){
        fromDate.value = "";
    }

    if(toDate){
        toDate.value = "";
    }


    filterHistory();

}


// =====================================
// INITIAL LOAD
// =====================================

refreshStockInData();

loadYears();

refreshHistoryTable();