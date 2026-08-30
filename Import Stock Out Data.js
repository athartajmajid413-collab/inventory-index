// =====================================
// IMPORT OLD STOCK OUT DATA
// LOCAL STORAGE → SUPABASE
// TABLE: stock_issue
// =====================================

async function importStockOutData() {

    console.log("=====================================");
    console.log("STOCK OUT DATA IMPORT STARTED");
    console.log("=====================================");


    // =====================================
    // GET OLD HISTORY
    // =====================================

    let oldHistory =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];


    console.log(
        "Total History Records:",
        oldHistory.length
    );


    // =====================================
    // CHECK HISTORY
    // =====================================

    if (oldHistory.length === 0) {

        alert(
            "LocalStorage میں کوئی History data نہیں ملا۔"
        );

        return;
    }


    // =====================================
    // GET STOCK OUT RECORDS
    // =====================================

    let stockOutRecords =
        oldHistory.filter(function (record) {

            return String(
                record.type || ""
            ).trim() === "Stock Issue";

        });


    console.log(
        "Stock Out Records Found:",
        stockOutRecords.length
    );


    // =====================================
    // NO STOCK OUT RECORDS
    // =====================================

    if (stockOutRecords.length === 0) {

        alert(
            "LocalStorage میں Stock Out کا کوئی record نہیں ملا۔"
        );

        return;
    }


    let inserted = 0;

    let skipped = 0;

    let errors = 0;


    // =====================================
    // LOOP ALL STOCK OUT RECORDS
    // =====================================

    for (
        let i = 0;
        i < stockOutRecords.length;
        i++
    ) {

        let record =
            stockOutRecords[i];


        // =================================
        // ITEM CODE
        // =================================

        let itemCode =
            String(
                record.itemCode ||
                record.item_code ||
                ""
            ).trim();


        if (!itemCode) {

            console.warn(
                "Skipped - Item Code Missing:",
                record
            );

            skipped++;

            continue;
        }


        // =================================
        // PREPARE DATA
        // =================================

        let recordDate =
            record.date || null;

        let recordTime =
            record.time || null;

        let quantity =
            Number(
                record.quantity || 0
            );


        let supabaseRecord = {

            date:
                recordDate,

            time:
                recordTime,

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

            department:
                record.department ||
                "",

            type:
                "Stock Issue",

            quantity:
                quantity

        };


        console.log(
            "Checking:",
            itemCode,
            recordDate,
            recordTime,
            quantity
        );


        // =================================
        // DUPLICATE CHECK
        // =================================

        let duplicateQuery =
            "?item_code=eq." +
            encodeURIComponent(itemCode) +

            "&date=eq." +
            encodeURIComponent(
                recordDate || ""
            ) +

            "&time=eq." +
            encodeURIComponent(
                recordTime || ""
            ) +

            "&quantity=eq." +
            encodeURIComponent(
                quantity
            ) +

            "&select=id";


        let checkResult =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                duplicateQuery
            );


        // =================================
        // DUPLICATE CHECK ERROR
        // =================================

        if (!checkResult.success) {

            console.error(
                "❌ Duplicate Check Error:",
                itemCode,
                checkResult.error
            );

            errors++;

            continue;
        }


        // =================================
        // ALREADY EXISTS
        // =================================

        if (
            checkResult.data &&
            checkResult.data.length > 0
        ) {

            console.log(
                "Already Exists:",
                itemCode,
                recordDate,
                recordTime
            );

            skipped++;

            continue;
        }


        // =================================
        // INSERT INTO SUPABASE
        // =================================

        let insertResult =
            await supabaseRequest(
                "stock_issue",
                "POST",
                supabaseRecord
            );


        // =================================
        // INSERT SUCCESS
        // =================================

        if (
            insertResult.success
        ) {

            console.log(
                "✅ Imported Stock Out:",
                itemCode,
                recordDate,
                recordTime,
                quantity
            );

            inserted++;

        }


        // =================================
        // INSERT ERROR
        // =================================

        else {

            console.error(
                "❌ Insert Error:",
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
        "STOCK OUT IMPORT COMPLETE"
    );

    console.log(
        "====================================="
    );

    console.log(
        "Total Stock Out Records:",
        stockOutRecords.length
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


    // =====================================
    // FINAL MESSAGE
    // =====================================

    alert(

        "Stock Out Import Complete!\n\n" +

        "Total Stock Out Records: " +
        stockOutRecords.length +

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
    function () {

        importStockOutData();

    }
);
