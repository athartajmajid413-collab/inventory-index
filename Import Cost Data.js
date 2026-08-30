// =====================================
// CONVERT DATE TO SUPABASE FORMAT
// DD/MM/YYYY → YYYY-MM-DD
// =====================================

function convertDateForSupabase(dateValue){

    if(!dateValue){
        return null;
    }

    let dateText =
        String(dateValue).trim();

    // Already YYYY-MM-DD
    if(
        /^\d{4}-\d{2}-\d{2}$/.test(dateText)
    ){

        return dateText;

    }

    // DD/MM/YYYY
    let parts =
        dateText.split("/");

    if(parts.length === 3){

        let day =
            parts[0].padStart(2, "0");

        let month =
            parts[1].padStart(2, "0");

        let year =
            parts[2];

        return (
            year +
            "-" +
            month +
            "-" +
            day
        );

    }

    return null;
}
// =====================================
// IMPORT OLD COST HISTORY DATA
// LOCAL STORAGE → SUPABASE
// TABLE: cost_history
// =====================================

async function importCostData(){

    console.log("=====================================");
    console.log("COST HISTORY IMPORT STARTED");
    console.log("=====================================");


    // =====================================
    // GET OLD COST HISTORY
    // =====================================

    let oldCostHistory =
        JSON.parse(
            localStorage.getItem("costHistory")
        ) || [];


    console.log(
        "LocalStorage Cost History:",
        oldCostHistory
    );


    if(oldCostHistory.length === 0){

        alert(
            "LocalStorage میں Cost History کا کوئی data نہیں ملا۔"
        );

        return;

    }


    let inserted = 0;
    let skipped = 0;
    let errors = 0;


    // =====================================
    // LOOP ALL COST RECORDS
    // =====================================

    for(
        let i = 0;
        i < oldCostHistory.length;
        i++
    ){

        let record =
            oldCostHistory[i];


        let month =
            String(
                record.month || ""
            ).trim();


        // =================================
        // MONTH REQUIRED
        // =================================

        if(!month){

            console.warn(
                "Skipped - Month Missing:",
                record
            );

            skipped++;

            continue;

        }


        // =================================
        // DUPLICATE CHECK
        // =================================

        let duplicateQuery =
            "?month=eq." +
            encodeURIComponent(month) +
            "&select=id";


        let checkResult =
            await supabaseRequest(
                "cost_history",
                "GET",
                null,
                duplicateQuery
            );


        if(!checkResult.success){

            console.error(
                "Duplicate Check Error:",
                month,
                checkResult.error
            );

            errors++;

            continue;

        }


        // =================================
        // ALREADY EXISTS
        // =================================

        if(
            checkResult.data &&
            checkResult.data.length > 0
        ){

            console.log(
                "Already Exists:",
                month
            );

            skipped++;

            continue;

        }


        // =================================
        // PREPARE SUPABASE DATA
        // =================================

        let supabaseRecord = {

            month:
                month,

            month_name:
                record.monthName ||
                record.month_name ||
                "",

            year:
                String(
                    record.year ||
                    month.substring(0,4)
                ),

            total_items:
                Number(
                    record.totalItems ||
                    record.total_items ||
                    0
                ),

            available_stock_cost:
                Number(
                    record.availableStockCost ??
                    record.available_stock_cost ??
                    0
                ),

            approved_demand_qty:
                Number(
                    record.approvedDemandQty ??
                    record.approved_demand_qty ??
                    0
                ),

            approved_demand_cost:
                Number(
                    record.approvedDemandCost ??
                    record.approved_demand_cost ??
                    0
                ),

            items:
                record.items ||
                [],

           saved_date:
    convertDateForSupabase(
        record.savedDate ||
        record.saved_date ||
        null
    )
        };


        // =================================
        // INSERT INTO SUPABASE
        // =================================

        let insertResult =
            await supabaseRequest(
                "cost_history",
                "POST",
                supabaseRecord
            );


        if(
            insertResult.success
        ){

            console.log(
                "✅ Imported Cost:",
                month
            );

            inserted++;

        }else{

            console.error(
                "❌ Insert Error:",
                month,
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
        "COST HISTORY IMPORT COMPLETE"
    );

    console.log(
        "Total Cost Records:",
        oldCostHistory.length
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

        "Cost History Import Complete!\n\n" +

        "Total Records: " +
        oldCostHistory.length +

        "\nNew Records Added: " +
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

        importCostData();

    }
);