// =====================================
// REPORTS.JS
// SUPABASE VERSION
// =====================================
const REPORT_SUPABASE_URL =
    "https://tncmmkyrpzlkupdnkyqm.supabase.co";

const REPORT_SUPABASE_KEY =
    "sb_publishable_e6j_EkJescicSS3nEOnscg_INwxeukT";

// =====================================
// GLOBAL DATA
// =====================================

let history = [];

let items = [];

let demandHistory = [];


// =====================================
// BASIC HELPERS
// =====================================

function val(obj, keys, fallback = "") {

    for (let key of keys) {

        if (
            obj &&
            obj[key] !== undefined &&
            obj[key] !== null &&
            obj[key] !== ""
        ) {

            return obj[key];

        }

    }

    return fallback;

}


// =====================================
// NUMBER HELPER
// =====================================

function num(value) {

    let n = Number(value);

    return Number.isFinite(n) ? n : 0;

}


// =====================================
// MONTH KEY
// =====================================

function getTodayMonthKey() {

    const d = new Date();

    const year = d.getFullYear();

    const month =
        String(d.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;

}


// =====================================
// DATE → MONTH
// =====================================

function getMonthKeyFromDate(value) {

    if (!value) {
        return "";
    }

    const text = String(value).trim();

    if (/^\d{4}-\d{2}$/.test(text)) {

        return text;

    }

    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {

        return text.substring(0, 7);

    }

    const d = new Date(text);

    if (isNaN(d.getTime())) {

        return "";

    }

    return `${d.getFullYear()}-${String(
        d.getMonth() + 1
    ).padStart(2, "0")}`;

}


// =====================================
// FORMAT MONTH
// =====================================

function formatMonth(monthKey) {

    if (!monthKey) {
        return "";
    }

    const parts = monthKey.split("-");

    if (parts.length !== 2) {
        return monthKey;
    }

    const year = parts[0];

    const month = Number(parts[1]);

    const names = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    if (month < 1 || month > 12) {
        return monthKey;
    }

    return `${names[month - 1]} ${year}`;

}


// =====================================
// LOAD SUPABASE DATA
// =====================================

async function loadReportsData() {

    try {

        console.log("Loading Reports data from Supabase...");


        // ---------------------------------
        // ITEMS
        // ---------------------------------

        const itemsResult =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?select=*"
            );


        if (itemsResult && itemsResult.data) {

            items = Array.isArray(itemsResult.data)
                ? itemsResult.data
                : [];

        } else {

            items = [];

        }


        // ---------------------------------
        // STOCK IN
        // ---------------------------------

        const stockInResult =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*"
            );


        // ---------------------------------
        // STOCK OUT
        // ---------------------------------

        const stockOutResult =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*"
            );


        history = [];


        // ---------------------------------
        // CONVERT STOCK IN
        // ---------------------------------

        if (
            stockInResult &&
            Array.isArray(stockInResult.data)
        ) {

            stockInResult.data.forEach(r => {

                history.push({

                    ...r,

                    type: "Stock In",

                    itemCode: val(
                        r,
                        [
                            "item_code",
                            "itemCode",
                            "code"
                        ]
                    ),

                    itemName: val(
                        r,
                        [
                            "item_name",
                            "itemName",
                            "name"
                        ]
                    ),

                    quantity: val(
                        r,
                        [
                            "quantity",
                            "qty"
                        ]
                    ),

                    unitCost: val(
                        r,
                        [
                            "unit_cost",
                            "unitCost"
                        ]
                    ),

                    totalCost: val(
                        r,
                        [
                            "total_cost",
                            "totalCost"
                        ]
                    ),

                    date: val(
                        r,
                        [
                            "date",
                            "transaction_date"
                        ]
                    ),

                    time: val(
                        r,
                        [
                            "time",
                            "transaction_time"
                        ]
                    ),

                    department: val(
                        r,
                        [
                            "department"
                        ]
                    )

                });

            });

        }


        // ---------------------------------
        // CONVERT STOCK OUT
        // ---------------------------------

        if (
            stockOutResult &&
            Array.isArray(stockOutResult.data)
        ) {

            stockOutResult.data.forEach(r => {

                history.push({

                    ...r,

                    type: "Stock Issue",

                    itemCode: val(
                        r,
                        [
                            "item_code",
                            "itemCode",
                            "code"
                        ]
                    ),

                    itemName: val(
                        r,
                        [
                            "item_name",
                            "itemName",
                            "name"
                        ]
                    ),

                    quantity: val(
                        r,
                        [
                            "quantity",
                            "qty"
                        ]
                    ),

                    unitCost: val(
                        r,
                        [
                            "unit_cost",
                            "unitCost"
                        ]
                    ),

                    totalCost: val(
                        r,
                        [
                            "total_cost",
                            "totalCost"
                        ]
                    ),

                    date: val(
                        r,
                        [
                            "date",
                            "transaction_date"
                        ]
                    ),

                    time: val(
                        r,
                        [
                            "time",
                            "transaction_time"
                        ]
                    ),

                    department: val(
                        r,
                        [
                            "department"
                        ]
                    )

                });

            });

        }


        // ---------------------------------
        // DEMAND HISTORY
        // ---------------------------------

        const demandResult =
            await supabaseRequest(
                "demand_history",
                "GET",
                null,
                "?select=*"
            );


        if (
            demandResult &&
            Array.isArray(demandResult.data)
        ) {

            demandHistory =
                demandResult.data;

        } else {

            demandHistory = [];

        }


        console.log(
            "Reports Items:",
            items.length
        );

        console.log(
            "Reports Transactions:",
            history.length
        );

        console.log(
            "Reports Demand History:",
            demandHistory.length
        );


    } catch (error) {

        console.error(
            "Reports data loading error:",
            error
        );

        alert(
            "Reports data load نہیں ہو سکا۔ Supabase connection check کریں۔"
        );

    }

}


// =====================================
// GET ITEM
// =====================================

function getItem(code) {

    const searchCode =
        String(code).trim();


    return items.find(x => {

        return String(
            val(
                x,
                [
                    "code",
                    "itemCode",
                    "item_code",
                    "id"
                ]
            )
        ).trim() === searchCode;

    });

}


// =====================================
// CURRENT STOCK
// =====================================

function currentStock(item) {

    if (!item) {
        return 0;
    }


    let opening =
        num(
            val(
                item,
                [
                    "openingStock",
                    "opening_Stock",
                    "openStock",
                    "currentStock"
                ]
            )
        );


    let inQty = 0;

    let outQty = 0;


    history.forEach(r => {

        const recordCode =
            String(
                val(
                    r,
                    [
                        "itemCode",
                        "item_code",
                        "code"
                    ]
                )
            ).trim();


        const itemCode =
            String(
                val(
                    item,
                    [
                        "code",
                        "itemCode",
                        "item_code",
                        "id"
                    ]
                )
            ).trim();


        if (recordCode !== itemCode) {
            return;
        }


        const q =
            num(
                val(
                    r,
                    [
                        "quantity",
                        "qty"
                    ]
                )
            );


        const type =
            String(
                val(r, ["type"])
            ).toLowerCase();


        if (
            type === "stock in" ||
            type === "stockin"
        ) {

            inQty += q;

        }


        if (
            type === "stock issue" ||
            type === "stock out" ||
            type === "stockout"
        ) {

            outQty += q;

        }

    });


    return opening + inQty - outQty;

}


// =====================================
// REPORT TYPE CHANGE
// =====================================

function reportTypeChanged() {

    const type =
        document.getElementById(
            "reportType"
        ).value;


    const demandMonthBox =
        document.getElementById(
            "demandMonthBox"
        );


    const fromDateBox =
        document.getElementById(
            "fromDateBox"
        );


    const toDateBox =
        document.getElementById(
            "toDateBox"
        );


    const fromDate =
        document.getElementById(
            "fromDate"
        );


    const toDate =
        document.getElementById(
            "toDate"
        );


    const department =
        document.getElementById(
            "department"
        );


    // ---------------------------------
    // MONTHLY DEMAND
    // ---------------------------------

    if (
        type === "monthlyDemand" ||
        type === "demand"
    ) {

        demandMonthBox.style.display =
            "block";


        fromDateBox.style.display =
            "none";


        toDateBox.style.display =
            "none";


        fromDate.disabled = true;

        toDate.disabled = true;


        if (!document.getElementById(
            "demandMonth"
        ).value) {

            document.getElementById(
                "demandMonth"
            ).value =
                getTodayMonthKey();

        }


    } else {

        demandMonthBox.style.display =
            "none";


        fromDateBox.style.display =
            "block";


        toDateBox.style.display =
            "block";


        fromDate.disabled = false;

        toDate.disabled = false;

    }


    // ---------------------------------
    // DEPARTMENT
    // ---------------------------------

    department.disabled = !(
        type === "stockOut" ||
        type === "all"
    );


    // ---------------------------------
    // TITLE
    // ---------------------------------

    if (
        type === "monthlyDemand" ||
        type === "demand"
    ) {

        const month =
            document.getElementById(
                "demandMonth"
            ).value;


        if (month) {

            setTitles(
                "Monthly Demand Report - " +
                formatMonth(month)
            );

        } else {

            setTitles(
                "Monthly Demand Report"
            );

        }

    }

}


// =====================================
// SET TITLES
// =====================================

function setTitles(title) {

    const screenTitle =
        document.getElementById(
            "screenReportTitle"
        );


    const printTitle =
        document.getElementById(
            "printReportTitle"
        );


    if (screenTitle) {

        screenTitle.innerHTML =
            title;

    }


    if (printTitle) {

        printTitle.innerHTML =
            title.toUpperCase();

    }


    const d = new Date();


    const printDate =
        document.getElementById(
            "printDate"
        );


    if (printDate) {

        printDate.innerHTML =
            `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;

    }

}


// =====================================
// SET TABLE HEAD
// =====================================

function setHead(columns) {

    document.getElementById(
        "reportHead"
    ).innerHTML =

        `<tr>${
            columns
                .map(x => `<th>${x}</th>`)
                .join("")
        }</tr>`;

}


// =====================================
// ADD ROW
// =====================================

function addRow(values) {

    let tr =
        document.createElement("tr");


    values.forEach(v => {

        let td =
            document.createElement("td");


        td.textContent =
            v === undefined ||
            v === null ||
            v === ""
                ? "-"
                : v;


        tr.appendChild(td);

    });


    document.getElementById(
        "reportBody"
    ).appendChild(tr);

}


// =====================================
// RESET SUMMARY
// =====================================

function resetSummary() {

    document.getElementById(
        "totalEntries"
    ).innerHTML = "0";


    document.getElementById(
        "reportQuantity"
    ).innerHTML = "0";


    document.getElementById(
        "reportCost"
    ).innerHTML = "0";

}


// =====================================
// GENERATE REPORT
// =====================================

function generateReport() {

    const type =
        document.getElementById(
            "reportType"
        ).value;


    const fromDate =
        document.getElementById(
            "fromDate"
        ).value;


    const toDate =
        document.getElementById(
            "toDate"
        ).value;


    const itemCode =
        document.getElementById(
            "itemCode"
        ).value.trim();


    const department =
        document.getElementById(
            "department"
        ).value;


    const body =
        document.getElementById(
            "reportBody"
        );


    body.innerHTML = "";


    resetSummary();


    // ---------------------------------
    // MONTHLY DEMAND
    // ---------------------------------

    if (
        type === "monthlyDemand" ||
        type === "demand"
    ) {

        const demandMonth =
            document.getElementById(
                "demandMonth"
            ).value;


        if (!demandMonth) {

            alert(
                "Please select Demand Month."
            );

            return;

        }


        return monthlyDemandReport(
            demandMonth,
            itemCode
        );

    }


    // ---------------------------------
    // STOCK IN
    // ---------------------------------

    if (type === "stockIn") {

        return stockInReport(
            fromDate,
            toDate,
            itemCode,
            department
        );

    }


    // ---------------------------------
    // STOCK OUT
    // ---------------------------------

    if (type === "stockOut") {

        return stockOutReport(
            fromDate,
            toDate,
            itemCode,
            department
        );

    }


    // ---------------------------------
    // CURRENT STOCK
    // ---------------------------------

    if (type === "currentStock") {

        return currentStockReport(
            itemCode
        );

    }


    // ---------------------------------
    // COST
    // ---------------------------------

    if (type === "cost") {

        return costReport(
            itemCode
        );

    }


    // ---------------------------------
    // ALL TRANSACTIONS
    // ---------------------------------

    return allTransactionsReport(
        fromDate,
        toDate,
        itemCode,
        department
    );

}


// =====================================
// FILTER HISTORY
// =====================================

function filteredHistory(
    type,
    fromDate,
    toDate,
    itemCode,
    department
) {

    return history.filter(r => {


        const rType =
            String(
                val(r, ["type"])
            ).toLowerCase();


        if (
            type === "stockIn" &&
            ![
                "stock in",
                "stockin"
            ].includes(rType)
        ) {

            return false;

        }


        if (
            type === "stockOut" &&
            ![
                "stock issue",
                "stock out",
                "stockout"
            ].includes(rType)
        ) {

            return false;

        }


        const date =
            String(
                val(
                    r,
                    [
                        "date",
                        "transactionDate",
                        "transaction_date"
                    ]
                )
            );


        if (
            fromDate &&
            date &&
            date < fromDate
        ) {

            return false;

        }


        if (
            toDate &&
            date &&
            date > toDate
        ) {

            return false;

        }


        const recordCode =
            String(
                val(
                    r,
                    [
                        "itemCode",
                        "item_code",
                        "code"
                    ]
                )
            ).trim();


        if (
            itemCode &&
            recordCode !== itemCode
        ) {

            return false;

        }


        if (
            department &&
            String(
                val(
                    r,
                    ["department"]
                )
            ).trim() !== department
        ) {

            return false;

        }


        return true;

    });

}


// =====================================
// STOCK IN REPORT
// =====================================

function stockInReport(
    fromDate,
    toDate,
    itemCode,
    department
) {

    setTitles(
        "Stock In Report"
    );


    setHead([
        "Item Code",
        "Item Name",
        "Date",
        "Quantity",
        "Unit Cost",
        "Total Cost"
    ]);


    let rows =
        filteredHistory(
            "stockIn",
            fromDate,
            toDate,
            itemCode,
            department
        );


    let qty = 0;

    let cost = 0;


    rows.forEach(r => {

        let q =
            num(
                val(
                    r,
                    [
                        "quantity",
                        "qty"
                    ]
                )
            );


        let c =
            num(
                val(
                    r,
                    [
                        "totalCost",
                        "total_cost"
                    ]
                )
            );


        qty += q;

        cost += c;


        addRow([

            val(
                r,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ]
            ),

            val(
                r,
                [
                    "itemName",
                    "item_name",
                    "name"
                ]
            ),

            val(
                r,
                [
                    "date",
                    "transactionDate",
                    "transaction_date"
                ]
            ),

            q,

            val(
                r,
                [
                    "unitCost",
                    "unit_cost"
                ]
            ),

            c || "-"

        ]);

    });


    showSummary(
        rows.length,
        qty,
        cost
    );

}


// =====================================
// STOCK OUT REPORT
// =====================================

function stockOutReport(
    fromDate,
    toDate,
    itemCode,
    department
) {

    setTitles(
        "Stock Out Report"
    );


    setHead([
        "Item Code",
        "Item Name",
        "Department",
        "Date",
        "Quantity"
    ]);


    let rows =
        filteredHistory(
            "stockOut",
            fromDate,
            toDate,
            itemCode,
            department
        );


    let qty = 0;


    rows.forEach(r => {

        let q =
            num(
                val(
                    r,
                    [
                        "quantity",
                        "qty"
                    ]
                )
            );


        qty += q;


        addRow([

            val(
                r,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ]
            ),

            val(
                r,
                [
                    "itemName",
                    "item_name",
                    "name"
                ]
            ),

            val(
                r,
                [
                    "department"
                ]
            ),

            val(
                r,
                [
                    "date",
                    "transactionDate",
                    "transaction_date"
                ]
            ),

            q

        ]);

    });


    showSummary(
        rows.length,
        qty,
        0
    );

}


// =====================================
// CURRENT STOCK REPORT
// =====================================

function currentStockReport(itemCode) {

    setTitles(
        "Current Stock Report"
    );


    setHead([
        "Item Code",
        "Item Name",
        "Unit",
        "Current Stock",
        "Minimum Stock",
        "Low Stock Status"
    ]);


    let rows =
        items.filter(i => {

            if (!itemCode) {
                return true;
            }


            return String(
                val(
                    i,
                    [
                        "code",
                        "itemCode",
                        "item_code",
                        "id"
                    ]
                )
            ).trim() === itemCode;

        });


    rows.forEach(i => {

        let stock =
            currentStock(i);


        let min =
            num(
                val(
                    i,
                    [
                        "minimumStock",
                        "minimum_stock",
                        "minimum_Stock",
                        "minStock"
                    ]
                )
            );


        addRow([

            val(
                i,
                [
                    "code",
                    "itemCode",
                    "item_code",
                    "id"
                ]
            ),

            val(
                i,
                [
                    "itemName",
                    "item_name",
                    "name"
                ]
            ),

            val(
                i,
                [
                    "unit"
                ]
            ),

            stock,

            min,

            stock <= min
                ? "LOW STOCK"
                : "OK"

        ]);

    });


    showSummary(

        rows.length,

        rows.reduce(
            (s, i) =>
                s + currentStock(i),
            0
        ),

        0

    );

}


// =====================================
// COST REPORT
// =====================================

function costReport(itemCode) {

    setTitles(
        "Cost Report"
    );


    setHead([
        "Item Code",
        "Item Name",
        "Total Stock In Quantity",
        "Total Cost",
        "Average Unit Cost"
    ]);


    let map = {};


    filteredHistory(
        "stockIn",
        "",
        "",
        itemCode,
        ""
    ).forEach(r => {


        let code =
            String(
                val(
                    r,
                    [
                        "itemCode",
                        "item_code",
                        "code"
                    ]
                )
            );


        if (!map[code]) {

            map[code] = {

                name:
                    val(
                        r,
                        [
                            "itemName",
                            "item_name",
                            "name"
                        ]
                    ),

                qty: 0,

                cost: 0

            };

        }


        map[code].qty +=
            num(
                val(
                    r,
                    [
                        "quantity",
                        "qty"
                    ]
                )
            );


        map[code].cost +=
            num(
                val(
                    r,
                    [
                        "totalCost",
                        "total_cost"
                    ]
                )
            );

    });


    let total = 0;

    let qty = 0;


    Object.keys(map).forEach(
        code => {

            let x =
                map[code];


            total += x.cost;

            qty += x.qty;


            addRow([

                code,

                x.name,

                x.qty,

                x.cost,

                x.qty
                    ? (
                        x.cost /
                        x.qty
                    ).toFixed(2)
                    : "0"

            ]);

        }
    );


    addRow([
        "",
        "OVERALL TOTAL",
        qty,
        total,
        qty
            ? (
                total / qty
            ).toFixed(2)
            : "0"
    ]);


    showSummary(
        Object.keys(map).length,
        qty,
        total
    );

}


// =====================================
// GET DEMAND MONTH
// =====================================
//
// IMPORTANT:
// demand_month کو سب سے پہلے لیا جائے گا.
// generate_date/date صرف fallback ہے.
// اس سے June کی demand اگر September میں
// generate ہوئی ہو تو بھی June ہی رہے گی.
// =====================================

function getDemandMonth(record) {

    const explicitMonth =
        String(
            record?.demand_month ??
            record?.demandMonth ??
            record?.month ??
            ""
        ).trim();


    if (explicitMonth) {

        return explicitMonth
            .substring(0, 7);

    }


    const fallbackDate =
        val(
            record,
            [
                "date",
                "generate_date",
                "generateDate"
            ]
        );


    return getMonthKeyFromDate(
        fallbackDate
    );

}


// =====================================
// GET DEMAND ITEMS
// =====================================

function getDemandItems(record) {

    const list =
        record?.demand_items ??
        record?.demandItems ??
        record?.items ??
        record?.demands;


    if (Array.isArray(list)) {

        return list;

    }


    return [];

}


// =====================================
// DEMAND ITEM CODE
// =====================================

function getDemandItemCode(item) {

    return String(
        val(
            item,
            [
                "itemCode",
                "item_code",
                "code",
                "item_id",
                "itemID",
                "itemId"
            ]
        )
    ).trim();

}


// =====================================
// DEMAND ITEM NAME
// =====================================

function getDemandItemName(item) {

    return val(
        item,
        [
            "itemName",
            "item_name",
            "name"
        ]
    );

}


// =====================================
// DEMAND QUANTITY
// =====================================

function getDemandQuantity(item) {

    return num(
        val(
            item,
            [
                "final_demand",
                "finalDemand",
                "approved_qty",
                "approvedQty",
                "demand_qty",
                "demandQty",
                "demand_quantity",
                "demandQuantity",
                "quantity",
                "qty",
                "demand"
            ]
        )
    );

}


// =====================================
// PENDING DEMAND
// =====================================

function getPendingDemand(item) {

    return num(
        val(
            item,
            [
                "pendingDemand",
                "pending_demand",
                "pending",
                "pendingQty",
                "pending_qty"
            ]
        )
    );

}


// =====================================
// PENDING PO
// =====================================

function getPendingPO(item) {

    return num(
        val(
            item,
            [
                "pendingPO",
                "pending_po",
                "pendingPo",
                "poPending",
                "po_pending"
            ]
        )
    );

}


// =====================================
// MONTHLY DEMAND REPORT
// =====================================

function monthlyDemandReport(
    demandMonth,
    itemCode
) {

    // ---------------------------------
    // TITLE
    // ---------------------------------

    setTitles(
        "Monthly Demand Report - " +
        formatMonth(demandMonth)
    );


    // ---------------------------------
    // TABLE HEAD
    // ---------------------------------

    setHead([

        "Item Code",

        "Item Name",

        "Demand",

        "Received Demand",

        "Demand vs Received",

        "Pending Demand",

        "Pending PO"

    ]);


    let map = {};


    // =================================
    // 1. GET DEMAND FOR SELECTED MONTH
    // =================================

    demandHistory.forEach(record => {

        const recordMonth =
            getDemandMonth(record);


        // صرف selected demand month
        if (
            recordMonth !== demandMonth
        ) {

            return;

        }


        const demandItems =
            getDemandItems(record);


        // ---------------------------------
        // NORMAL NESTED DEMAND DATA
        // ---------------------------------

        if (demandItems.length > 0) {

            demandItems.forEach(item => {

                const code =
                    getDemandItemCode(item);


                if (!code) {

                    return;

                }


                if (
                    itemCode &&
                    code !== itemCode
                ) {

                    return;

                }


                if (!map[code]) {

                    map[code] = {

                        name:
                            getDemandItemName(
                                item
                            ),

                        demand: 0,

                        received: 0,

                        pendingPO: 0

                    };

                }


                // Demand
                map[code].demand +=
                    getDemandQuantity(item);


                // Pending PO
                map[code].pendingPO +=
                    getPendingPO(item);

            });


            return;

        }


        // ---------------------------------
        // FALLBACK OLD FORMAT
        // ---------------------------------

        const code =
            String(
                val(
                    record,
                    [
                        "itemCode",
                        "item_code",
                        "code",
                        "id"
                    ]
                )
            ).trim();


        if (!code) {

            return;

        }


        if (
            itemCode &&
            code !== itemCode
        ) {

            return;

        }


        if (!map[code]) {

            map[code] = {

                name:
                    val(
                        record,
                        [
                            "itemName",
                            "item_name",
                            "name"
                        ]
                    ),

                demand: 0,

                received: 0,

                pendingPO: 0

            };

        }


        map[code].demand +=
            num(
                val(
                    record,
                    [
                        "final_demand",
                        "finalDemand",
                        "approved_qty",
                        "approvedQty",
                        "demand",
                        "quantity",
                        "qty"
                    ]
                )
            );


        map[code].pendingPO +=
            num(
                val(
                    record,
                    [
                        "pendingPO",
                        "pending_po",
                        "pendingPo",
                        "poPending"
                    ]
                )
            );

    });


    // =================================
    // 2. CALCULATE RECEIVED DEMAND
    // =================================
    //
    // Selected month کے آخر تک کی
    // Stock In quantity count ہوگی.
    //
    // Example:
    // June Demand = 1000
    // June Stock In = 700
    //
    // Received = 700
    // Difference = -300
    // Pending = 300
    //
    // اگر Stock In = 1200
    //
    // Received = 1200
    // Difference = +200
    // Pending = 0
    // =================================

    history.forEach(r => {

        // صرف Stock In
        const type =
            String(
                val(r, ["type"])
            ).toLowerCase();


        if (
            type !== "stock in" &&
            type !== "stockin"
        ) {

            return;

        }


        const code =
            String(
                val(
                    r,
                    [
                        "itemCode",
                        "item_code",
                        "code"
                    ]
                )
            ).trim();


        if (!code) {

            return;

        }


        if (
            itemCode &&
            code !== itemCode
        ) {

            return;

        }


        // اگر اس item کی demand نہیں ہے
        // تو report میں Stock In کو demand
        // received نہیں سمجھیں گے.
        if (!map[code]) {

            return;

        }


        const stockInDate =
            String(
                val(
                    r,
                    [
                        "date",
                        "transactionDate",
                        "transaction_date"
                    ]
                )
            );


        const stockInMonth =
            getMonthKeyFromDate(
                stockInDate
            );


        // صرف selected month کی Stock In
        if (
            stockInMonth !== demandMonth
        ) {

            return;

        }


        const quantity =
            num(
                val(
                    r,
                    [
                        "quantity",
                        "qty"
                    ]
                )
            );


        map[code].received +=
            quantity;

    });


    // =================================
    // 3. SHOW RESULT
    // =================================

    let totalDemand = 0;

    let totalReceived = 0;

    let totalPending = 0;


    Object.keys(map).forEach(
        code => {

            const x =
                map[code];


            // ---------------------------------
            // DEMAND
            // ---------------------------------

            const demand =
                num(x.demand);


            // ---------------------------------
            // RECEIVED
            // ---------------------------------

            const received =
                num(x.received);


            // ---------------------------------
            // DIFFERENCE
            // ---------------------------------
            //
            // Received - Demand
            //
            // + = زیادہ received
            // - = کم received
            // ---------------------------------

            const difference =
                received - demand;


            // ---------------------------------
            // PENDING DEMAND
            // ---------------------------------
            //
            // Demand - Received
            //
            // اگر negative ہو تو 0
            // ---------------------------------

            const pending =
                Math.max(
                    demand - received,
                    0
                );


            totalDemand +=
                demand;


            totalReceived +=
                received;


            totalPending +=
                pending;


            // ---------------------------------
            // + / - DISPLAY
            // ---------------------------------

            let differenceDisplay;


            if (
                difference > 0
            ) {

                differenceDisplay =
                    "+" +
                    difference;

            } else {

                differenceDisplay =
                    String(difference);

            }


            addRow([

                code,

                x.name,

                demand,

                received,

                differenceDisplay,

                pending,

                x.pendingPO

            ]);

        }
    );


    // =================================
    // SUMMARY
    // =================================

    showSummary(

        Object.keys(map).length,

        totalDemand,

        0

    );


    // =================================
    // NO DATA MESSAGE
    // =================================

    if (
        Object.keys(map).length === 0
    ) {

        addRow([

            "No Data",

            "No Monthly Demand found for " +
            formatMonth(demandMonth),

            "-",

            "-",

            "-",

            "-",

            "-"

        ]);

    }

}



// =====================================
// ALL TRANSACTIONS REPORT
// =====================================

function allTransactionsReport(
    fromDate,
    toDate,
    itemCode,
    department
) {

    setTitles(
        "All Transactions Report"
    );


    setHead([

        "Date",

        "Time",

        "Type",

        "Item Code",

        "Item Name",

        "Department",

        "Quantity",

        "Unit Cost",

        "Total Cost"

    ]);


    let rows =
        filteredHistory(
            "all",
            fromDate,
            toDate,
            itemCode,
            department
        );


    let qty = 0;

    let cost = 0;


    rows.forEach(r => {


        let q =
            num(
                val(
                    r,
                    [
                        "quantity",
                        "qty"
                    ]
                )
            );


        let c =
            num(
                val(
                    r,
                    [
                        "totalCost",
                        "total_cost"
                    ]
                )
            );


        qty += q;

        cost += c;


        addRow([

            val(
                r,
                [
                    "date",
                    "transactionDate",
                    "transaction_date"
                ]
            ),

            val(
                r,
                [
                    "time",
                    "transactionTime",
                    "transaction_time"
                ]
            ),

            val(
                r,
                [
                    "type"
                ]
            ),

            val(
                r,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ]
            ),

            val(
                r,
                [
                    "itemName",
                    "item_name",
                    "name"
                ]
            ),

            val(
                r,
                [
                    "department"
                ]
            ),

            q,

            val(
                r,
                [
                    "unitCost",
                    "unit_cost"
                ]
            ),

            c || "-"

        ]);

    });


    showSummary(
        rows.length,
        qty,
        cost
    );

}


// =====================================
// SHOW SUMMARY
// =====================================

function showSummary(
    entries,
    quantity,
    cost
) {

    document.getElementById(
        "totalEntries"
    ).innerHTML =
        entries;


    document.getElementById(
        "reportQuantity"
    ).innerHTML =
        quantity;


    document.getElementById(
        "reportCost"
    ).innerHTML =
        cost;

}


// =====================================
// CLEAR REPORT
// =====================================

function clearReport() {

    document.getElementById(
        "reportType"
    ).value = "stockIn";


    document.getElementById(
        "fromDate"
    ).value = "";


    document.getElementById(
        "toDate"
    ).value = "";


    document.getElementById(
        "demandMonth"
    ).value =
        getTodayMonthKey();


    document.getElementById(
        "itemCode"
    ).value = "";


    document.getElementById(
        "department"
    ).value = "";


    document.getElementById(
        "reportBody"
    ).innerHTML = "";


    document.getElementById(
        "reportHead"
    ).innerHTML = "";


    resetSummary();


    reportTypeChanged();


    setTitles(
        "Stock In Report"
    );

}


// =====================================
// PRINT REPORT
// =====================================

function printReport() {

    window.print();

}


// =====================================
// PAGE START
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {


        // ---------------------------------
        // REPORT TYPE CHANGE
        // ---------------------------------

        document.getElementById(
            "reportType"
        ).addEventListener(
            "change",
            reportTypeChanged
        );


        // ---------------------------------
        // DEMAND MONTH CHANGE
        // ---------------------------------

        document.getElementById(
            "demandMonth"
        ).addEventListener(
            "change",
            function () {

                if (
                    document.getElementById(
                        "reportType"
                    ).value === "monthlyDemand"
                ) {

                    const month =
                        this.value;


                    if (month) {

                        setTitles(
                            "Monthly Demand Report - " +
                            formatMonth(month)
                        );

                    }

                }

            }
        );


        // ---------------------------------
        // DEFAULT MONTH
        // ---------------------------------

        document.getElementById(
            "demandMonth"
        ).value =
            getTodayMonthKey();


        // ---------------------------------
        // DEFAULT TYPE
        // ---------------------------------

        reportTypeChanged();


        setTitles(
            "Stock In Report"
        );


        // ---------------------------------
        // LOAD SUPABASE
        // ---------------------------------

        await loadReportsData();


        console.log(
            "Reports page ready."
        );

    }
);
