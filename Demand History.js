// =====================================
// LOAD DEMAND HISTORY
// =====================================

let demandHistory =
    JSON.parse(
        localStorage.getItem("demandHistory")
    ) || [];


// =====================================
// EDIT INDEX
// =====================================

let editDemandIndex = -1;


// =====================================
// SHOW DEMAND HISTORY
// =====================================

function showDemandHistory(){

    let historyBody =
        document.getElementById(
            "demandHistoryBody"
        );

    historyBody.innerHTML = "";


    for(
        let i = 0;
        i < demandHistory.length;
        i++
    ){

        let record =
            demandHistory[i];


        let row =
            document.createElement("tr");


        // =====================================
        // DEMAND NO
        // =====================================

        let cell0 =
            document.createElement("td");

        cell0.innerHTML =
            record.demandNo || ("DEM-" + String(i + 1).padStart(3, "0"));

        row.appendChild(cell0);


        // =====================================
        // DEMAND MONTH
        // =====================================

        let cell1 =
            document.createElement("td");

        cell1.innerHTML =
            record.demandMonth || "-";

        row.appendChild(cell1);


        // =====================================
        // ITEMS
        // =====================================

        let cell2 =
            document.createElement("td");

        if(
            Array.isArray(record.demandItems)
        ){

            cell2.innerHTML =
                record.demandItems.length;

        }else if(
            Array.isArray(record.items)
        ){

            cell2.innerHTML =
                record.items.length;

        }else{

            cell2.innerHTML =
                record.items || "-";

        }

        row.appendChild(cell2);


        // =====================================
        // GENERATE DATE
        // =====================================

        let cell3 =
            document.createElement("td");

        cell3.innerHTML =
            record.generateDate || "-";

        row.appendChild(cell3);


        // =====================================
        // STATUS
        // =====================================

        let cell4 =
            document.createElement("td");

        cell4.innerHTML =
            record.status || "Generated";

        row.appendChild(cell4);


        // =====================================
        // ACTION
        // =====================================

        let cell5 =
            document.createElement("td");


        // =====================================
        // PRINT PREVIEW
        // =====================================

        let previewButton =
            document.createElement("button");

        previewButton.innerHTML =
            "Print Preview";


        previewButton.type =
            "button";


        previewButton.onclick =
            function(){

                printDemandPreview(
                    record
                );

            };


        cell5.appendChild(
            previewButton
        );


        // =====================================
        // EDIT BUTTON
        // =====================================

        let editButton =
            document.createElement("button");

        editButton.innerHTML =
            "Edit";


        editButton.type =
            "button";


        editButton.onclick =
            function(){

                editDemand(
                    i
                );

            };


        cell5.appendChild(
            editButton
        );


        // =====================================
        // DELETE BUTTON
        // =====================================

        let deleteButton =
            document.createElement("button");

        deleteButton.innerHTML =
            "Delete";


        deleteButton.type =
            "button";


        deleteButton.onclick =
            function(){

                deleteDemand(
                    i
                );

            };


        cell5.appendChild(
            deleteButton
        );


        row.appendChild(cell5);


        historyBody.appendChild(row);

    }

}


// =====================================
// EDIT DEMAND
// =====================================

function editDemand(index){

    editDemandIndex =
        index;


    let record =
        demandHistory[index];


    let editArea =
        document.getElementById(
            "editArea"
        );


    let editInfo =
        document.getElementById(
            "editInfo"
        );


    let editItems =
        document.getElementById(
            "editItems"
        );


    editArea.style.display =
        "block";


    editInfo.innerHTML = `

        <strong>
            Demand No:
        </strong>

        ${record.demandNo || "-"}

        &nbsp;&nbsp;&nbsp;

        <strong>
            Demand Month:
        </strong>

        ${record.demandMonth || "-"}

        &nbsp;&nbsp;&nbsp;

        <strong>
            Generate Date:
        </strong>

        ${record.generateDate || "-"}

    `;


    editItems.innerHTML = "";


    if(
        !record.demandItems ||
        record.demandItems.length == 0
    ){

        editItems.innerHTML =

            "<p>No detailed items available for editing.</p>";

        return;

    }


    let table =
        document.createElement("table");

    table.className =
        "edit-table";


    table.innerHTML = `

        <tr>

            <th>Item Code</th>

            <th>Item Name</th>

            <th>Stock Level</th>

            <th>Demand Quantity</th>

            <th>Final Demand</th>

            <th>Remarks</th>

        </tr>

    `;


    for(
        let i = 0;
        i < record.demandItems.length;
        i++
    ){

        let item =
            record.demandItems[i];


        let row =
            document.createElement("tr");


        // =====================================
        // ITEM CODE
        // =====================================

        let cell1 =
            document.createElement("td");

        cell1.innerHTML =
            item.itemCode || "-";

        row.appendChild(cell1);


        // =====================================
        // ITEM NAME
        // =====================================

        let cell2 =
            document.createElement("td");

        cell2.innerHTML =
            item.itemName || "-";

        row.appendChild(cell2);


        // =====================================
        // STOCK LEVEL
        // =====================================

        let cell3 =
            document.createElement("td");

        let stockInput =
            document.createElement("input");

        stockInput.type =
            "number";

        stockInput.value =
            item.stockLevel || "";

        stockInput.dataset.field =
            "stockLevel";

        stockInput.dataset.index =
            i;

        cell3.appendChild(
            stockInput
        );

        row.appendChild(cell3);


        // =====================================
        // DEMAND QUANTITY
        // =====================================

        let cell4 =
            document.createElement("td");

        let demandInput =
            document.createElement("input");

        demandInput.type =
            "number";

        demandInput.value =
            item.demandQuantity || "";

        demandInput.dataset.field =
            "demandQuantity";

        demandInput.dataset.index =
            i;

        cell4.appendChild(
            demandInput
        );

        row.appendChild(cell4);


        // =====================================
        // FINAL DEMAND
        // =====================================

        let cell5 =
            document.createElement("td");

        let finalInput =
            document.createElement("input");

        finalInput.type =
            "number";

        finalInput.value =
            item.finalDemand || "";

        finalInput.dataset.field =
            "finalDemand";

        finalInput.dataset.index =
            i;

        cell5.appendChild(
            finalInput
        );

        row.appendChild(cell5);


        // =====================================
        // REMARKS
        // =====================================

        let cell6 =
            document.createElement("td");

        let remarksInput =
            document.createElement("input");

        remarksInput.type =
            "text";

        remarksInput.value =
            item.remarks == "-" ?
            "" :
            item.remarks || "";

        remarksInput.dataset.field =
            "remarks";

        remarksInput.dataset.index =
            i;

        cell6.appendChild(
            remarksInput
        );

        row.appendChild(cell6);


        table.appendChild(row);

    }


    editItems.appendChild(
        table
    );


    editArea.scrollIntoView({
        behavior: "smooth"
    });

}


// =====================================
// UPDATE DEMAND
// =====================================

function updateDemand(){

    if(
        editDemandIndex == -1
    ){

        return;

    }


    let record =
        demandHistory[
            editDemandIndex
        ];


    let inputs =
        document.querySelectorAll(
            "#editItems input"
        );


    for(
        let i = 0;
        i < inputs.length;
        i++
    ){

        let input =
            inputs[i];


        let index =
            Number(
                input.dataset.index
            );


        let field =
            input.dataset.field;


        if(
            record.demandItems[index]
        ){

            record.demandItems[index][field] =
                input.value;

        }

    }


    record.status =
        "Updated";


    demandHistory[
        editDemandIndex
    ] =
        record;


    localStorage.setItem(
        "demandHistory",
        JSON.stringify(
            demandHistory
        )
    );


    alert(
        "Demand Updated Successfully!"
    );


    editDemandIndex =
        -1;


    document.getElementById(
        "editArea"
    ).style.display =
        "none";


    showDemandHistory();

}


// =====================================
// CANCEL EDIT
// =====================================

function cancelEdit(){

    editDemandIndex =
        -1;


    document.getElementById(
        "editArea"
    ).style.display =
        "none";

}


// =====================================
// DELETE DEMAND
// =====================================

function deleteDemand(index){

    let confirmDelete =
        confirm(
            "Are you sure you want to delete this Demand?"
        );


    if(
        confirmDelete == false
    ){

        return;

    }


    demandHistory.splice(
        index,
        1
    );


    localStorage.setItem(
        "demandHistory",
        JSON.stringify(
            demandHistory
        )
    );


    if(
        editDemandIndex == index
    ){

        cancelEdit();

    }


    showDemandHistory();


    alert(
        "Demand deleted successfully!"
    );

}


// =====================================
// PRINT PREVIEW
// =====================================

function printDemandPreview(record){

    if(
        !record.demandItems ||
        record.demandItems.length == 0
    ){

        alert(
            "Complete Demand data is not available for this record."
        );

        return;

    }


    let printWindow =
        window.open(
            "",
            "",
            "width=1200,height=800"
        );


    let today =
        new Date();


    let printDate =
        today.toLocaleDateString(
            "en-GB"
        );


    let demandNo =
        record.demandNo || "-";


    let printContent = `

<html>

<head>

<title>
${demandNo} - Monthly Demand
</title>


<style>

body{

    font-family:
        Arial, sans-serif;

    padding:
        20px;

}


h2{

    text-align:
        center;

    margin-bottom:
        5px;

}


h1{

    text-align:
        center;

    margin-top:
        5px;

}


.info-section{

    display:
        flex;

    justify-content:
        space-between;

    margin-top:
        15px;

    font-size:
        14px;

}


table{

    width:
        100%;

    border-collapse:
        collapse;

    margin-top:
        20px;

}


th{

    background:
        #12355b;

    color:
        white;

    padding:
        8px;

}


td{

    border:
        1px solid #999;

    padding:
        7px;

}


.approval-section{

    display:
        flex;

    justify-content:
        space-between;

    margin-top:
        40px;

    font-size:
        14px;

}


.approval-section span{

    white-space:
        nowrap;

}


@media print{

    @page{

        size:
            A4 landscape;

        margin:
            10mm;

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

<strong>
Demand No:
</strong>

${demandNo}

</span>


<span>

<strong>
Demand Month:
</strong>

${record.demandMonth || "-"}

</span>


<span>

<strong>
Print Date:
</strong>

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

<th>Source / Supplier</th>

<th>Latest Purchase Date</th>

<th>Latest Rate</th>

<th>Unit</th>

<th>Packing Qty</th>

<th>Packed Unit</th>

<th>Consumption / Average</th>

<th>Stock Level</th>

<th>Required Stock</th>

<th>Current Stock</th>

<th>Demand Quantity</th>

<th>Final Demand</th>

<th>Remarks</th>

</tr>

</thead>


<tbody>

`;


    for(
        let i = 0;
        i < record.demandItems.length;
        i++
    ){

        let item =
            record.demandItems[i];


        printContent += `

<tr>

<td>${item.category || "-"}</td>

<td>${item.itemCode || "-"}</td>

<td>${item.itemName || "-"}</td>

<td>${item.specification || "-"}</td>

<td>${item.source || "-"}</td>

<td>${item.latestPurchaseDate || "-"}</td>

<td>${item.latestRate || "-"}</td>

<td>${item.unit || "-"}</td>

<td>${item.packingQty || "-"}</td>

<td>${item.packedUnit || "-"}</td>

<td>${item.average || "-"}</td>

<td>${item.stockLevel || "-"}</td>

<td>${item.requiredStock || "-"}</td>

<td>${item.currentStock || "-"}</td>

<td>${item.demandQuantity || "-"}</td>

<td>${item.finalDemand || "-"}</td>

<td>${item.remarks || "-"}</td>

</tr>

`;

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
// LOAD HISTORY
// =====================================

showDemandHistory();