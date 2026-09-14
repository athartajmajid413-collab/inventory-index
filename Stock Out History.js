// =====================================
// STOCK OUT HISTORY - SUPABASE VERSION
// MECAS ENGINEERING PVT LIMITED SUNDAR
// =====================================

let history = [];


// =====================================
// SELECTED ITEM FROM DASHBOARD
// =====================================

let selectedItemCode =
    localStorage.getItem(
        "dashboardSelectedItem"
    );


// =====================================
// LOAD STOCK OUT HISTORY FROM SUPABASE
// =====================================

async function loadHistory(){

    console.log(
        "Loading Stock Out History from Supabase..."
    );


    let result =
        await supabaseRequest(
            "stock_issue",
            "GET",
            null,
            "?select=*&order=date.desc,time.desc"
        );


    if(!result.success){

        console.error(
            "Stock Out History Load Error:",
            result.error
        );

        alert(
            "Stock Out History load nahi ho saki!\n\n" +
            JSON.stringify(result.error)
        );

        return;
    }


    history =
        result.data || [];


    console.log(
        "Stock Out History Loaded:",
        history.length,
        history
    );


    loadYears();

    showHistory();

}


// =====================================
// SHOW HISTORY
// =====================================

function showHistory(){

    let body =
        document.getElementById(
            "historyBody"
        );


    if(!body){

        console.error(
            "historyBody not found!"
        );

        return;
    }


    body.innerHTML = "";


    let searchElement =
        document.getElementById(
            "itemSearch"
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
            "fromDate"
        );


    let toDateElement =
        document.getElementById(
            "toDate"
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


    let count = 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        // =================================
        // ONLY STOCK ISSUE
        // =================================

        if(
            record.type &&
            record.type != "Stock Issue"
        ){

            continue;

        }


        // =================================
        // DASHBOARD SELECTED ITEM
        // =================================

        if(
            selectedItemCode &&
            String(
                record.item_code || ""
            ).trim() !=
            String(
                selectedItemCode
            ).trim()
        ){

            continue;

        }


        // =================================
        // SEARCH
        // =================================

        let itemName =
            String(
                record.item_name || ""
            ).toLowerCase();


        let itemCode =
            String(
                record.item_code || ""
            ).toLowerCase();


        if(
            search != "" &&
            !itemName.includes(search) &&
            !itemCode.includes(search)
        ){

            continue;

        }


        // =================================
        // DATE
        // =================================

        let recordDate =
            String(
                record.date || ""
            );


        if(
            fromDate &&
            recordDate < fromDate
        ){

            continue;

        }


        if(
            toDate &&
            recordDate > toDate
        ){

            continue;

        }


        // =================================
        // MONTH
        // =================================

        if(month){

            let recordMonth =
                recordDate.substring(
                    5,
                    7
                );


            if(
                recordMonth != month
            ){

                continue;

            }

        }


        // =================================
        // YEAR
        // =================================

        if(year){

            let recordYear =
                recordDate.substring(
                    0,
                    4
                );


            if(
                recordYear != year
            ){

                continue;

            }

        }


        // =================================
        // ADD ROW
        // =================================

        addHistoryRow(
            record
        );


        count++;

    }


    let selectedInfo =
        document.getElementById(
            "selectedItemInfo"
        );


    if(selectedInfo){

        selectedInfo.innerHTML =
            "Showing " +
            count +
            " Stock Out entr" +
            (
                count == 1
                ? "y"
                : "ies"
            );

    }

}


// =====================================
// CREATE EDIT INPUT
// =====================================

function createEditInput(
    type,
    value,
    className
){

    let input =
        document.createElement(
            "input"
        );


    input.type =
        type;


    input.value =
        value ?? "";


    if(className){

        input.className =
            className;

    }


    input.style.width =
        "100%";


    input.style.boxSizing =
        "border-box";


    input.style.padding =
        "5px";


    return input;

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

        record.department || "-",

        Number(
            record.quantity || 0
        )

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


    // =================================
    // ACTION CELL
    // =================================

    let actionCell =
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


    editButton.textContent =
        "Edit";


    editButton.className =
        "edit-btn";


    editButton.onclick =
        function(){

            editHistoryRow(
                row,
                record
            );

        };


    // =================================
    // DELETE BUTTON
    // =================================

    let deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.textContent =
        "Delete";


    deleteButton.className =
        "delete-btn";


    deleteButton.onclick =
        function(){

            deleteHistory(
                record
            );

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


    let body =
        document.getElementById(
            "historyBody"
        );


    if(body){

        body.appendChild(
            row
        );

    }

}


// =====================================
// EDIT HISTORY ROW - INLINE EDIT
// =====================================

function editHistoryRow(
    row,
    record
){

    if(
        !row ||
        !record
    ){

        return;

    }


    // =================================
    // CLEAR CURRENT ROW
    // =================================

    row.innerHTML = "";


    // =================================
    // DATE
    // =================================

    let dateCell =
        document.createElement(
            "td"
        );


    let dateInput =
        createEditInput(
            "date",
            record.date || ""
        );


    dateCell.appendChild(
        dateInput
    );


    row.appendChild(
        dateCell
    );


    // =================================
    // TIME
    // =================================

    let timeCell =
        document.createElement(
            "td"
        );


    let timeValue =
        String(
            record.time || ""
        );


    // If Supabase returns HH:MM:SS,
    // time input uses HH:MM

    if(
        timeValue.length >= 5
    ){

        timeValue =
            timeValue.substring(
                0,
                5
            );

    }


    let timeInput =
        createEditInput(
            "time",
            timeValue
        );


    timeCell.appendChild(
        timeInput
    );


    row.appendChild(
        timeCell
    );


    // =================================
    // ITEM CODE
    // =================================

    let itemCodeCell =
        document.createElement(
            "td"
        );


    let itemCodeInput =
        createEditInput(
            "text",
            record.item_code || ""
        );


    itemCodeCell.appendChild(
        itemCodeInput
    );


    row.appendChild(
        itemCodeCell
    );


    // =================================
    // ITEM NAME
    // =================================

    let itemNameCell =
        document.createElement(
            "td"
        );


    let itemNameInput =
        createEditInput(
            "text",
            record.item_name || ""
        );


    itemNameCell.appendChild(
        itemNameInput
    );


    row.appendChild(
        itemNameCell
    );


    // =================================
    // UNIT
    // =================================

    let unitCell =
        document.createElement(
            "td"
        );


    let unitInput =
        createEditInput(
            "text",
            record.unit || ""
        );


    unitCell.appendChild(
        unitInput
    );


    row.appendChild(
        unitCell
    );


    // =================================
    // SOURCE
    // =================================

    let sourceCell =
        document.createElement(
            "td"
        );


    let sourceInput =
        createEditInput(
            "text",
            record.source || ""
        );


    sourceCell.appendChild(
        sourceInput
    );


    row.appendChild(
        sourceCell
    );


    // =================================
    // SUPPLIER
    // =================================

    let supplierCell =
        document.createElement(
            "td"
        );


    let supplierInput =
        createEditInput(
            "text",
            record.supplier || ""
        );


    supplierCell.appendChild(
        supplierInput
    );


    row.appendChild(
        supplierCell
    );


    // =================================
    // LOCATION
    // =================================

    let locationCell =
        document.createElement(
            "td"
        );


    let locationInput =
        createEditInput(
            "text",
            record.location || ""
        );


    locationCell.appendChild(
        locationInput
    );


    row.appendChild(
        locationCell
    );


    // =================================
    // DEPARTMENT
    // =================================

    let departmentCell =
        document.createElement(
            "td"
        );


    let departmentInput =
        createEditInput(
            "text",
            record.department || ""
        );


    departmentCell.appendChild(
        departmentInput
    );


    row.appendChild(
        departmentCell
    );


    // =================================
    // QUANTITY
    // =================================

    let quantityCell =
        document.createElement(
            "td"
        );


    let quantityInput =
        createEditInput(
            "number",
            record.quantity || 0
        );


    quantityInput.step =
        "any";


    quantityCell.appendChild(
        quantityInput
    );


    row.appendChild(
        quantityCell
    );


    // =================================
    // ACTION CELL
    // =================================

    let actionCell =
        document.createElement(
            "td"
        );


    // =================================
    // UPDATE BUTTON
    // =================================

    let updateButton =
        document.createElement(
            "button"
        );


    updateButton.textContent =
        "Update";


    updateButton.className =
        "edit-btn";


    updateButton.onclick =
        async function(){

            await updateHistoryRecord(
                record,
                row,
                dateInput,
                timeInput,
                itemCodeInput,
                itemNameInput,
                unitInput,
                sourceInput,
                supplierInput,
                locationInput,
                departmentInput,
                quantityInput
            );

        };


    // =================================
    // CANCEL BUTTON
    // =================================

    let cancelButton =
        document.createElement(
            "button"
        );


    cancelButton.textContent =
        "Cancel";


    cancelButton.className =
        "delete-btn";


    cancelButton.onclick =
        function(){

            showHistory();

        };


    actionCell.appendChild(
        updateButton
    );


    actionCell.appendChild(
        cancelButton
    );


    row.appendChild(
        actionCell
    );

}


// =====================================
// UPDATE HISTORY RECORD
// =====================================

async function updateHistoryRecord(
    record,
    row,
    dateInput,
    timeInput,
    itemCodeInput,
    itemNameInput,
    unitInput,
    sourceInput,
    supplierInput,
    locationInput,
    departmentInput,
    quantityInput
){

    if(
        !record ||
        !record.id
    ){

        alert(
            "Stock Out record ID nahi mila!"
        );

        return;

    }


    // =================================
    // GET VALUES
    // =================================

    let date =
        dateInput.value.trim();


    let time =
        timeInput.value.trim();


    let itemCode =
        itemCodeInput.value.trim();


    let itemName =
        itemNameInput.value.trim();


    let unit =
        unitInput.value.trim();


    let source =
        sourceInput.value.trim();


    let supplier =
        supplierInput.value.trim();


    let location =
        locationInput.value.trim();


    let department =
        departmentInput.value.trim();


    let quantity =
        Number(
            quantityInput.value
        );


    // =================================
    // VALIDATION
    // =================================

    if(!date){

        alert(
            "Date enter karein!"
        );

        return;

    }


    if(!time){

        alert(
            "Time enter karein!"
        );

        return;

    }


    if(!itemCode){

        alert(
            "Item Code enter karein!"
        );

        return;

    }


    if(!itemName){

        alert(
            "Item Name enter karein!"
        );

        return;

    }


    if(
        !Number.isFinite(quantity) ||
        quantity < 0
    ){

        alert(
            "Quantity sahi enter karein!"
        );

        return;

    }


    // =================================
    // UPDATE DATA
    // =================================

    let updateData = {

        date:
            date,

        time:
            time,

        item_code:
            itemCode,

        item_name:
            itemName,

        unit:
            unit,

        source:
            source,

        supplier:
            supplier,

        location:
            location,

        department:
            department,

        quantity:
            quantity

    };


    console.log(
        "Updating Stock Out Record:",
        record.id,
        updateData
    );


    // =================================
    // SUPABASE UPDATE
    // =================================

    let result =
        await supabaseRequest(
            "stock_issue",
            "PATCH",
            updateData,
            "?id=eq." +
            record.id
        );


    if(!result.success){

        console.error(
            "Stock Out Update Error:",
            result.error
        );


        alert(
            "Stock Out Entry update nahi hui!\n\n" +
            JSON.stringify(
                result.error
            )
        );


        return;

    }


    // =================================
    // SUCCESS
    // =================================

    alert(
        "Stock Out Entry Updated Successfully!"
    );


    await loadHistory();

}


// =====================================
// DELETE HISTORY
// =====================================

async function deleteHistory(record){

    if(!record){

        return;

    }


    let confirmDelete =
        confirm(
            "Are you sure you want to delete this Stock Out entry?\n\n" +
            record.item_name +
            " - " +
            record.quantity
        );


    if(
        confirmDelete == false
    ){

        return;

    }


    let result =
        await supabaseRequest(
            "stock_issue",
            "DELETE",
            null,
            "?id=eq." +
            record.id
        );


    if(!result.success){

        console.error(
            "Stock Out Delete Error:",
            result.error
        );


        alert(
            "Stock Out Entry delete nahi hui!\n\n" +
            JSON.stringify(result.error)
        );


        return;

    }


    alert(
        "Stock Out Entry Deleted Successfully!"
    );


    await loadHistory();

}


// =====================================
// FILTER
// =====================================

function filterHistory(){

    showHistory();

}


// =====================================
// CLEAR FILTERS
// =====================================

function clearFilters(){

    let search =
        document.getElementById(
            "itemSearch"
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
            "fromDate"
        );


    let toDate =
        document.getElementById(
            "toDate"
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


    // Dashboard selection clear

    localStorage.removeItem(
        "dashboardSelectedItem"
    );


    selectedItemCode =
        null;


    showHistory();

}


// =====================================
// LOAD YEARS
// =====================================

function loadYears(){

    let yearSelect =
        document.getElementById(
            "yearFilter"
        );


    if(!yearSelect){

        return;

    }


    let years = [];


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(
            record.type &&
            record.type != "Stock Issue"
        ){

            continue;

        }


        let year =
            String(
                record.date || ""
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


    years.sort(
        function(a,b){

            return b - a;

        }
    );


    yearSelect.innerHTML =
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


        yearSelect.appendChild(
            option
        );

    }

}


// =====================================
// PAGE START
// =====================================

(async function(){

    await loadHistory();

})();
