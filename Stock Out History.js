// =====================================
// LOAD DATA
// =====================================

let history =
    JSON.parse(
        localStorage.getItem("history")
    ) || [];


// =====================================
// SELECTED ITEM FROM DASHBOARD
// =====================================

let selectedItemCode =
    localStorage.getItem(
        "dashboardSelectedItem"
    );


// =====================================
// SHOW HISTORY
// =====================================

function showHistory(){

    let body =
        document.getElementById(
            "historyBody"
        );

    body.innerHTML = "";


    let search =
        document.getElementById(
            "itemSearch"
        )
        .value
        .trim()
        .toLowerCase();


    let month =
        document.getElementById(
            "monthFilter"
        ).value;


    let year =
        document.getElementById(
            "yearFilter"
        ).value;


    let fromDate =
        document.getElementById(
            "fromDate"
        ).value;


    let toDate =
        document.getElementById(
            "toDate"
        ).value;


    let count = 0;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        // =================================
        // ONLY STOCK OUT
        // =================================

        if(
            record.type !=
            "Stock Issue"
        ){

            continue;

        }


        // =================================
        // DASHBOARD SELECTED ITEM
        // =================================

        if(
            selectedItemCode &&
            String(
                record.itemCode
            ).trim() !=
            String(
                selectedItemCode
            ).trim()
        ){

            continue;

        }


        // =================================
        // ITEM SEARCH
        // =================================

        let itemName =
            String(
                record.itemName || ""
            ).toLowerCase();


        let itemCode =
            String(
                record.itemCode || ""
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
            record,
            i
        );


        count++;

    }


    document.getElementById(
        "selectedItemInfo"
    ).innerHTML =

        "Showing " +
        count +
        " Stock Out entr" +
        (
            count == 1
            ? "y"
            : "ies"
        );

}


// =====================================
// ADD HISTORY ROW
// =====================================

function addHistoryRow(
    record,
    historyIndex
){

    let row =
        document.createElement(
            "tr"
        );


    row.innerHTML =

        "<td>" +
        (record.date || "-") +
        "</td>" +

        "<td>" +
        (record.time || "-") +
        "</td>" +

        "<td>" +
        (record.itemCode || "-") +
        "</td>" +

        "<td>" +
        (record.itemName || "-") +
        "</td>" +

        "<td>" +
        (record.unit || "-") +
        "</td>" +

        "<td>" +
        (record.source || "-") +
        "</td>" +

        "<td>" +
        (record.supplier || "-") +
        "</td>" +

        "<td>" +
        (record.location || "-") +
        "</td>" +

        "<td>" +
        (record.department || "-") +
        "</td>" +

        "<td>" +
        (record.quantity || 0) +
        "</td>";


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


    editButton.innerHTML =
        "Edit";


    editButton.onclick =
        function(){

            editHistory(
                historyIndex
            );

        };


    // =================================
    // DELETE BUTTON
    // =================================

    let deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.innerHTML =
        "Delete";


    deleteButton.onclick =
        function(){

            deleteHistory(
                historyIndex
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


    document.getElementById(
        "historyBody"
    ).appendChild(
        row
    );

}


// =====================================
// EDIT HISTORY
// =====================================

function editHistory(index){

    let record =
        history[index];


    if(!record){

        return;

    }


    // Save selected record
    localStorage.setItem(
        "editStockOutIndex",
        index
    );


    // Open Stock Out entry page
    window.location.href =
        "Stock out .html";

}


// =====================================
// DELETE HISTORY
// =====================================

function deleteHistory(index){

    let record =
        history[index];


    if(!record){

        return;

    }


    let confirmDelete =
        confirm(
            "Are you sure you want to delete this Stock Out entry?\n\n" +
            record.itemName +
            " - " +
            record.quantity
        );


    if(
        confirmDelete == false
    ){

        return;

    }


    history.splice(
        index,
        1
    );


    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );


    alert(
        "Stock Out Entry Deleted Successfully!"
    );


    showHistory();

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

    document.getElementById(
        "itemSearch"
    ).value = "";


    document.getElementById(
        "monthFilter"
    ).value = "";


    document.getElementById(
        "yearFilter"
    ).value = "";


    document.getElementById(
        "fromDate"
    ).value = "";


    document.getElementById(
        "toDate"
    ).value = "";


    // Dashboard selection بھی ختم
    localStorage.removeItem(
        "dashboardSelectedItem"
    );


    selectedItemCode = null;


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


    let years = [];


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(
            record.type !=
            "Stock Issue"
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


    years.sort();


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

loadYears();

showHistory();