// =====================================
// STOCK IN HISTORY - SUPABASE VERSION
// MECAS ENGINEERING PVT LIMITED SUNDAR
// =====================================

let history = [];


// =====================================
// SELECTED ITEM FROM DASHBOARD
// =====================================

let selectedItem =
    localStorage.getItem(
        "dashboardSelectedItem"
    );


// =====================================
// LOAD HISTORY FROM SUPABASE
// =====================================

async function loadHistory(){

    console.log(
        "Loading Stock In History from Supabase..."
    );


    let result =
        await supabaseRequest(
            "stock_in",
            "GET",
            null,
            "?select=*&order=date.desc,time.desc"
        );


    if(!result.success){

        console.error(
            "Stock In History Load Error:",
            result.error
        );

        alert(
            "Stock In History load nahi ho saki!"
        );

        return;
    }


    history =
        result.data || [];


    console.log(
        "Stock In History:",
        history
    );


    createYearOptions();

    filterHistory();

}


// =====================================
// CREATE YEAR OPTIONS
// =====================================

function createYearOptions(){

    let yearFilter =
        document.getElementById(
            "yearFilter"
        );


    if(!yearFilter){

        return;
    }


    yearFilter.innerHTML =
        '<option value="">Select Year</option>';


    let years = [];


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(!record.date){

            continue;
        }


        let year =
            String(
                record.date
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
// FILTER HISTORY
// =====================================

function filterHistory(){

    let searchElement =
        document.getElementById(
            "searchInput"
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


    let body =
        document.getElementById(
            "historyBody"
        );


    if(!body){

        return;
    }


    body.innerHTML = "";


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        // =================================
        // DASHBOARD SELECTED ITEM
        // =================================

        if(
            selectedItem &&
            String(
                record.item_code || ""
            ).trim() !=
            String(
                selectedItem
            ).trim()
        ){

            continue;

        }


        // =================================
        // SEARCH
        // =================================

        if(search != ""){

            let itemCode =
                String(
                    record.item_code || ""
                )
                .toLowerCase();


            let itemName =
                String(
                    record.item_name || ""
                )
                .toLowerCase();


            if(
                !itemCode.includes(search) &&
                !itemName.includes(search)
            ){

                continue;

            }

        }


        // =================================
        // MONTH
        // =================================

        if(month != ""){

            let recordMonth =
                record.date
                ? String(
                    record.date
                ).substring(
                    5,
                    7
                )
                : "";


            if(
                recordMonth != month
            ){

                continue;

            }

        }


        // =================================
        // YEAR
        // =================================

        if(year != ""){

            let recordYear =
                record.date
                ? String(
                    record.date
                ).substring(
                    0,
                    4
                )
                : "";


            if(
                recordYear != year
            ){

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


        // =================================
        // SHOW ROW
        // =================================

        addHistoryRow(
            record
        );

    }

}


// =====================================
// CREATE INPUT
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
        value == null
        ? ""
        : value;


    input.className =
        className || "history-edit-input";


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


    let unitCost =
        Number(
            record.unit_cost || 0
        );


    let totalCost =
        Number(
            record.total_cost ||
            (
                Number(
                    record.quantity || 0
                ) *
                unitCost
            )
        );


    // =====================================
    // NORMAL VIEW CELLS
    // =====================================

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

        unitCost.toFixed(2),

        totalCost.toFixed(2)

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
    // EDIT BUTTON
    // =====================================

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


    // =====================================
    // DELETE BUTTON
    // =====================================

    let deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.textContent =
        "Delete";


    deleteButton.className =
        "delete-btn";


    deleteButton.onclick =
        async function(){

            let confirmDelete =
                confirm(
                    "Are you sure you want to delete this Stock In entry?"
                );


            if(
                !confirmDelete
            ){

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
                    "Stock In Delete Error:",
                    result.error
                );


                alert(
                    "Stock In Entry delete nahi hui!"
                );


                return;

            }


            alert(
                "Stock In Entry Deleted Successfully!"
            );


            await loadHistory();

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
// EDIT HISTORY ROW
// =====================================

function editHistoryRow(
    row,
    record
){

    // =====================================
    // CLEAR EXISTING CELLS
    // =====================================

    row.innerHTML = "";


    // =====================================
    // DATE
    // =====================================

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


    // =====================================
    // TIME
    // =====================================

    let timeCell =
        document.createElement(
            "td"
        );


    let timeInput =
        createEditInput(
            "time",
            record.time || ""
        );


    timeCell.appendChild(
        timeInput
    );


    row.appendChild(
        timeCell
    );


    // =====================================
    // ITEM CODE
    // =====================================

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


    // =====================================
    // ITEM NAME
    // =====================================

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


    // =====================================
    // UNIT
    // =====================================

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


    // =====================================
    // SOURCE
    // =====================================

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


    // =====================================
    // SUPPLIER
    // =====================================

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


    // =====================================
    // LOCATION
    // =====================================

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


    // =====================================
    // QUANTITY
    // =====================================

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


    // =====================================
    // UNIT COST
    // =====================================

    let unitCostCell =
        document.createElement(
            "td"
        );


    let unitCostInput =
        createEditInput(
            "number",
            record.unit_cost || 0
        );


    unitCostInput.step =
        "any";


    unitCostCell.appendChild(
        unitCostInput
    );


    row.appendChild(
        unitCostCell
    );


    // =====================================
    // TOTAL COST
    // =====================================

    let totalCostCell =
        document.createElement(
            "td"
        );


    let totalCostValue =
        document.createElement(
            "span"
        );


    totalCostValue.textContent =
        (
            Number(
                quantityInput.value || 0
            ) *
            Number(
                unitCostInput.value || 0
            )
        ).toFixed(2);


    totalCostCell.appendChild(
        totalCostValue
    );


    row.appendChild(
        totalCostCell
    );


    // =====================================
    // UPDATE TOTAL COST LIVE
    // =====================================

    function updateTotalCost(){

        let quantity =
            Number(
                quantityInput.value || 0
            );


        let unitCost =
            Number(
                unitCostInput.value || 0
            );


        totalCostValue.textContent =
            (
                quantity *
                unitCost
            ).toFixed(2);

    }


    quantityInput.addEventListener(
        "input",
        updateTotalCost
    );


    unitCostInput.addEventListener(
        "input",
        updateTotalCost
    );


    // =====================================
    // ACTION CELL
    // =====================================

    let actionCell =
        document.createElement(
            "td"
        );


    // =====================================
    // UPDATE BUTTON
    // =====================================

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
                quantityInput,
                unitCostInput
            );

        };


    // =====================================
    // CANCEL BUTTON
    // =====================================

    let cancelButton =
        document.createElement(
            "button"
        );


    cancelButton.textContent =
        "Cancel";


    cancelButton.className =
        "delete-btn";


    cancelButton.style.marginLeft =
        "5px";


    cancelButton.onclick =
        function(){

            filterHistory();

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
// UPDATE HISTORY RECORD IN SUPABASE
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
    quantityInput,
    unitCostInput

){

    // =====================================
    // GET VALUES
    // =====================================

    let date =
        dateInput.value;


    let time =
        timeInput.value;


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


    let quantity =
        Number(
            quantityInput.value
        );


    let unitCost =
        Number(
            unitCostInput.value
        );


    // =====================================
    // VALIDATION
    // =====================================

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
        isNaN(quantity) ||
        quantity < 0
    ){

        alert(
            "Quantity theek enter karein!"
        );

        return;

    }


    if(
        isNaN(unitCost) ||
        unitCost < 0
    ){

        alert(
            "Unit Cost theek enter karein!"
        );

        return;

    }


    // =====================================
    // CALCULATE TOTAL COST
    // =====================================

    let totalCost =
        quantity *
        unitCost;


    // =====================================
    // UPDATE OBJECT
    // =====================================

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

        quantity:
            quantity,

        unit_cost:
            unitCost,

        total_cost:
            totalCost

    };


    console.log(
        "Updating Stock In:",
        record.id,
        updateData
    );


    // =====================================
    // UPDATE SUPABASE
    // =====================================

    let result =
        await supabaseRequest(
            "stock_in",
            "PATCH",
            updateData,
            "?id=eq." +
            record.id
        );


    if(!result.success){

        console.error(
            "Stock In Update Error:",
            result.error
        );


        alert(
            "Stock In Entry update nahi hui!"
        );


        return;

    }


    // =====================================
    // SUCCESS
    // =====================================

    alert(
        "Stock In Entry Successfully Updated!"
    );


    // =====================================
    // RELOAD HISTORY
    // =====================================

    await loadHistory();

}


// =====================================
// CLEAR FILTERS
// =====================================

function clearFilters(){

    let search =
        document.getElementById(
            "searchInput"
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


    filterHistory();

}


// =====================================
// INITIAL LOAD
// =====================================

(async function(){

    await loadHistory();

})();
