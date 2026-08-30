// =====================================
// IMPORT OLD MASTER LIST DATA
// LOCAL STORAGE → SUPABASE
// =====================================

async function importMasterData() {

    console.log("=====================================");
    console.log("MASTER DATA IMPORT STARTED");
    console.log("=====================================");


    // =====================================
    // GET OLD MASTER DATA
    // =====================================

    let oldItems =
        JSON.parse(
            localStorage.getItem("items")
        ) || [];


    console.log(
        "LocalStorage Items:",
        oldItems
    );


    if(oldItems.length === 0){

        alert(
            "LocalStorage میں Master List کا کوئی data نہیں ملا۔"
        );

        return;

    }


    let inserted = 0;

    let updated = 0;

    let skipped = 0;

    let errors = 0;


    // =====================================
    // LOOP ALL ITEMS
    // =====================================

    for(
        let i = 0;
        i < oldItems.length;
        i++
    ){

        let item =
            oldItems[i];


        let code =
            String(
                item.code || ""
            ).trim();


        // =================================
        // CODE REQUIRED
        // =================================

        if(!code){

            console.warn(
                "Item skipped - Code missing:",
                item
            );

            skipped++;

            continue;

        }


        // =================================
        // CHECK ITEM IN SUPABASE
        // =================================

        let checkResult =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?code=eq." +
                encodeURIComponent(code) +
                "&select=*"
            );


        if(!checkResult.success){

            console.error(
                "Check Error:",
                checkResult.error
            );

            errors++;

            continue;

        }


        let existing =
            checkResult.data || [];


        // =================================
        // ALREADY EXISTS
        // =================================

        if(existing.length > 0){

            console.log(
                "Already exists:",
                code
            );

            skipped++;

            continue;

        }


        // =================================
        // PREPARE SUPABASE DATA
        // =================================

        let supabaseItem = {

            code:
                code,

            item_name:
                item.itemName ||
                item.item_name ||
                "",

            specification:
                item.specification ||
                "",

            category:
                item.category ||
                "",

            unit:
                item.unit ||
                "",

            opening_stock:
                Number(
                    item.openingStock ??
                    item.opening_stock ??
                    0
                ),

            minimum_stock:
                Number(
                    item.minimumStock ??
                    item.minimum_stock ??
                    0
                ),

            storage_location:
                item.storageLocation ??
                item.storage_location ??
                "",

            department:
                item.department ||
                "",

            source:
                item.source ||
                "",

            supplier:
                item.supplier ||
                "",

            opening_cost:
                Number(
                    item.openingCost ??
                    item.opening_cost ??
                    item.cost ??
                    0
                )

        };


        // =================================
        // INSERT INTO SUPABASE
        // =================================

        let insertResult =
            await supabaseRequest(
                "items",
                "POST",
                supabaseItem
            );


        if(
            insertResult.success
        ){

            console.log(
                "✅ Imported:",
                code,
                supabaseItem
            );

            inserted++;

        }else{

            console.error(
                "❌ Insert Error:",
                code,
                insertResult.error
            );

            errors++;

        }

    }


    // =====================================
    // FINAL RESULT
    // =====================================

    console.log(
        "====================================="
    );

    console.log(
        "IMPORT COMPLETE"
    );

    console.log(
        "Inserted:",
        inserted
    );

    console.log(
        "Already Exists / Skipped:",
        skipped
    );

    console.log(
        "Errors:",
        errors
    );

    console.log(
        "====================================="
    );


    alert(

        "Master List Import Complete!\n\n" +

        "New Items Added: " +
        inserted +

        "\nAlready Exists / Skipped: " +
        skipped +

        "\nErrors: " +
        errors

    );

}


// =====================================
// PAGE LOAD
// =====================================

window.addEventListener(
    "load",
    function(){

        importMasterData();

    }
);
