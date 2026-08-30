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
    // ACTION
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

            localStorage.setItem(
                "editStockInRecord",
                JSON.stringify(record)
            );


            window.location.href =
                "Stock In .html";

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

