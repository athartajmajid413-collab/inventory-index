// =====================================
// DEMAND HISTORY
// SUPABASE VERSION
// TABLE: demand_history
// =====================================


// =====================================
// GLOBAL DATA
// =====================================

let demandHistory = [];

let editDemandIndex = -1;


// =====================================
// SAFE VALUE
// =====================================

function getValue(item, fields, defaultValue = "-"){

    if(!item){

        return defaultValue;

    }


    for(let i = 0; i < fields.length; i++){

        let value =
            item[fields[i]];


        if(
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ){

            return value;

        }

    }


    return defaultValue;

}


// =====================================
// LOAD DEMAND HISTORY FROM SUPABASE
// =====================================

async function loadDemandHistory(){

    console.log("=====================================");
    console.log("LOADING DEMAND HISTORY FROM SUPABASE");
    console.log("=====================================");


    let result =
        await supabaseRequest(
            "demand_history",
            "GET",
            null,
            "?select=*&order=id.desc"
        );


    if(!result.success){

        console.error(
            "❌ Demand History Load Error:",
            result.error
        );


        alert(
            "Demand History load نہیں ہو سکی۔\n\n" +
            JSON.stringify(result.error)
        );


        return;

    }


    demandHistory =
        result.data || [];


    console.log(
        "✅ Demand History Loaded:",
        demandHistory.length
    );


    console.log(
        "Demand History Data:",
        demandHistory
    );


    showDemandHistory();

}


// =====================================
// SHOW DEMAND HISTORY
// =====================================

function showDemandHistory(){

    let historyBody =
        document.getElementById(
            "demandHistoryBody"
        );


    if(!historyBody){

        return;

    }


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
            getValue(
                record,
                [
                    "demand_no",
                    "demandNo",
                    "demandNumber"
                ],
                "DEM-" +
                String(i + 1).padStart(3, "0")
            );


        row.appendChild(cell0);


        // =====================================
        // DEMAND MONTH
        // =====================================

        let cell1 =
            document.createElement("td");


        cell1.innerHTML =
            getValue(
                record,
                [
                    "demand_month",
                    "demandMonth",
                    "month"
                ],
                "-"
            );


        row.appendChild(cell1);


        // =====================================
        // ITEMS
        // =====================================

        let cell2 =
            document.createElement("td");


        let list =
            getDemandItems(record);


        if(Array.isArray(list)){

            cell2.innerHTML =
                list.length;

        }
        else{

            cell2.innerHTML =
                getValue(
                    record,
                    [
                        "items"
                    ],
                    "-"
                );

        }


        row.appendChild(cell2);


        // =====================================
        // GENERATE DATE
        // =====================================

        let cell3 =
            document.createElement("td");


        cell3.innerHTML =
            getValue(
                record,
                [
                    "generate_date",
                    "generateDate",
                    "generatedDate",
                    "date"
                ],
                "-"
            );


        row.appendChild(cell3);


        // =====================================
        // STATUS
        // =====================================

        let cell4 =
            document.createElement("td");


        cell4.innerHTML =
            getValue(
                record,
                [
                    "status"
                ],
                "Generated"
            );


        row.appendChild(cell4);


        // =====================================
        // ACTION
        // =====================================

        let cell5 =
            document.createElement("td");


        // PRINT
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


        // EDIT
        let editButton =
            document.createElement("button");


        editButton.innerHTML =
            "Edit";


        editButton.type =
            "button";


        editButton.onclick =
            function(){

                editDemand(i);

            };


        cell5.appendChild(
            editButton
        );


        // DELETE
        let deleteButton =
            document.createElement("button");


        deleteButton.innerHTML =
            "Delete";


        deleteButton.type =
            "button";


        deleteButton.onclick =
            function(){

                deleteDemand(i);

            };


        cell5.appendChild(
            deleteButton
        );


        row.appendChild(cell5);


        historyBody.appendChild(row);

    }

}


// =====================================
// GET DEMAND ITEMS
// =====================================

function getDemandItems(record){

    let list =
        record.demand_items ||
        record.demandItems ||
        record.items ||
        [];


    // اگر JSON string ہے
    if(typeof list === "string"){

        try{

            list =
                JSON.parse(list);

        }
        catch(error){

            console.warn(
                "Demand Items JSON Parse Error:",
                error
            );

            list = [];

        }

    }


    if(!Array.isArray(list)){

        return [];

    }


    return list;

}


// =====================================
// EDIT DEMAND
// =====================================

function editDemand(index){

    editDemandIndex =
        index;


    let record =
        demandHistory[index];


    if(!record){

        return;

    }


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


    if(!editArea || !editInfo || !editItems){

        alert(
            "Edit area HTML میں نہیں ملا۔"
        );

        return;

    }


    editArea.style.display =
        "block";


    editInfo.innerHTML = `

        <strong>Demand No:</strong>
        ${getValue(
            record,
            [
                "demand_no",
                "demandNo"
            ],
            "-"
        )}

        &nbsp;&nbsp;&nbsp;

        <strong>Demand Month:</strong>
        ${getValue(
            record,
            [
                "demand_month",
                "demandMonth"
            ],
            "-"
        )}

        &nbsp;&nbsp;&nbsp;

        <strong>Generate Date:</strong>
        ${getValue(
            record,
            [
                "generate_date",
                "generateDate",
                "date"
            ],
            "-"
        )}

    `;


    editItems.innerHTML = "";


    let list =
        getDemandItems(record);


    if(
        !Array.isArray(list) ||
        list.length === 0
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
        i < list.length;
        i++
    ){

        let item =
            list[i];


        let row =
            document.createElement("tr");


        // =====================================
        // ITEM CODE
        // =====================================

        let cell1 =
            document.createElement("td");


        cell1.innerHTML =
            getValue(
                item,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ],
                "-"
            );


        row.appendChild(cell1);


        // =====================================
        // ITEM NAME
        // =====================================

        let cell2 =
            document.createElement("td");


        cell2.innerHTML =
            getValue(
                item,
                [
                    "itemName",
                    "item_name",
                    "name"
                ],
                "-"
            );


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
            getValue(
                item,
                [
                    "stockLevel"
                ],
                ""
            );


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
            getValue(
                item,
                [
                    "demandQuantity",
                    "demandQty",
                    "quantity"
                ],
                ""
            );


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
            getValue(
                item,
                [
                    "finalDemand",
                    "final_demand",
                    "approvedQty",
                    "approvedQuantity"
                ],
                ""
            );


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


        let remarks =
            getValue(
                item,
                [
                    "remarks",
                    "remark"
                ],
                ""
            );


        remarksInput.value =
            remarks === "-" ?
            "" :
            remarks;


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
// SUPABASE
// =====================================

async function updateDemand(){

    if(editDemandIndex === -1){

        return;

    }


    let record =
        demandHistory[
            editDemandIndex
        ];


    if(!record){

        return;

    }


    if(!record.id){

        alert(
            "اس Demand record کی Supabase ID موجود نہیں ہے۔"
        );

        return;

    }


    let list =
        getDemandItems(record);


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


        if(list[index]){

            if(field === "stockLevel"){

                list[index][field] =
                    Number(input.value || 0);

            }
            else if(field === "demandQuantity"){

                list[index][field] =
                    Number(input.value || 0);

            }
            else if(field === "finalDemand"){

                list[index][field] =
                    Number(input.value || 0);

            }
            else{

                list[index][field] =
                    input.value;

            }

        }

    }


    // =====================================
    // SUPABASE UPDATE DATA
    // =====================================

    let updateData = {

        demand_items:
            list,

        items:
            list,

        status:
            "Updated"

    };


    console.log(
        "Updating Demand:",
        record.id,
        updateData
    );


    let result =
        await supabaseRequest(
            "demand_history/" +
            record.id,
            "PATCH",
            updateData
        );


    if(!result.success){

        console.error(
            "❌ Demand Update Error:",
            result.error
        );


        alert(
            "Demand update نہیں ہوئی۔\n\n" +
            JSON.stringify(result.error)
        );


        return;

    }


    // =====================================
    // UPDATE LOCAL ARRAY
    // =====================================

    record.demand_items =
        list;


    record.items =
        list;


    record.status =
        "Updated";


    demandHistory[
        editDemandIndex
    ] =
        record;


    alert(
        "Demand Updated Successfully!"
    );


    editDemandIndex =
        -1;


    if(
        document.getElementById(
            "editArea"
        )
    ){

        document.getElementById(
            "editArea"
        ).style.display =
            "none";

    }


    showDemandHistory();

}


// =====================================
// CANCEL EDIT
// =====================================

function cancelEdit(){

    editDemandIndex =
        -1;


    let editArea =
        document.getElementById(
            "editArea"
        );


    if(editArea){

        editArea.style.display =
            "none";

    }

}


// =====================================
// DELETE DEMAND
// SUPABASE
// =====================================

async function deleteDemand(index){

    let record =
        demandHistory[index];


    if(!record){

        return;

    }


    let confirmDelete =
        confirm(
            "Are you sure you want to delete this Demand?"
        );


    if(!confirmDelete){

        return;

    }


    if(!record.id){

        alert(
            "اس Demand record کی Supabase ID موجود نہیں ہے۔"
        );

        return;

    }


    console.log(
        "Deleting Demand:",
        record.id
    );


    let result =
        await supabaseRequest(
            "demand_history/" +
            record.id,
            "DELETE",
            null
        );


    if(!result.success){

        console.error(
            "❌ Demand Delete Error:",
            result.error
        );


        alert(
            "Demand delete نہیں ہوئی۔\n\n" +
            JSON.stringify(result.error)
        );


        return;

    }


    // =====================================
    // REMOVE FROM LOCAL ARRAY
    // =====================================

    demandHistory.splice(
        index,
        1
    );


    if(editDemandIndex === index){

        cancelEdit();

    }


    showDemandHistory();


    alert(
        "Demand deleted successfully!"
    );

}


// =====================================
// PRINT DEMAND PREVIEW
// =====================================

function printDemandPreview(record){

    let list =
        getDemandItems(record);


    if(
        !Array.isArray(list) ||
        list.length === 0
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
            "width=1400,height=900"
        );


    if(!printWindow){

        alert(
            "Please allow pop-ups for this website."
        );

        return;

    }


    let today =
        new Date();


    let printDate =
        today.toLocaleDateString(
            "en-GB"
        );


    let demandNo =
        getValue(
            record,
            [
                "demand_no",
                "demandNo",
                "demandNumber"
            ],
            "-"
        );


    let demandMonth =
        getValue(
            record,
            [
                "demand_month",
                "demandMonth",
                "month"
            ],
            "-"
        );


    // =====================================
    // BUILD PRINT HTML
    // =====================================

    let printContent = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
${demandNo} - Monthly Demand
</title>

<style>

*{
    box-sizing:border-box;
}

body{

    font-family:
        Arial,
        sans-serif;

    padding:
        15px;

    margin:
        0;

}

h2{

    text-align:
        center;

    margin:
        5px 0;

    color:
        #12355b;

}

h1{

    text-align:
        center;

    margin:
        5px 0 15px;

}

.info-section{

    display:
        flex;

    justify-content:
        space-between;

    gap:
        15px;

    margin-top:
        15px;

    font-size:
        13px;

    border:
        1px solid #999;

    padding:
        10px;

}

table{

    width:
        100%;

    border-collapse:
        collapse;

    margin-top:
        15px;

    font-size:
        10px;

}

th{

    background:
        #12355b;

    color:
        white;

    border:
        1px solid #555;

    padding:
        6px;

    text-align:
        center;

}

td{

    border:
        1px solid #999;

    padding:
        5px;

    text-align:
        center;

}

.approval-section{

    display:
        flex;

    justify-content:
        space-between;

    margin-top:
        45px;

    font-size:
        13px;

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
            8mm;

    }

    body{

        padding:
            0;

    }

    table{

        font-size:
            9px;

    }

    th,
    td{

        padding:
            4px;

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

        ${demandMonth}

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

<th>Demand Qty</th>

<th>Final Demand</th>

<th>Remarks</th>

</tr>

</thead>

<tbody>

`;


    // =====================================
    // PRINT ITEMS
    // =====================================

    for(
        let i = 0;
        i < list.length;
        i++
    ){

        let item =
            list[i];


        let category =
            getValue(
                item,
                ["category"],
                "-"
            );


        let itemCode =
            getValue(
                item,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ],
                "-"
            );


        let itemName =
            getValue(
                item,
                [
                    "itemName",
                    "item_name",
                    "name"
                ],
                "-"
            );


        let specification =
            getValue(
                item,
                [
                    "specification",
                    "spec"
                ],
                "-"
            );


        let source =
            getValue(
                item,
                [
                    "source",
                    "supplier",
                    "sourceSupplier"
                ],
                "-"
            );


        let latestPurchaseDate =
            getValue(
                item,
                [
                    "latestPurchaseDate",
                    "latestDate",
                    "purchaseDate"
                ],
                "-"
            );


        let latestRate =
            getValue(
                item,
                [
                    "latestRate",
                    "latestPurchaseRate",
                    "unitCost",
                    "purchaseRate",
                    "rate",
                    "cost"
                ],
                "-"
            );


        let unit =
            getValue(
                item,
                [
                    "unit",
                    "uom"
                ],
                "-"
            );


        let packingQty =
            getValue(
                item,
                [
                    "packingQty",
                    "packQty",
                    "packingQuantity"
                ],
                "-"
            );


        let packedUnit =
            getValue(
                item,
                [
                    "packedUnit",
                    "packingUnit"
                ],
                "-"
            );


        let average =
            getValue(
                item,
                [
                    "average",
                    "avgConsumption",
                    "averageConsumption",
                    "consumption"
                ],
                "-"
            );


        let stockLevel =
            getValue(
                item,
                [
                    "stockLevel",
                    "stock"
                ],
                "-"
            );


        let requiredStock =
            getValue(
                item,
                [
                    "requiredStock",
                    "requiredQty"
                ],
                "-"
            );


        let currentStock =
            getValue(
                item,
                [
                    "currentStock",
                    "currentQty",
                    "balanceStock"
                ],
                "-"
            );


        let demandQuantity =
            getValue(
                item,
                [
                    "demandQuantity",
                    "demandQty",
                    "demand",
                    "quantity"
                ],
                "-"
            );


        let finalDemand =
            getValue(
                item,
                [
                    "finalDemand",
                    "final_demand",
                    "approvedQty",
                    "approvedQuantity",
                    "finalQty"
                ],
                "-"
            );


        let remarks =
            getValue(
                item,
                [
                    "remarks",
                    "remark"
                ],
                "-"
            );


        printContent += `

<tr>

<td>${category}</td>

<td>${itemCode}</td>

<td>${itemName}</td>

<td>${specification}</td>

<td>${source}</td>

<td>${latestPurchaseDate}</td>

<td>${latestRate}</td>

<td>${unit}</td>

<td>${packingQty}</td>

<td>${packedUnit}</td>

<td>${average}</td>

<td>${stockLevel}</td>

<td>${requiredStock}</td>

<td>${currentStock}</td>

<td>${demandQuantity}</td>

<td>${finalDemand}</td>

<td>${remarks}</td>

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


    printWindow.document.open();

    printWindow.document.write(
        printContent
    );

    printWindow.document.close();


    setTimeout(
        function(){

            printWindow.focus();

            printWindow.print();

        },
        500
    );

}


// =====================================
// PAGE START
// =====================================

window.addEventListener(
    "load",
    function(){

        loadDemandHistory();

    }
);
