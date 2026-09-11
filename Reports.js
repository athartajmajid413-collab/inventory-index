// ============================================================
// REPORTS.JS
// SUPABASE VERSION
// ============================================================
// IMPORTANT:
// This file uses Supabase only.
// No LocalStorage is used for report data.
//
// Tables used:
// 1. items
// 2. stock_in
// 3. stock_issue
// 4. demand_history
//
// Monthly Demand IMPORTANT:
// Demand is grouped by demand_month,
// NOT by generate_date/date.
//
// Example:
// demand_month = 2026-06
// generate_date = 2026-09-11
//
// Report will show this Demand in June 2026.
// ============================================================
const REPORT_SUPABASE_URL =
    "https://tncmmkyrpzlkupdnkyqm.supabase.co";

const REPORT_SUPABASE_KEY =
    "sb_publishable_e6j_EkJescicSS3nEOnscg_INwxeukT";

// ============================================================
// GLOBAL DATA
// ============================================================

let history = [];
let items = [];
let demandHistory = [];


// ============================================================
// BASIC HELPERS
// ============================================================

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


function num(value) {

    let n = Number(value);

    return Number.isFinite(n) ? n : 0;
}


// ============================================================
// ITEM CODE
// ============================================================

function getItemCode(obj) {

    return String(
        val(
            obj,
            [
                "itemCode",
                "item_code",
                "code",
                "itemId",
                "item_id",
                "id"
            ],
            ""
        )
    ).trim();

}


// ============================================================
// ITEM NAME
// ============================================================

function getItemName(obj) {

    return val(
        obj,
        [
            "itemName",
            "item_name",
            "name"
        ],
        ""
    );

}


// ============================================================
// DATE
// ============================================================

function getRecordDate(obj) {

    return String(
        val(
            obj,
            [
                "date",
                "transactionDate",
                "transaction_date"
            ],
            ""
        )
    ).trim();

}


// ============================================================
// DEMAND MONTH
// ============================================================
// IMPORTANT:
// This function ALWAYS gives priority to demand_month.
//
// This prevents a June Demand generated in September
// from appearing in September.
// ============================================================

function getDemandMonth(record) {

    let month = String(
        val(
            record,
            [
                "demand_month",
                "demandMonth",
                "month"
            ],
            ""
        )
    ).trim();


    // --------------------------------------------------------
    // If demand_month exists, use it directly.
    // --------------------------------------------------------

    if (month) {

        // YYYY-MM
        if (/^\d{4}-\d{2}$/.test(month)) {
            return month;
        }

        // YYYY-M
        if (/^\d{4}-\d{1}$/.test(month)) {

            let parts = month.split("-");

            return (
                parts[0] +
                "-" +
                String(parts[1]).padStart(2, "0")
            );
        }

        // Full date YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}/.test(month)) {

            return month.substring(0, 7);
        }
    }


    // --------------------------------------------------------
    // FALLBACK ONLY
    // --------------------------------------------------------
    // Old records may not have demand_month.
    // Then use date / generate_date.
    // --------------------------------------------------------

    let date = String(
        val(
            record,
            [
                "date",
                "generate_date",
                "generateDate"
            ],
            ""
        )
    ).trim();


    if (/^\d{4}-\d{2}/.test(date)) {

        return date.substring(0, 7);
    }


    return "";
}


// ============================================================
// GET DEMAND ITEMS
// ============================================================
// Demand History stores the item list inside:
// demand_items
// or
// items
//
// Some older records may use:
// demandItems
// ============================================================

function getDemandItems(record) {

    if (!record) {
        return [];
    }


    let list =
        record.demand_items ??
        record.demandItems ??
        record.items ??
        record.demands ??
        [];


    // --------------------------------------------------------
    // If database returned JSON as text
    // --------------------------------------------------------

    if (typeof list === "string") {

        try {

            list = JSON.parse(list);

        }
        catch (error) {

            console.warn(
                "Could not parse demand item JSON:",
                error
            );

            return [];
        }

    }


    return Array.isArray(list)
        ? list
        : [];

}


// ============================================================
// GET DEMAND ITEM CODE
// ============================================================

function getDemandItemCode(item) {

    return String(
        val(
            item,
            [
                "itemCode",
                "item_code",
                "code",
                "itemId",
                "item_id",
                "id"
            ],
            ""
        )
    ).trim();

}


// ============================================================
// GET DEMAND ITEM NAME
// ============================================================

function getDemandItemName(item) {

    return val(
        item,
        [
            "itemName",
            "item_name",
            "name"
        ],
        ""
    );

}


// ============================================================
// GET DEMAND QUANTITY
// ============================================================

function getDemandQuantity(item) {

    return num(
        val(
            item,
            [
                "finalDemand",
                "final_demand",
                "approvedQty",
                "approved_qty",
                "approvedQuantity",
                "demandQuantity",
                "demand_quantity",
                "demandQty",
                "demand_qty",
                "quantity",
                "qty",
                "demand"
            ],
            0
        )
    );

}


// ============================================================
// GET PENDING DEMAND
// ============================================================

function getPendingDemand(item) {

    return num(
        val(
            item,
            [
                "pendingDemand",
                "pending_demand",
                "pendingQty",
                "pending_qty",
                "pending"
            ],
            0
        )
    );

}


// ============================================================
// GET PENDING PO
// ============================================================

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
            ],
            0
        )
    );

}


// ============================================================
// FIND ITEM
// ============================================================

function getItem(code) {

    let c = String(code || "").trim();


    return items.find(
        x =>
            String(
                val(
                    x,
                    [
                        "code",
                        "itemCode",
                        "item_code",
                        "id"
                    ],
                    ""
                )
            ).trim() === c
    );

}


// ============================================================
// CURRENT STOCK
// ============================================================

function currentStock(item) {

    if (!item) {
        return 0;
    }


    let opening = num(
        val(
            item,
            [
                "openingStock",
                "opening_stock",
                "opening_Stock",
                "openStock",
                "currentStock"
            ],
            0
        )
    );


    let code = String(
        val(
            item,
            [
                "code",
                "itemCode",
                "item_code",
                "id"
            ],
            ""
        )
    ).trim();


    let inQty = 0;
    let outQty = 0;


    history.forEach(record => {

        let recordCode =
            getItemCode(record);


        if (recordCode !== code) {
            return;
        }


        let quantity = num(
            val(
                record,
                [
                    "quantity",
                    "qty"
                ],
                0
            )
        );


        let type =
            String(
                val(
                    record,
                    ["type"],
                    ""
                )
            ).toLowerCase();


        if (
            type === "stock in" ||
            type === "stockin"
        ) {

            inQty += quantity;

        }


        if (
            type === "stock issue" ||
            type === "stock out" ||
            type === "stockout"
        ) {

            outQty += quantity;

        }

    });


    return opening + inQty - outQty;

}


// ============================================================
// REPORT TYPE CHANGE
// ============================================================

function reportTypeChanged() {

    let reportType =
        document.getElementById("reportType");

    if (!reportType) {
        return;
    }


    let type =
        reportType.value;


    let dateEnabled =
        [
            "stockIn",
            "stockOut",
            "all",
            "monthlyDemand"
        ].includes(type);


    let fromDate =
        document.getElementById("fromDate");

    let toDate =
        document.getElementById("toDate");

    let department =
        document.getElementById("department");


    if (fromDate) {
        fromDate.disabled = !dateEnabled;
    }


    if (toDate) {
        toDate.disabled = !dateEnabled;
    }


    if (department) {

        department.disabled =
            !(
                type === "stockOut" ||
                type === "all"
            );

    }

}


// ============================================================
// TITLES
// ============================================================

function setTitles(title) {

    let screenTitle =
        document.getElementById(
            "screenReportTitle"
        );


    let printTitle =
        document.getElementById(
            "printReportTitle"
        );


    let printDate =
        document.getElementById(
            "printDate"
        );


    if (screenTitle) {
        screenTitle.innerHTML = title;
    }


    if (printTitle) {
        printTitle.innerHTML =
            title.toUpperCase();
    }


    if (printDate) {

        let d = new Date();


        printDate.innerHTML =
            `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;

    }

}


// ============================================================
// TABLE HEADER
// ============================================================

function setHead(columns) {

    let head =
        document.getElementById(
            "reportHead"
        );


    if (!head) {
        return;
    }


    head.innerHTML =
        `<tr>
            ${
                columns
                    .map(
                        x =>
                            `<th>${x}</th>`
                    )
                    .join("")
            }
        </tr>`;

}


// ============================================================
// ADD TABLE ROW
// ============================================================

function addRow(values) {

    let body =
        document.getElementById(
            "reportBody"
        );


    if (!body) {
        return;
    }


    let tr =
        document.createElement("tr");


    values.forEach(value => {

        let td =
            document.createElement("td");


        td.textContent =
            value === undefined ||
            value === null ||
            value === ""
                ? "-"
                : value;


        tr.appendChild(td);

    });


    body.appendChild(tr);

}


// ============================================================
// SUMMARY RESET
// ============================================================

function resetSummary() {

    let entries =
        document.getElementById(
            "totalEntries"
        );

    let quantity =
        document.getElementById(
            "reportQuantity"
        );

    let cost =
        document.getElementById(
            "reportCost"
        );


    if (entries) {
        entries.innerHTML = "0";
    }


    if (quantity) {
        quantity.innerHTML = "0";
    }


    if (cost) {
        cost.innerHTML = "0";
    }

}


// ============================================================
// GENERATE REPORT
// ============================================================

function generateReport() {

    let reportType =
        document.getElementById(
            "reportType"
        );


    if (!reportType) {
        return;
    }


    let type =
        reportType.value;


    let fromDate =
        document.getElementById(
            "fromDate"
        )?.value || "";


    let toDate =
        document.getElementById(
            "toDate"
        )?.value || "";


    let itemCode =
        document.getElementById(
            "itemCode"
        )?.value.trim() || "";


    let department =
        document.getElementById(
            "department"
        )?.value || "";


    let body =
        document.getElementById(
            "reportBody"
        );


    if (body) {
        body.innerHTML = "";
    }


    resetSummary();


    if (type === "stockIn") {

        stockInReport(
            fromDate,
            toDate,
            itemCode,
            department
        );

        return;
    }


    if (type === "stockOut") {

        stockOutReport(
            fromDate,
            toDate,
            itemCode,
            department
        );

        return;
    }


    if (type === "currentStock") {

        currentStockReport(
            itemCode
        );

        return;
    }


    if (type === "cost") {

        costReport(
            itemCode
        );

        return;
    }


    if (type === "monthlyDemand") {

        monthlyDemandReport(
            fromDate,
            toDate,
            itemCode
        );

        return;
    }


    allTransactionsReport(
        fromDate,
        toDate,
        itemCode,
        department
    );

}


// ============================================================
// FILTER HISTORY
// ============================================================

function filteredHistory(
    type,
    fromDate,
    toDate,
    itemCode,
    department
) {

    return history.filter(record => {

        let recordType =
            String(
                val(
                    record,
                    ["type"],
                    ""
                )
            ).toLowerCase();


        if (
            type === "stockIn" &&
            ![
                "stock in",
                "stockin"
            ].includes(recordType)
        ) {

            return false;
        }


        if (
            type === "stockOut" &&
            ![
                "stock issue",
                "stock out",
                "stockout"
            ].includes(recordType)
        ) {

            return false;
        }


        let date =
            getRecordDate(record);


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


        if (
            itemCode &&
            getItemCode(record) !==
                itemCode
        ) {

            return false;
        }


        if (
            department &&
            String(
                val(
                    record,
                    ["department"],
                    ""
                )
            ).trim() !==
                department
        ) {

            return false;
        }


        return true;

    });

}


// ============================================================
// STOCK IN REPORT
// ============================================================

function stockInReport(
    fromDate,
    toDate,
    itemCode,
    department
) {

    setTitles(
        "Stock In Report"
    );


    setHead(
        [
            "Item Code",
            "Item Name",
            "Date",
            "Quantity",
            "Unit Cost",
            "Total Cost"
        ]
    );


    let rows =
        filteredHistory(
            "stockIn",
            fromDate,
            toDate,
            itemCode,
            department
        );


    let quantity = 0;
    let cost = 0;


    rows.forEach(record => {

        let q =
            num(
                val(
                    record,
                    [
                        "quantity",
                        "qty"
                    ],
                    0
                )
            );


        let c =
            num(
                val(
                    record,
                    [
                        "totalCost",
                        "total_cost"
                    ],
                    0
                )
            );


        quantity += q;
        cost += c;


        addRow(
            [
                getItemCode(record),
                getItemName(record),
                getRecordDate(record),
                q,
                val(
                    record,
                    [
                        "unitCost",
                        "unit_cost"
                    ],
                    0
                ),
                c || "-"
            ]
        );

    });


    showSummary(
        rows.length,
        quantity,
        cost
    );

}


// ============================================================
// STOCK OUT REPORT
// ============================================================

function stockOutReport(
    fromDate,
    toDate,
    itemCode,
    department
) {

    setTitles(
        "Stock Out Report"
    );


    setHead(
        [
            "Item Code",
            "Item Name",
            "Department",
            "Date",
            "Quantity"
        ]
    );


    let rows =
        filteredHistory(
            "stockOut",
            fromDate,
            toDate,
            itemCode,
            department
        );


    let quantity = 0;


    rows.forEach(record => {

        let q =
            num(
                val(
                    record,
                    [
                        "quantity",
                        "qty"
                    ],
                    0
                )
            );


        quantity += q;


        addRow(
            [
                getItemCode(record),
                getItemName(record),
                val(
                    record,
                    ["department"],
                    ""
                ),
                getRecordDate(record),
                q
            ]
        );

    });


    showSummary(
        rows.length,
        quantity,
        0
    );

}


// ============================================================
// CURRENT STOCK REPORT
// ============================================================

function currentStockReport(
    itemCode
) {

    setTitles(
        "Current Stock Report"
    );


    setHead(
        [
            "Item Code",
            "Item Name",
            "Unit",
            "Current Stock",
            "Minimum Stock",
            "Low Stock Status"
        ]
    );


    let rows =
        items.filter(item => {

            if (!itemCode) {
                return true;
            }


            return String(
                val(
                    item,
                    [
                        "code",
                        "itemCode",
                        "item_code",
                        "id"
                    ],
                    ""
                )
            ).trim() === itemCode;

        });


    let totalStock = 0;


    rows.forEach(item => {

        let stock =
            currentStock(item);


        let minimum =
            num(
                val(
                    item,
                    [
                        "minimumStock",
                        "minimum_stock",
                        "minimum_Stock",
                        "minStock"
                    ],
                    0
                )
            );


        totalStock += stock;


        addRow(
            [
                val(
                    item,
                    [
                        "code",
                        "itemCode",
                        "item_code",
                        "id"
                    ],
                    ""
                ),
                getItemName(item),
                val(
                    item,
                    ["unit"],
                    ""
                ),
                stock,
                minimum,
                stock <= minimum
                    ? "LOW STOCK"
                    : "OK"
            ]
        );

    });


    showSummary(
        rows.length,
        totalStock,
        0
    );

}


// ============================================================
// COST REPORT
// ============================================================

function costReport(
    itemCode
) {

    setTitles(
        "Cost Report"
    );


    setHead(
        [
            "Item Code",
            "Item Name",
            "Total Stock In Quantity",
            "Total Cost",
            "Average Unit Cost"
        ]
    );


    let map = {};


    let rows =
        filteredHistory(
            "stockIn",
            "",
            "",
            itemCode,
            ""
        );


    rows.forEach(record => {

        let code =
            getItemCode(record);


        if (!map[code]) {

            map[code] = {

                name:
                    getItemName(record),

                quantity: 0,

                cost: 0

            };

        }


        map[code].quantity +=
            num(
                val(
                    record,
                    [
                        "quantity",
                        "qty"
                    ],
                    0
                )
            );


        map[code].cost +=
            num(
                val(
                    record,
                    [
                        "totalCost",
                        "total_cost"
                    ],
                    0
                )
            );

    });


    let totalCost = 0;
    let totalQuantity = 0;


    Object.keys(map).forEach(code => {

        let x =
            map[code];


        totalCost +=
            x.cost;


        totalQuantity +=
            x.quantity;


        addRow(
            [
                code,
                x.name,
                x.quantity,
                x.cost,
                x.quantity
                    ? (
                        x.cost /
                        x.quantity
                    ).toFixed(2)
                    : "0"
            ]
        );

    });


    addRow(
        [
            "",
            "OVERALL TOTAL",
            totalQuantity,
            totalCost,
            totalQuantity
                ? (
                    totalCost /
                    totalQuantity
                ).toFixed(2)
                : "0"
        ]
    );


    showSummary(
        Object.keys(map).length,
        totalQuantity,
        totalCost
    );

}


// ============================================================
// MONTHLY DEMAND REPORT
// ============================================================
// IMPORTANT:
//
// Demand is grouped by:
//     demand_month
//
// NOT:
//     generate_date
//
// Example:
//
// demand_month  = 2026-06
// generate_date = 2026-09-11
//
// Result:
// June Demand
// ============================================================

function monthlyDemandReport(
    fromDate,
    toDate,
    itemCode
) {

    setTitles(
        "Monthly Demand Report"
    );


    setHead(
        [
            "Item Code",
            "Item Name",
            "Demand",
            "Pending Demand",
            "Pending PO"
        ]
    );


    let map = {};


    // --------------------------------------------------------
    // Convert selected date range to month range
    // --------------------------------------------------------

    let fromMonth = "";


    let toMonth = "";


    if (fromDate) {

        fromMonth =
            fromDate.substring(0, 7);

    }


    if (toDate) {

        toMonth =
            toDate.substring(0, 7);

    }


    // --------------------------------------------------------
    // Read demand_history
    // --------------------------------------------------------

    demandHistory.forEach(record => {

        // ====================================================
        // CRITICAL:
        // Use demand_month.
        // Do NOT use generate_date here.
        // ====================================================

        let demandMonth =
            getDemandMonth(record);


        if (!demandMonth) {

            return;

        }


        // ----------------------------------------------------
        // Date range filtering
        // ----------------------------------------------------

        if (
            fromMonth &&
            demandMonth < fromMonth
        ) {

            return;

        }


        if (
            toMonth &&
            demandMonth > toMonth
        ) {

            return;

        }


        // ----------------------------------------------------
        // Get nested demand items
        // ----------------------------------------------------

        let demandItems =
            getDemandItems(record);


        if (
            !Array.isArray(
                demandItems
            )
        ) {

            return;

        }


        // ----------------------------------------------------
        // Process each item
        // ----------------------------------------------------

        demandItems.forEach(item => {

            let code =
                getDemandItemCode(item);


            if (!code) {
                return;
            }


            // ------------------------------------------------
            // Item filter
            // ------------------------------------------------

            if (
                itemCode &&
                code !== itemCode
            ) {

                return;

            }


            if (!map[code]) {

                map[code] = {

                    name:
                        getDemandItemName(item),

                    demand: 0,

                    pending: 0,

                    po: 0

                };

            }


            // ------------------------------------------------
            // Demand
            // ------------------------------------------------

            map[code].demand +=
                getDemandQuantity(item);


            // ------------------------------------------------
            // Pending Demand
            // ------------------------------------------------

            map[code].pending +=
                getPendingDemand(item);


            // ------------------------------------------------
            // Pending PO
            // ------------------------------------------------

            map[code].po +=
                getPendingPO(item);

        });

    });


    // --------------------------------------------------------
    // Display
    // --------------------------------------------------------

    let totalDemand = 0;


    let codes =
        Object.keys(map);


    codes.forEach(code => {

        let x =
            map[code];


        totalDemand +=
            x.demand;


        addRow(
            [
                code,
                x.name,
                x.demand,
                x.pending,
                x.po
            ]
        );

    });


    showSummary(
        codes.length,
        totalDemand,
        0
    );

}


// ============================================================
// ALL TRANSACTIONS REPORT
// ============================================================

function allTransactionsReport(
    fromDate,
    toDate,
    itemCode,
    department
) {

    setTitles(
        "All Transactions Report"
    );


    setHead(
        [
            "Date",
            "Time",
            "Type",
            "Item Code",
            "Item Name",
            "Department",
            "Quantity",
            "Unit Cost",
            "Total Cost"
        ]
    );


    let rows =
        filteredHistory(
            "all",
            fromDate,
            toDate,
            itemCode,
            department
        );


    let quantity = 0;
    let cost = 0;


    rows.forEach(record => {

        let q =
            num(
                val(
                    record,
                    [
                        "quantity",
                        "qty"
                    ],
                    0
                )
            );


        let c =
            num(
                val(
                    record,
                    [
                        "totalCost",
                        "total_cost"
                    ],
                    0
                )
            );


        quantity += q;
        cost += c;


        addRow(
            [
                getRecordDate(record),

                val(
                    record,
                    [
                        "time",
                        "transactionTime",
                        "transaction_time"
                    ],
                    ""
                ),

                val(
                    record,
                    ["type"],
                    ""
                ),

                getItemCode(record),

                getItemName(record),

                val(
                    record,
                    ["department"],
                    ""
                ),

                q,

                val(
                    record,
                    [
                        "unitCost",
                        "unit_cost"
                    ],
                    0
                ),

                c || "-"
            ]
        );

    });


    showSummary(
        rows.length,
        quantity,
        cost
    );

}


// ============================================================
// SHOW SUMMARY
// ============================================================

function showSummary(
    entries,
    quantity,
    cost
) {

    let totalEntries =
        document.getElementById(
            "totalEntries"
        );


    let reportQuantity =
        document.getElementById(
            "reportQuantity"
        );


    let reportCost =
        document.getElementById(
            "reportCost"
        );


    if (totalEntries) {

        totalEntries.innerHTML =
            entries;

    }


    if (reportQuantity) {

        reportQuantity.innerHTML =
            quantity;

    }


    if (reportCost) {

        reportCost.innerHTML =
            cost;

    }

}


// ============================================================
// SUPABASE LOAD
// ============================================================

async function loadReportsFromSupabase() {

    console.log(
        "====================================="
    );


    console.log(
        "REPORTS: Loading Supabase data..."
    );


    console.log(
        "====================================="
    );


    try {

        // ----------------------------------------------------
        // Check Supabase function
        // ----------------------------------------------------

        if (
            typeof supabaseRequest !==
            "function"
        ) {

            throw new Error(
                "supabaseRequest() is not available. " +
                "Make sure supabase.js is loaded before Reports.js."
            );

        }


        // ====================================================
        // ITEMS
        // ====================================================

        let itemsResult =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?select=*"
            );


        if (itemsResult?.success) {

            items =
                itemsResult.data || [];

        }
        else {

            items = [];


            console.error(
                "Items Load Error:",
                itemsResult?.error
            );

        }


        // ====================================================
        // STOCK IN
        // ====================================================

        let stockInResult =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*"
            );


        // ====================================================
        // STOCK ISSUE
        // ====================================================

        let stockOutResult =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*"
            );


        // ====================================================
        // BUILD COMMON HISTORY ARRAY
        // ====================================================

        history = [];


        // ----------------------------------------------------
        // Stock In
        // ----------------------------------------------------

        if (
            stockInResult?.success
        ) {

            let data =
                stockInResult.data || [];


            data.forEach(record => {

                history.push({

                    id:
                        record.id,

                    date:
                        record.date,

                    time:
                        record.time,

                    itemCode:
                        record.item_code ??
                        record.itemCode ??
                        record.code,

                    itemName:
                        record.item_name ??
                        record.itemName,

                    unit:
                        record.unit,

                    source:
                        record.source,

                    supplier:
                        record.supplier,

                    location:
                        record.location,

                    department:
                        record.department,

                    quantity:
                        num(
                            record.quantity
                        ),

                    unitCost:
                        num(
                            record.unit_cost ??
                            record.unitCost ??
                            record.latest_rate ??
                            record.rate
                        ),

                    totalCost:
                        num(
                            record.total_cost ??
                            record.totalCost
                        ),

                    type:
                        "Stock In"

                });

            });

        }
        else {

            console.error(
                "Stock In Load Error:",
                stockInResult?.error
            );

        }


        // ----------------------------------------------------
        // Stock Issue
        // ----------------------------------------------------

        if (
            stockOutResult?.success
        ) {

            let data =
                stockOutResult.data || [];


            data.forEach(record => {

                history.push({

                    id:
                        record.id,

                    date:
                        record.date,

                    time:
                        record.time,

                    itemCode:
                        record.item_code ??
                        record.itemCode ??
                        record.code,

                    itemName:
                        record.item_name ??
                        record.itemName,

                    unit:
                        record.unit,

                    source:
                        record.source,

                    supplier:
                        record.supplier,

                    location:
                        record.location,

                    department:
                        record.department,

                    quantity:
                        num(
                            record.quantity
                        ),

                    unitCost:
                        0,

                    totalCost:
                        0,

                    type:
                        "Stock Issue"

                });

            });

        }
        else {

            console.error(
                "Stock Issue Load Error:",
                stockOutResult?.error
            );

        }


        // ====================================================
        // DEMAND HISTORY
        // ====================================================

        let demandResult =
            await supabaseRequest(
                "demand_history",
                "GET",
                null,
                "?select=*"
            );


        if (
            demandResult?.success
        ) {

            demandHistory =
                demandResult.data || [];

        }
        else {

            demandHistory = [];


            console.error(
                "Demand History Load Error:",
                demandResult?.error
            );

        }


        // ====================================================
        // DEBUG INFORMATION
        // ====================================================

        console.log(
            "Reports Supabase Items:",
            items.length
        );


        console.log(
            "Reports Stock In:",
            history.filter(
                x =>
                    x.type ===
                    "Stock In"
            ).length
        );


        console.log(
            "Reports Stock Issue:",
            history.filter(
                x =>
                    x.type ===
                    "Stock Issue"
            ).length
        );


        console.log(
            "Reports Demand History:",
            demandHistory.length
        );


        // ----------------------------------------------------
        // Show demand months in console
        // ----------------------------------------------------

        demandHistory.forEach(
            record => {

                console.log(
                    "Demand Record:",
                    {
                        id:
                            record.id,

                        demand_no:
                            record.demand_no,

                        demand_month:
                            record.demand_month,

                        generate_date:
                            record.generate_date,

                        items:
                            getDemandItems(
                                record
                            ).length
                    }
                );

            }
        );


        console.log(
            "====================================="
        );


        console.log(
            "REPORTS: Supabase data loaded."
        );


        console.log(
            "=====================================");


        // ====================================================
        // DEFAULT REPORT
        // ====================================================

        reportTypeChanged();


        setTitles(
            "Stock In Report"
        );


    }
    catch (error) {

        console.error(
            "Reports Supabase Load Error:",
            error
        );


        alert(
            "Reports data load error.\n\n" +
            (
                error.message ||
                error
            )
        );

    }

}


// ============================================================
// CLEAR REPORT
// ============================================================

function clearReport() {

    let reportType =
        document.getElementById(
            "reportType"
        );


    let fromDate =
        document.getElementById(
            "fromDate"
        );


    let toDate =
        document.getElementById(
            "toDate"
        );


    let itemCode =
        document.getElementById(
            "itemCode"
        );


    let department =
        document.getElementById(
            "department"
        );


    let body =
        document.getElementById(
            "reportBody"
        );


    let head =
        document.getElementById(
            "reportHead"
        );


    if (reportType) {
        reportType.value =
            "stockIn";
    }


    if (fromDate) {
        fromDate.value = "";
    }


    if (toDate) {
        toDate.value = "";
    }


    if (itemCode) {
        itemCode.value = "";
    }


    if (department) {
        department.value = "";
    }


    if (body) {
        body.innerHTML = "";
    }


    if (head) {
        head.innerHTML = "";
    }


    resetSummary();


    reportTypeChanged();


    setTitles(
        "Stock In Report"
    );

}


// ============================================================
// PRINT REPORT
// ============================================================

function printReport() {

    window.print();

}


// ============================================================
// PAGE LOAD
// ============================================================

window.addEventListener(
    "load",
    async function () {

        console.log(
            "Reports page loaded."
        );


        await loadReportsFromSupabase();

    }
);
