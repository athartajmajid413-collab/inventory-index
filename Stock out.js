// =====================================
// STOCK OUT / STOCK ISSUE
// SUPABASE VERSION
// MECAS ENGINEERING PVT LIMITED SUNDAR
// =====================================


// =====================================
// GLOBAL VARIABLES
// =====================================

let items = [];
let history = [];
let editHistoryId = null;


// =====================================
// LOAD ITEMS FROM SUPABASE
// =====================================

async function loadItems() {

    let result = await supabaseRequest(
        "items",
        "GET",
        null,
        "?select=*"
    );

    if (!result.success) {

        console.error(
            "Items Load Error:",
            result.error
        );

        alert("Items load نہیں ہو سکے!");

        return;
    }

    items = result.data || [];

    console.log("✅ Items Loaded:", items);
}


// =====================================
// LOAD STOCK OUT HISTORY
// =====================================

async function loadStockIssues() {

    let result = await supabaseRequest(
        "stock_issues",
        "GET",
        null,
        "?select=*&order=id.asc"
    );

    if (!result.success) {

        console.error(
            "Stock Issue Load Error:",
            result.error
        );

        alert(
            "Stock Out History load نہیں ہو سکی!"
        );

        return;
    }

    history = result.data || [];

    console.log(
        "✅ Stock Out History Loaded:",
        history
    );

    refreshHistoryTable();
}


// =====================================
// LOAD ALL DATA
// =====================================

async function loadAllData() {

    await loadItems();
    await loadStockIssues();

}


// =====================================
// FIND ITEM
// =====================================

function findItem(itemCode) {

    return items.find(function (item) {

        return String(
            item.code || ""
        ).trim().toLowerCase()
        ===
        String(
            itemCode || ""
        ).trim().toLowerCase();

    });

}


// =====================================
// SHOW ITEM INFORMATION
// =====================================

async function showItemInfo() {

    let itemCode =
        document.getElementById(
            "itemCode"
        ).value.trim();


    if (itemCode === "") {

        clearItemInfo();

        return;
    }


    if (items.length === 0) {

        await loadItems();

    }


    let item = findItem(itemCode);


    if (!item) {

        clearItemInfo();

        return;
    }


    document.getElementById(
        "itemName"
    ).value =
        item.item_name ||
        item.itemName ||
        "";


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
        item.storage_location ||
        item.storageLocation ||
        "";


    let currentStock =
        await calculateCurrentStock(
            item.code
        );


    document.getElementById(
        "currentStock"
    ).value =
        currentStock;

}


// =====================================
// CLEAR ITEM INFORMATION
// =====================================

function clearItemInfo() {

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


// =====================================
// GET STOCK IN QUANTITY
// =====================================

async function getStockInQuantity(itemCode) {

    let result =
        await supabaseRequest(
            "stock_in",
            "GET",
            null,
            "?select=quantity&item_code=eq." +
            encodeURIComponent(itemCode)
        );


    if (!result.success) {

        console.error(
            "Stock In Error:",
            result.error
        );

        return 0;
    }


    let total = 0;


    for (
        let i = 0;
        i < result.data.length;
        i++
    ) {

        total += Number(
            result.data[i].quantity || 0
        );

    }


    return total;

}


// =====================================
// GET STOCK OUT QUANTITY
// =====================================

async function getStockIssueQuantity(itemCode) {

    let result =
        await supabaseRequest(
            "stock_issues",
            "GET",
            null,
            "?select=id,quantity,item_code" +
            "&item_code=eq." +
            encodeURIComponent(itemCode)
        );


    if (!result.success) {

        console.error(
            "Stock Out Error:",
            result.error
        );

        return 0;
    }


    let total = 0;


    for (
        let i = 0;
        i < result.data.length;
        i++
    ) {

        // Edit کے دوران پرانی quantity دوبارہ minus نہیں ہوگی

        if (
            editHistoryId !== null &&
            Number(result.data[i].id)
            ===
            Number(editHistoryId)
        ) {

            continue;

        }


        total += Number(
            result.data[i].quantity || 0
        );

    }


    return total;

}


// =====================================
// CALCULATE CURRENT STOCK
// =====================================

async function calculateCurrentStock(itemCode) {

    let item =
        findItem(itemCode);


    if (!item) {

        return 0;

    }


    let openingStock =
        Number(
            item.opening_stock ??
            item.openingStock ??
            0
        );


    let stockIn =
        await getStockInQuantity(
            itemCode
        );


    let stockOut =
        await getStockIssueQuantity(
            itemCode
        );


    let currentStock =
        openingStock +
        stockIn -
        stockOut;


    if (currentStock < 0) {

        currentStock = 0;

    }


    return currentStock;

}


// =====================================
// STOCK ISSUE / SAVE
// =====================================

async function stockIssue() {

    let itemCode =
        document.getElementById(
            "itemCode"
        ).value.trim();


    let department =
        document.getElementById(
            "department"
        ).value;


    let quantity =
        document.getElementById(
            "quantity"
        ).value;


    let transactionDate =
        document.getElementById(
            "transactionDate"
        ).value;


    let transactionTime =
        document.getElementById(
            "transactionTime"
        ).value;


    // =================================
    // VALIDATION
    // =================================

    if (itemCode === "") {

        alert(
            "Please Enter Item Code!"
        );

        return;
    }


    if (department === "") {

        alert(
            "Please Select Department!"
        );

        return;
    }


    if (quantity === "") {

        alert(
            "Please Enter Quantity!"
        );

        return;
    }


    let requestedQuantity =
        Number(quantity);


    if (
        isNaN(requestedQuantity) ||
        requestedQuantity <= 0
    ) {

        alert(
            "Quantity must be greater than 0!"
        );

        return;
    }


    if (transactionDate === "") {

        alert(
            "Please Select Date!"
        );

        return;
    }


    if (transactionTime === "") {

        alert(
            "Please Select Time!"
        );

        return;
    }


    // =================================
    // FIND ITEM
    // =================================

    let item =
        findItem(itemCode);


    if (!item) {

        alert(
            "Item Not Found!"
        );

        return;
    }


    // =================================
    // CHECK CURRENT STOCK
    // =================================

    let currentStock =
        await calculateCurrentStock(
            item.code
        );


    if (
        requestedQuantity >
        currentStock
    ) {

        alert(
            "Insufficient Stock!\n\n" +
            "Current Stock: " +
            currentStock +
            "\n" +
            "Requested Quantity: " +
            requestedQuantity
        );

        return;
    }


    // =================================
    // CREATE DATA
    // =================================

    let data = {

        date:
            transactionDate,

        time:
            transactionTime,

        item_code:
            item.code,

        item_name:
            item.item_name ||
            item.itemName ||
            "",

        unit:
            item.unit || "",

        source:
            item.source || "",

        supplier:
            item.supplier || "",

        location:
            item.storage_location ||
            item.storageLocation ||
            "",

        department:
            department,

        type:
            "Stock Issue",

        quantity:
            requestedQuantity

    };


    console.log(
        "📦 Stock Out Data:",
        data
    );


    // =================================
    // UPDATE EXISTING
    // =================================

    if (editHistoryId !== null) {

        let result =
            await supabaseRequest(
                "stock_issues",
                "PATCH",
                data,
                "?id=eq." +
                editHistoryId
            );


        if (!result.success) {

            console.error(
                "❌ Update Error:",
                result.error
            );

            alert(
                "Stock Issue Update نہیں ہوئی!\n\n" +
                JSON.stringify(
                    result.error
                )
            );

            return;
        }


        alert(
            "Stock Issue Updated Successfully!"
        );

    }


    // =================================
    // INSERT NEW
    // =================================

    else {

        let result =
            await supabaseRequest(
                "stock_issues",
                "POST",
                data
            );


        if (!result.success) {

            console.error(
                "❌ Insert Error:",
                result.error
            );

            alert(
                "Stock Out Save نہیں ہوئی!\n\n" +
                JSON.stringify(
                    result.error
                )
            );

            return;
        }


        console.log(
            "✅ Stock Out Saved:",
            result.data
        );


        alert(
            "Stock Out Successfully Saved!"
        );

    }


    // =================================
    // RESET EDIT MODE
    // =================================

    editHistoryId = null;


    let button =
        document.getElementById(
            "stockIssueButton"
        );


    if (button) {

        button.innerHTML =
            "Stock Issue";

    }


    // =================================
    // RELOAD HISTORY
    // =================================

    await loadStockIssues();


    // =================================
    // UPDATE CURRENT STOCK
    // =================================

    let newStock =
        await calculateCurrentStock(
            item.code
        );


    document.getElementById(
        "currentStock"
    ).value =
        newStock;


    // =================================
    // CLEAR ENTRY FIELDS
    // =================================

    document.getElementById(
        "quantity"
    ).value = "";

    document.getElementById(
        "transactionDate"
    ).value = "";

    document.getElementById(
        "transactionTime"
    ).value = "";

}


// =====================================
// REFRESH HISTORY TABLE
// =====================================

function refreshHistoryTable() {

    let historyBody =
        document.getElementById(
            "historyBody"
        );


    if (!historyBody) {

        return;

    }


    historyBody.innerHTML = "";


    for (
        let i = 0;
        i < history.length;
        i++
    ) {

        let record =
            history[i];


        if (
            record.type ===
            "Stock Issue"
        ) {

            addHistoryRow(
                record
            );

        }

    }

}


// =====================================
// HISTORY ROW
// =====================================

function addHistoryRow(record) {

    let row =
        document.createElement(
            "tr"
        );


    // DATE

    let cell1 =
        document.createElement(
            "td"
        );

    cell1.textContent =
        record.date || "-";

    row.appendChild(cell1);


    // TIME

    let cell2 =
        document.createElement(
            "td"
        );

    cell2.textContent =
        record.time || "-";

    row.appendChild(cell2);


    // ITEM CODE

    let cell3 =
        document.createElement(
            "td"
        );

    cell3.textContent =
        record.item_code || "-";

    row.appendChild(cell3);


    // ITEM NAME

    let cell4 =
        document.createElement(
            "td"
        );

    cell4.textContent =
        record.item_name || "-";

    row.appendChild(cell4);


    // UNIT

    let cell5 =
        document.createElement(
            "td"
        );

    cell5.textContent =
        record.unit || "-";

    row.appendChild(cell5);


    // SOURCE

    let cell6 =
        document.createElement(
            "td"
        );

    cell6.textContent =
        record.source || "-";

    row.appendChild(cell6);


    // SUPPLIER

    let cell7 =
        document.createElement(
            "td"
        );

    cell7.textContent =
        record.supplier || "-";

    row.appendChild(cell7);


    // LOCATION

    let cell8 =
        document.createElement(
            "td"
        );

    cell8.textContent =
        record.location || "-";

    row.appendChild(cell8);


    // DEPARTMENT

    let cell9 =
        document.createElement(
            "td"
        );

    cell9.textContent =
        record.department || "-";

    row.appendChild(cell9);


    // QUANTITY

    let cell10 =
        document.createElement(
            "td"
        );

    cell10.textContent =
        Number(
            record.quantity || 0
        );

    row.appendChild(cell10);


    // =================================
    // ACTION
    // =================================

    let cell11 =
        document.createElement(
            "td"
        );


    // =================================
    // EDIT BUTTON
    // =================================

    let editButton =
        document.createElement(
            "button"
        );

    editButton.type =
        "button";

    editButton.textContent =
        "Edit";


    editButton.onclick =
        function () {

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
                "department"
            ).value =
                record.department || "";


            document.getElementById(
                "quantity"
            ).value =
                record.quantity || "";


            document.getElementById(
                "transactionDate"
            ).value =
                record.date || "";


            document.getElementById(
                "transactionTime"
            ).value =
                record.time || "";


            calculateCurrentStock(
                record.item_code
            )
            .then(
                function (stock) {

                    document.getElementById(
                        "currentStock"
                    ).value =
                        stock;

                }
            );


            let button =
                document.getElementById(
                    "stockIssueButton"
                );


            if (button) {

                button.innerHTML =
                    "Update";

            }

        };


    // =================================
    // DELETE BUTTON
    // =================================

    let deleteButton =
        document.createElement(
            "button"
        );

    deleteButton.type =
        "button";

    deleteButton.textContent =
        "Delete";


    deleteButton.onclick =
        async function () {

            let confirmDelete =
                confirm(
                    "Are you sure you want to delete this Stock Issue entry?"
                );


            if (!confirmDelete) {

                return;

            }


            let result =
                await supabaseRequest(
                    "stock_issues",
                    "DELETE",
                    null,
                    "?id=eq." +
                    record.id
                );


            if (!result.success) {

                console.error(
                    "❌ Delete Error:",
                    result.error
                );

                alert(
                    "Stock Issue Delete نہیں ہوئی!\n\n" +
                    JSON.stringify(
                        result.error
                    )
                );

                return;
            }


            alert(
                "Stock Issue Entry Deleted Successfully!"
            );


            if (
                Number(editHistoryId)
                ===
                Number(record.id)
            ) {

                editHistoryId = null;

            }


            await loadStockIssues();


            let currentCode =
                document.getElementById(
                    "itemCode"
                ).value.trim();


            if (
                currentCode !== ""
            ) {

                let newStock =
                    await calculateCurrentStock(
                        currentCode
                    );


                document.getElementById(
                    "currentStock"
                ).value =
                    newStock;

            }

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


    if (historyBody) {

        historyBody.appendChild(
            row
        );

    }

}


// =====================================
// INITIAL LOAD
// =====================================

loadAllData();
