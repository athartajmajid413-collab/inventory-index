// =====================================
// MONTHLY DEMAND DATA
// =====================================

let items =
    JSON.parse(localStorage.getItem("items")) || [];

let history =
    JSON.parse(localStorage.getItem("history")) || [];

let demandEdits =
    JSON.parse(localStorage.getItem("demandEdits")) || {};


// =====================================
// STOCK MONTH DATA
// =====================================

let stockMonths =
    JSON.parse(localStorage.getItem("stockMonths")) || {};


// =====================================
// SHOW ALL ITEMS
// =====================================

function showAllItems(){

    let demandBody =
        document.getElementById("demandBody");

    if(!demandBody){

        return;

    }

    demandBody.innerHTML = "";


    for(let i = 0; i < items.length; i++){

        let item = items[i];

        let row =
            document.createElement("tr");


        // =================================
        // SELECT
        // =================================

        let cell0 =
            document.createElement("td");

        let checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.className =
            "demandCheck";

        checkbox.dataset.index =
            i;

        cell0.appendChild(
            checkbox
        );

        row.appendChild(
            cell0
        );


        // =================================
        // CATEGORY
        // =================================

        let cell1 =
            document.createElement("td");

        cell1.innerHTML =
            item.category || "-";

        row.appendChild(
            cell1
        );


        // =================================
        // ITEM CODE
        // =================================

        let cell2 =
            document.createElement("td");

        cell2.innerHTML =
            item.code || "-";

        row.appendChild(
            cell2
        );


        // =================================
        // ITEM NAME
        // =================================

        let cell3 =
            document.createElement("td");

        cell3.innerHTML =
            item.itemName || "-";

        row.appendChild(
            cell3
        );


        // =================================
        // SPECIFICATION
        // =================================

        let cell4 =
            document.createElement("td");

        cell4.innerHTML =
            item.specification || "-";

        row.appendChild(
            cell4
        );


        // =================================
        // SOURCE
        // =================================

        let cell5 =
            document.createElement("td");

        cell5.innerHTML =
            item.source || "-";

        row.appendChild(
            cell5
        );


        // =================================
        // SUPPLIER
        // =================================

        let cell6 =
            document.createElement("td");

        cell6.innerHTML =
            item.supplier || "-";

        row.appendChild(
            cell6
        );


        // =================================
        // PURCHASE INFORMATION
        // =================================

        let purchaseInfo =
            getPurchaseRates(
                item.code
            );


        // =================================
        // PURCHASE DATE
        // =================================

        let cell7 =
            document.createElement("td");

        cell7.innerHTML =
            purchaseInfo.latestDate;

        row.appendChild(
            cell7
        );


        // =================================
        // FIRST RATE
        // =================================

        let cell8 =
            document.createElement("td");

        cell8.innerHTML =
            purchaseInfo.firstRate;

        row.appendChild(
            cell8
        );


        // =================================
        // SECOND RATE
        // =================================

        let cell9 =
            document.createElement("td");

        cell9.innerHTML =
            purchaseInfo.secondRate;

        row.appendChild(
            cell9
        );


        // =================================
        // LATEST RATE
        // =================================

        let cell10 =
            document.createElement("td");

        cell10.innerHTML =
            purchaseInfo.latestRate;

        row.appendChild(
            cell10
        );


        // =================================
        // UNIT
        // =================================

        let cell11 =
            document.createElement("td");

        cell11.innerHTML =
            item.unit || "-";

        row.appendChild(
            cell11
        );


        // =================================
        // PACKING QTY
        // =================================

        let cell12 =
            document.createElement("td");

        cell12.innerHTML =
            item.packingQty || "-";

        row.appendChild(
            cell12
        );


        // =================================
        // PACKED UNIT
        // =================================

        let cell13 =
            document.createElement("td");

        cell13.innerHTML =
            item.packedUnit || "-";

        row.appendChild(
            cell13
        );


        // =================================
        // AVERAGE CONSUMPTION
        // =================================

        let averageConsumption =
            calculateAverageConsumption(
                item.code
            );


        let cell14 =
            document.createElement("td");

        cell14.innerHTML =
            averageConsumption.toFixed(2);

        row.appendChild(
            cell14
        );


        // =================================
        // STOCK MONTH
        // =================================

        let savedStockMonth =
            stockMonths[
                String(item.code)
            ];


        if(
            savedStockMonth === undefined ||
            savedStockMonth === null ||
            savedStockMonth === ""
        ){

            savedStockMonth = 3;

        }


        let cell15 =
            document.createElement("td");

        let stockMonthInput =
            document.createElement("input");

        stockMonthInput.type =
            "number";

        stockMonthInput.step =
            "0.5";

        stockMonthInput.min =
            "0";

        stockMonthInput.value =
            savedStockMonth;

        stockMonthInput.style.width =
            "80px";

        stockMonthInput.style.padding =
            "6px";

        stockMonthInput.title =
            "Enter required stock months";


        stockMonthInput.onchange =
            function(){

                let value =
                    Number(
                        this.value
                    );

                if(
                    isNaN(value) ||
                    value < 0
                ){

                    value = 0;

                    this.value = 0;

                }


                stockMonths[
                    String(item.code)
                ] = value;


                localStorage.setItem(
                    "stockMonths",
                    JSON.stringify(
                        stockMonths
                    )
                );


                showAllItems();

            };


        cell15.appendChild(
            stockMonthInput
        );

        row.appendChild(
            cell15
        );


        // =================================
        // CURRENT STOCK
        // =================================

        let cell16 =
            document.createElement("td");


        let currentStock =
            getCurrentStock(
                item
            );


        cell16.innerHTML =
            currentStock.toFixed(2);


        // =================================
        // MINIMUM STOCK
        // INTERNAL ONLY
        // LAST 3 MONTHS STOCK OUT
        // =================================

        let minimumStock =
            calculateMinimumStock(
                item.code
            );


        // =================================
        // REQUIRED STOCK
        // =================================

        let requiredStock =
            averageConsumption *
            Number(savedStockMonth);


        // =================================
        // DEMAND QUANTITY
        // =================================

        let demandQuantity =
            requiredStock -
            currentStock;


        if(
            demandQuantity < 0
        ){

            demandQuantity = 0;

        }


        // =================================
        // CURRENT STOCK COLOR
        // =================================

        let yellowLimit =
            requiredStock;


        let redLimit =
            minimumStock;


        if(
            currentStock <= redLimit
        ){

            cell16.style.backgroundColor =
                "#e74c3c";

            cell16.style.color =
                "white";

            cell16.style.fontWeight =
                "bold";

        }
        else if(
            currentStock <= yellowLimit
        ){

            cell16.style.backgroundColor =
                "#f1c40f";

            cell16.style.color =
                "#000";

            cell16.style.fontWeight =
                "bold";

        }
        else{

            cell16.style.backgroundColor =
                "#d5f5e3";

            cell16.style.color =
                "#1e8449";

            cell16.style.fontWeight =
                "bold";

        }


        row.appendChild(
            cell16
        );


        // =================================
        // DEMAND QUANTITY
        // =================================

        let cell17 =
            document.createElement("td");


        cell17.innerHTML =
            demandQuantity.toFixed(2);


        row.appendChild(
            cell17
        );


        // =================================
        // APPROVED QTY
        // =================================

        let packingQty =
            Number(
                item.packingQty || 0
            );


        let approvedQty =
            demandQuantity;


        if(
            packingQty > 0 &&
            demandQuantity > 0
        ){

            approvedQty =
                Math.ceil(
                    demandQuantity /
                    packingQty
                ) *
                packingQty;

        }


        let cell18 =
            document.createElement("td");


        cell18.innerHTML =
            approvedQty.toFixed(2);


        row.appendChild(
            cell18
        );


        // =================================
        // REMARKS
        // =================================

        let cell19 =
            document.createElement("td");


        cell19.innerHTML =
            "-";


        row.appendChild(
            cell19
        );


        // =================================
        // LOAD APPROVED EDIT
        // =================================

        let savedEdit =
            demandEdits[
                String(item.code)
            ];


        if(savedEdit){

            cell18.innerHTML =
                Number(
                    savedEdit.finalDemand ||
                    0
                ).toFixed(2);

            cell19.innerHTML =
                savedEdit.remarks ||
                "-";

        }


        // =================================
        // ACTION
        // =================================

        let cell20 =
            document.createElement("td");


        let editButton =
            document.createElement("button");


        editButton.innerHTML =
            "Edit Approved";


        editButton.type =
            "button";


        editButton.onclick =
            function(){

                let approved =
                    prompt(
                        "Enter Approved Qty:",
                        cell18.innerHTML
                    );


                if(
                    approved === null
                ){

                    return;

                }


                approved =
                    Number(
                        approved
                    );


                if(
                    isNaN(approved) ||
                    approved < 0
                ){

                    alert(
                        "Please enter a valid Approved Qty!"
                    );

                    return;

                }


                let remarks =
                    prompt(
                        "Enter Remarks:",
                        cell19.innerHTML == "-"
                        ? ""
                        : cell19.innerHTML
                    );


                if(
                    remarks === null
                ){

                    return;

                }


                cell18.innerHTML =
                    approved.toFixed(2);


                cell19.innerHTML =
                    remarks || "-";


                demandEdits[
                    String(item.code)
                ] = {

                    finalDemand:
                        approved,

                    remarks:
                        remarks

                };


                localStorage.setItem(
                    "demandEdits",
                    JSON.stringify(
                        demandEdits
                    )
                );


                alert(
                    "Approved Qty saved successfully!"
                );

            };


        cell20.appendChild(
            editButton
        );

        row.appendChild(
            cell20
        );


        demandBody.appendChild(
            row
        );

    }

}


// =====================================
// CURRENT STOCK
// =====================================

function getCurrentStock(item){

    let currentStock =
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

            record.type ==
            "Stock In"

            &&

            String(
                record.itemCode
            ).trim()
            ==
            String(
                item.code
            ).trim()

        ){

            currentStock +=
                Number(
                    record.quantity || 0
                );

        }


        if(

            record.type ==
            "Stock Issue"

            &&

            String(
                record.itemCode
            ).trim()
            ==
            String(
                item.code
            ).trim()

        ){

            currentStock -=
                Number(
                    record.quantity || 0
                );

        }

    }


    if(
        currentStock < 0
    ){

        currentStock = 0;

    }


    return currentStock;

}


// =====================================
// MINIMUM STOCK
// LAST 3 MONTHS STOCK OUT
// =====================================

function calculateMinimumStock(
    itemCode
){

    let monthData = {};


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            record.type ==
            "Stock Issue"

            &&

            String(
                record.itemCode
            ).trim()
            ==
            String(
                itemCode
            ).trim()

        ){

            let date =
                String(
                    record.date || ""
                );


            if(
                date.length < 7
            ){

                continue;

            }


            let month =
                date.substring(
                    0,
                    7
                );


            if(
                !monthData[month]
            ){

                monthData[month] = 0;

            }


            monthData[month] +=
                Number(
                    record.quantity || 0
                );

        }

    }


    let months =
        Object.keys(
            monthData
        );


    months.sort();


    // آخری 3 ماہ

    let lastThree =
        months.slice(-3);


    if(
        lastThree.length == 0
    ){

        return 0;

    }


    let total = 0;


    for(
        let i = 0;
        i < lastThree.length;
        i++
    ){

        total +=
            monthData[
                lastThree[i]
            ];

    }


    return total /
        lastThree.length;

}


// =====================================
// AVERAGE CONSUMPTION
// =====================================

function calculateAverageConsumption(
    itemCode
){

    let monthData = {};


    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        if(

            record.type ==
            "Stock Issue"

            &&

            String(
                record.itemCode
            ).trim()
            ==
            String(
                itemCode
            ).trim()

        ){

            let date =
                String(
                    record.date || ""
                );


            if(
                date.length < 7
            ){

                continue;

            }


            let month =
                date.substring(
                    0,
                    7
                );


            if(
                !monthData[month]
            ){

                monthData[month] = 0;

            }


            monthData[month] +=
                Number(
                    record.quantity || 0
                );

        }

    }


    let months =
        Object.keys(
            monthData
        );


    if(
        months.length == 0
    ){

        return 0;

    }


    let total = 0;


    for(
        let i = 0;
        i < months.length;
        i++
    ){

        total +=
            monthData[
                months[i]
            ];

    }


    return total /
        months.length;

}


// =====================================
// PURCHASE RATES
// =====================================

function getPurchaseRates(
    itemCode
){

    let purchases = [];


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

            String(
                record.itemCode
            ).trim()
            ==
            String(
                itemCode
            ).trim()

        ){

            purchases.push(
                record
            );

        }

    }


    purchases.sort(
        function(a,b){

            let dateA =
                String(
                    a.date || ""
                )
                +
                String(
                    a.time || ""
                );


            let dateB =
                String(
                    b.date || ""
                )
                +
                String(
                    b.time || ""
                );


            return dateA.localeCompare(
                dateB
            );

        }
    );


    if(
        purchases.length == 0
    ){

        return {

            firstRate: "-",

            secondRate: "-",

            latestRate: "-",

            latestDate: "-"

        };

    }


    let first =
        purchases[
            purchases.length - 3
        ];


    let second =
        purchases[
            purchases.length - 2
        ];


    let latest =
        purchases[
            purchases.length - 1
        ];


    return {

        firstRate:
            first
            ? first.unitCost
            : "-",

        secondRate:
            second
            ? second.unitCost
            : "-",

        latestRate:
            latest
            ? latest.unitCost
            : "-",

        latestDate:
            latest
            ? latest.date
            : "-"

    };

}


// =====================================
// SELECT ALL
// =====================================

function selectAllItems(){

    let checkboxes =
        document.querySelectorAll(
            ".demandCheck"
        );


    for(
        let i = 0;
        i < checkboxes.length;
        i++
    ){

        checkboxes[i].checked =
            true;

    }

}


// =====================================
// UNSELECT ALL
// =====================================

function unselectAllItems(){

    let checkboxes =
        document.querySelectorAll(
            ".demandCheck"
        );


    for(
        let i = 0;
        i < checkboxes.length;
        i++
    ){

        checkboxes[i].checked =
            false;

    }

}


// =====================================
// GENERATE DEMAND
// =====================================

function generateDemand(){

    let checkboxes =
        document.querySelectorAll(
            ".demandCheck"
        );


    let selectedCount = 0;


    for(
        let i = 0;
        i < checkboxes.length;
        i++
    ){

        if(
            checkboxes[i].checked
        ){

            selectedCount++;

        }

    }


    if(
        selectedCount == 0
    ){

        alert(
            "Please select at least one item!"
        );

        return;

    }


    let demandMonth =
        document.getElementById(
            "month"
        ).value;


    if(
        demandMonth == ""
    ){

        alert(
            "Please select Demand Month!"
        );

        return;

    }


    let confirmGenerate =
        confirm(
            "Generate Demand for " +
            selectedCount +
            " selected item(s)?"
        );


    if(
        !confirmGenerate
    ){

        return;

    }


    saveGeneratedDemand();

}


// =====================================
// SAVE GENERATED DEMAND
// =====================================

function saveGeneratedDemand(){

    let checkboxes =
        document.querySelectorAll(
            ".demandCheck"
        );


    let selectedItems = [];


    for(
        let i = 0;
        i < checkboxes.length;
        i++
    ){

        if(
            checkboxes[i].checked
        ){

            let row =
                checkboxes[i]
                .closest("tr");


            let cells =
                row.querySelectorAll(
                    "td"
                );


            let demandItem = {

                category:
                    cells[1].innerHTML,

                code:
                    cells[2].innerHTML,

                itemName:
                    cells[3].innerHTML,

                specification:
                    cells[4].innerHTML,

                source:
                    cells[5].innerHTML,

                supplier:
                    cells[6].innerHTML,

                purchaseDate:
                    cells[7].innerHTML,

                firstRate:
                    cells[8].innerHTML,

                secondRate:
                    cells[9].innerHTML,

                latestRate:
                    cells[10].innerHTML,

                unit:
                    cells[11].innerHTML,

                packingQty:
                    cells[12].innerHTML,

                packedUnit:
                    cells[13].innerHTML,

                average:
                    cells[14].innerHTML,

                stockMonth:
                    cells[15]
                    .querySelector("input")
                    .value,

                currentStock:
                    cells[16].innerHTML,

                demandQuantity:
                    cells[17].innerHTML,

                approvedQty:
                    cells[18].innerHTML,

                remarks:
                    cells[19].innerHTML

            };


            selectedItems.push(
                demandItem
            );

        }

    }


    if(
        selectedItems.length == 0
    ){

        alert(
            "Please select at least one item!"
        );

        return;

    }


    let demandMonth =
        document.getElementById(
            "month"
        ).value;


    if(
        demandMonth == ""
    ){

        alert(
            "Please select Demand Month!"
        );

        return;

    }


    let demandHistory =
        JSON.parse(
            localStorage.getItem(
                "demandHistory"
            )
        ) || [];


    let demandNumber =
        "DEM-" +
        String(
            demandHistory.length + 1
        ).padStart(
            3,
            "0"
        );


    let today =
        new Date();


    let generateDate =
        today.toLocaleDateString(
            "en-GB"
        );


    let demandRecord = {

        demandNo:
            demandNumber,

        demandMonth:
            demandMonth,

        generateDate:
            generateDate,

        date:
            generateDate,

        items:
            selectedItems,

        demandItems:
            selectedItems,

        status:
            "Generated"

    };


    demandHistory.push(
        demandRecord
    );


    localStorage.setItem(
        "demandHistory",
        JSON.stringify(
            demandHistory
        )
    );


    localStorage.setItem(
        "generatedDemandMonth",
        demandMonth
    );


    localStorage.setItem(
        "generatedDemandCount",
        String(
            selectedItems.length
        )
    );


    // =================================
    // IMPORTANT
    // APPROVED EDIT CLEAR
    // FORMULA ACTIVE AGAIN
    // =================================

    for(
        let i = 0;
        i < selectedItems.length;
        i++
    ){

        let code =
            String(
                selectedItems[i].code
            );


        delete demandEdits[
            code
        ];

    }


    localStorage.setItem(
        "demandEdits",
        JSON.stringify(
            demandEdits
        )
    );


    // =================================
    // REFRESH TABLE
    // =================================

    showAllItems();


    alert(
        "Demand Generated Successfully!\n\n" +
        "Demand No: " +
        demandNumber
    );

}


// =====================================
// ADD DEMAND
// =====================================

function addDemand(){

    let code =
        document.getElementById(
            "itemCode"
        ).value.trim();


    let month =
        document.getElementById(
            "month"
        ).value;


    if(
        code == ""
    ){

        alert(
            "Please enter Item Code!"
        );

        return;

    }


    if(
        month == ""
    ){

        alert(
            "Please select Demand Month!"
        );

        return;

    }


    let found =
        false;


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        if(
            String(
                items[i].code
            ).trim()
            ==
            code
        ){

            found = true;

            break;

        }

    }


    if(!found){

        alert(
            "Item Code not found!"
        );

        return;

    }


    alert(
        "Item already exists in the Monthly Demand list."
    );

}


// =====================================
// SHOW ITEM INFO
// =====================================

function showItemInfo(){

    let input =
        document.getElementById(
            "itemCode"
        );


    if(!input){

        return;

    }


    let code =
        input.value.trim();


    if(
        code == ""
    ){

        return;

    }


    let item = null;


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        if(
            String(
                items[i].code
            ).trim()
            ==
            code
        ){

            item =
                items[i];

            break;

        }

    }


    if(item){

        input.style.border =
            "2px solid #16a085";

    }
    else{

        input.style.border =
            "2px solid #e74c3c";

    }

}


// =====================================
// PRINT SELECTED DEMAND
// =====================================

function printSelectedDemand(){

    let checkboxes =
        document.querySelectorAll(
            ".demandCheck"
        );


    let selectedRows = [];


    for(
        let i = 0;
        i < checkboxes.length;
        i++
    ){

        if(
            checkboxes[i].checked
        ){

            selectedRows.push(
                checkboxes[i]
                .closest("tr")
            );

        }

    }


    if(
        selectedRows.length == 0
    ){

        alert(
            "Please select at least one item to print!"
        );

        return;

    }


    let today =
        new Date();


    let printDate =
        today.toLocaleDateString(
            "en-GB"
        );


    let demandMonth =
        document.getElementById(
            "month"
        ).value;


    let formattedDemandMonth =
        "-";


    if(
        demandMonth
    ){

        let parts =
            demandMonth.split("-");


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


        formattedDemandMonth =
            monthNames[
                Number(
                    parts[1]
                ) - 1
            ]
            +
            " "
            +
            parts[0];

    }


    let printWindow =
        window.open(
            "",
            "",
            "width=1400,height=800"
        );


    let printContent = `

<html>

<head>

<title>Monthly Demand</title>

<style>

body{
    font-family:Arial,sans-serif;
    padding:20px;
}

h2,
h1{
    text-align:center;
}

.info-section{
    display:flex;
    justify-content:space-between;
    margin-top:15px;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}

th{
    background:#12355b;
    color:white;
    padding:7px;
}

td{
    border:1px solid #999;
    padding:7px;
}

.current-stock-low{
    background-color:#e74c3c !important;
    color:white !important;
    font-weight:bold;
}

.current-stock-yellow{
    background-color:#f1c40f !important;
    color:#000 !important;
    font-weight:bold;
}

.current-stock-normal{
    background-color:#d5f5e3 !important;
    color:#1e8449 !important;
    font-weight:bold;
}

.approval-section{
    display:flex;
    justify-content:space-between;
    margin-top:40px;
}

@media print{

    @page{
        size:A4 landscape;
        margin:10mm;
    }

}

</style>

</head>

<body>

<h2>
MECAS ENGINEERING PVT LIMITED SUNDAR
</h2>

<h1>
MONTHLY DEMAND
</h1>

<div class="info-section">

<span>
<strong>Demand Month:</strong>
${formattedDemandMonth}
</span>

<span>
<strong>Print Date:</strong>
${printDate}
</span>

</div>

<table>

<thead>

<tr>

<th>Category</th>
<th>Item Code</th>
<th>Item Name</th>
<th>Specification</th>
<th>Source</th>
<th>Supplier</th>
<th>Latest Purchase Date</th>
<th>1st Rate</th>
<th>2nd Rate</th>
<th>Latest Rate</th>
<th>Unit</th>
<th>Packing Qty</th>
<th>Packed Unit</th>
<th>Consumption / Average</th>
<th>Stock Month</th>
<th>Current Stock</th>
<th>Demand Quantity</th>
<th>Approved Qty</th>
<th>Remarks</th>

</tr>

</thead>

<tbody>

`;


    for(
        let i = 0;
        i < selectedRows.length;
        i++
    ){

        let cells =
            selectedRows[i]
            .querySelectorAll("td");


        printContent += "<tr>";


        for(
            let j = 1;
            j <= 19;
            j++
        ){

            let className = "";


            // CURRENT STOCK COLUMN

            if(
                j == 16
            ){

                let currentStock =
                    Number(
                        cells[j]
                        .innerText
                    );


                let itemCode =
                    cells[2]
                    .innerText;


                let minimumStock =
                    calculateMinimumStock(
                        itemCode
                    );


                let average =
                    Number(
                        cells[14]
                        .innerText
                    );


                let stockMonth =
                    Number(
                        cells[15]
                        .querySelector("input")
                        .value
                    );


                let requiredStock =
                    average *
                    stockMonth;


                if(
                    currentStock <=
                    minimumStock
                ){

                    className =
                        "current-stock-low";

                }
                else if(
                    currentStock <=
                    requiredStock
                ){

                    className =
                        "current-stock-yellow";

                }
                else{

                    className =
                        "current-stock-normal";

                }

            }


            let value =
                cells[j].innerHTML;


            if(
                j == 15
            ){

                value =
                    cells[j]
                    .querySelector("input")
                    .value;

            }


            printContent +=

                "<td class='" +
                className +
                "'>" +
                value +
                "</td>";

        }


        printContent +=
            "</tr>";

    }


    printContent += `

</tbody>

</table>

<div class="approval-section">

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

showAllItems();