let items =
    JSON.parse(localStorage.getItem("items")) || [];

let history =
    JSON.parse(localStorage.getItem("history")) || [];

let editHistoryIndex = -1;


// =====================================
// SHOW ITEM INFORMATION
// =====================================

function showItemInfo(){

    let itemCode =
        document.getElementById("itemCode")
        .value
        .trim();


    if(itemCode == ""){

        document.getElementById("itemName").value = "";
        document.getElementById("unit").value = "";
        document.getElementById("source").value = "";
        document.getElementById("supplier").value = "";
        document.getElementById("location").value = "";
        document.getElementById("currentStock").value = "";

        return;
    }


    // دوبارہ latest data load کریں
    items =
        JSON.parse(localStorage.getItem("items")) || [];

    history =
        JSON.parse(localStorage.getItem("history")) || [];


    let item =
        items.find(function(item){

            return String(item.code).trim() ==
                   itemCode;

        });


    if(item){

        document.getElementById("itemName").value =
            item.itemName || "";

        document.getElementById("unit").value =
            item.unit || "";

        document.getElementById("source").value =
            item.source || "";

        document.getElementById("supplier").value =
            item.supplier || "";

        document.getElementById("location").value =
            item.storageLocation || "";

        document.getElementById("currentStock").value =
            calculateCurrentStock(item.code);

    }
    else{

        document.getElementById("itemName").value = "";
        document.getElementById("unit").value = "";
        document.getElementById("source").value = "";
        document.getElementById("supplier").value = "";
        document.getElementById("location").value = "";
        document.getElementById("currentStock").value = "";

    }

}


// =====================================
// CALCULATE CURRENT STOCK
// =====================================

function calculateCurrentStock(itemCode){

    let item =
        items.find(function(item){

            return String(item.code).trim() ==
                   String(itemCode).trim();

        });


    if(!item){

        return 0;

    }


    let currentStock =
        Number(item.openingStock) || 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(
            String(record.itemCode).trim() !=
            String(itemCode).trim()
        ){

            continue;

        }


        let quantity =
            Number(record.quantity) || 0;


        // STOCK IN

        if(
            record.type ==
            "Stock In"
        ){

            currentStock += quantity;

        }


        // STOCK OUT

        if(
            record.type ==
            "Stock Issue"
        ){

            currentStock -= quantity;

        }

    }


    return currentStock;

}


// =====================================
// STOCK ISSUE
// =====================================

function stockIssue(){

    let itemCode =
        document.getElementById("itemCode")
        .value
        .trim();


    let department =
        document.getElementById("department")
        .value;


    let quantity =
        document.getElementById("quantity")
        .value;


    let transactionDate =
        document.getElementById("transactionDate")
        .value;


    let transactionTime =
        document.getElementById("transactionTime")
        .value;


    // =====================================
    // VALIDATION
    // =====================================

    if(itemCode == ""){

        alert("Please Enter Item Code!");

        return;

    }


    if(department == ""){

        alert("Please Select Department!");

        return;

    }


    if(quantity == ""){

        alert("Please Enter Quantity!");

        return;

    }


    if(Number(quantity) <= 0){

        alert(
            "Quantity must be greater than 0!"
        );

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
    // LOAD LATEST DATA
    // =====================================

    items =
        JSON.parse(localStorage.getItem("items")) || [];

    history =
        JSON.parse(localStorage.getItem("history")) || [];


    // =====================================
    // FIND ITEM
    // =====================================

    let item =
        items.find(function(item){

            return String(item.code).trim() ==
                   itemCode;

        });


    if(!item){

        alert("Item Not Found!");

        return;

    }


    // =====================================
    // CURRENT STOCK BEFORE ISSUE
    // =====================================

    let currentStock =
        calculateCurrentStock(item.code);


    // =====================================
    // STOCK CHECK
    // =====================================

    if(Number(quantity) > currentStock){

        alert(
            "Insufficient Stock! Current Stock is " +
            currentStock
        );

        return;

    }


    // =====================================
    // CREATE RECORD
    // =====================================

    let record = {

        date:
            transactionDate,

        time:
            transactionTime,

        itemCode:
            itemCode,

        itemName:
            item.itemName,

        unit:
            item.unit || "",

        source:
            item.source || "",

        supplier:
            item.supplier || "",

        location:
            item.storageLocation || "",

        department:
            department,

        type:
            "Stock Issue",

        quantity:
            Number(quantity)

    };


    // =====================================
    // SAVE NEW ENTRY
    // =====================================

    if(editHistoryIndex == -1){

        history.push(record);

        alert(
            "Stock Issue Successfully!"
        );

    }
    else{

        history[editHistoryIndex] =
            record;

        alert(
            "Stock Issue Updated Successfully!"
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
    // CALCULATE NEW CURRENT STOCK
    // =====================================

    let newCurrentStock =
        calculateCurrentStock(item.code);


    // =====================================
    // UPDATE CURRENT STOCK
    // =====================================

    document.getElementById(
        "currentStock"
    ).value =
        newCurrentStock;


    // =====================================
    // REFRESH HISTORY TABLE
    // =====================================

    let historyBody =
        document.getElementById(
            "historyBody"
        );


    if(historyBody){

        historyBody.innerHTML = "";


        for(
            let i = 0;
            i < history.length;
            i++
        ){

            if(
                history[i].type ==
                "Stock Issue"
            ){

                addHistoryRow(
                    history[i]
                );

            }

        }

    }


    // =====================================
    // RESET EDIT MODE
    // =====================================

    editHistoryIndex = -1;


    let issueButton =
        document.getElementById(
            "stockIssueButton"
        );


    if(issueButton){

        issueButton.innerHTML =
            "Stock Issue";

    }


    // =====================================
    // CLEAR ONLY:
    // QUANTITY
    // DATE
    // TIME
    // =====================================

    document.getElementById(
        "quantity"
    ).value = "";


    document.getElementById(
        "transactionDate"
    ).value = "";


    document.getElementById(
        "transactionTime"
    ).value = "";


    // =====================================
    // IMPORTANT
    // =====================================
    // Item Code
    // Item Name
    // Unit
    // Source
    // Supplier
    // Location
    // Department
    // Current Stock
    //
    // سب اپنی جگہ رہیں گے۔

}


// =====================================
// HISTORY ROW
// =====================================

function addHistoryRow(record){

    let row =
        document.createElement("tr");


    // DATE

    let cell1 =
        document.createElement("td");

    cell1.innerHTML =
        record.date;

    row.appendChild(cell1);


    // TIME

    let cell2 =
        document.createElement("td");

    cell2.innerHTML =
        record.time;

    row.appendChild(cell2);


    // ITEM CODE

    let cell3 =
        document.createElement("td");

    cell3.innerHTML =
        record.itemCode;

    row.appendChild(cell3);


    // ITEM NAME

    let cell4 =
        document.createElement("td");

    cell4.innerHTML =
        record.itemName;

    row.appendChild(cell4);


    // UNIT

    let cell5 =
        document.createElement("td");

    cell5.innerHTML =
        record.unit || "-";

    row.appendChild(cell5);


    // SOURCE

    let cell6 =
        document.createElement("td");

    cell6.innerHTML =
        record.source || "-";

    row.appendChild(cell6);


    // SUPPLIER

    let cell7 =
        document.createElement("td");

    cell7.innerHTML =
        record.supplier || "-";

    row.appendChild(cell7);


    // LOCATION

    let cell8 =
        document.createElement("td");

    cell8.innerHTML =
        record.location || "-";

    row.appendChild(cell8);


    // DEPARTMENT

    let cell9 =
        document.createElement("td");

    cell9.innerHTML =
        record.department;

    row.appendChild(cell9);


    // QUANTITY

    let cell10 =
        document.createElement("td");

    cell10.innerHTML =
        record.quantity;

    row.appendChild(cell10);


    // ACTION

    let cell11 =
        document.createElement("td");


    let editButton =
        document.createElement("button");

    editButton.innerHTML =
        "Edit";


    let deleteButton =
        document.createElement("button");

    deleteButton.innerHTML =
        "Delete";


    // =====================================
    // EDIT
    // =====================================

    editButton.onclick =
        function(){

            editHistoryIndex =
                history.indexOf(record);


            document.getElementById(
                "itemCode"
            ).value =
                record.itemCode;


            document.getElementById(
                "itemName"
            ).value =
                record.itemName;


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
                "currentStock"
            ).value =
                calculateCurrentStock(
                    record.itemCode
                );


            document.getElementById(
                "department"
            ).value =
                record.department;


            document.getElementById(
                "quantity"
            ).value =
                record.quantity;


            document.getElementById(
                "transactionDate"
            ).value =
                record.date;


            document.getElementById(
                "transactionTime"
            ).value =
                record.time;


            document.getElementById(
                "stockIssueButton"
            ).innerHTML =
                "Update";

        };


    // =====================================
    // DELETE
    // =====================================

    deleteButton.onclick =
        function(){

            let confirmDelete =
                confirm(
                    "Are you sure you want to delete this Stock Issue entry?"
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


            row.remove();


            // اگر یہی item screen پر ہے
            // تو Current Stock بھی update کریں

            let currentItemCode =
                document.getElementById(
                    "itemCode"
                ).value.trim();


            if(
                currentItemCode ==
                String(record.itemCode).trim()
            ){

                document.getElementById(
                    "currentStock"
                ).value =
                    calculateCurrentStock(
                        currentItemCode
                    );

            }


            alert(
                "Stock Issue Entry Deleted Successfully!"
            );

        };


    cell11.appendChild(
        editButton
    );


    cell11.appendChild(
        deleteButton
    );


    row.appendChild(
        cell11
    );


    let historyBody =
        document.getElementById(
            "historyBody"
        );


    if(historyBody){

        historyBody.appendChild(row);

    }

}


// =====================================
// LOAD EXISTING HISTORY
// =====================================

for(
    let i = 0;
    i < history.length;
    i++
){

    if(
        history[i].type ==
        "Stock Issue"
    ){

        addHistoryRow(
            history[i]
        );

    }

}