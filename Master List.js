// =====================================
// MASTER LIST
// =====================================

let items =
    JSON.parse(localStorage.getItem("items")) || [];

let history =
    JSON.parse(localStorage.getItem("history")) || [];

let editIndex = -1;


// =====================================
// NUMBER FUNCTION
// =====================================

function toNumber(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){
        return 0;
    }

    let number =
        Number(
            String(value)
                .replace(/,/g,"")
                .trim()
        );

    return isNaN(number)
        ? 0
        : number;
}


// =====================================
// GET STOCK SUMMARY
// =====================================

function getStockSummary(item){

    let code =
        String(item.code || "")
            .trim()
            .toLowerCase();

    let stockIn = 0;
    let stockOut = 0;

    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];

        let historyCode =
            String(
                record.itemCode ||
                record.code ||
                ""
            )
            .trim()
            .toLowerCase();

        if(
            historyCode !== code
        ){
            continue;
        }

        let quantity =
            toNumber(
                record.quantity
            );

        let type =
            String(
                record.type ||
                record.transactionType ||
                ""
            )
            .trim()
            .toLowerCase();


        // =================================
        // STOCK IN
        // =================================

        if(

            type === "in" ||

            type === "stockin" ||

            type === "stock in" ||

            type === "inward"

        ){

            stockIn += quantity;

        }


        // =================================
        // STOCK OUT
        // =================================

        else if(

            type === "out" ||

            type === "stockout" ||

            type === "stock out" ||

            type === "outward"

        ){

            stockOut += quantity;

        }

    }


    let openingStock =
        toNumber(
            item.openingStock
        );


    let currentBalance =
        openingStock +
        stockIn -
        stockOut;


    return {

        openingStock:
            openingStock,

        stockIn:
            stockIn,

        stockOut:
            stockOut,

        currentBalance:
            currentBalance

    };

}


// =====================================
// SAVE ITEM
// =====================================

function saveItem(){

    let idNumber =
        document.getElementById("code").value.trim();

    let itemName =
        document.getElementById("itemName").value.trim();

    let specification =
        document.getElementById("specification").value.trim();

    let category =
        document.getElementById("category").value.trim();

    let unit =
        document.getElementById("unit").value.trim();

    let packingQty =
        document.getElementById("packingQty").value;

    let packedUnit =
        document.getElementById("packedUnit").value.trim();

    let source =
        document.getElementById("source").value.trim();

    let supplier =
        document.getElementById("supplier").value.trim();

    let openingStock =
        document.getElementById("openStock").value;

    let openingCost =
        document.getElementById("openingCost").value;

    let storageLocation =
        document.getElementById("location").value.trim();


    // =====================================
    // VALIDATION
    // =====================================

    if(idNumber == ""){

        alert("Please Enter ID Number!");
        return;

    }


    if(itemName == ""){

        alert("Please Enter Item Name!");
        return;

    }


    if(specification == ""){

        alert("Please Enter Specification!");
        return;

    }


    if(category == ""){

        alert("Please Enter Category!");
        return;

    }


    if(unit == ""){

        alert("Please Enter Unit!");
        return;

    }


    if(openingStock == ""){

        alert("Please Enter Opening Stock!");
        return;

    }


    if(storageLocation == ""){

        alert(
            "Please Enter Storage Location!"
        );

        return;

    }


    // =====================================
    // ITEM OBJECT
    // =====================================

    let item = {

        code:
            idNumber,

        itemName:
            itemName,

        specification:
            specification,

        category:
            category,

        unit:
            unit,

        packingQty:
            packingQty,

        packedUnit:
            packedUnit,

        source:
            source,

        supplier:
            supplier,

        openingStock:
            openingStock,

        openingCost:
            openingCost,

        storageLocation:
            storageLocation

    };


    // =====================================
    // SAVE / EDIT
    // =====================================

    if(editIndex == -1){

        items.push(item);

    }
    else{

        items[editIndex] = item;

    }


    localStorage.setItem(
        "items",
        JSON.stringify(items)
    );


    alert(
        "Item Saved Successfully!"
    );


    editIndex = -1;


    renderItems();


    clearForm();

}


// =====================================
// ADD ROW
// =====================================

function addRow(item){

    let row =
        document.createElement("tr");


    // =====================================
    // STOCK CALCULATION
    // =====================================

    let stock =
        getStockSummary(item);


    // =====================================
    // CODE
    // =====================================

    let cell1 =
        document.createElement("td");

    cell1.innerHTML =
        item.code;

    row.appendChild(cell1);


    // =====================================
    // ITEM NAME
    // =====================================

    let cell2 =
        document.createElement("td");

    cell2.innerHTML =
        item.itemName;

    row.appendChild(cell2);


    // =====================================
    // SPECIFICATION
    // =====================================

    let cell3 =
        document.createElement("td");

    cell3.innerHTML =
        item.specification || "-";

    row.appendChild(cell3);


    // =====================================
    // CATEGORY
    // =====================================

    let cell4 =
        document.createElement("td");

    cell4.innerHTML =
        item.category || "-";

    row.appendChild(cell4);


    // =====================================
    // UNIT
    // =====================================

    let cell5 =
        document.createElement("td");

    cell5.innerHTML =
        item.unit || "-";

    row.appendChild(cell5);


    // =====================================
    // PACKING QTY
    // =====================================

    let cell6 =
        document.createElement("td");

    cell6.innerHTML =
        item.packingQty || "-";

    row.appendChild(cell6);


    // =====================================
    // PACKED UNIT
    // =====================================

    let cell7 =
        document.createElement("td");

    cell7.innerHTML =
        item.packedUnit || "-";

    row.appendChild(cell7);


    // =====================================
    // SOURCE
    // =====================================

    let cell8 =
        document.createElement("td");

    cell8.innerHTML =
        item.source || "-";

    row.appendChild(cell8);


    // =====================================
    // SUPPLIER
    // =====================================

    let cell9 =
        document.createElement("td");

    cell9.innerHTML =
        item.supplier || "-";

    row.appendChild(cell9);


    // =====================================
    // OPENING STOCK
    // =====================================

    let cell10 =
        document.createElement("td");

    cell10.innerHTML =
        stock.openingStock;

    row.appendChild(cell10);


    // =====================================
    // OPENING COST
    // =====================================

    let cell11 =
        document.createElement("td");

    cell11.innerHTML =
        "Rs. " +
        toNumber(item.openingCost).toFixed(2);

    row.appendChild(cell11);


    // =====================================
    // STOCK IN
    // =====================================

    let cell12 =
        document.createElement("td");

    cell12.innerHTML =
        stock.stockIn;

    row.appendChild(cell12);


    // =====================================
    // STOCK OUT
    // =====================================

    let cell13 =
        document.createElement("td");

    cell13.innerHTML =
        stock.stockOut;

    row.appendChild(cell13);


    // =====================================
    // CURRENT BALANCE
    // =====================================

    let cell14 =
        document.createElement("td");

    cell14.innerHTML =
        stock.currentBalance;

    row.appendChild(cell14);


    // =====================================
    // LOCATION
    // =====================================

    let cell15 =
        document.createElement("td");

    cell15.innerHTML =
        item.storageLocation || "-";

    row.appendChild(cell15);


    // =====================================
    // STATUS
    // =====================================

    let cell16 =
        document.createElement("td");


    if(
        stock.currentBalance <= 0
    ){

        cell16.innerHTML =
            "Out of Stock ❌";

    }
    else{

        cell16.innerHTML =
            "Available ✅";

    }


    row.appendChild(cell16);


    // =====================================
    // ACTION
    // =====================================

    let cell17 =
        document.createElement("td");


    // =====================================
    // EDIT BUTTON
    // =====================================

    let editButton =
        document.createElement("button");


    editButton.innerHTML =
        "Edit";


    editButton.onclick =
    function(){

        editIndex =
            items.indexOf(item);


        document.getElementById(
            "code"
        ).value =
            item.code;


        document.getElementById(
            "itemName"
        ).value =
            item.itemName;


        document.getElementById(
            "specification"
        ).value =
            item.specification || "";


        document.getElementById(
            "category"
        ).value =
            item.category || "";


        document.getElementById(
            "unit"
        ).value =
            item.unit || "";


        document.getElementById(
            "packingQty"
        ).value =
            item.packingQty || "";


        document.getElementById(
            "packedUnit"
        ).value =
            item.packedUnit || "";


        document.getElementById(
            "source"
        ).value =
            item.source || "";


        document.getElementById(
            "supplier"
        ).value =
            item.supplier || "";


        // ==============================
        // OPENING STOCK
        // ==============================

        document.getElementById(
            "openStock"
        ).value =
            item.openingStock || "";


        document.getElementById(
            "openStock"
        ).readOnly = false;


        // ==============================
        // OPENING COST
        // ==============================

        document.getElementById(
            "openingCost"
        ).value =
            item.openingCost || "";


        // ==============================
        // LOCATION
        // ==============================

        document.getElementById(
            "location"
        ).value =
            item.storageLocation || "";

    };


    // =====================================
    // DELETE BUTTON
    // =====================================

    let deleteButton =
        document.createElement("button");


    deleteButton.innerHTML =
        "Delete";


    deleteButton.onclick =
        function(){

            let confirmDelete =
                confirm(
                    "Are you sure you want to delete this item?"
                );


            if(
                confirmDelete == false
            ){

                return;

            }


            let deleteIndex =
                items.indexOf(item);


            items.splice(
                deleteIndex,
                1
            );


            localStorage.setItem(
                "items",
                JSON.stringify(items)
            );


            renderItems();

        };


    cell17.appendChild(
        editButton
    );


    cell17.appendChild(
        deleteButton
    );


    row.appendChild(
        cell17
    );


    document.getElementById(
        "tableBody"
    ).appendChild(row);

}


// =====================================
// RENDER ALL ITEMS
// =====================================

function renderItems(){

    /*
       History ko dobara read kar rahe hain
       taake Stock In/Out ki latest values
       Master List mein show hon.
    */

    items =
        JSON.parse(
            localStorage.getItem("items")
        ) || [];


    history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];


    let tableBody =
        document.getElementById(
            "tableBody"
        );


    tableBody.innerHTML = "";


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        addRow(
            items[i]
        );

    }

}


// =====================================
// LOAD EXISTING ITEMS
// =====================================

renderItems();


// =====================================
// CLEAR FORM
// =====================================

function clearForm(){

    document.getElementById(
        "code"
    ).value = "";


    document.getElementById(
        "itemName"
    ).value = "";


    document.getElementById(
        "specification"
    ).value = "";


    document.getElementById(
        "category"
    ).value = "";


    document.getElementById(
        "unit"
    ).value = "";


    document.getElementById(
        "packingQty"
    ).value = "";


    document.getElementById(
        "packedUnit"
    ).value = "";


    document.getElementById(
        "source"
    ).value = "";


    document.getElementById(
        "supplier"
    ).value = "";


    document.getElementById(
        "openStock"
    ).value = "";


    // =================================
    // OPENING COST
    // =================================

    document.getElementById(
        "openingCost"
    ).value = "";


    document.getElementById(
        "location"
    ).value = "";


    document.getElementById(
        "openStock"
    ).readOnly = false;


    editIndex = -1;

}


// =====================================
// SEARCH ITEM
// =====================================

function searchItem(){

    let searchValue =
        document
            .getElementById("search")
            .value
            .toLowerCase();


    let tableBody =
        document.getElementById(
            "tableBody"
        );


    tableBody.innerHTML = "";


    /*
       History ko refresh kar rahe hain
       taake current values fresh hon.
    */

    history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let code =
            String(
                items[i].code || ""
            ).toLowerCase();


        let name =
            String(
                items[i].itemName || ""
            ).toLowerCase();


        if(

            code.includes(
                searchValue
            )

            ||

            name.includes(
                searchValue
            )

        ){

            addRow(
                items[i]
            );

        }

    }

}