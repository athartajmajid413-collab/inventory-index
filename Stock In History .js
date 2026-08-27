// =====================================
// STOCK IN HISTORY
// =====================================

let history =
    JSON.parse(localStorage.getItem("history")) || [];


// =====================================
// SELECTED ITEM FROM DASHBOARD
// =====================================

let selectedItem =
    localStorage.getItem(
        "dashboardSelectedItem"
    );


// =====================================
// LOAD PAGE
// =====================================

loadHistory();


// =====================================
// LOAD HISTORY
// =====================================

function loadHistory(){

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
            "Stock In"
        ){

            continue;

        }


        if(!record.date){

            continue;

        }


        let year =
            record.date.substring(
                0,
                4
            );


        if(
            !years.includes(year)
        ){

            years.push(year);

        }

    }


    years.sort(
        function(a,b){

            return b-a;

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

    let search =
        document.getElementById(
            "searchInput"
        )
        .value
        .trim()
        .toLowerCase();


    let month =
        document.getElementById(
            "monthFilter"
        )
        .value;


    let year =
        document.getElementById(
            "yearFilter"
        )
        .value;


    let fromDate =
        document.getElementById(
            "fromDate"
        )
        .value;


    let toDate =
        document.getElementById(
            "toDate"
        )
        .value;


    let body =
        document.getElementById(
            "historyBody"
        );


    body.innerHTML = "";


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        // Only Stock In

        if(
            record.type !=
            "Stock In"
        ){

            continue;

        }


        // =================================
        // DASHBOARD SELECTED ITEM
        // =================================

        if(
            selectedItem &&
            String(record.itemCode).trim() !=
            String(selectedItem).trim()
        ){

            continue;

        }


        // =================================
        // SEARCH
        // =================================

        if(search != ""){

            let itemCode =
                String(
                    record.itemCode || ""
                )
                .toLowerCase();


            let itemName =
                String(
                    record.itemName || ""
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
                ? record.date.substring(
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
                ? record.date.substring(
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
// ADD HISTORY ROW
// =====================================

function addHistoryRow(record){

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
        (record.quantity || 0) +
        "</td>" +

        "<td>" +
        (record.unitCost || 0) +
        "</td>" +

        "<td>" +
        (record.totalCost || 0) +
        "</td>" +

        "<td>" +

        "<button " +
        "class='edit-btn' " +
        "onclick='editEntry(" +
        JSON.stringify(record) +
        ")'>" +

        "Edit" +

        "</button>" +

        "<button " +
        "class='delete-btn' " +
        "onclick='deleteEntry(" +
        JSON.stringify(record) +
        ")'>" +

        "Delete" +

        "</button>" +

        "</td>";


    document.getElementById(
        "historyBody"
    )
    .appendChild(
        row
    );

}


// =====================================
// EDIT ENTRY
// =====================================

function editEntry(record){

    localStorage.setItem(
        "editStockInRecord",
        JSON.stringify(record)
    );


    window.location.href =
        "Stock In .html";

}


// =====================================
// DELETE ENTRY
// =====================================

function deleteEntry(record){

    let confirmDelete =
        confirm(
            "Are you sure you want to delete this Stock In entry?"
        );


    if(
        confirmDelete == false
    ){

        return;

    }


    let index =
        history.indexOf(record);


    if(index == -1){

        // Find matching record

        index =
            history.findIndex(
                function(item){

                    return (
                        item.type ==
                        record.type &&

                        item.date ==
                        record.date &&

                        item.time ==
                        record.time &&

                        item.itemCode ==
                        record.itemCode &&

                        item.quantity ==
                        record.quantity
                    );

                }
            );

    }


    if(index != -1){

        history.splice(
            index,
            1
        );


        localStorage.setItem(
            "history",
            JSON.stringify(history)
        );


        alert(
            "Stock In Entry Deleted Successfully!"
        );


        filterHistory();

    }

}


// =====================================
// CLEAR FILTERS
// =====================================

function clearFilters(){

    document.getElementById(
        "searchInput"
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


    filterHistory();

}