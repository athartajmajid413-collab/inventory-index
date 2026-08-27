// =====================================
// LOAD DATA
// =====================================

let items =
    JSON.parse(localStorage.getItem("items")) || [];

let history =
    JSON.parse(localStorage.getItem("history")) || [];

let demandHistory =
    JSON.parse(localStorage.getItem("demandHistory")) || [];

let costHistory =
    JSON.parse(localStorage.getItem("costHistory")) || [];


// =====================================
// GET CURRENT MONTH
// =====================================

function getCurrentMonth(){

    let today =
        new Date();

    let year =
        today.getFullYear();

    let month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    return year + "-" + month;

}


// =====================================
// MONTH NAME
// =====================================

function getMonthName(month){

    if(!month){
        return "-";
    }

    let parts =
        month.split("-");

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

    let monthNumber =
        Number(parts[1]);

    return (
        monthNames[monthNumber - 1]
        +
        " "
        +
        parts[0]
    );

}


// =====================================
// LOAD YEARS
// =====================================

function loadHistoryYears(){

    let yearSelect =
        document.getElementById("historyYear");


    yearSelect.innerHTML =
        '<option value="">Select Year</option>';


    let years = [];


    for(
        let i = 0;
        i < costHistory.length;
        i++
    ){

        let record =
            costHistory[i];


        if(
            record.month
        ){

            let year =
                record.month.substring(0,4);


            if(
                !years.includes(year)
            ){

                years.push(year);

            }

        }

    }


    years.sort();


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
// GET LATEST RATE
// =====================================

function getLatestRate(itemCode){

    let latestRecord =
        null;


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            record.type ==
            "Stock In"

            &&

            String(record.itemCode).trim() ==
            String(itemCode).trim()

        ){

            if(

                latestRecord == null

                ||

                record.date >
                latestRecord.date

                ||

                (

                    record.date ==
                    latestRecord.date

                    &&

                    record.time >
                    latestRecord.time

                )

            ){

                latestRecord =
                    record;

            }

        }

    }


    if(
        latestRecord == null
    ){

        return 0;

    }


    return Number(
        latestRecord.unitCost || 0
    );

}


// =====================================
// GET CURRENT STOCK
// =====================================

function getCurrentStock(item){

    let stock =
        Number(
            item.openingStock || 0
        );


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            String(record.itemCode).trim() !=
            String(item.code).trim()

        ){

            continue;

        }


        if(
            record.type ==
            "Stock In"
        ){

            stock =
                stock +
                Number(
                    record.quantity || 0
                );

        }


        if(
            record.type ==
            "Stock Issue"
        ){

            stock =
                stock -
                Number(
                    record.quantity || 0
                );

        }

    }


    if(stock < 0){

        stock = 0;

    }


    return stock;

}


// =====================================
// GET MONTH DEMAND
// =====================================

function getMonthlyDemand(
    itemCode,
    month
){

    let demandQuantity =
        0;


    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let demandRecord =
            demandHistory[i];


        if(

            demandRecord.demandMonth !=
            month

        ){

            continue;

        }


        let demandItems =
            demandRecord.demandItems
            ||
            demandRecord.items
            ||
            [];


        for(
            let j = 0;
            j < demandItems.length;
            j++
        ){

            let demandItem =
                demandItems[j];


            if(

                String(
                    demandItem.code
                ).trim()

                ==

                String(
                    itemCode
                ).trim()

            ){

                demandQuantity =
                    demandQuantity
                    +
                    Number(
                        demandItem.finalDemand
                        ||
                        demandItem.demandQuantity
                        ||
                        0
                    );

            }

        }

    }


    return demandQuantity;

}


// =====================================
// CREATE MONTHLY COST DATA
// =====================================

function createMonthlyCostRecord(
    month
){

    let totalItems =
        0;


    let totalStockCost =
        0;


    let totalDemandQty =
        0;


    let totalDemandCost =
        0;


    let itemDetails =
        [];


    // =================================
    // ALL MASTER ITEMS
    // =================================

    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let item =
            items[i];


        let availableQty =
            getCurrentStock(item);


        let rate =
            getLatestRate(item.code);


        let availableStockCost =
            availableQty * rate;


        let approvedDemandQty =
            getMonthlyDemand(
                item.code,
                month
            );


        let approvedDemandCost =
            approvedDemandQty * rate;


        totalItems++;


        totalStockCost =
            totalStockCost
            +
            availableStockCost;


        totalDemandQty =
            totalDemandQty
            +
            approvedDemandQty;


        totalDemandCost =
            totalDemandCost
            +
            approvedDemandCost;


        // =================================
        // SAVE ITEM DETAIL
        // =================================

        itemDetails.push({

            category:
                item.category || "-",

            code:
                item.code || "-",

            itemName:
                item.itemName || "-",

            specification:
                item.specification || "-",

            source:
                item.source || "-",

            rate:
                rate,

            availableQuantity:
                availableQty,

            availableStockCost:
                availableStockCost,

            approvedDemandQty:
                approvedDemandQty,

            approvedDemandCost:
                approvedDemandCost

        });

    }


    let today =
        new Date();


    let saveDate =
        today.toLocaleDateString(
            "en-GB"
        );


    return {

        month:
            month,

        monthName:
            getMonthName(month),

        year:
            month.substring(0,4),

        totalItems:
            totalItems,

        availableStockCost:
            totalStockCost,

        approvedDemandQty:
            totalDemandQty,

        approvedDemandCost:
            totalDemandCost,

        items:
            itemDetails,

        savedDate:
            saveDate

    };

}


// =====================================
// AUTO SAVE CURRENT MONTH
// =====================================

function autoSaveCurrentMonth(){

    let currentMonth =
        getCurrentMonth();


    saveMonthlyCost(
        currentMonth,
        false
    );

}


// =====================================
// SAVE MONTHLY COST
// =====================================

function saveMonthlyCost(
    month,
    showMessage
){

    let newRecord =
        createMonthlyCostRecord(
            month
        );


    // =================================
    // CHECK EXISTING MONTH
    // =================================

    let existingIndex =
        -1;


    for(
        let i = 0;
        i < costHistory.length;
        i++
    ){

        if(
            costHistory[i].month ==
            month
        ){

            existingIndex =
                i;

            break;

        }

    }


    // =================================
    // UPDATE EXISTING MONTH
    // =================================

    if(existingIndex != -1){

        costHistory[
            existingIndex
        ] =
            newRecord;

    }

    // =================================
    // CREATE NEW MONTH
    // =================================

    else{

        costHistory.push(
            newRecord
        );

    }


    // =================================
    // SAVE LOCAL STORAGE
    // =================================

    localStorage.setItem(
        "costHistory",
        JSON.stringify(
            costHistory
        )
    );


    // =================================
    // UPDATE YEAR LIST
    // =================================

    loadHistoryYears();


    if(showMessage){

        alert(
            "Cost History saved successfully!\n\n"
            +
            getMonthName(month)
        );

    }


    showCostHistory();

}


// =====================================
// MANUAL SAVE CURRENT COST
// =====================================

function saveCurrentCostHistory(){

    let currentMonth =
        getCurrentMonth();


    saveMonthlyCost(
        currentMonth,
        true
    );

}


// =====================================
// SHOW COST HISTORY
// =====================================

function showCostHistory(){

    let selectedMonth =
        document.getElementById(
            "historyMonth"
        ).value;


    let selectedYear =
        document.getElementById(
            "historyYear"
        ).value;


    let historyBody =
        document.getElementById(
            "historyBody"
        );


    historyBody.innerHTML =
        "";


    let totalMonths =
        0;


    let totalStockCost =
        0;


    let totalDemandQty =
        0;


    let totalDemandCost =
        0;


    // =================================
    // SORT HISTORY
    // =================================

    let filteredHistory =
        [];


    for(
        let i = 0;
        i < costHistory.length;
        i++
    ){

        let record =
            costHistory[i];


        // =============================
        // MONTH FILTER
        // =============================

        if(

            selectedMonth

            &&

            record.month !=
            selectedMonth

        ){

            continue;

        }


        // =============================
        // YEAR FILTER
        // =============================

        if(

            selectedYear

            &&

            record.year !=
            selectedYear

        ){

            continue;

        }


        filteredHistory.push(
            record
        );

    }


    filteredHistory.sort(
        function(a,b){

            return a.month.localeCompare(
                b.month
            );

        }
    );


    // =================================
    // NO RECORD
    // =================================

    if(
        filteredHistory.length == 0
    ){

        let row =
            document.createElement("tr");


        let cell =
            document.createElement("td");


        cell.colSpan =
            7;


        cell.className =
            "empty-message";


        cell.textContent =
            "No Cost History Found";


        row.appendChild(cell);


        historyBody.appendChild(row);


    }


    // =================================
    // SHOW RECORDS
    // =================================

    for(
        let i = 0;
        i < filteredHistory.length;
        i++
    ){

        let record =
            filteredHistory[i];


        totalMonths++;


        totalStockCost =
            totalStockCost
            +
            Number(
                record.availableStockCost || 0
            );


        totalDemandQty =
            totalDemandQty
            +
            Number(
                record.approvedDemandQty || 0
            );


        totalDemandCost =
            totalDemandCost
            +
            Number(
                record.approvedDemandCost || 0
            );


        let row =
            document.createElement("tr");


        // YEAR

        let cell1 =
            document.createElement("td");

        cell1.textContent =
            record.year;

        row.appendChild(cell1);


        // MONTH

        let cell2 =
            document.createElement("td");

        cell2.textContent =
            record.monthName;

        row.appendChild(cell2);


        // TOTAL ITEMS

        let cell3 =
            document.createElement("td");

        cell3.textContent =
            record.totalItems;

        row.appendChild(cell3);


        // STOCK COST

        let cell4 =
            document.createElement("td");

        cell4.textContent =
            "Rs. "
            +
            Number(
                record.availableStockCost || 0
            ).toFixed(2);

        row.appendChild(cell4);


        // DEMAND QTY

        let cell5 =
            document.createElement("td");

        cell5.textContent =
            Number(
                record.approvedDemandQty || 0
            ).toFixed(2);

        row.appendChild(cell5);


        // DEMAND COST

        let cell6 =
            document.createElement("td");

        cell6.textContent =
            "Rs. "
            +
            Number(
                record.approvedDemandCost || 0
            ).toFixed(2);

        row.appendChild(cell6);


        // SAVED DATE

        let cell7 =
            document.createElement("td");

        cell7.textContent =
            record.savedDate || "-";

        row.appendChild(cell7);


        historyBody.appendChild(row);
        // =================================
// VIEW DETAILS BUTTON
// =================================

let cell8 =
    document.createElement("td");


let viewButton =
    document.createElement("button");


viewButton.type =
    "button";


viewButton.textContent =
    "View Details";


viewButton.onclick =
    function(){

        viewCostDetails(
            record.month
        );

    };


cell8.appendChild(
    viewButton
);


row.appendChild(cell8);

    }


    // =================================
    // SUMMARY
    // =================================

    document.getElementById(
        "totalMonths"
    ).textContent =
        totalMonths;


    document.getElementById(
        "totalStockCost"
    ).textContent =
        "Rs. "
        +
        totalStockCost.toFixed(2);


    document.getElementById(
        "totalDemandCost"
    ).textContent =
        "Rs. "
        +
        totalDemandCost.toFixed(2);


    // =================================
    // FOOTER
    // =================================

    document.getElementById(
        "footerStockCost"
    ).textContent =
        "Rs. "
        +
        totalStockCost.toFixed(2);


    document.getElementById(
        "footerDemandQty"
    ).textContent =
        totalDemandQty.toFixed(2);


    document.getElementById(
        "footerDemandCost"
    ).textContent =
        "Rs. "
        +
        totalDemandCost.toFixed(2);

}


// =====================================
// SHOW ALL HISTORY
// =====================================

function showAllHistory(){

    document.getElementById(
        "historyMonth"
    ).value =
        "";


    document.getElementById(
        "historyYear"
    ).value =
        "";


    showCostHistory();

}


// =====================================
// PRINT COST HISTORY
// =====================================

function printCostHistory(){

    let table =
        document.querySelector("table");


    if(!table){

        alert(
            "History table not found!"
        );

        return;

    }


    let month =
        document.getElementById(
            "historyMonth"
        ).value;


    let year =
        document.getElementById(
            "historyYear"
        ).value;


    let title =
        "COST HISTORY";


    if(month){

        title =
            "COST HISTORY - "
            +
            getMonthName(month);

    }


    if(year){

        title =
            "COST HISTORY - YEAR "
            +
            year;

    }


    let printWindow =
        window.open(
            "",
            "",
            "width=1400,height=900"
        );


    let printContent = `

<html>

<head>

<title>
${title}
</title>


<style>

body {

    font-family:
        Arial, sans-serif;

    padding:
        15px;

}

h2 {

    text-align:
        center;

    margin-bottom:
        5px;

}

h1 {

    text-align:
        center;

    margin-top:
        5px;

}

table {

    width:
        100%;

    border-collapse:
        collapse;

    margin-top:
        20px;

    font-size:
        10px;

}

th {

    background:
        #12355b;

    color:
        white;

    padding:
        7px;

    border:
        1px solid #777;

}

td {

    padding:
        7px;

    border:
        1px solid #777;

}

tfoot td {

    font-weight:
        bold;

    background:
        #e8eef5;

}

.approval {

    display:
        flex;

    justify-content:
        space-between;

    margin-top:
        45px;

    font-size:
        13px;

}

@media print {

    @page {

        size:
            A4 landscape;

        margin:
            8mm;

    }

}

</style>

</head>


<body>


<h2>
MECAS ENGINEERING PVT LIMITED SUNDAR
</h2>


<h1>
${title}
</h1>


<p>
Report Date:
${new Date().toLocaleDateString("en-GB")}
</p>


${table.outerHTML}


<div class="approval">

    <span>
        Prepared By: __________________
    </span>

    <span>
        Verified By: __________________
    </span>

    <span>
        Approved By: __________________
    </span>

</div>


</body>

</html>

`;


    printWindow.document.write(
        printContent
    );


    printWindow.document.close();


    printWindow.focus();


    printWindow.print();

}


// =====================================
// PAGE START
// =====================================

// پہلے موجودہ مہینے کا Cost
// خود بخود History میں save/update ہوگا

autoSaveCurrentMonth();


// پھر Year list load ہوگی

loadHistoryYears();


// پھر History show ہوگی

showCostHistory();
function backToCost(){

    window.location.href =
        "Cost .html.";

}
document
    .getElementById("backToCostButton")
    .addEventListener("click", function(){

        window.location.href = "Cost .html";

    });
   // =====================================
// VIEW COST DETAILS
// =====================================

function viewCostDetails(month){

    localStorage.setItem(
        "selectedCostHistoryMonth",
        month
    );


    window.location.href =
        "Cost History Details.html";

} 
// =====================================
// OPEN YEAR HISTORY
// =====================================

function openYearHistory(){

    window.location.href =
        "Cost Year History.html";

}
// =====================================
// FILTER COST HISTORY
// =====================================

function filterCostHistory(){

    let search =
        document.getElementById(
            "historySearch"
        ).value
        .trim()
        .toLowerCase();


    let selectedMonth =
        document.getElementById(
            "historyMonth"
        ).value;


    let rows =
        document.querySelectorAll(
            "#costHistoryBody tr"
        );


    for(
        let i = 0;
        i < rows.length;
        i++
    ){

        let row =
            rows[i];


        // =================================
        // GET ROW TEXT
        // =================================

        let rowText =
            row.textContent.toLowerCase();


        // =================================
        // MONTH CHECK
        // =================================

        let monthMatch =
            true;


        if(selectedMonth){

            monthMatch =
                rowText.includes(
                    getHistoryMonthText(
                        selectedMonth
                    ).toLowerCase()
                );

        }


        // =================================
        // SEARCH CHECK
        // =================================

        let searchMatch =
            true;


        if(search){

            searchMatch =
                rowText.includes(
                    search
                );

        }


        // =================================
        // SHOW / HIDE
        // =================================

        if(
            monthMatch &&
            searchMatch
        ){

            row.style.display =
                "";

        }else{

            row.style.display =
                "none";

        }

    }

}


// =====================================
// MONTH TEXT
// =====================================

function getHistoryMonthText(month){

    if(!month){

        return "";

    }


    let parts =
        month.split("-");


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


    let monthNumber =
        Number(parts[1]);


    return (

        monthNames[
            monthNumber - 1
        ]

        +

        " "

        +

        parts[0]

    );

}


// =====================================
// CLEAR FILTER
// =====================================

function clearCostHistoryFilter(){

    document.getElementById(
        "historySearch"
    ).value =
        "";


    document.getElementById(
        "historyMonth"
    ).value =
        "";


    let rows =
        document.querySelectorAll(
            "#costHistoryBody tr"
        );


    for(
        let i = 0;
        i < rows.length;
        i++
    ){

        rows[i].style.display =
            "";

    }

}