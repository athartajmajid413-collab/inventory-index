// =====================================
// LOAD COST HISTORY
// =====================================

let costHistory =
    JSON.parse(
        localStorage.getItem("costHistory")
    ) || [];


// =====================================
// LOAD YEARS
// =====================================

function loadYears(){

    let yearSelect =
        document.getElementById(
            "yearSelect"
        );

    yearSelect.innerHTML =
        '<option value="">Select Year</option>';


    let years = [];


    // =================================
    // GET YEARS FROM HISTORY
    // =================================

    for(
        let i = 0;
        i < costHistory.length;
        i++
    ){

        let month =
            costHistory[i].month;


        if(!month){
            continue;
        }


        let year =
            month.substring(0, 4);


        if(
            years.indexOf(year) === -1
        ){

            years.push(year);

        }

    }


    // =================================
    // SORT YEARS
    // =================================

    years.sort(function(a, b){

        return Number(b) - Number(a);

    });


    // =================================
    // ADD YEARS
    // =================================

    for(
        let i = 0;
        i < years.length;
        i++
    ){

        let option =
            document.createElement("option");


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
// SHOW YEAR HISTORY
// =====================================

function showYearHistory(){

    let selectedYear =
        document.getElementById(
            "yearSelect"
        ).value;


    let body =
        document.getElementById(
            "yearHistoryBody"
        );


    body.innerHTML =
        "";


    // =================================
    // RESET TOTALS
    // =================================

    document.getElementById(
        "yearStockCost"
    ).textContent =
        "Rs. 0";


    document.getElementById(
        "yearDemandQty"
    ).textContent =
        "0";


    document.getElementById(
        "yearDemandCost"
    ).textContent =
        "Rs. 0";


    document.getElementById(
        "yearTotalCost"
    ).textContent =
        "Rs. 0";


    // =================================
    // CHECK YEAR
    // =================================

    if(selectedYear == ""){

        document.getElementById(
            "yearTitle"
        ).textContent =
            "Please Select Year";


        return;

    }


    document.getElementById(
        "yearTitle"
    ).textContent =

        "Cost History - "
        +
        selectedYear;


    // =================================
    // TOTAL VARIABLES
    // =================================

    let yearStockCost =
        0;


    let yearDemandQty =
        0;


    let yearDemandCost =
        0;


    let yearTotalCost =
        0;


    let monthNames = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];


    // =================================
    // MONTH BY MONTH
    // =================================

    for(
        let monthNumber = 1;
        monthNumber <= 12;
        monthNumber++
    ){

        let monthString =
            selectedYear
            +
            "-"
            +
            String(
                monthNumber
            ).padStart(2, "0");


        let record =
            null;


        // =============================
        // FIND MONTH RECORD
        // =============================

        for(
            let i = 0;
            i < costHistory.length;
            i++
        ){

            if(

                costHistory[i].month ==
                monthString

            ){

                record =
                    costHistory[i];

                break;

            }

        }


        // =============================
        // IF NO RECORD
        // =============================

        if(!record){

            continue;

        }


        // =============================
        // MONTH TOTALS
        // =============================

        let monthStockCost =
            0;


        let monthDemandQty =
            0;


        let monthDemandCost =
            0;


        let items =
            record.items || [];


        for(
            let j = 0;
            j < items.length;
            j++
        ){

            let item =
                items[j];


            monthStockCost =
                monthStockCost
                +
                Number(
                    item.availableStockCost || 0
                );


            monthDemandQty =
                monthDemandQty
                +
                Number(
                    item.approvedDemandQty || 0
                );


            monthDemandCost =
                monthDemandCost
                +
                Number(
                    item.approvedDemandCost || 0
                );

        }


        // =============================
        // MONTH TOTAL COST
        // =============================

        let monthTotalCost =

            monthStockCost
            +
            monthDemandCost;


        // =============================
        // YEAR TOTALS
        // =============================

        yearStockCost =
            yearStockCost
            +
            monthStockCost;


        yearDemandQty =
            yearDemandQty
            +
            monthDemandQty;


        yearDemandCost =
            yearDemandCost
            +
            monthDemandCost;


        yearTotalCost =
            yearTotalCost
            +
            monthTotalCost;


        // =============================
        // CREATE ROW
        // =============================

        let row =
            document.createElement("tr");


        // =============================
        // MONTH
        // =============================

        let cell1 =
            document.createElement("td");


        cell1.textContent =
            monthNames[
                monthNumber - 1
            ];


        row.appendChild(cell1);


        // =============================
        // STOCK COST
        // =============================

        let cell2 =
            document.createElement("td");


        cell2.textContent =

            "Rs. "

            +

            monthStockCost.toFixed(2);


        row.appendChild(cell2);


        // =============================
        // DEMAND QTY
        // =============================

        let cell3 =
            document.createElement("td");


        cell3.textContent =
            monthDemandQty.toFixed(2);


        row.appendChild(cell3);


        // =============================
        // DEMAND COST
        // =============================

        let cell4 =
            document.createElement("td");


        cell4.textContent =

            "Rs. "

            +

            monthDemandCost.toFixed(2);


        row.appendChild(cell4);


        // =============================
        // TOTAL COST
        // =============================

        let cell5 =
            document.createElement("td");


        cell5.textContent =

            "Rs. "

            +

            monthTotalCost.toFixed(2);


        row.appendChild(cell5);


        // =============================
        // ACTION
        // =============================

        let cell6 =
            document.createElement("td");


        cell6.className =
            "no-print";


        let button =
            document.createElement("button");


        button.type =
            "button";


        button.textContent =
            "View Details";


        button.onclick =
            function(){

                viewMonthDetails(
                    monthString
                );

            };


        cell6.appendChild(button);


        row.appendChild(cell6);


        // =============================
        // ADD ROW
        // =============================

        body.appendChild(row);

    }


    // =================================
    // SHOW YEAR TOTALS
    // =================================

    document.getElementById(
        "yearStockCost"
    ).textContent =

        "Rs. "

        +

        yearStockCost.toFixed(2);


    document.getElementById(
        "yearDemandQty"
    ).textContent =

        yearDemandQty.toFixed(2);


    document.getElementById(
        "yearDemandCost"
    ).textContent =

        "Rs. "

        +

        yearDemandCost.toFixed(2);


    document.getElementById(
        "yearTotalCost"
    ).textContent =

        "Rs. "

        +

        yearTotalCost.toFixed(2);

}


// =====================================
// VIEW MONTH DETAILS
// =====================================

function viewMonthDetails(month){

    localStorage.setItem(
        "selectedCostHistoryMonth",
        month
    );


    window.location.href =
        "Cost History Details.html";

}


// =====================================
// BACK TO COST HISTORY
// =====================================

function backToCostHistory(){

    window.location.href =
        "Cost History.html";

}


// =====================================
// PRINT YEAR HISTORY
// =====================================

function printYearHistory(){

    let selectedYear =
        document.getElementById(
            "yearSelect"
        ).value;


    if(selectedYear == ""){

        alert(
            "Please select a year first!"
        );

        return;

    }


    window.print();

}


// =====================================
// LOAD PAGE
// =====================================

loadYears();