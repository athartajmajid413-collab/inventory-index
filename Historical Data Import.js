// ==========================================
// HISTORICAL DATA IMPORT - CORRECTED VERSION
// ==========================================


// ==========================================
// EXISTING LOCALSTORAGE DATA
// ==========================================

let items =
    JSON.parse(localStorage.getItem("items")) || [];

let history =
    JSON.parse(localStorage.getItem("history")) || [];


// ==========================================
// TEMPORARY EXCEL DATA
// ==========================================

let excelWorkbook = null;
let excelFileName = "";


// ==========================================
// LOG FUNCTION
// ==========================================

function logMessage(message) {

    let log = document.getElementById("log");

    if (!log) return;

    let time = new Date().toLocaleTimeString();

    log.innerHTML +=
        `[${time}] ${message}<br>`;

    log.scrollTop = log.scrollHeight;
}


// ==========================================
// CLEAR LOG
// ==========================================

function clearImportLog() {

    document.getElementById("log").innerHTML =
        "Ready...";

    document.getElementById("newItems").innerText = "0";
    document.getElementById("stockInCount").innerText = "0";
    document.getElementById("stockOutCount").innerText = "0";
    document.getElementById("skippedCount").innerText = "0";
}


// ==========================================
// CLEAN TEXT
// ==========================================

function cleanText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\s+/g, " ");
}


// ==========================================
// NUMBER CONVERTER
// ==========================================

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "number") {

        return isNaN(value)
            ? 0
            : value;
    }

    let number =
        Number(
            String(value)
                .replace(/,/g, "")
                .trim()
        );

    return isNaN(number)
        ? 0
        : number;
}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }


    // JavaScript Date
    if (
        value instanceof Date &&
        !isNaN(value.getTime())
    ) {

        let year =
            value.getFullYear();

        let month =
            String(
                value.getMonth() + 1
            ).padStart(2, "0");

        let day =
            String(
                value.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    // Excel serial date
    if (typeof value === "number") {

        try {

            let date =
                XLSX.SSF.parse_date_code(value);

            if (date) {

                return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
            }

        }
        catch (error) {

            console.log(
                "Date conversion error:",
                error
            );
        }
    }


    let text =
        cleanText(value);

    // Already YYYY-MM-DD
    if (
        /^\d{4}-\d{1,2}-\d{1,2}$/.test(text)
    ) {

        let parts =
            text.split("-");

        return `${parts[0]}-${String(parts[1]).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")}`;
    }


    // DD/MM/YYYY
    if (
        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)
    ) {

        let parts =
            text.split("/");

        return `${parts[2]}-${String(parts[1]).padStart(2, "0")}-${String(parts[0]).padStart(2, "0")}`;
    }


    // DD-MM-YYYY
    if (
        /^\d{1,2}-\d{1,2}-\d{4}$/.test(text)
    ) {

        let parts =
            text.split("-");

        return `${parts[2]}-${String(parts[1]).padStart(2, "0")}-${String(parts[0]).padStart(2, "0")}`;
    }


    return text;
}


// ==========================================
// CHECK DATE VALUE
// ==========================================

function isExcelDate(value) {

    if (
        value instanceof Date &&
        !isNaN(value.getTime())
    ) {
        return true;
    }


    if (typeof value === "number") {

        return (
            value > 20000 &&
            value < 60000
        );
    }


    let text =
        cleanText(value);

    return (
        /^\d{4}-\d{1,2}-\d{1,2}$/.test(text) ||
        /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text) ||
        /^\d{1,2}-\d{1,2}-\d{4}$/.test(text)
    );
}


// ==========================================
// FIND COLUMN
// ==========================================

function findColumn(headers, names) {

    for (
        let i = 0;
        i < headers.length;
        i++
    ) {

        let header =
            cleanText(headers[i])
                .toLowerCase();

        for (
            let name of names
        ) {

            let search =
                name.toLowerCase();

            if (
                header === search ||
                header.includes(search)
            ) {

                return i;
            }
        }
    }

    return -1;
}


// ==========================================
// CHECK EXCEL
// ==========================================

function previewExcel() {

    let fileInput =
        document.getElementById("excelFile");


    if (
        !fileInput ||
        !fileInput.files.length
    ) {

        alert(
            "Pehle Excel file select karein."
        );

        return;
    }


    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "Excel library load nahi hui. Internet check karein aur page dobara open karein."
        );

        logMessage(
            "ERROR: XLSX library load nahi hui."
        );

        return;
    }


    let file =
        fileInput.files[0];

    excelFileName =
        file.name;


    let reader =
        new FileReader();


    reader.onload =
        function(event) {

            try {

                let data =
                    new Uint8Array(
                        event.target.result
                    );


                excelWorkbook =
                    XLSX.read(
                        data,
                        {
                            type: "array",
                            cellDates: true
                        }
                    );


                showExcelInformation();

            }
            catch(error) {

                console.error(error);

                document.getElementById(
                    "fileInfo"
                ).innerHTML =
                    `<b>❌ Excel read nahi ho saki.</b><br>${error.message}`;


                logMessage(
                    "ERROR: Excel file read nahi ho saki."
                );
            }
        };


    reader.onerror =
        function() {

            logMessage(
                "ERROR: File read nahi ho saki."
            );

            alert(
                "Excel file read nahi ho saki."
            );
        };


    reader.readAsArrayBuffer(file);
}


// ==========================================
// SHOW EXCEL INFORMATION
// ==========================================

function showExcelInformation() {

    if (!excelWorkbook) {
        return;
    }


    let sheets =
        excelWorkbook.SheetNames;


    let masterExists =
        sheets.includes(
            "MASTER SHEET"
        );


    let stockExists =
        sheets.includes(
            "SECTION WISE INWARD & OUTWARD"
        );


    let receivedExists =
        sheets.some(
            function(sheet) {

                return cleanText(sheet)
                    .toUpperCase()
                    === "RECEIVED";
            }
        );


    let consumptionExists =
        sheets.some(
            function(sheet) {

                return cleanText(sheet)
                    .toUpperCase()
                    === "CONSUMPTION";
            }
        );


    let costExists =
        sheets.some(
            function(sheet) {

                return cleanText(sheet)
                    .toUpperCase()
                    === "COST";
            }
        );


    let html = "";


    html +=
        `<b>Excel:</b> ${excelFileName}<br><br>`;


    html +=
        `<b>Sheets Found:</b><br>`;


    sheets.forEach(
        function(sheet) {

            html +=
                `✔ ${sheet}<br>`;
        }
    );


    html += `<br>`;


    html +=
        masterExists
            ? "✔ MASTER SHEET found<br>"
            : "❌ MASTER SHEET not found<br>";


    html +=
        stockExists
            ? "✔ SECTION WISE INWARD & OUTWARD found<br>"
            : "❌ SECTION WISE INWARD & OUTWARD not found<br>";


    html +=
        receivedExists
            ? "✔ RECEIVED sheet found<br>"
            : "⚠ RECEIVED sheet not found<br>";


    html +=
        consumptionExists
            ? "✔ CONSUMPTION sheet found<br>"
            : "⚠ CONSUMPTION sheet not found<br>";


    html +=
        costExists
            ? "✔ COST sheet found<br>"
            : "⚠ COST sheet not found<br>";


    document.getElementById(
        "fileInfo"
    ).innerHTML =
        html;


    logMessage(
        "Excel checked successfully."
    );
}


// ==========================================
// GET MASTER SHEET
// ==========================================

function getMasterSheet() {

    if (!excelWorkbook) {
        return null;
    }


    let sheetName =
        "MASTER SHEET";


    if (
        !excelWorkbook.SheetNames.includes(
            sheetName
        )
    ) {

        return null;
    }


    return excelWorkbook.Sheets[
        sheetName
    ];
}


// ==========================================
// IMPORT MASTER ITEMS
// ==========================================

function importMasterItems() {

    let sheet =
        getMasterSheet();


    if (!sheet) {

        logMessage(
            "WARNING: MASTER SHEET nahi mili."
        );

        return 0;
    }


    let rows =
        XLSX.utils.sheet_to_json(
            sheet,
            {
                header: 1,
                defval: ""
            }
        );


    let newItems = 0;


    let headerRowIndex = -1;


    // Find header
    for (
        let i = 0;
        i < rows.length;
        i++
    ) {

        let row =
            rows[i]
                .map(cleanText)
                .join(" ")
                .toLowerCase();


        if (
            row.includes("id #") &&
            (
                row.includes(
                    "insert description"
                ) ||
                row.includes(
                    "description"
                )
            )
        ) {

            headerRowIndex =
                i;

            break;
        }
    }


    if (
        headerRowIndex === -1
    ) {

        logMessage(
            "WARNING: MASTER SHEET header nahi mila."
        );

        return 0;
    }


    let headers =
        rows[headerRowIndex];


    let codeIndex =
        findColumn(
            headers,
            ["ID #", "ID"]
        );


    let nameIndex =
        findColumn(
            headers,
            [
                "INSERT DESCRIPTION",
                "ITEM NAME",
                "DESCRIPTION"
            ]
        );


    let specIndex =
        findColumn(
            headers,
            [
                "SPEC. IF ANY",
                "SPEC IF. ANY",
                "SPECIFICATION"
            ]
        );


    let unitIndex =
        findColumn(
            headers,
            ["UNIT"]
        );


    let categoryIndex =
        findColumn(
            headers,
            [
                "CATEGORY CLASSIFICATION",
                "CATEGORY"
            ]
        );


    let sourceIndex =
        findColumn(
            headers,
            ["SOURCE"]
        );


    let latestRateIndex =
        findColumn(
            headers,
            [
                "LATEST PURCHASE RATE",
                "LATEST RATE",
                "LATEST"
            ]
        );


    for (
        let r = headerRowIndex + 1;
        r < rows.length;
        r++
    ) {

        let row =
            rows[r];


        let code =
            cleanText(
                row[codeIndex]
            );


        let name =
            cleanText(
                row[nameIndex]
            );


        if (
            !code ||
            !name
        ) {
            continue;
        }


        let alreadyExists =
            items.some(
                function(item) {

                    return (
                        cleanText(
                            item.code
                        ).toLowerCase()
                        ===
                        code.toLowerCase()
                    );
                }
            );


        if (
            alreadyExists
        ) {
            continue;
        }


        let newItem = {

            code: code,

            itemName: name,

            specification:
                specIndex >= 0
                    ? cleanText(
                        row[specIndex]
                    )
                    : "",

            category:
                categoryIndex >= 0
                    ? cleanText(
                        row[categoryIndex]
                    )
                    : "",

            unit:
                unitIndex >= 0
                    ? cleanText(
                        row[unitIndex]
                    )
                    : "",

            source:
                sourceIndex >= 0
                    ? cleanText(
                        row[sourceIndex]
                    )
                    : "",

            openingStock: 0,

            minimumStock: 0,

            storageLocation: "",

            latestRate:
                latestRateIndex >= 0
                    ? toNumber(
                        row[latestRateIndex]
                    )
                    : 0,

            totalStockIn: 0,

            totalStockOut: 0,

            currentStock: 0
        };


        items.push(
            newItem
        );


        newItems++;


        logMessage(
            `New Master Item: ${code} - ${name}`
        );
    }


    localStorage.setItem(
        "items",
        JSON.stringify(items)
    );


    return newItems;
}


// ==========================================
// FIND ITEM
// ==========================================

function findItem(code) {

    let cleanCode =
        cleanText(code)
            .toLowerCase();


    return items.find(
        function(item) {

            return (
                cleanText(
                    item.code
                ).toLowerCase()
                ===
                cleanCode
            );
        }
    );
}


// ==========================================
// DUPLICATE HISTORY CHECK
// ==========================================

function historyExists(record) {

    return history.some(
        function(oldRecord) {

            let oldCode =
                cleanText(
                    oldRecord.itemCode ||
                    oldRecord.code
                ).toLowerCase();


            let newCode =
                cleanText(
                    record.itemCode
                ).toLowerCase();


            let oldDate =
                formatDate(
                    oldRecord.transactionDate ||
                    oldRecord.date
                );


            let newDate =
                formatDate(
                    record.transactionDate
                );


            let oldQty =
                toNumber(
                    oldRecord.quantity
                );


            let newQty =
                toNumber(
                    record.quantity
                );


            let oldType =
                cleanText(
                    oldRecord.type ||
                    oldRecord.transactionType
                ).toLowerCase();


            let newType =
                cleanText(
                    record.type
                ).toLowerCase();


            let oldDepartment =
                cleanText(
                    oldRecord.department
                ).toLowerCase();


            let newDepartment =
                cleanText(
                    record.department
                ).toLowerCase();


            return (
                oldCode === newCode &&
                oldDate === newDate &&
                oldQty === newQty &&
                oldType === newType &&
                oldDepartment === newDepartment
            );
        }
    );
}


// ==========================================
// ADD HISTORY RECORD
// ==========================================

function addHistoryRecord(
    code,
    itemName,
    quantity,
    date,
    type,
    department,
    unitCost
) {

    quantity =
        toNumber(quantity);


    if (
        quantity <= 0
    ) {
        return false;
    }


    let record = {

        itemCode: cleanText(code),

        itemName: cleanText(itemName),

        quantity: quantity,

        type: cleanText(type),

        department:
            cleanText(department),

        transactionDate:
            formatDate(date),

        transactionTime:
            "00:00",

        unitCost:
            toNumber(unitCost),

        totalCost:
            quantity *
            toNumber(unitCost),

        source:
            "Historical Excel Import"
    };


    if (
        historyExists(record)
    ) {

        return false;
    }


    history.push(
        record
    );


    return true;
}


// ==========================================
// IMPORT SECTION WISE DATA
// ==========================================

function importSectionWiseData() {

    if (!excelWorkbook) {

        return {
            stockIn: 0,
            stockOut: 0,
            skipped: 0
        };
    }


    let sheetName =
        "SECTION WISE INWARD & OUTWARD";


    if (
        !excelWorkbook.SheetNames.includes(
            sheetName
        )
    ) {

        logMessage(
            "ERROR: SECTION WISE sheet nahi mili."
        );

        return {
            stockIn: 0,
            stockOut: 0,
            skipped: 0
        };
    }


    let sheet =
        excelWorkbook.Sheets[
            sheetName
        ];


    let rows =
        XLSX.utils.sheet_to_json(
            sheet,
            {
                header: 1,
                defval: "",
                raw: true
            }
        );


    let stockInCount = 0;
    let stockOutCount = 0;
    let skippedCount = 0;


    // ======================================
    // DATE COLUMNS
    // ======================================

    let dateColumns = {};


    /*
       Column G onward = daily dates

       We scan the complete sheet for dates
       instead of depending only on one row.
    */

    for (
        let r = 0;
        r < rows.length;
        r++
    ) {

        let row =
            rows[r];


        for (
            let c = 6;
            c < row.length;
            c++
        ) {

            let value =
                row[c];


            if (
                isExcelDate(value)
            ) {

                let date =
                    formatDate(value);


                if (date) {

                    dateColumns[c] =
                        date;
                }
            }
        }
    }


    logMessage(
        `Date columns found: ${Object.keys(dateColumns).length}`
    );


    // ======================================
    // LAST ITEM
    // ======================================

    let lastItemCode = "";
    let lastItemName = "";


    // ======================================
    // PROCESS ROWS
    // ======================================

    for (
        let r = 0;
        r < rows.length;
        r++
    ) {

        let row =
            rows[r];


        let code =
            cleanText(
                row[1]
            );


        let name =
            cleanText(
                row[2]
            );


        let opening =
            toNumber(
                row[3]
            );


        let inward =
            toNumber(
                row[4]
            );


        let department =
            cleanText(
                row[5]
            );


        // ==================================
        // ITEM CODE / NAME
        // ==================================

        if (code) {

            lastItemCode =
                code;

            if (name) {

                lastItemName =
                    name;
            }
        }
        else {

            code =
                lastItemCode;

            name =
                lastItemName;
        }


        if (
            !code ||
            !name
        ) {
            continue;
        }


        // ==================================
        // FIND MASTER ITEM
        // ==================================

        let item =
            findItem(code);


        if (!item) {

            skippedCount++;


            logMessage(
                `Skipped: ${code} - Master item nahi mila.`
            );


            continue;
        }


        // ==================================
        // SAVE OPENING STOCK
        // ==================================

        if (
            opening !== 0
        ) {

            /*
               Agar item mein pehle opening
               stock nahi hai to Excel opening
               stock save hoga.
            */

            if (
                toNumber(
                    item.openingStock
                ) === 0
            ) {

                item.openingStock =
                    opening;
            }
        }


        // ==================================
        // STOCK IN
        // ==================================

        if (
            inward > 0
        ) {

            let rate =
                toNumber(
                    item.latestRate
                );


            /*
               Inward ke liye pehli available
               historical date use hogi.
            */

            let availableDates =
                Object.values(
                    dateColumns
                );


            let inwardDate =
                availableDates.length > 0
                    ? availableDates[0]
                    : "";


            let added =
                addHistoryRecord(
                    code,
                    name,
                    inward,
                    inwardDate,
                    "Stock in",
                    department,
                    rate
                );


            if (added) {

                stockInCount++;

            }
            else {

                skippedCount++;
            }
        }


        // ==================================
        // DAILY STOCK OUT
        // ==================================

        for (
            let c = 6;
            c < row.length;
            c++
        ) {

            let quantity =
                toNumber(
                    row[c]
                );


            if (
                quantity <= 0
            ) {
                continue;
            }


            let date =
                dateColumns[c];


            if (!date) {

                skippedCount++;

                continue;
            }


            let added =
                addHistoryRecord(
                    code,
                    name,
                    quantity,
                    date,
                    "Stock out",
                    department,
                    0
                );


            if (added) {

                stockOutCount++;

            }
            else {

                skippedCount++;
            }
        }
    }


    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );


    return {

        stockIn:
            stockInCount,

        stockOut:
            stockOutCount,

        skipped:
            skippedCount
    };
}

// ==========================================
// FIX OLD IMPORTED HISTORY TYPES
// ==========================================

function fixOldHistoryTypes(){

    for(let i = 0; i < history.length; i++){

        let type =
            cleanText(
                history[i].type ||
                history[i].transactionType
            ).toLowerCase();


        if(
            type === "in" ||
            type === "stockin" ||
            type === "inward"
        ){

            history[i].type =
                "Stock In";

        }


        else if(
            type === "out" ||
            type === "stockout" ||
            type === "outward"
        ){

            history[i].type =
                "Stock Issue";

        }

    }


    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );


    logMessage(
        "Old History Types corrected."
    );

}
// ==========================================
// CALCULATE STOCK BALANCE
// ==========================================

function calculateStockBalances() {

    logMessage(
        "Calculating Stock Balance..."
    );


    // Reset totals
    items.forEach(
        function(item) {

            item.totalStockIn = 0;

            item.totalStockOut = 0;

            item.currentStock =
                toNumber(
                    item.openingStock
                );
        }
    );


    // Read complete history
    history.forEach(
        function(record) {

            let code =
                cleanText(
                    record.itemCode ||
                    record.code
                ).toLowerCase();


            if (!code) {
                return;
            }


            let item =
                items.find(
                    function(x) {

                        return (
                            cleanText(
                                x.code
                            ).toLowerCase()
                            === code
                        );
                    }
                );


            if (!item) {
                return;
            }


            let quantity =
                toNumber(
                    record.quantity
                );


            let type =
                cleanText(
                    record.type ||
                    record.transactionType
                ).toLowerCase();


            if (
    type === "in" ||
    type === "stockin" ||
    type === "stock in" ||
    type === "inward"
) {

    item.totalStockIn +=
        quantity;

}

else if (
    type === "out" ||
    type === "stockout" ||
    type === "stock out" ||
    type === "outward"
) {

    item.totalStockOut +=
        quantity;

}

else if(
    type === "stock issue"
){

    item.totalStockOut +=
        quantity;

}
        });
        


    // Final balance
    items.forEach(
        function(item) {

            let opening =
                toNumber(
                    item.openingStock
                );


            let stockIn =
                toNumber(
                    item.totalStockIn
                );


            let stockOut =
                toNumber(
                    item.totalStockOut
                );


            item.currentStock =
                opening +
                stockIn -
                stockOut;
        }
    );


    // Save
    localStorage.setItem(
        "items",
        JSON.stringify(items)
    );


    logMessage(
        "Stock Balance calculated successfully."
    );
}


// ==========================================
// IMPORT HISTORICAL DATA
// ==========================================

function importHistoricalData() {

    if (!excelWorkbook) {

        alert(
            "Pehle Excel file select karke 'Check Excel' press karein."
        );

        return;
    }


    let confirmImport =
        confirm(
            "Historical data import karna hai?\n\n" +
            "Existing items aur duplicate history records skip honge."
        );


    if (!confirmImport) {
        return;
    }


    logMessage(
        "================================="
    );


    logMessage(
        "Historical Import Started..."
    );


    // ======================================
    // MASTER ITEMS
    // ======================================

    let newItems =
        importMasterItems();


    // ======================================
    // STOCK IN / OUT
    // ======================================

    let result =
        importSectionWiseData();


   // ======================================
// FIX OLD HISTORY TYPES
// ======================================

fixOldHistoryTypes();


// ======================================
// CALCULATE BALANCE
// ======================================

calculateStockBalances();


    // ======================================
    // UPDATE STATS
    // ======================================

    document.getElementById(
        "newItems"
    ).innerText =
        newItems;


    document.getElementById(
        "stockInCount"
    ).innerText =
        result.stockIn;


    document.getElementById(
        "stockOutCount"
    ).innerText =
        result.stockOut;


    document.getElementById(
        "skippedCount"
    ).innerText =
        result.skipped;


    // ======================================
    // LOG
    // ======================================

    logMessage(
        "---------------------------------"
    );


    logMessage(
        `New Items: ${newItems}`
    );


    logMessage(
        `Stock In Records: ${result.stockIn}`
    );


    logMessage(
        `Stock Out Records: ${result.stockOut}`
    );


    logMessage(
        `Skipped: ${result.skipped}`
    );


    logMessage(
        `Total History Records: ${history.length}`
    );


    logMessage(
        "Stock Balance Updated."
    );


    logMessage(
        "Historical Import Completed."
    );


    alert(
        "Historical Data Import Complete!\n\n" +
        "New Items: " + newItems + "\n" +
        "Stock In: " + result.stockIn + "\n" +
        "Stock Out: " + result.stockOut + "\n" +
        "Skipped: " + result.skipped + "\n\n" +
        "Stock Balance bhi calculate ho gaya hai."
    );
};