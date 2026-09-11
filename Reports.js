// =====================================
// REPORTS.JS
// SUPABASE VERSION
// NO LOCALSTORAGE
// =====================================


// =====================================
// SUPABASE SETTINGS
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

    for (const key of keys) {

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

    const n = Number(value);

    return Number.isFinite(n) ? n : 0;
}


// =====================================
// MONTH HELPERS
// =====================================

function getTodayMonthKey() {

    const d = new Date();

    return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0")
    );
}


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

    return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0")
    );
}


function formatMonth(monthKey) {

    if (!monthKey) {
        return "";
    }

    const parts = String(monthKey).split("-");

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
// DATE HELPER
// =====================================

function normalizeDate(value) {

    if (!value) {
        return "";
    }

    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return text;
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
        return text.substring(0, 10);
    }

    const d = new Date(text);

    if (isNaN(d.getTime())) {
        return "";
    }

    return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0")
    );
}


// =====================================
// GET ITEM
// =====================================

function getItem(code) {

    const wanted = String(code || "").trim();

    return items.find(item => {

        const itemCode = String(
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

        return itemCode === wanted;
    });
}


// =====================================
// CURRENT STOCK
// =====================================

function currentStock(item) {

    if (!item) {
        return 0;
    }

    const itemCode = String(
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


    const opening = num(
        val(
            item,
            [
                "openingStock",
                "opening_Stock",
                "opening_stock",
                "openStock",
                "currentStock"
            ]
        )
    );


    let stockIn = 0;
    let stockOut = 0;


    history.forEach(record => {

        const code = String(
            val(
                record,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ]
            )
        ).trim();


        if (code !== itemCode) {
            return;
        }


        const quantity = num(
            val(
                record,
                [
                    "quantity",
                    "qty"
                ]
            )
        );


        const type = String(
            val(record, ["type"])
        ).toLowerCase();


        if (
            type === "stock in" ||
            type === "stockin"
        ) {
            stockIn += quantity;
        }


        if (
            type === "stock issue" ||
            type === "stock out" ||
            type === "stockout"
        ) {
            stockOut += quantity;
        }

    });


    return opening + stockIn - stockOut;
}


// =====================================
// LOAD DATA FROM SUPABASE
// =====================================

async function loadReportsData() {

    console.log(
        "====================================="
    );

    console.log(
        "REPORTS: Loading data from Supabase..."
    );


    try {

        if (
            typeof supabaseRequest !==
            "function"
        ) {

            throw new Error(
                "supabaseRequest() is not available. Make sure supabase.js is loaded before Reports.js."
            );
        }


        // =================================
        // ITEMS
        // =================================

        const itemsResult =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?select=*"
            );


        console.log(
            "Reports Items Result:",
            itemsResult
        );


        if (
            itemsResult &&
            itemsResult.success
        ) {

            items =
                Array.isArray(
                    itemsResult.data
                )
                    ? itemsResult.data
                    : [];

        } else {

            items = [];

            console.error(
                "Items Load Error:",
                itemsResult
            );
        }


        // =================================
        // STOCK IN
        // =================================

        const stockInResult =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*"
            );


        console.log(
            "Reports Stock In Result:",
            stockInResult
        );


        // =================================
        // STOCK OUT
        // =================================

        const stockOutResult =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*"
            );


        console.log(
            "Reports Stock Out Result:",
            stockOutResult
        );


        // =================================
        // CLEAR HISTORY
        // =================================

        history = [];


        // =================================
        // STOCK IN → HISTORY
        // =================================

        if (
            stockInResult &&
            stockInResult.success
        ) {

            const stockInData =
                Array.isArray(
                    stockInResult.data
                )
                    ? stockInResult.data
                    : [];


            stockInData.forEach(record => {

                history.push({

                    id: record.id,

                    date: val(
                        record,
                        [
                            "date",
                            "transaction_date"
                        ]
                    ),

                    time: val(
                        record,
                        [
                            "time",
                            "transaction_time"
                        ]
                    ),

                    itemCode: val(
                        record,
                        [
                            "item_code",
                            "itemCode",
                            "code"
                        ]
                    ),

                    itemName: val(
                        record,
                        [
                            "item_name",
                            "itemName",
                            "name"
                        ]
                    ),

                    unit: val(
                        record,
                        [
                            "unit"
                        ]
                    ),

                    source: val(
                        record,
                        [
                            "source"
                        ]
                    ),

                    supplier: val(
                        record,
                        [
                            "supplier"
                        ]
                    ),

                    location: val(
                        record,
                        [
                            "location"
                        ]
                    ),

                    department: val(
                        record,
                        [
                            "department"
                        ]
                    ),

                    quantity: num(
                        val(
                            record,
                            [
                                "quantity",
                                "qty"
                            ]
                        )
                    ),

                    unitCost: num(
                        val(
                            record,
                            [
                                "unit_cost",
                                "unitCost"
                            ]
                        )
                    ),

                    totalCost: num(
                        val(
                            record,
                            [
                                "total_cost",
                                "totalCost"
                            ]
                        )
                    ),

                    type: "Stock In"

                });

            });

        } else {

            console.error(
                "Stock In Load Error:",
                stockInResult
            );
        }


        // =================================
        // STOCK OUT → HISTORY
        // =================================

        if (
            stockOutResult &&
            stockOutResult.success
        ) {

            const stockOutData =
                Array.isArray(
                    stockOutResult.data
                )
                    ? stockOutResult.data
                    : [];


            stockOutData.forEach(record => {

                history.push({

                    id: record.id,

                    date: val(
                        record,
                        [
                            "date",
                            "transaction_date"
                        ]
                    ),

                    time: val(
                        record,
                        [
                            "time",
                            "transaction_time"
                        ]
                    ),

                    itemCode: val(
                        record,
                        [
                            "item_code",
                            "itemCode",
                            "code"
                        ]
                    ),

                    itemName: val(
                        record,
                        [
                            "item_name",
                            "itemName",
                            "name"
                        ]
                    ),

                    unit: val(
                        record,
                        [
                            "unit"
                        ]
                    ),

                    source: val(
                        record,
                        [
                            "source"
                        ]
                    ),

                    supplier: val(
                        record,
                        [
                            "supplier"
                        ]
                    ),

                    location: val(
                        record,
                        [
                            "location"
                        ]
                    ),

                    department: val(
                        record,
                        [
                            "department"
                        ]
                    ),

                    quantity: num(
                        val(
                            record,
                            [
                                "quantity",
                                "qty"
                            ]
                        )
                    ),

                    unitCost: 0,

                    totalCost: 0,

                    type: "Stock Issue"

                });

            });

        } else {

            console.error(
                "Stock Out Load Error:",
                stockOutResult
            );
        }


        // =================================
        // DEMAND HISTORY
        // =================================

        const demandResult =
            await supabaseRequest(
                "demand_history",
                "GET",
                null,
                "?select=*"
            );


        console.log(
            "Reports Demand Result:",
            demandResult
        );


        if (
            demandResult &&
            demandResult.success
        ) {

            demandHistory =
                Array.isArray(
                    demandResult.data
                )
                    ? demandResult.data
                    : [];

        } else {

            demandHistory = [];

            console.error(
                "Demand History Load Error:",
                demandResult
            );
        }


        // =================================
        // FINAL LOG
        // =================================

        console.log(
            "====================================="
        );

        console.log(
            "REPORTS DATA LOADED"
        );

        console.log(
            "Items:",
            items.length
        );

        console.log(
            "Stock In:",
            history.filter(
                x => x.type === "Stock In"
            ).length
        );

        console.log(
            "Stock Out:",
            history.filter(
                x => x.type === "Stock Issue"
            ).length
        );

        console.log(
            "Demand History:",
            demandHistory.length
        );

        console.log(
            "====================================="
        );


    } catch (error) {

        console.error(
            "REPORTS SUPABASE ERROR:",
            error
        );

        alert(
            "Reports data load نہیں ہو سکا۔ Console میں error check کریں۔"
        );
    }
}


// =====================================
// REPORT TYPE CHANGE
// =====================================

function reportTypeChanged() {

    const reportType = document.getElementById("reportType").value;

    const fromDate = document.getElementById("fromDate");
    const toDate = document.getElementById("toDate");

    const department = document.getElementById("department");

    const demandMonthBox = document.getElementById("demandMonthBox");
    const demandMonth = document.getElementById("demandMonth");


    // ==========================================
    // MONTHLY DEMAND REPORT
    // ==========================================

    if (reportType === "monthlyDemand") {

        // From Date / To Date hide
        if (fromDate) {
            fromDate.parentElement.style.display = "none";
            fromDate.disabled = true;
        }

        if (toDate) {
            toDate.parentElement.style.display = "none";
            toDate.disabled = true;
        }


        // Department disable
        if (department) {
            department.disabled = true;
        }


        // Monthly Demand Month selector SHOW
        if (demandMonthBox) {
            demandMonthBox.style.display = "block";
        }

        if (demandMonth) {
            demandMonth.disabled = false;

            // اگر ابھی کوئی month selected نہیں ہے
            if (!demandMonth.value) {
                const today = new Date();

                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, "0");

                demandMonth.value = `${year}-${month}`;
            }
        }

        return;
    }


    // ==========================================
    // OTHER REPORTS
    // ==========================================

    if (fromDate) {
        fromDate.parentElement.style.display = "";
        fromDate.disabled = false;
    }

    if (toDate) {
        toDate.parentElement.style.display = "";
        toDate.disabled = false;
    }

    if (department) {
        department.disabled = false;
    }


    // Monthly Demand selector hide
    if (demandMonthBox) {
        demandMonthBox.style.display = "none";
    }

    if (demandMonth) {
        demandMonth.disabled = true;
    }
}

// =====================================
// TITLES
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

    const printDate =
        document.getElementById(
            "printDate"
        );


    if (screenTitle) {
        screenTitle.innerHTML =
            title;
    }


    if (printTitle) {
        printTitle.innerHTML =
            title.toUpperCase();
    }


    if (printDate) {

        const d = new Date();

        printDate.innerHTML =
            `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    }
}


// =====================================
// TABLE HEADER
// =====================================

function setHead(columns) {

    const head =
        document.getElementById(
            "reportHead"
        );

    if (!head) {
        return;
    }


    head.innerHTML =
        `<tr>${
            columns
                .map(
                    column =>
                        `<th>${column}</th>`
                )
                .join("")
        }</tr>`;
}


// =====================================
// ADD TABLE ROW
// =====================================

function addRow(values) {

    const body =
        document.getElementById(
            "reportBody"
        );

    if (!body) {
        return;
    }


    const tr =
        document.createElement(
            "tr"
        );


    values.forEach(value => {

        const td =
            document.createElement(
                "td"
            );


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


// =====================================
// SUMMARY RESET
// =====================================

function resetSummary() {

    const totalEntries =
        document.getElementById(
            "totalEntries"
        );

    const reportQuantity =
        document.getElementById(
            "reportQuantity"
        );

    const reportCost =
        document.getElementById(
            "reportCost"
        );


    if (totalEntries) {
        totalEntries.innerHTML =
            "0";
    }


    if (reportQuantity) {
        reportQuantity.innerHTML =
            "0";
    }


    if (reportCost) {
        reportCost.innerHTML =
            "0";
    }
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

    return history.filter(record => {

        const recordType =
            String(
                val(
                    record,
                    ["type"]
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


        const date =
            normalizeDate(
                val(
                    record,
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


        const code =
            String(
                val(
                    record,
                    [
                        "itemCode",
                        "item_code",
                        "code"
                    ]
                )
            ).trim();


        if (
            itemCode &&
            code !== itemCode
        ) {
            return false;
        }


        const recordDepartment =
            String(
                val(
                    record,
                    [
                        "department"
                    ]
                )
            ).trim();


        if (
            department &&
            recordDepartment !== department
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


    const rows =
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

        const q =
            num(
                val(
                    record,
                    [
                        "quantity",
                        "qty"
                    ]
                )
            );


        const unitCost =
            num(
                val(
                    record,
                    [
                        "unitCost",
                        "unit_cost"
                    ]
                )
            );


        const totalCost =
            num(
                val(
                    record,
                    [
                        "totalCost",
                        "total_cost"
                    ]
                )
            ) ||
            (q * unitCost);


        quantity += q;
        cost += totalCost;


        addRow([
            val(
                record,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ]
            ),

            val(
                record,
                [
                    "itemName",
                    "item_name",
                    "name"
                ]
            ),

            normalizeDate(
                val(
                    record,
                    [
                        "date",
                        "transactionDate",
                        "transaction_date"
                    ]
                )
            ),

            q,

            unitCost,

            totalCost
        ]);
    });


    showSummary(
        rows.length,
        quantity,
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


    const rows =
        filteredHistory(
            "stockOut",
            fromDate,
            toDate,
            itemCode,
            department
        );


    let quantity = 0;


    rows.forEach(record => {

        const q =
            num(
                val(
                    record,
                    [
                        "quantity",
                        "qty"
                    ]
                )
            );


        quantity += q;


        addRow([
            val(
                record,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ]
            ),

            val(
                record,
                [
                    "itemName",
                    "item_name",
                    "name"
                ]
            ),

            val(
                record,
                [
                    "department"
                ]
            ),

            normalizeDate(
                val(
                    record,
                    [
                        "date",
                        "transactionDate",
                        "transaction_date"
                    ]
                )
            ),

            q
        ]);
    });


    showSummary(
        rows.length,
        quantity,
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


    const rows =
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
                    ]
                )
            ).trim() === itemCode;
        });


    rows.forEach(item => {

        const stock =
            currentStock(item);


        const minimum =
            num(
                val(
                    item,
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
                item,
                [
                    "code",
                    "itemCode",
                    "item_code",
                    "id"
                ]
            ),

            val(
                item,
                [
                    "itemName",
                    "item_name",
                    "name"
                ]
            ),

            val(
                item,
                [
                    "unit"
                ]
            ),

            stock,

            minimum,

            stock <= minimum
                ? "LOW STOCK"
                : "OK"
        ]);
    });


    const totalStock =
        rows.reduce(
            (sum, item) =>
                sum +
                currentStock(item),
            0
        );


    showSummary(
        rows.length,
        totalStock,
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


    const map = {};


    filteredHistory(
        "stockIn",
        "",
        "",
        itemCode,
        ""
    ).forEach(record => {

        const code =
            String(
                val(
                    record,
                    [
                        "itemCode",
                        "item_code",
                        "code"
                    ]
                )
            );


        if (!map[code]) {

            map[code] = {

                name: val(
                    record,
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


        const q =
            num(
                val(
                    record,
                    [
                        "quantity",
                        "qty"
                    ]
                )
            );


        const c =
            num(
                val(
                    record,
                    [
                        "totalCost",
                        "total_cost"
                    ]
                )
            );


        map[code].qty += q;
        map[code].cost += c;
    });


    let totalCost = 0;
    let totalQty = 0;


    Object.keys(map).forEach(code => {

        const x =
            map[code];


        totalCost += x.cost;
        totalQty += x.qty;


        addRow([

            code,

            x.name,

            x.qty,

            x.cost,

            x.qty
                ? (x.cost / x.qty).toFixed(2)
                : "0"
        ]);
    });


    addRow([
        "",
        "OVERALL TOTAL",
        totalQty,
        totalCost,
        totalQty
            ? (totalCost / totalQty).toFixed(2)
            : "0"
    ]);


    showSummary(
        Object.keys(map).length,
        totalQty,
        totalCost
    );
}


// =====================================
// DEMAND HELPERS
// =====================================

function getDemandMonth(record) {

    return String(
        val(
            record,
            [
                "demand_month",
                "demandMonth",
                "month"
            ]
        )
    ).trim();
}


function getDemandDate(record) {

    return normalizeDate(
        val(
            record,
            [
                "demand_date",
                "demandDate"
            ]
        )
    );
}


function getNextDemandDate(
    currentDemandDate
) {

    if (!currentDemandDate) {
        return "";
    }


    const dates =
        demandHistory
            .map(record =>
                getDemandDate(record)
            )
            .filter(date =>
                date &&
                date > currentDemandDate
            )
            .sort();


    return dates.length
        ? dates[0]
        : "";
}


function getDemandItems(record) {

    const list =
        val(
            record,
            [
                "demand_items",
                "demandItems",
                "items",
                "demands"
            ],
            null
        );


    if (Array.isArray(list)) {
        return list;
    }


    return [];
}


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


function getPendingDemand(item) {

    return num(
        val(
            item,
            [
                "pending_demand",
                "pendingDemand",
                "pending_qty",
                "pendingQty"
            ]
        )
    );
}


function getPendingPO(item) {

    return num(
        val(
            item,
            [
                "pending_po",
                "pendingPO",
                "pendingPo",
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

    if (!demandMonth) {

        alert(
            "Please select Demand Month."
        );

        return;
    }


    setTitles(
        "Monthly Demand Report - " +
        formatMonth(demandMonth)
    );


    setHead([
        "Item Code",
        "Item Name",
        "Demand",
        "Received Demand",
        "Demand vs Received",
        "Pending Demand",
        "Pending PO"
    ]);


    // =================================
    // FIND ONE DEMAND RECORD
    // =================================

    const selectedRecord =
        demandHistory.find(record =>
            getDemandMonth(record) ===
            demandMonth
        );


    if (!selectedRecord) {

        addRow([
            "",
            "No demand generated for " +
            formatMonth(demandMonth),
            "",
            "",
            "",
            "",
            ""
        ]);


        showSummary(
            0,
            0,
            0
        );


        return;
    }


    // =================================
    // DEMAND DATE
    // =================================

    const demandDate =
        getDemandDate(
            selectedRecord
        );


    if (!demandDate) {

        addRow([
            "",
            "Demand Date is missing",
            "",
            "",
            "",
            "",
            ""
        ]);


        showSummary(
            0,
            0,
            0
        );


        return;
    }


    // =================================
    // NEXT DEMAND DATE
    // =================================

    const nextDemandDate =
        getNextDemandDate(
            demandDate
        );


    console.log(
        "Monthly Demand:",
        demandMonth
    );

    console.log(
        "Demand Date:",
        demandDate
    );

    console.log(
        "Next Demand Date:",
        nextDemandDate
    );


    // =================================
    // DEMAND ITEMS
    // =================================

    const demandItems =
        getDemandItems(
            selectedRecord
        );


    const map = {};


    // =================================
    // NESTED ITEMS
    // =================================

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


        map[code] = {

            name:
                getDemandItemName(item) ||
                val(
                    getItem(code),
                    [
                        "itemName",
                        "item_name",
                        "name"
                    ]
                ),

            demand:
                getDemandQuantity(item),

            received: 0,

            pending:
                getPendingDemand(item),

            pendingPO:
                getPendingPO(item)
        };
    });


    // =================================
    // OLD FLAT FORMAT SUPPORT
    // =================================

    if (
        demandItems.length === 0
    ) {

        const code =
            getDemandItemCode(
                selectedRecord
            );


        if (code) {

            if (
                !itemCode ||
                code === itemCode
            ) {

                map[code] = {

                    name:
                        val(
                            selectedRecord,
                            [
                                "itemName",
                                "item_name",
                                "name"
                            ]
                        ),

                    demand:
                        getDemandQuantity(
                            selectedRecord
                        ),

                    received: 0,

                    pending:
                        getPendingDemand(
                            selectedRecord
                        ),

                    pendingPO:
                        getPendingPO(
                            selectedRecord
                        )
                };
            }
        }
    }


    // =================================
    // RECEIVED DEMAND
    //
    // From:
    // Demand Date
    //
    // Until:
    // Day before Next Demand Date
    // =================================

    history.forEach(record => {

        if (
            record.type !==
            "Stock In"
        ) {
            return;
        }


        const code =
            String(
                val(
                    record,
                    [
                        "itemCode",
                        "item_code",
                        "code"
                    ]
                )
            ).trim();


        if (!map[code]) {
            return;
        }


        const stockInDate =
            normalizeDate(
                val(
                    record,
                    [
                        "date",
                        "transactionDate",
                        "transaction_date"
                    ]
                )
            );


        if (!stockInDate) {
            return;
        }


        // BEFORE DEMAND DATE
        if (
            stockInDate <
            demandDate
        ) {
            return;
        }


        // ON / AFTER NEXT DEMAND DATE
        if (
            nextDemandDate &&
            stockInDate >=
            nextDemandDate
        ) {
            return;
        }


        const quantity =
            num(
                val(
                    record,
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
    // OUTPUT
    // =================================

    let totalDemand = 0;
    let totalReceived = 0;
    let totalDifference = 0;
    let totalPending = 0;
    let totalPO = 0;


    Object.keys(map).forEach(code => {

        const row =
            map[code];


        const demand =
            row.demand;


        const received =
            row.received;


        const difference =
            received - demand;


        const pending =
            Math.max(
                demand - received,
                0
            );


        const pendingPO =
            row.pendingPO;


        totalDemand += demand;
        totalReceived += received;
        totalDifference += difference;
        totalPending += pending;
        totalPO += pendingPO;


        addRow([

            code,

            row.name,

            demand,

            received,

            difference,

            pending,

            pendingPO
        ]);
    });


    // =================================
    // SUMMARY
    // =================================

    const summary =
        document.getElementById(
            "reportCost"
        );


    if (summary) {

        summary.innerHTML =
            `Demand Date: ${demandDate}` +
            (
                nextDemandDate
                    ? ` | Next Demand Date: ${nextDemandDate}`
                    : ""
            );
    }


    const quantity =
        document.getElementById(
            "reportQuantity"
        );


    if (quantity) {

        quantity.innerHTML =
            `Demand: ${totalDemand} | Received: ${totalReceived} | Difference: ${totalDifference} | Pending: ${totalPending} | Pending PO: ${totalPO}`;
    }


    const entries =
        document.getElementById(
            "totalEntries"
        );


    if (entries) {

        entries.innerHTML =
            Object.keys(map).length;
    }
}


// =====================================
// GENERATE REPORT
// =====================================

function generateReport() {

    const typeElement =
        document.getElementById(
            "reportType"
        );


    if (!typeElement) {
        return;
    }


    const type =
        typeElement.value;


    const fromDateElement =
        document.getElementById(
            "fromDate"
        );


    const toDateElement =
        document.getElementById(
            "toDate"
        );


    const itemCodeElement =
        document.getElementById(
            "itemCode"
        );


    const departmentElement =
        document.getElementById(
            "department"
        );


    const demandMonthElement =
        document.getElementById(
            "demandMonth"
        );


    const body =
        document.getElementById(
            "reportBody"
        );


    if (body) {
        body.innerHTML = "";
    }


    resetSummary();


    // =================================
    // MONTHLY DEMAND
    // =================================

    if (
        type === "monthlyDemand" ||
        type === "demand"
    ) {

        const demandMonth =
            demandMonthElement
                ? demandMonthElement.value
                : "";


        const itemCode =
            itemCodeElement
                ? itemCodeElement.value.trim()
                : "";


        monthlyDemandReport(
            demandMonth,
            itemCode
        );


        return;
    }


    const fromDate =
        fromDateElement
            ? fromDateElement.value
            : "";


    const toDate =
        toDateElement
            ? toDateElement.value
            : "";


    const itemCode =
        itemCodeElement
            ? itemCodeElement.value.trim()
            : "";


    const department =
        departmentElement
            ? departmentElement.value
            : "";


    if (
        type === "stockIn"
    ) {

        stockInReport(
            fromDate,
            toDate,
            itemCode,
            department
        );

        return;
    }


    if (
        type === "stockOut"
    ) {

        stockOutReport(
            fromDate,
            toDate,
            itemCode,
            department
        );

        return;
    }


    if (
        type === "currentStock"
    ) {

        currentStockReport(
            itemCode
        );

        return;
    }


    if (
        type === "cost"
    ) {

        costReport(
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


// =====================================
// ALL TRANSACTIONS
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


    const rows =
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

        const q =
            num(
                val(
                    record,
                    [
                        "quantity",
                        "qty"
                    ]
                )
            );


        const c =
            num(
                val(
                    record,
                    [
                        "totalCost",
                        "total_cost"
                    ]
                )
            );


        quantity += q;
        cost += c;


        addRow([

            normalizeDate(
                val(
                    record,
                    [
                        "date",
                        "transactionDate",
                        "transaction_date"
                    ]
                )
            ),

            val(
                record,
                [
                    "time",
                    "transactionTime",
                    "transaction_time"
                ]
            ),

            val(
                record,
                [
                    "type"
                ]
            ),

            val(
                record,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ]
            ),

            val(
                record,
                [
                    "itemName",
                    "item_name",
                    "name"
                ]
            ),

            val(
                record,
                [
                    "department"
                ]
            ),

            q,

            val(
                record,
                [
                    "unitCost",
                    "unit_cost"
                ]
            ),

            c
        ]);
    });


    showSummary(
        rows.length,
        quantity,
        cost
    );
}


// =====================================
// SUMMARY
// =====================================

function showSummary(
    entries,
    quantity,
    cost
) {

    const totalEntries =
        document.getElementById(
            "totalEntries"
        );

    const reportQuantity =
        document.getElementById(
            "reportQuantity"
        );

    const reportCost =
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


// =====================================
// CLEAR REPORT
// =====================================

function clearReport() {

    const reportType =
        document.getElementById(
            "reportType"
        );

    const fromDate =
        document.getElementById(
            "fromDate"
        );

    const toDate =
        document.getElementById(
            "toDate"
        );

    const itemCode =
        document.getElementById(
            "itemCode"
        );

    const department =
        document.getElementById(
            "department"
        );

    const demandMonth =
        document.getElementById(
            "demandMonth"
        );

    const body =
        document.getElementById(
            "reportBody"
        );

    const head =
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


    if (demandMonth) {
        demandMonth.value = "";
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


// =====================================
// PRINT
// =====================================

function printReport() {

    window.print();
}


// =====================================
// PAGE LOAD
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "REPORTS.JS LOADED SUCCESSFULLY"
        );


        reportTypeChanged();


        setTitles(
            "Stock In Report"
        );


        await loadReportsData();


        console.log(
            "Reports page ready."
        );

    }
);
