let history =JSON.parse(localStorage.getItem("history")) || [];
function calculateTotalStockIn(data){
    let total = 0;
    for(let i =0; i<data.length; i++){
        if(data[i].type =="Stock In"){
            total =total + Number(data[i].quantity);
        }
    }
    document.getElementById("totalStockIn").innerHTML =total;
}
for(let i =0; i <history.length; i++){
    if(history[i].type =="Stock In"){
        addStockInRow(history[i]);
    }
}
calculateTotalStockIn(history);
function addStockInRow(record){
    let row =document.createElement("tr");
    let cell1 =document.createElement("td");
    cell1.innerHTML=record.date;
    row.appendChild(cell1);
     let cell2 = document.createElement("td");
    cell2.innerHTML = record.time;
    row.appendChild(cell2);

    let cell3 = document.createElement("td");
    cell3.innerHTML = record.itemCode;
    row.appendChild(cell3);

    let cell4 = document.createElement("td");
    cell4.innerHTML = record.quantity;
    row.appendChild(cell4);

    let stockInBody = document.getElementById("stockInBody");
    stockInBody.appendChild(row);
}
function searchStockIn(){

    let searchCode = document.getElementById("searchItemCode").value;

    let stockInBody = document.getElementById("stockInBody");
    stockInBody.innerHTML = "";
    let total =0;

    for(let i = 0; i < history.length; i++){

        if(history[i].type == "Stock In" &&
           history[i].itemCode == searchCode){

            addStockInRow(history[i]);
            total =total +Number(history[i].quantity);
        }
    }
    document.getElementById("totalStockIn").innerHTML =total;
}


function showAllStockIn(){

    let stockInBody = document.getElementById("stockInBody");
    stockInBody.innerHTML = "";

    for(let i = 0; i < history.length; i++){

        if(history[i].type == "Stock In"){

            addStockInRow(history[i]);
        }
    }
    calculateTotalStockIn(history);
}
function searchStockInByDate(){

    let fromDate = document.getElementById("fromDate").value;
    let toDate = document.getElementById("toDate").value;

    let stockInBody = document.getElementById("stockInBody");
    stockInBody.innerHTML = "";

    let total = 0;

    for(let i = 0; i < history.length; i++){

        if(history[i].type == "Stock In"){

            if(history[i].date >= fromDate &&
               history[i].date <= toDate){

                addStockInRow(history[i]);

                total = total + Number(history[i].quantity);
            }
        }
    }

    document.getElementById("totalStockIn").innerHTML = total;
}