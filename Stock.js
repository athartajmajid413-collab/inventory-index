let items =JSON.parse(localStorage.getItem("items")) || [];
let history =JSON.parse(localStorage.getItem("history")) || [];
function stockIn(){

    let itemCode = document.getElementById("itemCode").value;
    let quantity = document.getElementById("quantity").value;
    let transactionDate =document.getElementById("transactionDate").value;
    let transactionTime =document.getElementById("transactionTime").value;
    if(itemCode == ""){
        alert("Please Enter Item Code!");
        return;
    }

    if(quantity == ""){
        alert("Please Enter Quantity!");
        return;
    }
     let item =items.find(function(item){
        return item.code ==itemCode;
    });
    if(!item){
        alert("Item Not Found !");
        return;
    }
    if(Number(quantity) <=0){
        alert("Quantity must be greater then 0!");
        return;
    }
    if(transactionDate ==""){
        alert("Please Select Date!");
        return;
    }
    if(transactionTime ==""){
        alert("Please Select Time!");
        return;
    }
    item.openingStock =Number(item.openingStock) + Number(quantity);
    document.getElementById("currentStock").value = item.openingStock;
    localStorage.setItem("items" ,JSON.stringify(items));
     alert("Stock In Sucessfully!");
     addHistory(itemCode, "Stock In", quantity);
     clearTransactionForm();

}
function stockIssue(){

    let itemCode = document.getElementById("itemCode").value;
    let quantity = document.getElementById("quantity").value;
    let transactionDate =document.getElementById("transactionDate").value;
    let transactionTime =document.getElementById("transactionTime").value;
    if(itemCode == ""){
        alert("Please Enter Item Code!");
        return;
    }

    if(quantity == ""){
        alert("Please Enter Quantity!");
        return;
    }
     if(transactionDate ==""){
        alert("Please Select Date!");
        return;
     }
    if(Number(quantity)<=0){
        alert("Quantity must be greater then 0!");
        return;
    }
    if(transactionTime ==""){
        alert("Please Select Time!");
        return;
    }
    let item =items.find(function(item){
        return item.code ==itemCode;
    });
    if(!item){
        alert("Item Not Found !");
        return;
    }
    if(Number(quantity) > Number(item.openingStock)){
    alert("Not Enough Stock! Current Stock is " + item.openingStock );
    return;
}


    item.openingStock = Number(item.openingStock) - Number(quantity);
    document.getElementById("currentStock").value = item.openingStock;

    localStorage.setItem("items", JSON.stringify(items));

    alert("Stock Issue Successfully!");
    addHistory(itemCode, "Stock Issue", quantity);
    clearTransactionForm();
}
function showCurrentStock(){

    let itemCode = document.getElementById("itemCode").value;

    let item = items.find(function(item){
        return item.code == itemCode;
    });

    if(item){
        document.getElementById("currentStock").value = item.openingStock;
        document.getElementById("itemName").value = item.itemName;
    }else{
        document.getElementById("currentStock").value = "";
        document.getElementById("itemName").value = "";
    }
}
function addHistory(itemCode, type, quantity){
    let transactionDate =document.getElementById("transactionDate").value;
    let transactionTime =document.getElementById("transactionTime").value;

    let record ={
        date: transactionDate,
        time :transactionTime,
        itemCode :itemCode,
        type :type,
        quantity:quantity
    };
    history.push(record);
    localStorage.setItem("history",JSON.stringify(history));
    let row = document.createElement("tr");

    let cell1 = document.createElement("td");
    cell1.innerHTML = transactionDate;
    row.appendChild(cell1);
     let cell2 = document.createElement("td");
    cell2.innerHTML = transactionTime;
    row.appendChild(cell2);
    let cell3 = document.createElement("td");
    cell3.innerHTML = itemCode;
    row.appendChild(cell3);

    let cell4 = document.createElement("td");
    cell4.innerHTML = type;
    row.appendChild(cell4);

    let cell5 = document.createElement("td");
    cell5.innerHTML = quantity;
    row.appendChild(cell5);

    let historyBody = document.getElementById("historyBody");
    historyBody.appendChild(row);
}
function addHistoryRow(record){
    let row =document.createElement("tr");

    let cell1 =document.createElement("td");
    cell1.innerHTML =record.date;
    row.appendChild(cell1);
    let cell2 = document.createElement("td");
    cell2.innerHTML = record.time;
    row.appendChild(cell2);

    let cell3 = document.createElement("td");
    cell3.innerHTML = record.itemCode;
    row.appendChild(cell3);

    let cell4 = document.createElement("td");
    cell4.innerHTML = record.type;
    row.appendChild(cell4);

    let cell5 = document.createElement("td");
    cell5.innerHTML = record.quantity;
    row.appendChild(cell5);

    let tableBody = document.getElementById("historyBody");
    tableBody.appendChild(row);
}
for(let i =0; i< history.length;i ++){
    addHistoryRow(history[i]);
}
function clearTransactionForm(){
    document.getElementById("itemCode").value ="";
    document.getElementById("quantity").value ="";
    document.getElementById("transactionDate").value ="";
    document.getElementById("transactionTime").value ="";
    document.getElementById("currentStock").value ="";
    document.getElementById("itemName").value ="";

}
let quantityInput = document.getElementById("quantity");
let unitCostInput = document.getElementById("unitCost");
let totalCostInput = document.getElementById("totalCost");

function calculateTotalCost(){

    let quantity = Number(quantityInput.value);
    let unitCost = Number(unitCostInput.value);

    let totalCost = quantity * unitCost;

    totalCostInput.value = totalCost;
}

quantityInput.addEventListener("input", calculateTotalCost);
unitCostInput.addEventListener("input", calculateTotalCost);