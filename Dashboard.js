// =====================================
// DASHBOARD.JS - SUPABASE VERSION
// Correct Monthly Stock
// Monthly Demand Card = SELECTED MONTH APPROVED DEMAND
// =====================================

let items = [];
let history = [];
let stockInRecords = [];
let demandHistory = [];
let selectedItem = null;
let dashboardChart = null;

let selectedDashboardMonth = getTodayMonthKey();


// --------------------------------------------------
// BASIC HELPERS
// --------------------------------------------------

function getTodayMonthKey() {

    const d = new Date();

    return d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0");
}


function getSelectedMonthParts() {

    const p = String(selectedDashboardMonth).split("-");

    return {
        year: Number(p[0]),
        month: Number(p[1]) - 1
    };
}


function getMonthName(key) {

    const p = String(key).split("-");

    const d = new Date(
        Number(p[0]),
        Number(p[1]) - 1,
        1
    );

    return d.toLocaleString("en-US", {
        month: "long",
        year: "numeric"
    });
}


function safeNumber(value) {

    const n = Number(value);

    return Number.isFinite(n) ? n : 0;
}


function cleanCode(value) {

    return String(value ?? "").trim();
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// --------------------------------------------------
// MONTH SELECTOR
// --------------------------------------------------

function setDashboardMonth(key) {

    if (!/^\d{4}-\d{2}$/.test(String(key))) {
        return;
    }

    selectedDashboardMonth = String(key);

    updateMonthUI();
    updateDashboard();
}


function updateMonthUI() {

    const picker =
        document.getElementById("dashboardMonth");

    const label =
        document.getElementById("dashboardMonthName");

    const title =
        document.getElementById("stockTableTitle");

    if (picker) {
        picker.value = selectedDashboardMonth;
    }

    if (label) {
        label.textContent =
            getMonthName(selectedDashboardMonth);
    }

    if (title) {
        title.textContent =
            getMonthName(selectedDashboardMonth) +
            " Stock";
    }
}


// --------------------------------------------------
// DATE PARSING
// --------------------------------------------------

function getRecordDate(record) {

    if (!record) {
        return null;
    }

    let value =
        record.date ??
        record.transactionDate ??
        record.entryDate ??
        record.transaction_date ??
        record.transaction_datetime ??
        record.created_at ??
        record.createdDate ??
        record.demandDate ??
        record.demand_date ??
        record.demand_month ??
        record.month ??
        "";

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return null;
    }

    let text = String(value).trim();


    // YYYY-MM

    if (/^\d{4}-\d{2}$/.test(text)) {

        const [y, m] =
            text.split("-").map(Number);

        return new Date(
            y,
            m - 1,
            1
        );
    }


    // YYYY-MM-DD

    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {

        const d = new Date(text);

        if (!Number.isNaN(d.getTime())) {
            return d;
        }

        const p =
            text.substring(0, 10).split("-");

        return new Date(
            Number(p[0]),
            Number(p[1]) - 1,
            Number(p[2])
        );
    }


    // DD/MM/YYYY

    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(text)) {

        const p =
            text.substring(0, 10).split("/");

        return new Date(
            Number(p[2]),
            Number(p[1]) - 1,
            Number(p[0])
        );
    }


    // DD-MM-YYYY

    if (/^\d{1,2}-\d{1,2}-\d{4}/.test(text)) {

        const p =
            text.substring(0, 10).split("-");

        return new Date(
            Number(p[2]),
            Number(p[1]) - 1,
            Number(p[0])
        );
    }


    const d = new Date(text);

    return Number.isNaN(d.getTime())
        ? null
        : d;
}


function getRecordMonthKey(record) {

    const d = getRecordDate(record);

    if (!d) {
        return "";
    }

    return d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0");
}


function isSelectedMonth(record) {

    return (
        getRecordMonthKey(record) ===
        selectedDashboardMonth
    );
}


function isBeforeSelectedMonth(record) {

    const d = getRecordDate(record);

    if (!d) {
        return false;
    }

    const m =
        getSelectedMonthParts();

    return (
        d.getFullYear() < m.year ||
        (
            d.getFullYear() === m.year &&
            d.getMonth() < m.month
        )
    );
}


// --------------------------------------------------
// ITEM HELPERS
// --------------------------------------------------

function getItemCode(item) {

    return cleanCode(
        item?.code ??
        item?.item_code ??
        item?.itemCode ??
        item?.item_id ??
        item?.itemID
    );
}


function getItemName(item) {

    return String(
        item?.item_name ??
        item?.itemName ??
        item?.name ??
        item?.description ??
        getItemCode(item) ??
        ""
    ).trim();
}


function getItemUnit(item) {

    return String(
        item?.unit ??
        item?.uom ??
        "-"
    ).trim();
}


function getItemByCode(code) {

    const c = cleanCode(code);

    return (
        items.find(
            item =>
                getItemCode(item) === c
        ) || null
    );
}


// --------------------------------------------------
// SUPABASE LOAD
// --------------------------------------------------

async function loadDashboardFromSupabase() {

    console.log(
        "Loading Dashboard from Supabase..."
    );

    try {

        if (
            typeof supabaseRequest !==
            "function"
        ) {

            throw new Error(
                "supabaseRequest() is not available. Check that supabase.js is loaded before Dashboard.js."
            );
        }


        // -----------------------------------------
        // ITEMS
        // -----------------------------------------

        const itemsResult =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?select=*"
            );


        // -----------------------------------------
        // STOCK IN
        // -----------------------------------------

        const stockInResult =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*"
            );


        // Raw Stock In records.
        // Pending Demand will use these directly.

        stockInRecords =
            stockInResult?.success
                ? (stockInResult.data || [])
                : [];


        console.log(
            "Raw Stock In Records:",
            stockInRecords
        );


        // -----------------------------------------
        // STOCK OUT
        // -----------------------------------------

        const stockOutResult =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*"
            );


        // -----------------------------------------
        // DEMAND HISTORY
        // -----------------------------------------

        const demandResult =
            await supabaseRequest(
                "demand_history",
                "GET",
                null,
                "?select=*"
            );


        // -----------------------------------------
        // SAVE ITEMS
        // -----------------------------------------

        items =
            itemsResult?.success
                ? (itemsResult.data || [])
                : [];


        // SORT ITEMS BY ITEM CODE NUMBER

        items.sort(function(a, b) {

            let codeA = getItemCode(a);
            let codeB = getItemCode(b);

            let numberA =
                parseInt(
                    codeA.replace(/\D/g, ""),
                    10
                );

            let numberB =
                parseInt(
                    codeB.replace(/\D/g, ""),
                    10
                );

            if (isNaN(numberA)) {
                numberA = Infinity;
            }

            if (isNaN(numberB)) {
                numberB = Infinity;
            }

            return numberA - numberB;
        });


        console.log(
            "Dashboard Items sorted by Item Code:",
            items
        );


        // -----------------------------------------
        // BUILD HISTORY
        // -----------------------------------------

        history = [];


        // STOCK IN

        if (stockInResult?.success) {

            (stockInResult.data || []).forEach(r => {

                history.push({

                    id: r.id,

                    date: r.date,

                    time: r.time,

                    itemCode:
                        r.item_code ??
                        r.itemCode ??
                        r.code,

                    itemName:
                        r.item_name ??
                        r.itemName,

                    unit:
                        r.unit,

                    source:
                        r.source,

                    supplier:
                        r.supplier,

                    location:
                        r.location,

                    department:
                        r.department,

                    quantity:
                        safeNumber(
                            r.quantity
                        ),

                    unitCost:
                        safeNumber(
                            r.unit_cost ??
                            r.unitCost ??
                            r.cost ??
                            r.rate
                        ),

                    totalCost:
                        safeNumber(
                            r.total_cost ??
                            r.totalCost
                        ),

                    type:
                        "IN"

                });

            });

        }


        // STOCK OUT

        if (stockOutResult?.success) {

            (stockOutResult.data || []).forEach(r => {

                history.push({

                    id: r.id,

                    date:
                        r.date,

                    time:
                        r.time,

                    itemCode:
                        r.item_code ??
                        r.itemCode ??
                        r.code,

                    itemName:
                        r.item_name ??
                        r.itemName,

                    unit:
                        r.unit,

                    department:
                        r.department,

                    location:
                        r.location,

                    quantity:
                        safeNumber(
                            r.quantity
                        ),

                    type:
                        "OUT"

                });

            });

        }


        // -----------------------------------------
        // DEMAND HISTORY
        // -----------------------------------------

        demandHistory =
            demandResult?.success
                ? (demandResult.data || [])
                : [];


        console.log(
            "Dashboard Demand History:",
            demandHistory
        );


        console.log(
            "Dashboard data loaded from Supabase.",
            {
                items: items.length,
                stockIn:
                    stockInRecords.length,
                history:
                    history.length,
                demandHistory:
                    demandHistory.length
            }
        );


        // -----------------------------------------
        // UPDATE UI
        // -----------------------------------------

        updateMonthUI();

        buildItemSearch();

        loadSavedItem();

        updateDashboard();


    } catch (error) {

        console.error(
            "Dashboard Supabase Load Error:",
            error
        );

        alert(
            "Dashboard data Supabase se load nahi ho saka.\n\n" +
            error.message
        );
    }
}
// --------------------------------------------------
// LATEST RATE
// --------------------------------------------------

function getLatestRate(itemCode) {

    const code =
        cleanCode(itemCode);


    if (!code) {
        return 0;
    }


    const records =
        Array.isArray(demandHistory)
            ? demandHistory
            : [];


    const selectedMonthRecords =
        records
            .filter(record =>
                isDemandRecordSelectedMonth(
                    record
                )
            )
            .sort((a, b) => {

                const idA =
                    safeNumber(a?.id);

                const idB =
                    safeNumber(b?.id);

                return idB - idA;
            });


    for (
        const record
        of selectedMonthRecords
    ) {

        const list =
            getDemandList(record);

        if (!Array.isArray(list)) {
            continue;
        }


        for (
            const demandItem
            of list
        ) {

            if (
                cleanCode(
                    getDemandCode(
                        demandItem
                    )
                ) !== code
            ) {
                continue;
            }


            const rate =
                safeNumber(
                    demandItem?.rate ??
                    demandItem?.unitCost ??
                    demandItem?.unit_cost ??
                    demandItem?.purchaseRate ??
                    demandItem?.purchase_rate ??
                    demandItem?.latestRate ??
                    demandItem?.latest_rate
                );


            if (rate > 0) {
                return rate;
            }
        }
    }


    // -----------------------------------------
    // STOCK IN FALLBACK
    // -----------------------------------------

    const stockIn =
        stockInRecords
            .filter(r =>
                cleanCode(
                    r?.item_code ??
                    r?.itemCode ??
                    r?.code
                ) === code
            )
            .map(r => ({
                record: r,
                date:
                    getRecordDate(r),
                id:
                    safeNumber(r?.id)
            }))
            .sort((a, b) => {

                const timeA =
                    a.date
                        ? a.date.getTime()
                        : 0;

                const timeB =
                    b.date
                        ? b.date.getTime()
                        : 0;

                if (
                    timeB !== timeA
                ) {
                    return timeB - timeA;
                }

                return b.id - a.id;
            });


    for (
        const entry
        of stockIn
    ) {

        const r =
            entry.record;


        const rate =
            safeNumber(
                r?.unit_cost ??
                r?.unitCost ??
                r?.latest_rate ??
                r?.latestRate ??
                r?.rate ??
                r?.cost
            );


        if (rate > 0) {
            return rate;
        }
    }


    return 0;
}


// --------------------------------------------------
// DEMAND HELPERS
// --------------------------------------------------

function getDemandCode(record) {

    return cleanCode(
        record?.item_code ??
        record?.itemCode ??
        record?.code ??
        record?.item ??
        record?.item_id
    );
}


function getDemandValue(record) {

    return safeNumber(
        record?.finalDemand ??
        record?.final_demand ??
        record?.approvedQty ??
        record?.approved_qty ??
        record?.quantity ??
        record?.demand_qty ??
        record?.demandQty ??
        record?.qty
    );
}


function getDemandList(record) {

    if (!record) {
        return [];
    }


    const possible =
        record?.demand_items ??
        record?.demandItems ??
        record?.items ??
        record?.demand_list ??
        record?.demandList;


    if (
        Array.isArray(possible)
    ) {
        return possible;
    }


    return [];
}


function isDemandRecordSelectedMonth(record) {

    const date =
        getDemandGenerateDate(record);


    if (!date) {
        return false;
    }


    return (
        String(date)
            .substring(0, 7) ===
        selectedDashboardMonth
    );
}


// --------------------------------------------------
// DEMAND GENERATE DATE
// --------------------------------------------------

function getDemandGenerateDate(record) {

    if (!record) {
        return "";
    }


    const value =
        record?.generate_date ??
        record?.generateDate ??
        record?.generated_date ??
        record?.generatedDate ??
        record?.date ??
        record?.demand_date ??
        record?.demandDate ??
        record?.created_at ??
        "";


    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    const text =
        String(value).trim();


    if (!text) {
        return "";
    }


    // -----------------------------------------
    // YYYY-MM-DD
    // -----------------------------------------

    const match =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (match) {

        return (
            match[1] +
            "-" +
            match[2] +
            "-" +
            match[3]
        );
    }


    // -----------------------------------------
    // OTHER DATE FORMAT
    // -----------------------------------------

    const d =
        new Date(text);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {
        return "";
    }


    return (
        d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            d.getDate()
        ).padStart(2, "0")
    );
}


// --------------------------------------------------
// NEXT DEMAND GENERATE DATE
// --------------------------------------------------

function getNextDemandGenerateDate(
    currentGenerateDate
) {

    const current =
        String(
            currentGenerateDate || ""
        ).trim();


    if (!current) {
        return "";
    }


    const dates =
        demandHistory
            .map(record =>
                getDemandGenerateDate(
                    record
                )
            )
            .filter(Boolean)
            .filter(date =>
                date > current
            )
            .sort();


    return dates.length
        ? dates[0]
        : "";
}


// --------------------------------------------------
// DATE KEY COMPARISON
// --------------------------------------------------

function dateKeyFromRecord(record) {

    return getDemandGenerateDate(
        record
    );
}


function isStockInInsideDemandCycle(
    record,
    generateDate,
    nextGenerateDate
) {

    const stockDate =
        dateKeyFromRecord(record);


    if (!stockDate) {
        return false;
    }


    if (
        stockDate <
        generateDate
    ) {
        return false;
    }


    // Next Generate Date is exclusive

    if (
        nextGenerateDate &&
        stockDate >=
        nextGenerateDate
    ) {
        return false;
    }


    return true;
}


// --------------------------------------------------
// RECEIVED AGAINST DEMAND
// --------------------------------------------------

function getReceivedAgainstDemand(
    itemCode,
    generateDate,
    nextGenerateDate
) {

    const code =
        cleanCode(itemCode);


    if (
        !code ||
        !generateDate
    ) {
        return 0;
    }


    let received = 0;


    stockInRecords.forEach(
        record => {

            const recordCode =
                cleanCode(
                    record?.item_code ??
                    record?.itemCode ??
                    record?.code
                );


            if (
                recordCode !== code
            ) {
                return;
            }


            if (
                !isStockInInsideDemandCycle(
                    record,
                    generateDate,
                    nextGenerateDate
                )
            ) {
                return;
            }


            received +=
                safeNumber(
                    record?.quantity
                );
        }
    );


    return received;
}


// --------------------------------------------------
// CURRENT MONTH APPROVED DEMAND
// --------------------------------------------------

function getCurrentMonthDemand(
    itemCode
) {

    const code =
        cleanCode(itemCode);


    if (!code) {
        return 0;
    }


    let total = 0;


    demandHistory.forEach(
        record => {

            if (
                !isDemandRecordSelectedMonth(
                    record
                )
            ) {
                return;
            }


            const list =
                getDemandList(record);


            if (
                Array.isArray(list) &&
                list.length
            ) {

                list.forEach(
                    demandItem => {

                        if (
                            cleanCode(
                                getDemandCode(
                                    demandItem
                                )
                            ) === code
                        ) {

                            total +=
                                getDemandValue(
                                    demandItem
                                );
                        }

                    }
                );

                return;
            }


            // -------------------------------------
            // OLD / SIMPLE DEMAND RECORD FORMAT
            // -------------------------------------

            if (
                cleanCode(
                    getDemandCode(record)
                ) === code
            ) {

                total +=
                    getDemandValue(record);
            }

        }
    );


    return total;
}


// --------------------------------------------------
// OVERALL DEMAND
// --------------------------------------------------

function getOverallDemand() {

    return items.reduce(
        (
            sum,
            item
        ) =>
            sum +
            getCurrentMonthDemand(
                getItemCode(item)
            ),
        0
    );
}


// --------------------------------------------------
// PENDING DEMAND
// --------------------------------------------------

function getPendingDemandForItem(
    itemCode
) {

    const code =
        cleanCode(itemCode);


    if (!code) {
        return 0;
    }


    let pending = 0;


    const records =
        Array.isArray(demandHistory)
            ? demandHistory
            : [];


    records.forEach(
        record => {

            const generateDate =
                getDemandGenerateDate(
                    record
                );


            if (!generateDate) {
                return;
            }


            // Demand cycle starts from
            // Generate Date.

            const nextGenerateDate =
                getNextDemandGenerateDate(
                    generateDate
                );


            const list =
                getDemandList(record);


            let approved =
                0;


            if (
                Array.isArray(list) &&
                list.length
            ) {

                list.forEach(
                    demandItem => {

                        if (
                            cleanCode(
                                getDemandCode(
                                    demandItem
                                )
                            ) === code
                        ) {

                            approved +=
                                getDemandValue(
                                    demandItem
                                );
                        }

                    }
                );

            } else {

                if (
                    cleanCode(
                        getDemandCode(record)
                    ) === code
                ) {

                    approved =
                        getDemandValue(
                            record
                        );
                }
            }


            if (
                approved <= 0
            ) {
                return;
            }


            const received =
                getReceivedAgainstDemand(
                    code,
                    generateDate,
                    nextGenerateDate
                );


            const remaining =
                Math.max(
                    approved -
                    received,
                    0
                );


            pending +=
                remaining;

        }
    );


    return pending;
}


// --------------------------------------------------
// PENDING DEMAND FOR SELECTED MONTH
// --------------------------------------------------

function getSelectedMonthPendingDemand(
    itemCode
) {

    const code =
        cleanCode(itemCode);


    if (!code) {
        return 0;
    }


    let totalPending = 0;


    demandHistory.forEach(
        record => {

            const generateDate =
                getDemandGenerateDate(
                    record
                );


            if (!generateDate) {
                return;
            }


            // The demand belongs to the month
            // in which its Generate Date exists.

            if (
                generateDate.substring(0, 7) !==
                selectedDashboardMonth
            ) {
                return;
            }


            const nextGenerateDate =
                getNextDemandGenerateDate(
                    generateDate
                );


            const list =
                getDemandList(record);


            let approved =
                0;


            if (
                Array.isArray(list) &&
                list.length
            ) {

                list.forEach(
                    demandItem => {

                        if (
                            cleanCode(
                                getDemandCode(
                                    demandItem
                                )
                            ) === code
                        ) {

                            approved +=
                                getDemandValue(
                                    demandItem
                                );
                        }

                    }
                );

            } else {

                if (
                    cleanCode(
                        getDemandCode(record)
                    ) === code
                ) {

                    approved =
                        getDemandValue(
                            record
                        );
                }
            }


            if (
                approved <= 0
            ) {
                return;
            }


            const received =
                getReceivedAgainstDemand(
                    code,
                    generateDate,
                    nextGenerateDate
                );


            const remaining =
                Math.max(
                    approved -
                    received,
                    0
                );


            totalPending +=
                remaining;

        }
    );


    return totalPending;
}


// --------------------------------------------------
// LIVE DEMAND MONTHS
// --------------------------------------------------

function getLiveMonthlyDemandStockMonths() {

    /*
       IMPORTANT:

       Actual inventory data is NOT read
       from LocalStorage.

       This function only returns the number
       of months used by the demand calculation.

       If a global value already exists from
       Monthly Demand page, use it.

       Otherwise default = 3 months.
    */

    if (
        typeof window !==
        "undefined" &&
        Number.isFinite(
            Number(
                window.stockMonths
            )
        )
    ) {

        return Math.max(
            1,
            Number(
                window.stockMonths
            )
        );
    }


    return 3;
}


// --------------------------------------------------
// DASHBOARD DEMAND QTY
// --------------------------------------------------

function getDashboardDemandQty(
    itemCode
) {

    /*
       Dashboard stock table should show
       REMAINING QTY, not approved demand.

       Remaining =
       Approved Demand - Received Stock In
    */

    return getSelectedMonthPendingDemand(
        itemCode
    );
}
// --------------------------------------------------
// MASTER OPENING STOCK
// --------------------------------------------------

function getMasterOpeningStock(item) {

    if (!item) {
        return 0;
    }

    return safeNumber(
        item?.opening_Stock ??
        item?.opening_stock ??
        item?.openingStock ??
        item?.opening_qty ??
        item?.opening_quantity ??
        0
    );
}


// --------------------------------------------------
// STOCK RECORD ITEM CODE
// --------------------------------------------------

function getStockItemCode(record) {

    return cleanCode(
        record?.item_code ??
        record?.itemCode ??
        record?.code ??
        record?.item_id ??
        record?.itemID
    );
}


// --------------------------------------------------
// STOCK QUANTITY
// --------------------------------------------------

function getStockQuantity(record) {

    return safeNumber(
        record?.quantity ??
        record?.qty ??
        record?.stock_qty ??
        record?.stockQty ??
        0
    );
}


// --------------------------------------------------
// SELECTED MONTH STOCK IN
// --------------------------------------------------

function getSelectedMonthStockIn(
    itemCode
) {

    const code =
        cleanCode(itemCode);

    if (!code) {
        return 0;
    }

    return stockInRecords.reduce(
        (
            total,
            record
        ) => {

            if (
                getStockItemCode(record) !==
                code
            ) {
                return total;
            }

            if (
                !isSelectedMonth(record)
            ) {
                return total;
            }

            return (
                total +
                getStockQuantity(record)
            );
        },
        0
    );
}


// --------------------------------------------------
// SELECTED MONTH STOCK OUT
// --------------------------------------------------

function getSelectedMonthStockOut(
    itemCode
) {

    const code =
        cleanCode(itemCode);

    if (!code) {
        return 0;
    }

    return history.reduce(
        (
            total,
            record
        ) => {

            if (
                record.type !==
                "OUT"
            ) {
                return total;
            }

            if (
                cleanCode(
                    record.itemCode
                ) !== code
            ) {
                return total;
            }

            if (
                !isSelectedMonth(record)
            ) {
                return total;
            }

            return (
                total +
                safeNumber(
                    record.quantity
                )
            );
        },
        0
    );
}


// --------------------------------------------------
// ALL STOCK IN BEFORE SELECTED MONTH
// --------------------------------------------------

function getStockInBeforeSelectedMonth(
    itemCode
) {

    const code =
        cleanCode(itemCode);

    if (!code) {
        return 0;
    }

    return stockInRecords.reduce(
        (
            total,
            record
        ) => {

            if (
                getStockItemCode(record) !==
                code
            ) {
                return total;
            }

            if (
                !isBeforeSelectedMonth(record)
            ) {
                return total;
            }

            return (
                total +
                getStockQuantity(record)
            );
        },
        0
    );
}


// --------------------------------------------------
// ALL STOCK OUT BEFORE SELECTED MONTH
// --------------------------------------------------

function getStockOutBeforeSelectedMonth(
    itemCode
) {

    const code =
        cleanCode(itemCode);

    if (!code) {
        return 0;
    }

    return history.reduce(
        (
            total,
            record
        ) => {

            if (
                record.type !==
                "OUT"
            ) {
                return total;
            }

            if (
                cleanCode(
                    record.itemCode
                ) !== code
            ) {
                return total;
            }

            if (
                !isBeforeSelectedMonth(record)
            ) {
                return total;
            }

            return (
                total +
                safeNumber(
                    record.quantity
                )
            );
        },
        0
    );
}


// --------------------------------------------------
// MONTHLY OPENING STOCK
// --------------------------------------------------

function getMonthlyOpeningStock(
    item
) {

    const code =
        getItemCode(item);

    if (!code) {
        return 0;
    }


    /*
       Formula:

       Monthly Opening =
       Master Opening
       + All previous Stock In
       - All previous Stock Out
    */

    const masterOpening =
        getMasterOpeningStock(item);


    const previousStockIn =
        getStockInBeforeSelectedMonth(
            code
        );


    const previousStockOut =
        getStockOutBeforeSelectedMonth(
            code
        );


    const opening =
        masterOpening +
        previousStockIn -
        previousStockOut;


    return Math.max(
        opening,
        0
    );
}


// --------------------------------------------------
// CURRENT STOCK
// --------------------------------------------------

function getCurrentStock(
    item
) {

    const code =
        getItemCode(item);

    if (!code) {
        return 0;
    }


    const opening =
        getMonthlyOpeningStock(
            item
        );


    const stockIn =
        getSelectedMonthStockIn(
            code
        );


    const stockOut =
        getSelectedMonthStockOut(
            code
        );


    /*
       Current Stock =
       Opening
       + Current Month Stock In
       - Current Month Stock Out
    */

    return (
        opening +
        stockIn -
        stockOut
    );
}


// --------------------------------------------------
// TOTAL CURRENT STOCK
// --------------------------------------------------

function getTotalCurrentStock() {

    return items.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                getCurrentStock(item)
            );

        },
        0
    );
}


// --------------------------------------------------
// TOTAL STOCK IN
// --------------------------------------------------

function getTotalSelectedMonthStockIn() {

    return items.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                getSelectedMonthStockIn(
                    getItemCode(item)
                )
            );

        },
        0
    );
}


// --------------------------------------------------
// TOTAL STOCK OUT
// --------------------------------------------------

function getTotalSelectedMonthStockOut() {

    return items.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                getSelectedMonthStockOut(
                    getItemCode(item)
                )
            );

        },
        0
    );
}


// --------------------------------------------------
// CURRENT STOCK TABLE
// --------------------------------------------------

function buildCurrentStockTable() {

    const tbody =
        document.getElementById(
            "currentStockTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (!Array.isArray(items) ||
        items.length === 0) {

        tbody.innerHTML =
            `
            <tr>
                <td
                    colspan="9"
                    style="text-align:center;"
                >
                    No items found
                </td>
            </tr>
            `;

        return;
    }


    items.forEach(
        item => {

            const code =
                getItemCode(item);

            const name =
                getItemName(item);

            const unit =
                getItemUnit(item);


            const opening =
                getMonthlyOpeningStock(
                    item
                );


            const stockIn =
                getSelectedMonthStockIn(
                    code
                );


            const stockOut =
                getSelectedMonthStockOut(
                    code
                );


            const current =
                getCurrentStock(
                    item
                );


            const rate =
                getLatestRate(
                    code
                );


            /*
               IMPORTANT:

               یہاں Approved Demand نہیں،
               بلکہ Remaining Demand دکھانی ہے۔

               Remaining =
               Approved Demand
               - Demand Cycle کے اندر Received Stock In
            */

            const remainingQty =
                getSelectedMonthPendingDemand(
                    code
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML =
                "<td>" +
                escapeHTML(
                    code || "-"
                ) +
                "</td>" +

                "<td>" +
                escapeHTML(
                    name || "-"
                ) +
                "</td>" +

                "<td>" +
                escapeHTML(
                    unit || "-"
                ) +
                "</td>" +

                "<td>" +
                opening.toFixed(2) +
                "</td>" +

                "<td>" +
                stockIn.toFixed(2) +
                "</td>" +

                "<td>" +
                stockOut.toFixed(2) +
                "</td>" +

                "<td class='current-stock-cell'>" +
                current.toFixed(2) +
                "</td>" +

                "<td>" +
                "Rs. " +
                rate.toFixed(2) +
                "</td>" +

                "<td>" +
                remainingQty.toFixed(2) +
                "</td>";


            tbody.appendChild(
                row
            );

        }
    );
}


// --------------------------------------------------
// DASHBOARD CARDS
// --------------------------------------------------

function updateDashboardCards() {

    const totalItems =
        items.length;


    const totalStockIn =
        getTotalSelectedMonthStockIn();


    const totalStockOut =
        getTotalSelectedMonthStockOut();


    const totalCurrentStock =
        getTotalCurrentStock();


    const totalDemand =
        getOverallDemand();


    const totalRemainingDemand =
        items.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    getSelectedMonthPendingDemand(
                        getItemCode(item)
                    )
                );

            },
            0
        );


    const itemCountElement =
        document.getElementById(
            "totalItems"
        );


    const stockInElement =
        document.getElementById(
            "totalStockIn"
        );


    const stockOutElement =
        document.getElementById(
            "totalStockOut"
        );


    const currentStockElement =
        document.getElementById(
            "currentStock"
        );


    const demandElement =
        document.getElementById(
            "monthlyDemand"
        );


    if (itemCountElement) {

        itemCountElement.textContent =
            totalItems;
    }


    if (stockInElement) {

        stockInElement.textContent =
            totalStockIn.toFixed(2);
    }


    if (stockOutElement) {

        stockOutElement.textContent =
            totalStockOut.toFixed(2);
    }


    if (currentStockElement) {

        currentStockElement.textContent =
            totalCurrentStock.toFixed(2);
    }


    if (demandElement) {

        /*
           Monthly Demand Card =
           Selected Month Approved Demand

           This card does NOT show
           remaining quantity.
        */

        demandElement.textContent =
            totalDemand.toFixed(2);
    }


    const remainingElement =
        document.getElementById(
            "remainingDemand"
        );


    if (remainingElement) {

        remainingElement.textContent =
            totalRemainingDemand.toFixed(2);
    }
}


// --------------------------------------------------
// DASHBOARD UPDATE
// --------------------------------------------------

function updateDashboard() {

    console.log(
        "Updating Dashboard...",
        {
            selectedMonth:
                selectedDashboardMonth,

            items:
                items.length,

            stockIn:
                stockInRecords.length,

            history:
                history.length,

            demandHistory:
                demandHistory.length
        }
    );


    updateMonthUI();

    updateDashboardCards();

    buildCurrentStockTable();

    updateSelectedItem();

    updateDashboardChart();
}
// --------------------------------------------------
// ITEM SEARCH
// --------------------------------------------------

function buildItemSearch() {

    const select =
        document.getElementById(
            "dashboardItemSelect"
        );

    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML =
        `
        <option value="">
            Select Item
        </option>
        `;


    items.forEach(
        item => {

            const code =
                getItemCode(item);

            const name =
                getItemName(item);


            if (!code) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                code;


            option.textContent =
                code +
                " - " +
                name;


            select.appendChild(
                option
            );
        }
    );


    if (
        currentValue &&
        getItemByCode(
            currentValue
        )
    ) {

        select.value =
            currentValue;
    }
}


// --------------------------------------------------
// SELECT ITEM
// --------------------------------------------------

function selectDashboardItem(
    code
) {

    const clean =
        cleanCode(code);


    if (!clean) {

        selectedItem =
            null;

        updateSelectedItem();

        return;
    }


    selectedItem =
        getItemByCode(clean);


    if (!selectedItem) {

        console.warn(
            "Selected item not found:",
            clean
        );

        return;
    }


    updateSelectedItem();

    updateDashboardChart();
}


// --------------------------------------------------
// SAVED ITEM
// --------------------------------------------------

function saveSelectedItem() {

    if (!selectedItem) {
        return;
    }


    const code =
        getItemCode(
            selectedItem
        );


    if (!code) {
        return;
    }


    try {

        localStorage.setItem(
            "dashboardSelectedItem",
            code
        );

    } catch (error) {

        console.warn(
            "Unable to save selected item:",
            error
        );
    }
}


function loadSavedItem() {

    let code = "";


    try {

        code =
            localStorage.getItem(
                "dashboardSelectedItem"
            ) || "";

    } catch (error) {

        console.warn(
            "Unable to read saved item:",
            error
        );

        code = "";
    }


    if (!code) {

        selectedItem =
            null;

        return;
    }


    const item =
        getItemByCode(code);


    if (item) {

        selectedItem =
            item;

        const select =
            document.getElementById(
                "dashboardItemSelect"
            );


        if (select) {
            select.value =
                code;
        }
    }
}


// --------------------------------------------------
// SELECTED ITEM DETAILS
// --------------------------------------------------

function updateSelectedItem() {

    const codeElement =
        document.getElementById(
            "selectedItemCode"
        );


    const nameElement =
        document.getElementById(
            "selectedItemName"
        );


    const unitElement =
        document.getElementById(
            "selectedItemUnit"
        );


    const openingElement =
        document.getElementById(
            "selectedItemOpening"
        );


    const stockInElement =
        document.getElementById(
            "selectedItemStockIn"
        );


    const stockOutElement =
        document.getElementById(
            "selectedItemStockOut"
        );


    const currentElement =
        document.getElementById(
            "selectedItemCurrentStock"
        );


    const rateElement =
        document.getElementById(
            "selectedItemRate"
        );


    const demandElement =
        document.getElementById(
            "selectedItemDemand"
        );


    const remainingElement =
        document.getElementById(
            "selectedItemRemaining"
        );


    if (!selectedItem) {

        if (codeElement) {
            codeElement.textContent =
                "-";
        }

        if (nameElement) {
            nameElement.textContent =
                "-";
        }

        if (unitElement) {
            unitElement.textContent =
                "-";
        }

        if (openingElement) {
            openingElement.textContent =
                "0.00";
        }

        if (stockInElement) {
            stockInElement.textContent =
                "0.00";
        }

        if (stockOutElement) {
            stockOutElement.textContent =
                "0.00";
        }

        if (currentElement) {
            currentElement.textContent =
                "0.00";
        }

        if (rateElement) {
            rateElement.textContent =
                "Rs. 0.00";
        }

        if (demandElement) {
            demandElement.textContent =
                "0.00";
        }

        if (remainingElement) {
            remainingElement.textContent =
                "0.00";
        }

        return;
    }


    const code =
        getItemCode(
            selectedItem
        );


    const name =
        getItemName(
            selectedItem
        );


    const unit =
        getItemUnit(
            selectedItem
        );


    const opening =
        getMonthlyOpeningStock(
            selectedItem
        );


    const stockIn =
        getSelectedMonthStockIn(
            code
        );


    const stockOut =
        getSelectedMonthStockOut(
            code
        );


    const current =
        getCurrentStock(
            selectedItem
        );


    const rate =
        getLatestRate(
            code
        );


    const demand =
        getCurrentMonthDemand(
            code
        );


    const remaining =
        getSelectedMonthPendingDemand(
            code
        );


    if (codeElement) {
        codeElement.textContent =
            code || "-";
    }


    if (nameElement) {
        nameElement.textContent =
            name || "-";
    }


    if (unitElement) {
        unitElement.textContent =
            unit || "-";
    }


    if (openingElement) {
        openingElement.textContent =
            opening.toFixed(2);
    }


    if (stockInElement) {
        stockInElement.textContent =
            stockIn.toFixed(2);
    }


    if (stockOutElement) {
        stockOutElement.textContent =
            stockOut.toFixed(2);
    }


    if (currentElement) {
        currentElement.textContent =
            current.toFixed(2);
    }


    if (rateElement) {

        rateElement.textContent =
            "Rs. " +
            rate.toFixed(2);
    }


    if (demandElement) {

        demandElement.textContent =
            demand.toFixed(2);
    }


    if (remainingElement) {

        remainingElement.textContent =
            remaining.toFixed(2);
    }


    saveSelectedItem();
}


// --------------------------------------------------
// CHART DATA
// --------------------------------------------------

function getItemMonthlyStockData(
    itemCode
) {

    const code =
        cleanCode(itemCode);


    const result = [];


    if (!code) {
        return result;
    }


    const selected =
        getSelectedMonthParts();


    const year =
        selected.year;


    const month =
        selected.month;


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const date =
            new Date(
                year,
                month - (5 - i),
                1
            );


        const key =
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(2, "0");


        const item =
            getItemByCode(
                code
            );


        if (!item) {
            continue;
        }


        const opening =
            getOpeningForMonthKey(
                item,
                key
            );


        const stockIn =
            getStockInForMonthKey(
                code,
                key
            );


        const stockOut =
            getStockOutForMonthKey(
                code,
                key
            );


        const closing =
            opening +
            stockIn -
            stockOut;


        result.push({

            month:
                key,

            opening:
                opening,

            stockIn:
                stockIn,

            stockOut:
                stockOut,

            closing:
                closing

        });
    }


    return result;
}


// --------------------------------------------------
// OPENING FOR ANY MONTH
// --------------------------------------------------

function getOpeningForMonthKey(
    item,
    monthKey
) {

    const code =
        getItemCode(item);


    const masterOpening =
        getMasterOpeningStock(item);


    const targetParts =
        String(
            monthKey
        ).split("-");


    const targetYear =
        Number(
            targetParts[0]
        );


    const targetMonth =
        Number(
            targetParts[1]
        ) - 1;


    let opening =
        masterOpening;


    stockInRecords.forEach(
        record => {

            const recordKey =
                getRecordMonthKey(
                    record
                );


            if (!recordKey) {
                return;
            }


            const parts =
                recordKey.split("-");


            const recordYear =
                Number(parts[0]);


            const recordMonth =
                Number(parts[1]) - 1;


            const isBefore =
                (
                    recordYear <
                    targetYear
                ) ||
                (
                    recordYear ===
                    targetYear &&
                    recordMonth <
                    targetMonth
                );


            if (
                !isBefore
            ) {
                return;
            }


            if (
                getStockItemCode(record) !==
                code
            ) {
                return;
            }


            opening +=
                getStockQuantity(record);
        }
    );


    history.forEach(
        record => {

            if (
                record.type !==
                "OUT"
            ) {
                return;
            }


            const recordKey =
                getRecordMonthKey(
                    record
                );


            if (!recordKey) {
                return;
            }


            const parts =
                recordKey.split("-");


            const recordYear =
                Number(parts[0]);


            const recordMonth =
                Number(parts[1]) - 1;


            const isBefore =
                (
                    recordYear <
                    targetYear
                ) ||
                (
                    recordYear ===
                    targetYear &&
                    recordMonth <
                    targetMonth
                );


            if (
                !isBefore
            ) {
                return;
            }


            if (
                cleanCode(
                    record.itemCode
                ) !== code
            ) {
                return;
            }


            opening -=
                safeNumber(
                    record.quantity
                );
        }
    );


    return Math.max(
        opening,
        0
    );
}


// --------------------------------------------------
// STOCK IN FOR MONTH KEY
// --------------------------------------------------

function getStockInForMonthKey(
    itemCode,
    monthKey
) {

    const code =
        cleanCode(itemCode);


    return stockInRecords.reduce(
        (
            total,
            record
        ) => {

            if (
                getStockItemCode(record) !==
                code
            ) {
                return total;
            }


            if (
                getRecordMonthKey(record) !==
                monthKey
            ) {
                return total;
            }


            return (
                total +
                getStockQuantity(record)
            );
        },
        0
    );
}


// --------------------------------------------------
// STOCK OUT FOR MONTH KEY
// --------------------------------------------------

function getStockOutForMonthKey(
    itemCode,
    monthKey
) {

    const code =
        cleanCode(itemCode);


    return history.reduce(
        (
            total,
            record
        ) => {

            if (
                record.type !==
                "OUT"
            ) {
                return total;
            }


            if (
                cleanCode(
                    record.itemCode
                ) !== code
            ) {
                return total;
            }


            if (
                getRecordMonthKey(record) !==
                monthKey
            ) {
                return total;
            }


            return (
                total +
                safeNumber(
                    record.quantity
                )
            );
        },
        0
    );
}
// --------------------------------------------------
// DASHBOARD CHART
// --------------------------------------------------

function updateDashboardChart() {

    const canvas =
        document.getElementById(
            "dashboardChart"
        );


    if (!canvas) {
        return;
    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js is not loaded."
        );

        return;
    }


    if (
        !selectedItem
    ) {

        if (dashboardChart) {

            dashboardChart.destroy();

            dashboardChart =
                null;
        }

        return;
    }


    const code =
        getItemCode(
            selectedItem
        );


    const data =
        getItemMonthlyStockData(
            code
        );


    const labels =
        data.map(
            row =>
                getMonthName(
                    row.month
                )
        );


    const openingData =
        data.map(
            row =>
                Number(
                    row.opening.toFixed(2)
                )
        );


    const stockInData =
        data.map(
            row =>
                Number(
                    row.stockIn.toFixed(2)
                )
        );


    const stockOutData =
        data.map(
            row =>
                Number(
                    row.stockOut.toFixed(2)
                )
        );


    const closingData =
        data.map(
            row =>
                Number(
                    row.closing.toFixed(2)
                )
        );


    if (dashboardChart) {

        dashboardChart.destroy();

        dashboardChart =
            null;
    }


    dashboardChart =
        new Chart(
            canvas,
            {

                type:
                    "line",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {
                            label:
                                "Opening Stock",

                            data:
                                openingData,

                            borderWidth:
                                2,

                            tension:
                                0.25
                        },

                        {
                            label:
                                "Stock In",

                            data:
                                stockInData,

                            borderWidth:
                                2,

                            tension:
                                0.25
                        },

                        {
                            label:
                                "Stock Out",

                            data:
                                stockOutData,

                            borderWidth:
                                2,

                            tension:
                                0.25
                        },

                        {
                            label:
                                "Closing Stock",

                            data:
                                closingData,

                            borderWidth:
                                2,

                            tension:
                                0.25
                        }

                    ]
                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        mode:
                            "index",

                        intersect:
                            false
                    },


                    plugins: {

                        legend: {

                            display:
                                true
                        }

                    },


                    scales: {

                        y: {

                            beginAtZero:
                                true

                        }

                    }

                }

            }
        );
}


// --------------------------------------------------
// ITEM SUMMARY
// --------------------------------------------------

function getSelectedItemSummary() {

    if (!selectedItem) {

        return {

            code: "",

            name: "",

            unit: "",

            opening: 0,

            stockIn: 0,

            stockOut: 0,

            current: 0,

            rate: 0,

            demand: 0,

            remaining: 0

        };
    }


    const code =
        getItemCode(
            selectedItem
        );


    return {

        code:
            code,

        name:
            getItemName(
                selectedItem
            ),

        unit:
            getItemUnit(
                selectedItem
            ),

        opening:
            getMonthlyOpeningStock(
                selectedItem
            ),

        stockIn:
            getSelectedMonthStockIn(
                code
            ),

        stockOut:
            getSelectedMonthStockOut(
                code
            ),

        current:
            getCurrentStock(
                selectedItem
            ),

        rate:
            getLatestRate(
                code
            ),

        demand:
            getCurrentMonthDemand(
                code
            ),

        remaining:
            getSelectedMonthPendingDemand(
                code
            )

    };
}


// --------------------------------------------------
// NAVIGATION
// --------------------------------------------------

function openDashboardItem(
    code
) {

    const clean =
        cleanCode(code);


    if (!clean) {
        return;
    }


    selectedItem =
        getItemByCode(
            clean
        );


    if (!selectedItem) {
        return;
    }


    try {

        localStorage.setItem(
            "dashboardSelectedItem",
            clean
        );

    } catch (error) {

        console.warn(
            "Unable to save dashboard item:",
            error
        );
    }


    updateSelectedItem();

    updateDashboardChart();
}


// --------------------------------------------------
// REFRESH DASHBOARD
// --------------------------------------------------

async function refreshDashboard() {

    const button =
        document.getElementById(
            "refreshDashboard"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Loading...";
    }


    try {

        await loadDashboardFromSupabase();

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Refresh";
        }
    }
}


// --------------------------------------------------
// SUPABASE CONNECTION CHECK
// --------------------------------------------------

async function checkDashboardConnection() {

    const status =
        document.getElementById(
            "dashboardConnectionStatus"
        );


    if (status) {

        status.textContent =
            "Checking...";
    }


    try {

        if (
            typeof supabaseRequest !==
            "function"
        ) {

            throw new Error(
                "Supabase connection function not found."
            );
        }


        const result =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?select=id&limit=1"
            );


        if (
            result?.success
        ) {

            if (status) {

                status.textContent =
                    "Supabase Connected";
            }

            return true;
        }


        throw new Error(
            result?.error ||
            "Supabase request failed."
        );


    } catch (error) {

        console.error(
            "Supabase connection error:",
            error
        );


        if (status) {

            status.textContent =
                "Supabase Connection Error";
        }


        return false;
    }
}


// --------------------------------------------------
// MONTH NAVIGATION
// --------------------------------------------------

function changeDashboardMonth(
    offset
) {

    const current =
        String(
            selectedDashboardMonth
        ).split("-");


    let year =
        Number(
            current[0]
        );


    let month =
        Number(
            current[1]
        ) - 1;


    const date =
        new Date(
            year,
            month + Number(offset),
            1
        );


    selectedDashboardMonth =
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    updateMonthUI();

    updateDashboard();
}


// --------------------------------------------------
// GO TO CURRENT MONTH
// --------------------------------------------------

function goToCurrentDashboardMonth() {

    selectedDashboardMonth =
        getTodayMonthKey();


    updateMonthUI();

    updateDashboard();
}


// --------------------------------------------------
// MONTH INPUT EVENT
// --------------------------------------------------

function handleDashboardMonthChange(
    event
) {

    const value =
        event?.target?.value;


    if (
        !value ||
        !/^\d{4}-\d{2}$/.test(
            value
        )
    ) {
        return;
    }


    selectedDashboardMonth =
        value;


    updateMonthUI();

    updateDashboard();
}


// --------------------------------------------------
// SEARCH ITEM
// --------------------------------------------------

function handleDashboardItemChange(
    event
) {

    const value =
        event?.target?.value ||
        "";


    selectDashboardItem(
        value
    );
}


// --------------------------------------------------
// DASHBOARD TABLE SEARCH
// --------------------------------------------------

function filterCurrentStockTable(
    searchText
) {

    const tbody =
        document.getElementById(
            "currentStockTableBody"
        );


    if (!tbody) {
        return;
    }


    const search =
        String(
            searchText || ""
        )
        .trim()
        .toLowerCase();


    const rows =
        tbody.querySelectorAll(
            "tr"
        );


    rows.forEach(
        row => {

            const text =
                String(
                    row.textContent || ""
                )
                .toLowerCase();


            if (
                !search ||
                text.includes(search)
            ) {

                row.style.display =
                    "";

            } else {

                row.style.display =
                    "none";
            }
        }
    );
}


// --------------------------------------------------
// DASHBOARD INITIALIZATION
// --------------------------------------------------

async function initializeDashboard() {

    console.log(
        "Initializing Dashboard..."
    );


    updateMonthUI();


    // Build empty UI first

    buildItemSearch();


    updateDashboard();


    // -----------------------------------------
    // Load REAL DATA from Supabase
    // -----------------------------------------

    await loadDashboardFromSupabase();


    // -----------------------------------------
    // Connection status
    // -----------------------------------------

    await checkDashboardConnection();


    console.log(
        "Dashboard initialized successfully."
    );
}


// --------------------------------------------------
// DOM READY
// --------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "Dashboard DOM ready."
        );


        // -------------------------------------
        // MONTH INPUT
        // -------------------------------------

        const monthPicker =
            document.getElementById(
                "dashboardMonth"
            );


        if (monthPicker) {

            monthPicker.addEventListener(
                "change",
                handleDashboardMonthChange
            );
        }


        // -------------------------------------
        // PREVIOUS MONTH
        // -------------------------------------

        const previousButton =
            document.getElementById(
                "previousMonth"
            );


        if (previousButton) {

            previousButton.addEventListener(
                "click",
                function() {

                    changeDashboardMonth(
                        -1
                    );

                }
            );
        }


        // -------------------------------------
        // NEXT MONTH
        // -------------------------------------

        const nextButton =
            document.getElementById(
                "nextMonth"
            );


        if (nextButton) {

            nextButton.addEventListener(
                "click",
                function() {

                    changeDashboardMonth(
                        1
                    );

                }
            );
        }


        // -------------------------------------
        // CURRENT MONTH
        // -------------------------------------

        const currentButton =
            document.getElementById(
                "currentMonth"
            );


        if (currentButton) {

            currentButton.addEventListener(
                "click",
                goToCurrentDashboardMonth
            );
        }


        // -------------------------------------
        // ITEM SELECT
        // -------------------------------------

        const itemSelect =
            document.getElementById(
                "dashboardItemSelect"
            );


        if (itemSelect) {

            itemSelect.addEventListener(
                "change",
                handleDashboardItemChange
            );
        }


        // -------------------------------------
        // SEARCH
        // -------------------------------------

        const searchInput =
            document.getElementById(
                "stockTableSearch"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                function(event) {

                    filterCurrentStockTable(
                        event.target.value
                    );

                }
            );
        }


        // -------------------------------------
        // REFRESH
        // -------------------------------------

        const refreshButton =
            document.getElementById(
                "refreshDashboard"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                refreshDashboard
            );
        }


        // -------------------------------------
        // INITIAL LOAD
        // -------------------------------------

        initializeDashboard();

    }
);
// --------------------------------------------------
// NAVIGATION
// --------------------------------------------------

function saveSelectedItem() {

    if (!selectedItem) {

        alert(
            "Please enter a valid Item ID first."
        );

        return false;
    }


    localStorage.setItem(

        "dashboardSelectedItem",

        getItemCode(selectedItem)

    );


    return true;
}


function openMasterView() {

    if (selectedItem) {

        saveSelectedItem();
    }


    window.location.href =
        "Master List .html";
}


function newMasterEntry() {

    window.location.href =
        "Master List .html";
}


function openStockInView() {

    if (!saveSelectedItem()) {
        return;
    }


    localStorage.setItem(

        "historyViewType",

        "stockIn"

    );


    window.location.href =
        "Stock In History.html";
}


function newStockIn() {

    if (selectedItem) {

        localStorage.setItem(

            "stockInSelectedItem",

            getItemCode(selectedItem)

        );
    }


    window.location.href =
        "Stock In .html";
}


function openStockOutView() {

    if (!saveSelectedItem()) {
        return;
    }


    localStorage.setItem(

        "historyViewType",

        "stockOut"

    );


    window.location.href =
        "Stock Out History.html";
}


function newStockOut() {

    if (selectedItem) {

        localStorage.setItem(

            "stockOutSelectedItem",

            getItemCode(selectedItem)

        );
    }


    window.location.href =
        "Stock out .html";
}


function openCostView() {

    if (selectedItem) {

        localStorage.setItem(

            "dashboardSelectedItem",

            getItemCode(selectedItem)

        );

    } else {

        localStorage.removeItem(
            "dashboardSelectedItem"
        );
    }


    window.location.href =
        "Cost .html";
}


function newCostEntry() {

    if (selectedItem) {

        localStorage.setItem(

            "costSelectedItem",

            getItemCode(selectedItem)

        );
    }


    window.location.href =
        "Cost .html";
}


function openDemandView() {

    if (!saveSelectedItem()) {
        return;
    }


    localStorage.setItem(

        "demandViewItem",

        getItemCode(selectedItem)

    );


    window.location.href =
        "Demand History.html";
}


function newDemandEntry() {

    if (selectedItem) {

        localStorage.setItem(

            "demandSelectedItem",

            getItemCode(selectedItem)

        );
    }


    window.location.href =
        "Monthly Demand .html";
}


function openGraph() {

    if (!saveSelectedItem()) {
        return;
    }


    window.location.href =
        "Graphs.html";
}


function openUserProfile() {

    window.location.href =
        "User Profile.html";
}


// --------------------------------------------------
// SAVED ITEM
// --------------------------------------------------

function loadSavedItem() {

    const saved =
        localStorage.getItem(
            "dashboardSelectedItem"
        );


    if (saved) {

        const item =
            getItemByCode(saved);


        if (item) {

            selectedItem =
                item;


            const box =
                document.getElementById(
                    "itemSearch"
                );


            if (box) {

                box.value =
                    getItemCode(item);
            }
        }
    }


    updateMonthUI();

    updateDashboard();
}


// --------------------------------------------------
// REFRESH
// --------------------------------------------------

async function refreshDashboardData() {

    await loadDashboardFromSupabase();
}


// --------------------------------------------------
// START
// --------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateMonthUI();


        const picker =
            document.getElementById(
                "dashboardMonth"
            );


        if (picker) {

            picker.addEventListener(
                "change",
                function () {

                    setDashboardMonth(
                        picker.value
                    );

                }
            );
        }


        loadDashboardFromSupabase();

    }
);


// --------------------------------------------------
// VISIBILITY REFRESH
// --------------------------------------------------

document.addEventListener(
    "visibilitychange",
    function () {

        if (

            document.visibilityState ===
            "visible"

        ) {

            refreshDashboardData();
        }

    }
);


// --------------------------------------------------
// GLOBAL ERROR SAFETY
// --------------------------------------------------

window.handleItemPictureError =
    handleItemPictureError;


console.log(
    "✅ Dashboard.js loaded successfully."
);
