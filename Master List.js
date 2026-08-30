// =====================================
// MASTER LIST - SUPABASE VERSION
// MECAS ENGINEERING PVT LIMITED SUNDAR
// =====================================

let items = [];

let editItemId = null;


// =====================================
// LOAD ITEMS FROM SUPABASE
// =====================================

async function loadItems(){

    let result =
        await supabaseRequest(
            "items",
            "GET",
            null,
            "?select=*&order=id.asc"
        );


    if(!result.success){

        console.error(
            "Items Load Error:",
            result.error
        );

        alert(
            "Items load nahi ho sake!"
        );

        return;
    }


    items =
        result.data || [];


    renderItems();

}


// =====================================
// NUMBER FUNCTION
// =====================================

function toNumber(value){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return 0;

    }


    let number =
        Number(
            String(value)
                .replace(/,/g,"")
                .trim()
        );


    return isNaN(number)
        ? 0
        : number;

}


// =====================================
// SAVE ITEM
// =====================================

async function saveItem(){

    let code =
        document.getElementById(
            "code"
        ).value.trim();


    let itemName =
        document.getElementById(
            "itemName"
        ).value.trim();


    let specification =
        document.getElementById(
            "specification"
        ).value.trim();


    let category =
        document.getElementById(
            "category"
        ).value.trim();


    let unit =
        document.getElementById(
            "unit"
        ).value.trim();


    let packingQty =
        document.getElementById(
            "packingQty"
        ).value;


    let packedUnit =
        document.getElementById(
            "packedUnit"
        ).value.trim();


    let source =
        document.getElementById(
            "source"
        ).value.trim();


    let supplier =
        document.getElementById(
            "supplier"
        ).value.trim();


    let openingStock =
        document.getElementById(
            "openStock"
        ).value;


    let openingCost =
        document.getElementById(
            "openingCost"
        ).value;


    let storageLocation =
        document.getElementById(
            "location"
        ).value.trim();


    // =====================================
    // VALIDATION
    // =====================================

    if(code == ""){

        alert(
            "Please Enter ID Number!"
        );

        return;

    }


    if(itemName == ""){

        alert(
            "Please Enter Item Name!"
        );

        return;

    }


    if(specification == ""){

        alert(
            "Please Enter Specification!"
        );

        return;

    }


    if(category == ""){

        alert(
            "Please Enter Category!"
        );

        return;

    }


    if(unit == ""){

        alert(
            "Please Enter Unit!"
        );

        return;

    }


    if(openingStock == ""){

        alert(
            "Please Enter Opening Stock!"
        );

        return;

    }


    if(storageLocation == ""){

        alert(
            "Please Enter Storage Location!"
        );

        return;

    }


    // =====================================
    // DUPLICATE CODE CHECK
    // =====================================

    let duplicate =
        items.find(function(item){

            return String(
                item.code || ""
            ).trim().toLowerCase() ===
            code.toLowerCase()
            &&
            String(item.id) !==
            String(editItemId);

        });


    if(duplicate){

        alert(
            "This Item Code already exists!"
        );

        return;

    }


    // =====================================
    // SUPABASE DATA
    // =====================================

    let data = {

        code:
            code,

        item_name:
            itemName,

        specification:
            specification,

        category:
            category,

        unit:
            unit,

        packing_qty:
            packingQty === ""
            ? null
            : toNumber(packingQty),

        packed_unit:
            packedUnit,

        source:
            source,

        supplier:
            supplier,

        opening_stock:
            toNumber(openingStock),

        opening_cost:
            toNumber(openingCost),

        storage_location:
            storageLocation

    };


    // =====================================
    // NEW ITEM
    // =====================================

    if(editItemId === null){

        let result =
            await supabaseRequest(
                "items",
                "POST",
                data
            );


        if(!result.success){

            console.error(
                "Supabase Insert Error:",
                result.error
            );


            alert(
                "Item save nahi hua!\n\n" +
                JSON.stringify(
                    result.error
                )
            );

            return;

        }


        alert(
            "Item Saved Successfully!"
        );

    }


    // =====================================
    // EDIT ITEM
    // =====================================

    else{

        let result =
            await supabaseRequest(
                "items",
                "PATCH",
                data,
                "?id=eq." +
                encodeURIComponent(
                    editItemId
                )
            );


        if(!result.success){

            console.error(
                "Supabase Update Error:",
                result.error
            );


            alert(
                "Item update nahi hua!\n\n" +
                JSON.stringify(
                    result.error
                )
            );

            return;

        }


        alert(
            "Item Updated Successfully!"
        );

    }


    // =====================================
    // RESET
    // =====================================

    editItemId = null;


    await loadItems();


    clearForm();

}


// =====================================
// ADD ROW
// =====================================

function addRow(item){

    let row =
        document.createElement(
            "tr"
        );


    // =====================================
    // ID / CODE
    // =====================================

    let cell1 =
        document.createElement(
            "td"
        );

    cell1.textContent =
        item.code || "-";

    row.appendChild(cell1);


    // =====================================
    // ITEM NAME
    // =====================================

    let cell2 =
        document.createElement(
            "td"
        );

    cell2.textContent =
        item.item_name || "-";

    row.appendChild(cell2);


    // =====================================
    // SPECIFICATION
    // =====================================

    let cell3 =
        document.createElement(
            "td"
        );

    cell3.textContent =
        item.specification || "-";

    row.appendChild(cell3);


    // =====================================
    // CATEGORY
    // =====================================

    let cell4 =
        document.createElement(
            "td"
        );

    cell4.textContent =
        item.category || "-";

    row.appendChild(cell4);


    // =====================================
    // UNIT
    // =====================================

    let cell5 =
        document.createElement(
            "td"
        );

    cell5.textContent =
        item.unit || "-";

    row.appendChild(cell5);


    // =====================================
    // PACKING QTY
    // =====================================

    let cell6 =
        document.createElement(
            "td"
        );

    cell6.textContent =
        item.packing_qty ?? "-";

    row.appendChild(cell6);


    // =====================================
    // PACKED UNIT
    // =====================================

    let cell7 =
        document.createElement(
            "td"
        );

    cell7.textContent =
        item.packed_unit || "-";

    row.appendChild(cell7);


    // =====================================
    // SOURCE
    // =====================================

    let cell8 =
        document.createElement(
            "td"
        );

    cell8.textContent =
        item.source || "-";

    row.appendChild(cell8);


    // =====================================
    // SUPPLIER
    // =====================================

    let cell9 =
        document.createElement(
            "td"
        );

    cell9.textContent =
        item.supplier || "-";

    row.appendChild(cell9);


    // =====================================
    // OPENING STOCK
    // =====================================

    let cell10 =
        document.createElement(
            "td"
        );

    cell10.textContent =
        toNumber(
            item.opening_stock
        );

    row.appendChild(cell10);


    // =====================================
    // OPENING COST
    // =====================================

    let cell11 =
        document.createElement(
            "td"
        );

    cell11.textContent =
        "Rs. " +
        toNumber(
            item.opening_cost
        ).toFixed(2);

    row.appendChild(cell11);


    // =====================================
    // STOCK IN
    // =====================================

    let cell12 =
        document.createElement(
            "td"
        );

    cell12.textContent =
        "0";

    row.appendChild(cell12);


    // =====================================
    // STOCK OUT
    // =====================================

    let cell13 =
        document.createElement(
            "td"
        );

    cell13.textContent =
        "0";

    row.appendChild(cell13);


    // =====================================
    // CURRENT BALANCE
    // =====================================

    let cell14 =
        document.createElement(
            "td"
        );

    cell14.textContent =
        toNumber(
            item.opening_stock
        );

    row.appendChild(cell14);


    // =====================================
    // LOCATION
    // =====================================

    let cell15 =
        document.createElement(
            "td"
        );

    cell15.textContent =
        item.storage_location || "-";

    row.appendChild(cell15);


    // =====================================
    // STATUS
    // =====================================

    let cell16 =
        document.createElement(
            "td"
        );


    let balance =
        toNumber(
            item.opening_stock
        );


    if(balance <= 0){

        cell16.textContent =
            "Out of Stock ❌";

    }
    else{

        cell16.textContent =
            "Available ✅";

    }


    row.appendChild(cell16);


    // =====================================
    // ACTION
    // =====================================

    let cell17 =
        document.createElement(
            "td"
        );


    // =====================================
    // EDIT
    // =====================================

    let editButton =
        document.createElement(
            "button"
        );


    editButton.textContent =
        "Edit";


    editButton.onclick =
        function(){

            editItemId =
                item.id;


            document.getElementById(
                "code"
            ).value =
                item.code || "";


            document.getElementById(
                "itemName"
            ).value =
                item.item_name || "";


            document.getElementById(
                "specification"
            ).value =
                item.specification || "";


            document.getElementById(
                "category"
            ).value =
                item.category || "";


            document.getElementById(
                "unit"
            ).value =
                item.unit || "";


            document.getElementById(
                "packingQty"
            ).value =
                item.packing_qty ?? "";


            document.getElementById(
                "packedUnit"
            ).value =
                item.packed_unit || "";


            document.getElementById(
                "source"
            ).value =
                item.source || "";


            document.getElementById(
                "supplier"
            ).value =
                item.supplier || "";


            document.getElementById(
                "openStock"
            ).value =
                item.opening_stock ?? "";


            document.getElementById(
                "openingCost"
            ).value =
                item.opening_cost ?? "";


            document.getElementById(
                "location"
            ).value =
                item.storage_location || "";


            let saveButton =
                document.getElementById(
                    "saveButton"
                );


            if(saveButton){

                saveButton.textContent =
                    "Update Item";

            }

        };


    // =====================================
    // DELETE
    // =====================================

    let deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.textContent =
        "Delete";


    deleteButton.onclick =
        async function(){

            let confirmDelete =
                confirm(
                    "Are you sure you want to delete this item?"
                );


            if(!confirmDelete){

                return;

            }


            let result =
                await supabaseRequest(
                    "items",
                    "DELETE",
                    null,
                    "?id=eq." +
                    encodeURIComponent(
                        item.id
                    )
                );


            if(!result.success){

                console.error(
                    "Supabase Delete Error:",
                    result.error
                );


                alert(
                    "Item delete nahi hua!\n\n" +
                    JSON.stringify(
                        result.error
                    )
                );

                return;

            }


            alert(
                "Item Deleted Successfully!"
            );


            editItemId = null;


            await loadItems();

        };


    cell17.appendChild(
        editButton
    );


    cell17.appendChild(
        deleteButton
    );


    row.appendChild(
        cell17
    );


    document.getElementById(
        "tableBody"
    ).appendChild(row);

}


// =====================================
// RENDER ITEMS
// =====================================

function renderItems(){

    let tableBody =
        document.getElementById(
            "tableBody"
        );


    if(!tableBody){

        return;

    }


    tableBody.innerHTML =
        "";


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        addRow(
            items[i]
        );

    }

}


// =====================================
// CLEAR FORM
// =====================================

function clearForm(){

    let ids = [

        "code",
        "itemName",
        "specification",
        "category",
        "unit",
        "packingQty",
        "packedUnit",
        "source",
        "supplier",
        "openStock",
        "openingCost",
        "location"

    ];


    for(
        let i = 0;
        i < ids.length;
        i++
    ){

        let element =
            document.getElementById(
                ids[i]
            );


        if(element){

            element.value =
                "";

        }

    }


    editItemId = null;


    let saveButton =
        document.getElementById(
            "saveButton"
        );


    if(saveButton){

        saveButton.textContent =
            "Save Item";

    }

}


// =====================================
// SEARCH ITEM
// =====================================

function searchItem(){

    let searchInput =
        document.getElementById(
            "search"
        );


    if(!searchInput){

        return;

    }


    let searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    let tableBody =
        document.getElementById(
            "tableBody"
        );


    tableBody.innerHTML =
        "";


    for(
        let i = 0;
        i < items.length;
        i++
    ){

        let code =
            String(
                items[i].code || ""
            ).toLowerCase();


        let name =
            String(
                items[i].item_name || ""
            ).toLowerCase();


        if(
            code.includes(searchValue) ||
            name.includes(searchValue)
        ){

            addRow(
                items[i]
            );

        }

    }

}


// =====================================
// INITIAL LOAD
// =====================================

(async function(){

    await loadItems();

})();
