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

    if (!obj) return fallback;

    for (const key of keys) {

        if (
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


function getTodayMonthKey() {

    const d = new Date();

    const year = d.getFullYear();

    const month =
        String(d.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}


function getMonthKeyFromDate(value) {

    if (!value) return "";

    const text = String(value);

    if (/^\d{4}-\d{2}/.test(text)) {
        return text.substring(0, 7);
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return "";
    }

    const year = d.getFullYear();

    const month =
        String(d.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}


function formatMonth(monthKey) {

    if (!monthKey) return "";

    const parts = String(monthKey).split("-");

    if (parts.length !== 2) {
        return monthKey;
    }

    const year = parts[0];

    const month = Number(parts[1]);

    const names = [
        "",
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

    return `${names[month] || parts[1]} ${year}`;
}


// =====================================
// LOAD REPORT DATA
// =====================================

async function loadReportsData() {

    try {

        const itemsResult =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?select=*"
            );

        const stockInResult =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*"
            );

        const stockOutResult =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*"
            );

        const demandResult =
            await supabaseRequest(
                "demand_history",
                "GET",
                null,
                "?select=*"
            );


        // ---------------------------------
        // ITEMS
        // ---------------------------------

        if (
            itemsResult &&
            Array.isArray(itemsResult.data)
        ) {

            items = itemsResult.data;

        } else {

            items = [];
        }


        // ---------------------------------
        // STOCK IN / OUT
        // ---------------------------------

        history = [];


        // STOCK IN

        if (
            stockInResult &&
            Array.isArray(stockInResult.data)
        ) {

            stockInResult.data.forEach(row => {

                history.push({

                    ...row,

                    type: "Stock In",

                    itemCode: val(
                        row,
                        [
                            "item_code",
                            "itemCode",
                            "code"
                        ]
                    ),

                    itemName: val(
                        row,
                        [
                            "item_name",
                            "itemName",
                            "name"
                        ]
                    ),

                    quantity: num(
                        val(
                            row,
                            [
                                "quantity",
                                "qty"
                            ]
                        )
                    ),

                    unitCost: num(
                        val(
                            row,
                            [
                                "unit_cost",
                                "unitCost",
                                "rate",
                                "cost"
                            ]
                        )
                    ),

                    totalCost: num(
                        val(
                            row,
                            [
                                "total_cost",
                                "totalCost"
                            ]
                        )
                    ),

                    date: val(
                        row,
                        [
                            "date",
                            "transaction_date",
                            "transactionDate"
                        ]
                    ),

                    time: val(
                        row,
                        [
                            "time",
                            "transaction_time",
                            "transactionTime"
                        ]
                    ),

                    department: val(
                        row,
                        [
                            "department",
                            "dept"
                        ]
                    )

                });

            });
        }


        // STOCK OUT

        if (
            stockOutResult &&
            Array.isArray(stockOutResult.data)
        ) {

            stockOutResult.data.forEach(row => {

                history.push({

                    ...row,

                    type: "Stock Issue",

                    itemCode: val(
                        row,
                        [
                            "item_code",
                            "itemCode",
                            "code"
                        ]
                    ),

                    itemName: val(
                        row,
                        [
                            "item_name",
                            "itemName",
                            "name"
                        ]
                    ),

                    quantity: num(
                        val(
                            row,
                            [
                                "quantity",
                                "qty"
                            ]
                        )
                    ),

                    unitCost: num(
                        val(
                            row,
                            [
                                "unit_cost",
                                "unitCost",
                                "rate",
                                "cost"
                            ]
                        )
                    ),

                    totalCost: num(
                        val(
                            row,
                            [
                                "total_cost",
                                "totalCost"
                            ]
                        )
                    ),

                    date: val(
                        row,
                        [
                            "date",
                            "transaction_date",
                            "transactionDate"
                        ]
                    ),

                    time: val(
                        row,
                        [
                            "time",
                            "transaction_time",
                            "transactionTime"
                        ]
                    ),

                    department: val(
                        row,
                        [
                            "department",
                            "dept"
                        ]
                    )

                });

            });
        }


        // ---------------------------------
        // DEMAND HISTORY
        // ---------------------------------

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
            "Reports data loaded:",
            {
                items,
                history,
                demandHistory
            }
        );


    } catch (error) {

        console.error(
            "Error loading Reports data:",
            error
        );

        alert(
            "Reports data load نہیں ہو سکا۔ Console میں error check کریں۔"
        );
    }
}


// =====================================
// FIND ITEM
// =====================================

function getItem(code) {

    const searchCode =
        String(code || "")
            .trim()
            .toLowerCase();

    return items.find(item => {

        const itemCode =
            String(
                val(
                    item,
                    [
                        "itemCode",
                        "item_code",
                        "code"
                    ]
                )
            )
                .trim()
                .toLowerCase();

        return itemCode === searchCode;

    });
}


// =====================================
// CURRENT STOCK
// =====================================

function currentStock(item) {

    const code =
        String(
            val(
                item,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ]
            )
        ).trim();


    let stock =
        num(
            val(
                item,
                [
                    "openingStock",
                    "opening_Stock",
                    "opening_stock"
                ]
            )
        );


    history.forEach(row => {

        const rowCode =
            String(row.itemCode || "").trim();

        if (rowCode !== code) {
            return;
        }


        const qty =
            num(row.quantity);


        if (row.type === "Stock In") {

            stock += qty;

        }

        else if (row.type === "Stock Issue") {

            stock -= qty;

        }

    });


    return stock;
}


// =====================================
// REPORT TYPE CHANGED
// =====================================

function reportTypeChanged() {

    const reportType =
        document.getElementById("reportType");

    if (!reportType) return;


    const type =
        reportType.value;


    const demandMonthBox =
        document.getElementById("demandMonthBox");


    const fromDate =
        document.getElementById("fromDate");


    const toDate =
        document.getElementById("toDate");


    const department =
        document.getElementById("department");


    if (
        type === "monthlyDemand" ||
        type === "demand"
    ) {

        if (demandMonthBox) {
            demandMonthBox.style.display =
                "block";
        }


        if (fromDate) {

            fromDate.disabled = true;
            fromDate.value = "";

        }


        if (toDate) {

            toDate.disabled = true;
            toDate.value = "";

        }


        const demandMonth =
            document.getElementById(
                "demandMonth"
            );


        if (
            demandMonth &&
            !demandMonth.value
        ) {

            demandMonth.value =
                getTodayMonthKey();

        }

    }

    else {

        if (demandMonthBox) {

            demandMonthBox.style.display =
                "none";

        }


        if (fromDate) {
            fromDate.disabled = false;
        }


        if (toDate) {
            toDate.disabled = false;
        }

    }


    // Department is mainly required
    // for Stock Out / All Transactions

    if (department) {

        if (
            type === "stockOut" ||
            type === "all"
        ) {

            department.disabled = false;

        }

        else {

            department.disabled = true;
            department.value = "";

        }
    }


    if (type === "monthlyDemand") {

        setTitles(
            "Monthly Demand Report"
        );

    }

}


// =====================================
// TITLES
// =====================================

function setTitles(title) {

    const screenTitle =
        document.getElementById(
            "reportTitle"
        );

    if (screenTitle) {

        screenTitle.textContent =
            title;

    }


    const printTitle =
        document.getElementById(
            "printTitle"
        );

    if (printTitle) {

        printTitle.textContent =
            title;

    }


    const printDate =
        document.getElementById(
            "printDate"
        );

    if (printDate) {

        const d = new Date();

        printDate.textContent =
            d.toLocaleDateString();

    }

}


// =====================================
// TABLE HEADER
// =====================================

function setHead(columns) {

    const thead =
        document.querySelector(
            "#reportTable thead"
        );

    if (!thead) return;


    thead.innerHTML = "";


    const tr =
        document.createElement("tr");


    columns.forEach(column => {

        const th =
            document.createElement("th");

        th.textContent =
            column;

        tr.appendChild(th);

    });


    thead.appendChild(tr);

}


// =====================================
// ADD TABLE ROW
// =====================================

function addRow(values) {

    const tbody =
        document.querySelector(
            "#reportTable tbody"
        );

    if (!tbody) return;


    const tr =
        document.createElement("tr");


    values.forEach(value => {

        const td =
            document.createElement("td");

        td.textContent =
            value ?? "";

        tr.appendChild(td);

    });


    tbody.appendChild(tr);

}


// =====================================
// RESET SUMMARY
// =====================================

function resetSummary() {

    const summary =
        document.getElementById(
            "summary"
        );

    if (summary) {

        summary.innerHTML = "";

    }

}


// =====================================
// GENERATE REPORT
// =====================================

function generateReport() {

    const reportType =
        document.getElementById(
            "reportType"
        )?.value;


    const itemCode =
        document.getElementById(
            "itemCode"
        )?.value || "";


    const fromDate =
        document.getElementById(
            "fromDate"
        )?.value || "";


    const toDate =
        document.getElementById(
            "toDate"
        )?.value || "";


    const department =
        document.getElementById(
            "department"
        )?.value || "";


    const demandMonth =
        document.getElementById(
            "demandMonth"
        )?.value || "";


    resetSummary();


    if (
        reportType === "monthlyDemand" ||
        reportType === "demand"
    ) {

        monthlyDemandReport(
            demandMonth,
            itemCode
        );

        return;
    }


    switch (reportType) {

        case "stockIn":

            stockInReport(
                fromDate,
                toDate,
                itemCode
            );

            break;


        case "stockOut":

            stockOutReport(
                fromDate,
                toDate,
                itemCode,
                department
            );

            break;


        case "currentStock":

            currentStockReport(
                itemCode
            );

            break;


        case "cost":

            costReport(
                fromDate,
                toDate,
                itemCode
            );

            break;


        case "all":

            allTransactionsReport(
                fromDate,
                toDate,
                itemCode,
                department
            );

            break;


        default:

            alert(
                "Please select Report Type."
            );

    }

}


// =====================================
// FILTER HISTORY
// =====================================

function filteredHistory(
    fromDate,
    toDate,
    itemCode,
    department,
    type
) {

    return history.filter(row => {

        if (
            type &&
            row.type !== type
        ) {

            return false;

        }


        if (
            itemCode &&
            String(row.itemCode).trim() !==
            String(itemCode).trim()
        ) {

            return false;

        }


        if (
            department &&
            String(row.department || "")
                .trim() !==
            String(department).trim()
        ) {

            return false;

        }


        const date =
            String(row.date || "")
                .substring(0, 10);


        if (
            fromDate &&
            date < fromDate
        ) {

            return false;

        }


        if (
            toDate &&
            date > toDate
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
    itemCode
) {

    setTitles(
        "Stock In Report"
    );


    setHead([
        "Date",
        "Item Code",
        "Item Name",
        "Quantity",
        "Unit Cost",
        "Total Cost",
        "Source",
        "Supplier",
        "Location"
    ]);


    const rows =
        filteredHistory(
            fromDate,
            toDate,
            itemCode,
            "",
            "Stock In"
        );


    let totalQty = 0;
    let totalCost = 0;


    rows.forEach(row => {

        const qty =
            num(row.quantity);


        const unitCost =
            num(row.unitCost);


        const total =
            num(
                row.totalCost ||
                qty * unitCost
            );


        totalQty += qty;
        totalCost += total;


        addRow([

            row.date || "",

            row.itemCode || "",

            row.itemName || "",

            qty,

            unitCost.toFixed(2),

            total.toFixed(2),

            val(
                row,
                [
                    "source"
                ]
            ),

            val(
                row,
                [
                    "supplier"
                ]
            ),

            val(
                row,
                [
                    "location",
                    "storage_location"
                ]
            )

        ]);

    });


    showSummary([

        `Total Transactions: ${rows.length}`,

        `Total Quantity: ${totalQty}`,

        `Total Cost: ${totalCost.toFixed(2)}`

    ]);

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
        "Date",
        "Item Code",
        "Item Name",
        "Quantity",
        "Department"
    ]);


    const rows =
        filteredHistory(
            fromDate,
            toDate,
            itemCode,
            department,
            "Stock Issue"
        );


    let totalQty = 0;


    rows.forEach(row => {

        const qty =
            num(row.quantity);


        totalQty += qty;


        addRow([

            row.date || "",

            row.itemCode || "",

            row.itemName || "",

            qty,

            row.department || ""

        ]);

    });


    showSummary([

        `Total Transactions: ${rows.length}`,

        `Total Stock Out: ${totalQty}`

    ]);

}


// =====================================
// CURRENT STOCK REPORT
// =====================================

function currentStockReport(
    itemCode
) {

    setTitles(
        "Current Stock Report"
    );


    setHead([
        "Item Code",
        "Item Name",
        "Unit",
        "Opening Stock",
        "Current Stock",
        "Latest Rate"
    ]);


    let reportItems =
        items;


    if (itemCode) {

        reportItems =
            items.filter(item => {

                return String(
                    val(
                        item,
                        [
                            "itemCode",
                            "item_code",
                            "code"
                        ]
                    )
                ).trim() ===
                String(itemCode).trim();

            });

    }


    reportItems.forEach(item => {

        const code =
            val(
                item,
                [
                    "itemCode",
                    "item_code",
                    "code"
                ]
            );


        const name =
            val(
                item,
                [
                    "itemName",
                    "item_name",
                    "name"
                ]
            );


        const unit =
            val(
                item,
                [
                    "unit"
                ]
            );


        const opening =
            num(
                val(
                    item,
                    [
                        "openingStock",
                        "opening_Stock",
                        "opening_stock"
                    ]
                )
            );


        const stock =
            currentStock(item);


        let latestRate = 0;


        const stockIns =
            history
                .filter(row => {

                    return (
                        row.type === "Stock In" &&
                        String(row.itemCode).trim() ===
                        String(code).trim()
                    );

                })
                .sort((a, b) => {

                    return String(
                        b.date || ""
                    ).localeCompare(
                        String(a.date || "")
                    );

                });


        if (stockIns.length) {

            latestRate =
                num(
                    stockIns[0].unitCost
                );

        }


        addRow([

            code,

            name,

            unit,

            opening,

            stock,

            latestRate.toFixed(2)

        ]);

    });

}


// =====================================
// COST REPORT
// =====================================

function costReport(
    fromDate,
    toDate,
    itemCode
) {

    setTitles(
        "Cost Report"
    );


    setHead([
        "Date",
        "Item Code",
        "Item Name",
        "Quantity",
        "Unit Cost",
        "Total Cost",
        "Supplier"
    ]);


    const rows =
        filteredHistory(
            fromDate,
            toDate,
            itemCode,
            "",
            "Stock In"
        );


    let totalCost = 0;


    rows.forEach(row => {

        const qty =
            num(row.quantity);


        const rate =
            num(row.unitCost);


        const total =
            num(
                row.totalCost ||
                qty * rate
            );


        totalCost += total;


        addRow([

            row.date || "",

            row.itemCode || "",

            row.itemName || "",

            qty,

            rate.toFixed(2),

            total.toFixed(2),

            val(
                row,
                [
                    "supplier"
                ]
            )

        ]);

    });


    showSummary([

        `Total Cost: ${totalCost.toFixed(2)}`,

        `Total Transactions: ${rows.length}`

    ]);

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
        "Type",
        "Item Code",
        "Item Name",
        "Quantity",
        "Unit Cost",
        "Department"
    ]);


    const rows =
        filteredHistory(
            fromDate,
            toDate,
            itemCode,
            department,
            ""
        );


    rows.forEach(row => {

        addRow([

            row.date || "",

            row.type || "",

            row.itemCode || "",

            row.itemName || "",

            num(row.quantity),

            num(row.unitCost).toFixed(2),

            row.department || ""

        ]);

    });


    showSummary([

        `Total Transactions: ${rows.length}`

    ]);

}


// =====================================
// DEMAND MONTH
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

        return explicitMonth.substring(
            0,
            7
        );

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
// DEMAND DATE
// =====================================

function getDemandDate(record) {

    const value =
        val(
            record,
            [
                "demand_date",
                "demandDate"
            ]
        );


    if (!value) {
        return "";
    }


    return String(value)
        .substring(0, 10);
}


// =====================================
// GET NEXT DEMAND DATE
// =====================================

function getNextDemandDate(
    currentDemandDate
) {

    if (!currentDemandDate) {
        return "";
    }


    const futureDates =
        demandHistory

            .map(record => {

                return getDemandDate(
                    record
                );

            })

            .filter(date => {

                return (
                    date &&
                    date > currentDemandDate
                );

            })

            .sort();


    if (futureDates.length === 0) {

        return "";

    }


    return futureDates[0];
}


// =====================================
// DEMAND ITEMS
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

    if (!demandMonth) {

        alert(
            "Please select Demand Month."
        );

        return;
    }


    setTitles(
        `Monthly Demand Report - ${formatMonth(demandMonth)}`
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
    // FIND SELECTED DEMAND RECORD
    // =================================

    let selectedDemandRecord = null;


    demandHistory.forEach(record => {

        if (
            getDemandMonth(record) ===
            demandMonth
        ) {

            selectedDemandRecord =
                record;

        }

    });


    if (!selectedDemandRecord) {

        alert(
            `Selected Demand Month (${formatMonth(demandMonth)}) کی Demand موجود نہیں ہے۔`
        );

        return;
    }


    // =================================
    // DEMAND DATE
    // =================================

    const demandDate =
        getDemandDate(
            selectedDemandRecord
        );


    if (!demandDate) {

        alert(
            `Selected Demand (${formatMonth(demandMonth)}) میں Demand Date موجود نہیں ہے۔`
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
        "Monthly Demand Period:",
        {
            demandMonth,
            demandDate,
            nextDemandDate
        }
    );


    // =================================
    // CREATE DEMAND MAP
    // =================================

    const map = {};


    // =================================
    // READ SELECTED DEMAND ITEMS
    // =================================

    const selectedItems =
        getDemandItems(
            selectedDemandRecord
        );


    // =================================
    // NEW DEMAND FORMAT
    // =================================

    if (selectedItems.length > 0) {

        selectedItems.forEach(item => {

            const code =
                getDemandItemCode(item);


            if (!code) {
                return;
            }


            if (
                itemCode &&
                String(code).trim() !==
                String(itemCode).trim()
            ) {

                return;

            }


            if (!map[code]) {

                map[code] = {

                    code: code,

                    name:
                        getDemandItemName(
                            item
                        ),

                    demand: 0,

                    received: 0,

                    pending: 0,

                    pendingPO: 0

                };

            }


            map[code].demand +=
                getDemandQuantity(item);


            map[code].pendingPO +=
                getPendingPO(item);

        });

    }


    // =================================
    // OLD / FLAT DEMAND FORMAT
    // =================================

    else {

        const code =
            String(
                val(
                    selectedDemandRecord,
                    [
                        "itemCode",
                        "item_code",
                        "code"
                    ]
                )
            ).trim();


        if (code) {

            if (
                !itemCode ||
                code ===
                String(itemCode).trim()
            ) {

                map[code] = {

                    code: code,

                    name:
                        val(
                            selectedDemandRecord,
                            [
                                "itemName",
                                "item_name",
                                "name"
                            ]
                        ),

                    demand:
                        getDemandQuantity(
                            selectedDemandRecord
                        ),

                    received: 0,

                    pending: 0,

                    pendingPO:
                        getPendingPO(
                            selectedDemandRecord
                        )

                };

            }

        }

    }


    // =================================
    // RECEIVED DEMAND
    //
    // IMPORTANT:
    //
    // Demand Date سے شروع ہوگا
    //
    // اگلی Demand Date سے پہلے تک
    // Stock In اس Demand میں شمار ہوگا
    //
    // Example:
    //
    // June Demand Date = 14-05-2026
    // July Demand Date = 21-06-2026
    //
    // June Received:
    // 14-05-2026 <= Stock In < 21-06-2026
    //
    // =================================

    history.forEach(row => {

        // صرف Stock In

        if (row.type !== "Stock In") {
            return;
        }


        const code =
            String(
                row.itemCode || ""
            ).trim();


        if (!code) {
            return;
        }


        // صرف وہ item جو Demand میں موجود ہے

        if (!map[code]) {
            return;
        }


        // اگر report میں specific item selected ہے

        if (
            itemCode &&
            code !==
            String(itemCode).trim()
        ) {

            return;
        }


        const stockInDate =
            String(
                val(
                    row,
                    [
                        "date",
                        "transactionDate",
                        "transaction_date"
                    ]
                ) || ""
            ).substring(0, 10);


        if (!stockInDate) {
            return;
        }


        // ---------------------------------
        // Stock In Demand Date سے پہلے ہے
        // تو شامل نہیں ہوگا
        // ---------------------------------

        if (
            stockInDate <
            demandDate
        ) {

            return;
        }


        // ---------------------------------
        // اگر اگلی Demand موجود ہے
        //
        // تو اگلی Demand Date پر
        // یا اس کے بعد کا Stock In
        // موجودہ Demand میں شامل نہیں ہوگا
        // ---------------------------------

        if (
            nextDemandDate &&
            stockInDate >=
            nextDemandDate
        ) {

            return;
        }


        // ---------------------------------
        // RECEIVED DEMAND
        // ---------------------------------

        map[code].received +=
            num(row.quantity);

    });


    // =================================
    // SHOW REPORT
    // =================================

    let totalDemand = 0;

    let totalReceived = 0;

    let totalDifference = 0;

    let totalPending = 0;

    let totalPendingPO = 0;


    Object.values(map)
        .forEach(record => {

            const demand =
                num(record.demand);


            const received =
                num(record.received);


            // ---------------------------------
            // Difference
            //
            // Received - Demand
            //
            // 1000 - 700 = -300
            // 1000 - 1200 = +200
            // ---------------------------------

            const difference =
                received - demand;


            // ---------------------------------
            // Pending
            //
            // اگر Received کم ہے
            // تو باقی Pending ہوگا
            //
            // 1000 - 700 = 300
            // 1000 - 1200 = 0
            // ---------------------------------

            const pending =
                Math.max(
                    demand - received,
                    0
                );


            const pendingPO =
                num(
                    record.pendingPO
                );


            totalDemand +=
                demand;


            totalReceived +=
                received;


            totalDifference +=
                difference;


            totalPending +=
                pending;


            totalPendingPO +=
                pendingPO;


            addRow([

                record.code,

                record.name,

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

    showSummary([

        `Demand Date: ${demandDate}`,

        `Next Demand Date: ${nextDemandDate || "No Next Demand"}`,

        `Total Demand: ${totalDemand}`,

        `Total Received Demand: ${totalReceived}`,

        `Demand vs Received: ${totalDifference}`,

        `Total Pending Demand: ${totalPending}`,

        `Total Pending PO: ${totalPendingPO}`

    ]);

}


// =====================================
// SHOW SUMMARY
// =====================================

function showSummary(lines) {

    const summary =
        document.getElementById(
            "summary"
        );


    if (!summary) return;


    summary.innerHTML = "";


    lines.forEach(line => {

        const div =
            document.createElement("div");

        div.textContent =
            line;

        summary.appendChild(div);

    });

}


// =====================================
// CLEAR REPORT
// =====================================

function clearReport() {

    const tbody =
        document.querySelector(
            "#reportTable tbody"
        );


    if (tbody) {

        tbody.innerHTML = "";

    }


    const thead =
        document.querySelector(
            "#reportTable thead"
        );


    if (thead) {

        thead.innerHTML = "";

    }


    resetSummary();

}


// =====================================
// PRINT REPORT
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

        // -----------------------------
        // Demand Month
        // -----------------------------

        const demandMonth =
            document.getElementById(
                "demandMonth"
            );


        if (demandMonth) {

            if (!demandMonth.value) {

                demandMonth.value =
                    getTodayMonthKey();

            }


            demandMonth.addEventListener(
                "change",
                function () {

                    const reportType =
                        document.getElementById(
                            "reportType"
                        )?.value;


                    if (
                        reportType ===
                        "monthlyDemand"
                    ) {

                        clearReport();

                    }

                }
            );

        }


        // -----------------------------
        // Initial Report Type
        // -----------------------------

        reportTypeChanged();


        // -----------------------------
        // Load Supabase Data
        // -----------------------------

        await loadReportsData();

    }
);
