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

        record.quantity || 0

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
    // EDIT
    // =================================

    let editButton =
        document.createElement(
            "button"
        );


    editButton.textContent =
        "Edit";


    editButton.onclick =
        function(){

            editHistory(
                record
            );

        };


    // =================================
    // DELETE
    // =================================

    let deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.textContent =
        "Delete";


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
// EDIT HISTORY
// =====================================

function editHistory(record){

    if(!record){

        return;

    }


    // Save Supabase record ID
    localStorage.setItem(
        "editStockOutId",
        record.id
    );


    // Open Stock Out page
    window.location.href =
        "Stock out .html";

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
