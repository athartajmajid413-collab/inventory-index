// =====================================
// IMPORT OLD STOCK IN DATA
// LOCAL STORAGE → SUPABASE
// =====================================

async function importStockInData() {

    console.log("=====================================");
    console.log("STOCK IN DATA IMPORT STARTED");
    console.log("====================================");


    // =====================================
    // GET OLD HISTORY DATA
    // =====================================

    let history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];


    console.log(
        "LocalStorage History:",
        history
    );


    if(history.length === 0){

        alert(
            "LocalStorage میں Stock In کا کوئی data نہیں ملا۔"
        );

        return;

    }


    let inserted = 0;
    let skipped = 0;
    let errors = 0;


    // =====================================
    // LOOP HISTORY
    // =====================================

    for(
        let i = 0;
        i < history.length;
        i++
    ){

        let record =
            history[i];


        // =================================
        // ONLY STOCK IN
        // =================================

        if(
            record.type !== "Stock In"
        ){

            continue;

        }


        // =================================
        // ITEM CODE
        // =================================

        let itemCode =
            String(
                record.itemCode ||
                record.item_code ||
                ""
            ).trim();


        if(!itemCode){

            console.warn(
                "Stock In skipped - Item Code missing:",
                record
            );

            skipped++;

            continue;

        }


        // =================================
        // PREPARE SUPABASE DATA
        // =================================

        let supabaseRecord = {

            date:
                record.date || null,

            time:
                record.time || null,

            item_code:
                itemCode,

            item_name:
                record.itemName ||
                record.item_name ||
                "",

            unit:
                record.unit ||
                "",

            source:
                record.source ||
                "",

            supplier:
                record.supplier ||
                "",

            location:
                record.location ||
                "",

            quantity:
                Number(
                    record.quantity || 0
                ),

            unit_cost:
                Number(
                    record.unitCost ??
                    record.unit_cost ??
                    0
                ),

            total_cost:
                Number(
                    record.totalCost ??
                    record.total_cost ??
                    (
                        Number(
                            record.quantity || 0
                        )
                        *
                        Number(
                            record.unitCost ??
                            record.unit_cost ??
                            0
                        )
                    )
                ),

            type:
                "Stock In"

        };


        // =====================================
        // CHECK DUPLICATE
        // =====================================

        let duplicateQuery =
            "?item_code=eq." +
            encodeURIComponent(itemCode) +

            "&date=eq." +
            encodeURIComponent(
                supabaseRecord.date || ""
            ) +

            "&time=eq." +
            encodeURIComponent(
                supabaseRecord.time || ""
            ) +

            "&quantity=eq." +
            encodeURIComponent(
                supabaseRecord.quantity
            ) +

            "&select=id";


        let checkResult =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                duplicateQuery
            );


        if(!checkResult.success){

            console.error(
                "Duplicate Check Error:",
                itemCode,
                checkResult.error
            );

            errors++;

            continue;

        }


        // =====================================
        // DUPLICATE FOUND
        // =====================================

        if(
            checkResult.data &&
            checkResult.data.length > 0
        ){

            console.log(
                "Already exists:",
                itemCode,
                supabaseRecord.date,
                supabaseRecord.time
            );

            skipped++;

            continue;

        }


        // =====================================
        // INSERT INTO SUPABASE
        // =====================================

        let insertResult =
            await supabaseRequest(
                "stock_in",
                "POST",
                supabaseRecord
            );


        if(
            insertResult.success
        ){

            console.log(
                "✅ Stock In Imported:",
                itemCode,
                supabaseRecord
            );

            inserted++;

        }else{

            console.error(
                "❌ Stock In Insert Error:",
                itemCode,
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
        "STOCK IN IMPORT COMPLETE"
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
        "=====================================");


    alert(

        "Stock In Import Complete!\n\n" +

        "New Stock In Added: " +
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

        importStockInData();

    }
);
