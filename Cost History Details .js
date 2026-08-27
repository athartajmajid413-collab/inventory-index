// =====================================
// LOAD COST HISTORY
// =====================================

let costHistory =
    JSON.parse(
        localStorage.getItem("costHistory")
    ) || [];


// =====================================
// SELECTED MONTH
// =====================================

let selectedMonth =
    localStorage.getItem(
        "selectedCostHistoryMonth"
    );


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


    return (

        monthNames[
            Number(parts[1]) - 1
        ]

        +

        " "

        +

        parts[0]

    );

}


// =====================================
// SHOW DETAILS
// =====================================

function showCostDetails(){

    let detailsBody =
        document.getElementById(
            "detailsBody"
        );


    detailsBody.innerHTML =
        "";


    // =================================
    // CHECK MONTH
    // =================================

    if(!selectedMonth){

        document.getElementById(
            "historyTitle"
        ).textContent =
            "No Month Selected";


        return;

    }


    // =================================
    // FIND MONTH RECORD
    // =================================

    let selectedRecord =
        null;


    for(
        let i = 0;
        i < costHistory.length;
        i++
    ){

        if(

            costHistory[i].month ==
            selectedMonth

        ){

            selectedRecord =
                costHistory[i];

            break;

        }

    }


    // =================================
    // RECORD NOT FOUND
    // =================================

    if(!selectedRecord){

        document.getElementById(
            "historyTitle"
        ).textContent =
            getMonthName(selectedMonth)
            +
            " - No Record Found";


        let row =
            document.createElement("tr");


        let cell =
            document.createElement("td");


        cell.colSpan =
            10;


        cell.className =
            "empty-message";


        cell.textContent =
            "No Cost Details Found";


        row.appendChild(cell);


        detailsBody.appendChild(row);


        return;

    }


    // =================================
    // SHOW TITLE
    // =================================

    document.getElementById(
        "historyTitle"
    ).textContent =

        "Cost Details - "
        +
        getMonthName(
            selectedRecord.month
        );


    // =================================
    // TOTALS
    // =================================

    let totalStockCost =
        0;


    let totalDemandQty =
        0;


    let totalDemandCost =
        0;


    // =================================
    // GET ITEM DETAILS
    // =================================

    let itemDetails =
        selectedRecord.items || [];


    // =================================
    // SHOW ITEMS
    // =================================

    for(
        let i = 0;
        i < itemDetails.length;
        i++
    ){

        let item =
            itemDetails[i];


        // =============================
        // TOTALS
        // =============================

        totalStockCost =
            totalStockCost
            +
            Number(
                item.availableStockCost || 0
            );


        totalDemandQty =
            totalDemandQty
            +
            Number(
                item.approvedDemandQty || 0
            );


        totalDemandCost =
            totalDemandCost
            +
            Number(
                item.approvedDemandCost || 0
            );


        // =============================
        // CREATE ROW
        // =============================

        let row =
            document.createElement("tr");


        // =============================
        // CATEGORY
        // =============================

        let cell1 =
            document.createElement("td");


        cell1.textContent =
            item.category || "-";


        row.appendChild(cell1);


        // =============================
        // ITEM CODE
        // =============================

        let cell2 =
            document.createElement("td");


        cell2.textContent =
            item.code || "-";


        row.appendChild(cell2);


        // =============================
        // ITEM NAME
        // =============================

        let cell3 =
            document.createElement("td");


        cell3.textContent =
            item.itemName || "-";


        row.appendChild(cell3);


        // =============================
        // SPECIFICATION
        // =============================

        let cell4 =
            document.createElement("td");


        cell4.textContent =
            item.specification || "-";


        row.appendChild(cell4);


        // =============================
        // SOURCE / COMPANY
        // =============================

        let cell5 =
            document.createElement("td");


        cell5.textContent =
            item.source || "-";


        row.appendChild(cell5);


        // =============================
        // RATE
        // =============================

        let cell6 =
            document.createElement("td");


        cell6.textContent =
            "Rs. "
            +
            Number(
                item.rate || 0
            ).toFixed(2);


        row.appendChild(cell6);


        // =============================
        // AVAILABLE QUANTITY
        // =============================

        let cell7 =
            document.createElement("td");


        cell7.textContent =

            Number(
                item.availableQuantity || 0
            ).toFixed(2)

            +

            " "

            +

            (
                item.unit || ""
            );


        row.appendChild(cell7);


        // =============================
        // AVAILABLE QTY × RATE
        // =============================

        let cell8 =
            document.createElement("td");


        cell8.textContent =

            "Rs. "

            +

            Number(
                item.availableStockCost || 0
            ).toFixed(2);


        row.appendChild(cell8);


        // =============================
        // APPROVED DEMAND QTY
        // =============================

        let cell9 =
            document.createElement("td");


        cell9.textContent =

            Number(
                item.approvedDemandQty || 0
            ).toFixed(2);


        row.appendChild(cell9);


        // =============================
        // APPROVED DEMAND COST
        // =============================

        let cell10 =
            document.createElement("td");


        cell10.textContent =

            "Rs. "

            +

            Number(
                item.approvedDemandCost || 0
            ).toFixed(2);


        row.appendChild(cell10);


        // =============================
        // ADD ROW
        // =============================

        detailsBody.appendChild(row);

    }


    // =================================
    // SHOW TOTALS
    // =================================

    document.getElementById(
        "totalStockCost"
    ).textContent =

        "Rs. "

        +

        totalStockCost.toFixed(2);


    document.getElementById(
        "totalDemandQty"
    ).textContent =

        totalDemandQty.toFixed(2);


    document.getElementById(
        "totalDemandCost"
    ).textContent =

        "Rs. "

        +

        totalDemandCost.toFixed(2);

}


// =====================================
// BACK TO COST HISTORY
// =====================================

function backToCostHistory(){

    window.location.href =
        "Cost History.html";

}


// =====================================
// PRINT DETAILS
// =====================================

function printCostDetails(){

    let table =
        document.querySelector("table");


    if(!table){

        alert(
            "Cost Details table not found!"
        );

        return;

    }


    let title =
        "COST HISTORY DETAILS";


    if(selectedMonth){

        title =

            "COST HISTORY DETAILS - "

            +

            getMonthName(
                selectedMonth
            );

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
        9px;

}

th {

    background:
        #12355b;

    color:
        white;

    padding:
        6px;

    border:
        1px solid #777;

}

td {

    padding:
        6px;

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
// PAGE LOAD
// =====================================

showCostDetails();