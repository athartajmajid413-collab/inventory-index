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
                            r.latest_rate ??
                            r.rate
                        ),

                    totalCost:
                        safeNumber(
                            r.total_cost ??
                            r.totalCost
                        ),

                    type:
                        "Stock In"
                });

            });
        }


        // STOCK OUT
        if (stockOutResult?.success) {

            (stockOutResult.data || []).forEach(r => {

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
                        0,

                    totalCost:
                        0,

                    type:
                        "Stock Issue"
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
            "Supabase Items:",
            items.length
        );

        console.log(
            "Supabase Stock In:",
            history.filter(
                x => x.type === "Stock In"
            ).length
        );

        console.log(
            "Supabase Stock Out:",
            history.filter(
                x => x.type === "Stock Issue"
            ).length
        );

        console.log(
            "Supabase Demand History:",
            demandHistory.length
        );


        const status =
            document.getElementById(
                "searchInfo"
            );


        if (
            status &&
            !selectedItem
        ) {

            status.innerHTML =
                "✅ Supabase connected — " +
                items.length +
                " items loaded.";
        }


        updateMonthUI();

        loadSavedItem();

    } catch (error) {

        console.error(
            "Dashboard Supabase Load Error:",
            error
        );


        const status =
            document.getElementById(
                "searchInfo"
            );


        if (status) {

            status.innerHTML =
                "❌ Supabase data load error: " +
                escapeHTML(
                    error.message || error
                );
        }


        clearSelectedCards();

        buildCurrentStockTable();
    }
}


// --------------------------------------------------
// MONTHLY STOCK CALCULATIONS
// --------------------------------------------------

function getMasterOpeningStock(item) {

    return safeNumber(
        item?.opening_Stock ??
        item?.opening_stock ??
        item?.openingStock ??
        item?.opening_qty ??
        item?.opening_quantity
    );
}


function getStockBeforeMonth(itemCode) {

    let totalIn = 0;

    let totalOut = 0;

    const code =
        cleanCode(itemCode);


    history.forEach(r => {

        if (
            cleanCode(r.itemCode) !==
            code
        ) {
            return;
        }

        if (
            !isBeforeSelectedMonth(r)
        ) {
            return;
        }


        if (
            r.type === "Stock In"
        ) {

            totalIn +=
                safeNumber(
                    r.quantity
                );
        }


        if (
            r.type === "Stock Issue" ||
            r.type === "Stock Out"
        ) {

            totalOut +=
                safeNumber(
                    r.quantity
                );
        }

    });


    return totalIn - totalOut;
}


function getMonthlyOpeningStock(item) {

    if (!item) {
        return 0;
    }

    return Math.max(

        getMasterOpeningStock(item) +

        getStockBeforeMonth(
            getItemCode(item)
        ),

        0
    );
}


function getSelectedMonthStockIn(itemCode) {

    const code =
        cleanCode(itemCode);

    let total = 0;


    history.forEach(r => {

        if (

            r.type === "Stock In" &&

            cleanCode(r.itemCode) ===
            code &&

            isSelectedMonth(r)

        ) {

            total +=
                safeNumber(
                    r.quantity
                );
        }

    });


    return total;
}


function getSelectedMonthStockOut(itemCode) {

    const code =
        cleanCode(itemCode);

    let total = 0;


    history.forEach(r => {

        if (

            (
                r.type === "Stock Issue" ||
                r.type === "Stock Out"
            ) &&

            cleanCode(r.itemCode) ===
            code &&

            isSelectedMonth(r)

        ) {

            total +=
                safeNumber(
                    r.quantity
                );
        }

    });


    return total;
}


function getCurrentStock(item) {

    if (!item) {
        return 0;
    }


    const opening =
        getMonthlyOpeningStock(item);


    const stockIn =
        getSelectedMonthStockIn(
            getItemCode(item)
        );


    const stockOut =
        getSelectedMonthStockOut(
            getItemCode(item)
        );


    return Math.max(

        opening +
        stockIn -
        stockOut,

        0
    );
}


// BACKWARD COMPATIBILITY

function getCurrentMonthStockIn(itemCode) {

    return getSelectedMonthStockIn(
        itemCode
    );
}


function getCurrentMonthStockOut(itemCode) {

    return getSelectedMonthStockOut(
        itemCode
    );
}


function getAllStockIn(itemCode) {

    const code =
        cleanCode(itemCode);


    return history
        .filter(
            r =>
                r.type === "Stock In" &&
                cleanCode(r.itemCode) ===
                code
        )
        .reduce(
            (sum, r) =>
                sum +
                safeNumber(
                    r.quantity
                ),
            0
        );
}


function getAllStockOut(itemCode) {

    const code =
        cleanCode(itemCode);


    return history
        .filter(
            r =>
                (
                    r.type === "Stock Issue" ||
                    r.type === "Stock Out"
                ) &&
                cleanCode(r.itemCode) ===
                code
        )
        .reduce(
            (sum, r) =>
                sum +
                safeNumber(
                    r.quantity
                ),
            0
        );
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


                if (idA !== idB) {
                    return idB - idA;
                }


                const dateA =
                    getRecordDate(a);

                const dateB =
                    getRecordDate(b);


                return (

                    (dateB
                        ? dateB.getTime()
                        : 0) -

                    (dateA
                        ? dateA.getTime()
                        : 0)

                );

            });


    function findDemandRate(record) {

        const list =
            getDemandList(record);


        if (!Array.isArray(list)) {
            return null;
        }


        for (const detail of list) {

            const detailCode =
                cleanCode(

                    detail?.itemCode ??
                    detail?.item_code ??
                    detail?.code ??
                    detail?.itemID ??
                    detail?.itemId

                );


            if (
                detailCode !== code
            ) {
                continue;
            }


            const rate =

                detail?.latestRate ??
                detail?.latest_rate ??
                detail?.latestCost ??
                detail?.latest_cost ??
                detail?.secondRate ??
                detail?.second_rate ??
                detail?.firstRate ??
                detail?.first_rate;


            if (

                rate !== null &&
                rate !== undefined &&
                String(rate).trim() !== "" &&
                String(rate).trim() !== "-"

            ) {

                const number =
                    safeNumber(rate);


                if (number > 0) {

                    console.log(
                        "✅ Latest Rate from Monthly Demand:",
                        code,
                        number
                    );

                    return number;
                }
            }
        }


        return null;
    }


    for (
        const record of selectedMonthRecords
    ) {

        const rate =
            findDemandRate(record);


        if (rate !== null) {
            return rate;
        }
    }


    const sortedRecords =
        [...records].sort((a, b) => {

            const idA =
                safeNumber(a?.id);

            const idB =
                safeNumber(b?.id);


            if (idA !== idB) {
                return idB - idA;
            }


            const dateA =
                getRecordDate(a);

            const dateB =
                getRecordDate(b);


            return (

                (dateB
                    ? dateB.getTime()
                    : 0) -

                (dateA
                    ? dateA.getTime()
                    : 0)

            );

        });


    for (
        const record of sortedRecords
    ) {

        const rate =
            findDemandRate(record);


        if (rate !== null) {
            return rate;
        }
    }


    const stockEntries =
        history
            .filter(
                r =>
                    r.type === "Stock In" &&
                    cleanCode(r.itemCode) ===
                    code
            )
            .sort((a, b) => {

                const da =
                    getRecordDate(a);

                const db =
                    getRecordDate(b);


                return (

                    (db
                        ? db.getTime()
                        : 0) -

                    (da
                        ? da.getTime()
                        : 0)

                );

            });


    if (
        stockEntries.length
    ) {

        const rate =
            stockEntries[0].unitCost ??
            stockEntries[0].latestRate ??
            stockEntries[0].rate;


        const number =
            safeNumber(rate);


        if (number > 0) {
            return number;
        }
    }


    const item =
        getItemByCode(code);


    return safeNumber(

        item?.latest_rate ??
        item?.latestRate ??
        item?.unit_cost ??
        item?.unitCost ??
        item?.cost ??
        item?.rate

    );
}


// --------------------------------------------------
// DEMAND HISTORY HELPERS
// --------------------------------------------------

function getDemandCode(record) {

    return cleanCode(

        record?.item_code ??
        record?.itemCode ??
        record?.code ??
        record?.item_id ??
        record?.itemID ??
        record?.itemId

    );
}


function getDemandValue(record) {

    return safeNumber(

        record?.final_demand ??
        record?.finalDemand ??
        record?.approved_qty ??
        record?.approvedQty ??
        record?.demand_qty ??
        record?.demandQty ??
        record?.demand_quantity ??
        record?.demandQuantity ??
        record?.quantity ??
        record?.qty

    );
}


function getDemandList(record) {

    let list =

        record?.demand_items ??
        record?.demandItems ??
        record?.items ??
        record?.demands ??
        [];


    if (
        typeof list === "string"
    ) {

        try {

            list =
                JSON.parse(list);

        } catch (e) {

            list = [];
        }
    }


    return Array.isArray(list)
        ? list
        : [];
}


// --------------------------------------------------
// APPROVED DEMAND HELPERS
// --------------------------------------------------

function getApprovedDemandItemCode(detail) {

    return cleanCode(

        detail?.itemCode ??
        detail?.item_code ??
        detail?.code ??
        detail?.itemID ??
        detail?.itemId ??
        detail?.item_id

    );
}


function getApprovedDemandItemName(detail) {

    return String(

        detail?.itemName ??
        detail?.item_name ??
        detail?.name ??
        detail?.description ??
        ""

    ).trim();
}


function getApprovedDemandUnit(detail) {

    return String(

        detail?.unit ??
        detail?.uom ??
        "-"

    ).trim();
}


function getApprovedDemandQuantity(detail) {

    return safeNumber(

        detail?.approvedQty ??
        detail?.approved_qty ??
        detail?.finalDemand ??
        detail?.final_demand ??
        detail?.demandQty ??
        detail?.demand_qty ??
        detail?.quantity ??
        detail?.qty

    );
}


function isDemandRecordSelectedMonth(record) {

    const explicitMonth =
        String(

            record?.demand_month ??
            record?.demandMonth ??
            record?.month ??
            ""

        ).trim();


    if (explicitMonth) {

        return (

            explicitMonth ===
            selectedDashboardMonth

        );
    }


    return isSelectedMonth(
        record
    );
}


/*
    Selected month کی Demand History سے
    approved demand list تیار کی جاتی ہے.
*/

function getSelectedMonthApprovedDemandList() {

    const result = [];


    const records =
        Array.isArray(demandHistory)
            ? demandHistory
            : [];


    const selectedRecords =
        records.filter(
            record =>
                isDemandRecordSelectedMonth(
                    record
                )
        );


    selectedRecords.forEach(record => {

        const list =
            getDemandList(record);


        if (
            Array.isArray(list) &&
            list.length > 0
        ) {

            list.forEach(detail => {

                const code =
                    getApprovedDemandItemCode(
                        detail
                    );


                if (!code) {
                    return;
                }


                const item =
                    getItemByCode(code);


                const name =

                    getApprovedDemandItemName(
                        detail
                    ) ||

                    (
                        item
                            ? getItemName(item)
                            : code
                    );


                const unit =

                    getApprovedDemandUnit(
                        detail
                    ) !== "-"
                        ? getApprovedDemandUnit(
                            detail
                        )
                        : (
                            item
                                ? getItemUnit(item)
                                : "-"
                        );


                const quantity =
                    getApprovedDemandQuantity(
                        detail
                    );


                if (
                    quantity <= 0
                ) {
                    return;
                }


                result.push({

                    code:
                        code,

                    name:
                        name,

                    unit:
                        unit,

                    quantity:
                        quantity,

                    recordId:
                        record?.id

                });

            });


            return;
        }


        const directCode =
            getDemandCode(record);


        if (
            directCode
        ) {

            const item =
                getItemByCode(
                    directCode
                );


            const quantity =
                getDemandValue(
                    record
                );


            if (
                quantity > 0
            ) {

                result.push({

                    code:
                        directCode,

                    name:
                        (
                            record?.item_name ??
                            record?.itemName ??
                            record?.name ??
                            (
                                item
                                    ? getItemName(item)
                                    : directCode
                            )
                        ),

                    unit:
                        (
                            record?.unit ??
                            (
                                item
                                    ? getItemUnit(item)
                                    : "-"
                            )
                        ),

                    quantity:
                        quantity,

                    recordId:
                        record?.id

                });
            }
        }

    });


    const unique = {};


    result.forEach(row => {

        const code =
            cleanCode(row.code);


        if (!code) {
            return;
        }


        unique[code] = row;

    });


    return Object.values(unique);
}


// --------------------------------------------------
// MONTHLY DEMAND CARD
// --------------------------------------------------

function buildMonthlyDemandCardList() {

    const container =
        document.getElementById(
            "demandInfo"
        );


    if (!container) {
        return;
    }


    const approvedList =
        getSelectedMonthApprovedDemandList();


    if (selectedItem) {

        const selectedCode =
            getItemCode(
                selectedItem
            );


        const found =
            approvedList.find(
                row =>
                    cleanCode(row.code) ===
                    cleanCode(selectedCode)
            );


        if (!found) {

            container.innerHTML = "";

            return;
        }


        container.innerHTML =

            '<div style="' +
            'font-size:14px;' +
            'font-weight:bold;' +
            'padding:4px 2px;' +
            'overflow:hidden;' +
            'text-overflow:ellipsis;' +
            'white-space:nowrap;' +
            '">' +

            escapeHTML(
                found.name ||
                selectedCode
            ) +

            '</div>' +

            '<div style="' +
            'display:flex;' +
            'justify-content:space-between;' +
            'align-items:center;' +
            'gap:10px;' +
            'padding:7px 3px;' +
            'border-top:1px solid rgba(255,255,255,.25);' +
            'font-size:14px;' +
            '">' +

            '<span style="font-weight:bold;">' +
            'Approved Demand' +
            '</span>' +

            '<span style="' +
            'font-weight:bold;' +
            'white-space:nowrap;' +
            '">' +

            safeNumber(
                found.quantity
            ).toFixed(2) +

            ' ' +

            escapeHTML(
                found.unit
            ) +

            '</span>' +

            '</div>';

        return;
    }


    if (
        approvedList.length === 0
    ) {

        container.innerHTML =
            '<div style="' +
            'font-size:14px;' +
            'padding:5px 0;' +
            '">' +

            'No Approved Demand for ' +

            escapeHTML(
                getMonthName(
                    selectedDashboardMonth
                )
            ) +

            '</div>';

        return;
    }


    approvedList.sort(
        function(a, b) {

            let codeA =
                cleanCode(a.code);

            let codeB =
                cleanCode(b.code);


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


            if (
                isNaN(numberA)
            ) {
                numberA = Infinity;
            }


            if (
                isNaN(numberB)
            ) {
                numberB = Infinity;
            }


            if (
                numberA !== numberB
            ) {

                return (
                    numberA -
                    numberB
                );
            }


            return codeA.localeCompare(
                codeB,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base"
                }
            );

        }
    );


    let html =

        '<div style="' +

        'height:105px;' +

        'max-height:105px;' +

        'overflow-y:auto;' +

        'overflow-x:hidden;' +

        'padding-right:5px;' +

        '">';


    approvedList.forEach(
        function(row) {

            html +=

                '<div style="' +

                'display:flex;' +

                'justify-content:space-between;' +

                'align-items:center;' +

                'gap:10px;' +

                'padding:5px 3px;' +

                'border-bottom:1px solid rgba(255,255,255,.25);' +

                'font-size:14px;' +

                '">' +

                '<span style="' +

                'flex:1;' +

                'min-width:0;' +

                'overflow:hidden;' +

                'text-overflow:ellipsis;' +

                'white-space:nowrap;' +

                'font-weight:bold;' +

                '">' +

                escapeHTML(
                    row.code
                ) +

                ' - ' +

                escapeHTML(
                    row.name
                ) +

                '</span>' +

                '<span style="' +

                'font-weight:bold;' +

                'white-space:nowrap;' +

                '">' +

                safeNumber(
                    row.quantity
                ).toFixed(2) +

                ' ' +

                escapeHTML(
                    row.unit
                ) +

                '</span>' +

                '</div>';

        }
    );


    html +=
        '</div>';


    container.innerHTML =
        html;
}


// --------------------------------------------------
// LIVE MONTHLY DEMAND - COMPATIBILITY ONLY
// --------------------------------------------------

function getLiveMonthlyDemandStockMonths(itemCode) {

    const code =
        cleanCode(itemCode);

    let stockMonths = {};


    try {

        const saved =
            localStorage.getItem(
                "stockMonths"
            );


        if (saved) {

            const parsed =
                JSON.parse(saved);


            if (

                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)

            ) {

                stockMonths =
                    parsed;
            }
        }

    } catch (error) {

        console.warn(
            "Could not read stockMonths:",
            error
        );
    }


    let value =
        stockMonths[code];


    if (

        value === undefined ||
        value === null ||
        value === ""

    ) {

        value = 3;
    }


    return (
        safeNumber(value) ||
        3
    );
}


// LIVE AVERAGE CONSUMPTION

function getLiveAverageConsumption(itemCode) {

    const code =
        cleanCode(itemCode);


    if (!code) {
        return 0;
    }


    const monthlyTotals = {};


    history.forEach(record => {

        if (
            record.type !==
            "Stock Issue"
        ) {
            return;
        }


        if (
            cleanCode(record.itemCode) !==
            code
        ) {
            return;
        }


        const date =
            getRecordDate(record);


        if (!date) {
            return;
        }


        const monthKey =

            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            ).padStart(2, "0");


        if (
            !monthlyTotals[monthKey]
        ) {

            monthlyTotals[monthKey] =
                0;
        }


        monthlyTotals[monthKey] +=
            safeNumber(
                record.quantity
            );

    });


    const months =
        Object.keys(
            monthlyTotals
        );


    if (
        !months.length
    ) {
        return 0;
    }


    const total =
        months.reduce(
            (
                sum,
                month
            ) =>
                sum +
                safeNumber(
                    monthlyTotals[month]
                ),
            0
        );


    return (
        total /
        months.length
    );
}


// LIVE MONTHLY DEMAND CURRENT STOCK

function getLiveMonthlyDemandCurrentStock(item) {

    if (!item) {
        return 0;
    }


    const code =
        getItemCode(item);


    const opening =
        getMasterOpeningStock(item);


    let totalIn = 0;

    let totalOut = 0;


    history.forEach(record => {

        if (
            cleanCode(record.itemCode) !==
            code
        ) {
            return;
        }


        if (
            record.type ===
            "Stock In"
        ) {

            totalIn +=
                safeNumber(
                    record.quantity
                );
        }


        if (

            record.type ===
            "Stock Issue" ||

            record.type ===
            "Stock Out"

        ) {

            totalOut +=
                safeNumber(
                    record.quantity
                );
        }

    });


    return Math.max(

        opening +
        totalIn -
        totalOut,

        0
    );
}


// LIVE DEMAND QUANTITY

function getLiveMonthlyDemandQuantity(itemCode) {

    const code =
        cleanCode(itemCode);


    if (!code) {
        return 0;
    }


    const item =
        getItemByCode(code);


    if (!item) {
        return 0;
    }


    const averageConsumption =
        getLiveAverageConsumption(
            code
        );


    const stockMonths =
        getLiveMonthlyDemandStockMonths(
            code
        );


    const currentStock =
        getLiveMonthlyDemandCurrentStock(
            item
        );


    let demandQuantity =

        averageConsumption *
        stockMonths -
        currentStock;


    if (
        demandQuantity < 0
    ) {

        demandQuantity = 0;
    }


    return demandQuantity;
}


// CURRENT DASHBOARD DEMAND
// یہ compatibility کے لیے موجود ہے۔

function getCurrentMonthDemand(itemCode) {

    return getLiveMonthlyDemandQuantity(
        itemCode
    );
}


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
// SELECTED MONTH PENDING DEMAND / PO
// --------------------------------------------------
// Pending Demand:
//
// Demand Generate Date = cycle start
// Next Demand Generate Date = cycle end
//
// Stock In:
// start date شامل
// next demand date شامل نہیں
//
// Remaining:
// Approved Demand - Cycle Received
// --------------------------------------------------


// --------------------------------------------------
// DEMAND GENERATE DATE
// --------------------------------------------------

function getDemandGenerateDate(record) {

    if (!record) {
        return null;
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
        value === undefined ||
        String(value).trim() === ""
    ) {
        return null;
    }


    const text =
        String(value).trim();


    // YYYY-MM-DD

    if (
        /^\d{4}-\d{2}-\d{2}/.test(text)
    ) {

        const d =
            new Date(
                text.substring(0, 10) +
                "T00:00:00"
            );


        if (
            !Number.isNaN(
                d.getTime()
            )
        ) {

            return d;
        }
    }


    // DD/MM/YYYY

    if (
        /^\d{1,2}\/\d{1,2}\/\d{4}/.test(text)
    ) {

        const p =
            text.substring(0, 10)
                .split("/");


        const d =
            new Date(
                Number(p[2]),
                Number(p[1]) - 1,
                Number(p[0])
            );


        if (
            !Number.isNaN(
                d.getTime()
            )
        ) {

            return d;
        }
    }


    // DD-MM-YYYY

    if (
        /^\d{1,2}-\d{1,2}-\d{4}/.test(text)
    ) {

        const p =
            text.substring(0, 10)
                .split("-");


        const d =
            new Date(
                Number(p[2]),
                Number(p[1]) - 1,
                Number(p[0])
            );


        if (
            !Number.isNaN(
                d.getTime()
            )
        ) {

            return d;
        }
    }


    const d =
        new Date(text);


    return Number.isNaN(
        d.getTime()
    )
        ? null
        : d;
}


// --------------------------------------------------
// FIND NEXT DEMAND GENERATE DATE
// --------------------------------------------------

function getNextDemandGenerateDate(
    currentDemandRecord
) {

    const currentDate =
        getDemandGenerateDate(
            currentDemandRecord
        );


    if (!currentDate) {
        return null;
    }


    const currentTime =
        currentDate.getTime();


    let nextDate = null;


    if (
        !Array.isArray(
            demandHistory
        )
    ) {

        return null;
    }


    demandHistory.forEach(
        function(record) {

            const candidateDate =
                getDemandGenerateDate(
                    record
                );


            if (!candidateDate) {
                return;
            }


            const candidateTime =
                candidateDate.getTime();


            if (
                candidateTime <=
                currentTime
            ) {

                return;
            }


            if (
                nextDate === null ||
                candidateTime <
                nextDate.getTime()
            ) {

                nextDate =
                    candidateDate;
            }

        }
    );


    return nextDate;
}


// --------------------------------------------------
// STOCK IN RECEIVED BETWEEN TWO DEMAND DATES
// --------------------------------------------------

function getStockInReceivedForDemandCycle(
    itemCode,
    startDate,
    nextDemandDate
) {

    const code =
        cleanCode(itemCode);

    if (!code || !startDate) {
        return 0;
    }

    const startTime =
        new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
        ).getTime();

    const endTime =
        nextDemandDate
            ? new Date(
                nextDemandDate.getFullYear(),
                nextDemandDate.getMonth(),
                nextDemandDate.getDate()
            ).getTime()
            : null;

    let totalReceived = 0;

    // Raw Supabase stock_in is the source for Received.
    const records =
        Array.isArray(stockInRecords) &&
        stockInRecords.length
            ? stockInRecords
            : history;

    records.forEach(function(record) {

        if (
            record?.type !== undefined &&
            record?.type !== "Stock In"
        ) {
            return;
        }

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

        const recordDate =
            getRecordDate(record);

        if (!recordDate) {
            return;
        }

        const recordTime =
            new Date(
                recordDate.getFullYear(),
                recordDate.getMonth(),
                recordDate.getDate()
            ).getTime();

        if (
            recordTime < startTime
        ) {
            return;
        }

        if (
            endTime !== null &&
            recordTime >= endTime
        ) {
            return;
        }

        totalReceived +=
            safeNumber(
                record?.quantity
            );
    });

    return totalReceived;
}
// --------------------------------------------------
// SELECTED MONTH PENDING DEMAND LIST
// --------------------------------------------------

function getSelectedMonthPendingDemandList() {

    const result = [];

    if (!Array.isArray(demandHistory)) {
        return result;
    }

    const selectedRecords =
        demandHistory.filter(function(record) {
            return isDemandRecordSelectedMonth(record);
        });

    selectedRecords.forEach(function(demandRecord) {

        const demandGenerateDate =
            getDemandGenerateDate(demandRecord);

        if (!demandGenerateDate) {
            return;
        }

        const nextDemandDate =
            getNextDemandGenerateDate(demandRecord);

        const demandList =
            getDemandList(demandRecord);

        if (
            Array.isArray(demandList) &&
            demandList.length > 0
        ) {

            demandList.forEach(function(detail) {

                const code =
                    getApprovedDemandItemCode(detail);

                if (!code) {
                    return;
                }

                const approved =
                    getApprovedDemandQuantity(detail);

                if (approved <= 0) {
                    return;
                }

                const item =
                    getItemByCode(code);

                const name =
                    getApprovedDemandItemName(detail) ||
                    (
                        item
                            ? getItemName(item)
                            : code
                    );

                const unit =
                    getApprovedDemandUnit(detail) !== "-"
                        ? getApprovedDemandUnit(detail)
                        : (
                            item
                                ? getItemUnit(item)
                                : "-"
                        );

                const received =
                    getStockInReceivedForDemandCycle(
                        code,
                        demandGenerateDate,
                        nextDemandDate
                    );

                const pending =
                    Math.max(
                        approved - received,
                        0
                    );

                if (pending <= 0) {
                    return;
                }

                result.push({
                    code: code,
                    name: name,
                    unit: unit,
                    approved: approved,
                    received: received,
                    pending: pending,
                    demandGenerateDate:
                        demandGenerateDate,
                    nextDemandDate:
                        nextDemandDate,
                    recordId:
                        demandRecord?.id,
                    demandNo:
                        demandRecord?.demand_no ??
                        demandRecord?.demandNo ??
                        ""
                });

            });

            return;
        }

        const directCode =
            getDemandCode(demandRecord);

        if (!directCode) {
            return;
        }

        const approved =
            getDemandValue(demandRecord);

        if (approved <= 0) {
            return;
        }

        const item =
            getItemByCode(directCode);

        const name =
            demandRecord?.item_name ??
            demandRecord?.itemName ??
            demandRecord?.name ??
            (
                item
                    ? getItemName(item)
                    : directCode
            );

        const unit =
            demandRecord?.unit ??
            (
                item
                    ? getItemUnit(item)
                    : "-"
            );

        const received =
            getStockInReceivedForDemandCycle(
                directCode,
                demandGenerateDate,
                nextDemandDate
            );

        const pending =
            Math.max(
                approved - received,
                0
            );

        if (pending <= 0) {
            return;
        }

        result.push({
            code: directCode,
            name: name,
            unit: unit,
            approved: approved,
            received: received,
            pending: pending,
            demandGenerateDate:
                demandGenerateDate,
            nextDemandDate:
                nextDemandDate,
            recordId:
                demandRecord?.id,
            demandNo:
                demandRecord?.demand_no ??
                demandRecord?.demandNo ??
                ""
        });

    });

    const merged = {};

    result.forEach(function(row) {

        const code =
            cleanCode(row.code);

        if (!code) {
            return;
        }

        if (!merged[code]) {

            merged[code] = {
                code: code,
                name: row.name,
                unit: row.unit,
                approved:
                    safeNumber(row.approved),
                received:
                    safeNumber(row.received),
                pending:
                    safeNumber(row.pending),
                demandGenerateDate:
                    row.demandGenerateDate,
                nextDemandDate:
                    row.nextDemandDate,
                recordId:
                    row.recordId,
                demandNo:
                    row.demandNo
            };

            return;
        }

        merged[code].approved +=
            safeNumber(row.approved);

        merged[code].received +=
            safeNumber(row.received);

        merged[code].pending =
            Math.max(
                merged[code].approved -
                merged[code].received,
                0
            );

    });

    const finalResult =
        Object.values(merged).filter(function(row) {
            return safeNumber(row.pending) > 0;
        });

    finalResult.sort(function(a, b) {

        let codeA = cleanCode(a.code);
        let codeB = cleanCode(b.code);

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

        if (numberA !== numberB) {
            return numberA - numberB;
        }

        return codeA.localeCompare(
            codeB,
            undefined,
            {
                numeric: true,
                sensitivity: "base"
            }
        );

    });

    return finalResult;
}


// --------------------------------------------------
// PENDING DEMAND CARD
// --------------------------------------------------

function buildPendingDemandCardList() {

    const container =
        document.getElementById("pendingInfo");

    const value =
        document.getElementById("pendingValue");

    if (!container) {
        return;
    }

    if (value) {
        value.innerHTML = "";
    }

    const pendingList =
        getSelectedMonthPendingDemandList();

    if (selectedItem) {

        const selectedCode =
            getItemCode(selectedItem);

        const found =
            pendingList.find(function(row) {
                return (
                    cleanCode(row.code) ===
                    cleanCode(selectedCode)
                );
            });

        if (!found) {
            container.innerHTML = "";
            return;
        }

        container.innerHTML =
            '<div style="' +
            'font-size:14px;' +
            'font-weight:bold;' +
            'padding:4px 2px;' +
            'overflow:hidden;' +
            'text-overflow:ellipsis;' +
            'white-space:nowrap;' +
            '">' +
            escapeHTML(found.code) +
            " - " +
            escapeHTML(found.name) +
            "</div>" +

            '<div style="' +
            'padding:6px 3px;' +
            'border-top:1px solid rgba(255,255,255,.25);' +
            'font-size:13px;' +
            '">' +

            "Approved: " +
            safeNumber(found.approved).toFixed(2) +

            " | Received: " +
            safeNumber(found.received).toFixed(2) +

            " | Pending: " +
            safeNumber(found.pending).toFixed(2) +

            " " +
            escapeHTML(found.unit) +

            "</div>";

        return;
    }

    if (pendingList.length === 0) {

        container.innerHTML =
            '<div style="' +
            'font-size:14px;' +
            'padding:5px 0;' +
            '">' +
            "No Pending Demand for " +
            escapeHTML(
                getMonthName(
                    selectedDashboardMonth
                )
            ) +
            "</div>";

        return;
    }

    let html =
        '<div style="' +
        'height:105px;' +
        'max-height:105px;' +
        'overflow-y:auto;' +
        'overflow-x:hidden;' +
        'padding-right:5px;' +
        '">';

    pendingList.forEach(function(row) {

        html +=
            '<div style="' +
            'display:flex;' +
            'justify-content:space-between;' +
            'align-items:center;' +
            'gap:10px;' +
            'padding:5px 3px;' +
            'border-bottom:1px solid rgba(255,255,255,.25);' +
            'font-size:14px;' +
            '">' +

            '<span style="' +
            'flex:1;' +
            'min-width:0;' +
            'overflow:hidden;' +
            'text-overflow:ellipsis;' +
            'white-space:nowrap;' +
            'font-weight:bold;' +
            '">' +

            escapeHTML(row.code) +
            " - " +
            escapeHTML(row.name) +

            "</span>" +

            '<span style="' +
            'font-weight:bold;' +
            'white-space:nowrap;' +
            '">' +

            safeNumber(row.pending).toFixed(2) +
            " " +
            escapeHTML(row.unit) +

            "</span>" +

            "</div>";

    });

    html += "</div>";

    container.innerHTML = html;
}


// --------------------------------------------------
// COST
// --------------------------------------------------

function getOverallCost() {

    return items.reduce(
        function(sum, item) {
            return (
                sum +
                getItemCurrentCost(item)
            );
        },
        0
    );
}


function getItemCurrentCost(item) {

    if (!item) {
        return 0;
    }

    const code =
        getItemCode(item);

    const stock =
        getCurrentStock(item);

    const rate =
        getLatestRate(code);

    return stock * rate;
}


// --------------------------------------------------
// ITEM IMAGE
// --------------------------------------------------

function getItemImageURL(item) {

    if (!item) {
        return "";
    }

    return String(
        item?.image_url ??
        item?.imageURL ??
        item?.image ??
        item?.picture ??
        item?.photo ??
        ""
    ).trim();
}


function isOilTypeItem(item) {

    const text =
        (
            getItemName(item) +
            " " +
            String(
                item?.category ?? ""
            )
        ).toLowerCase();

    return (
        text.includes("oil") ||
        text.includes("mobil") ||
        text.includes("kerosene") ||
        text.includes("diesel")
    );
}


function getFallbackImage(item) {

    if (isOilTypeItem(item)) {
        return "";
    }

    return "";
}


function handleItemPictureError(event) {

    const img =
        event?.target ??
        this;

    if (!img) {
        return;
    }

    img.onerror = null;

    const item =
        selectedItem;

    const fallback =
        getFallbackImage(item);

    if (fallback) {
        img.src = fallback;
    } else {
        img.style.display = "none";
    }
}


function showSelectedItemPicture(item) {

    const img =
        document.getElementById(
            "selectedItemPicture"
        );

    if (!img) {
        return;
    }

    const url =
        getItemImageURL(item);

    if (!url) {
        img.style.display = "none";
        return;
    }

    img.onerror =
        handleItemPictureError;

    img.src = url;

    img.style.display =
        "block";
}


function clearSelectedItemPicture() {

    const img =
        document.getElementById(
            "selectedItemPicture"
        );

    if (!img) {
        return;
    }

    img.removeAttribute("src");

    img.style.display =
        "none";
}


// --------------------------------------------------
// SEARCH ITEM
// --------------------------------------------------

function searchItem() {

    const input =
        document.getElementById(
            "itemSearch"
        );

    if (!input) {
        return;
    }

    const code =
        cleanCode(input.value);

    if (!code) {

        selectedItem = null;

        clearSelectedItemPicture();

        updateDashboard();

        return;
    }

    const item =
        getItemByCode(code);

    if (!item) {

        selectedItem = null;

        clearSelectedItemPicture();

        const info =
            document.getElementById(
                "searchInfo"
            );

        if (info) {
            info.innerHTML =
                "❌ Item not found: " +
                escapeHTML(code);
        }

        updateDashboard();

        return;
    }

    selectedItem =
        item;

    showSelectedItemPicture(item);

    const info =
        document.getElementById(
            "searchInfo"
        );

    if (info) {

        info.innerHTML =
            "✅ " +
            escapeHTML(
                getItemCode(item)
            ) +
            " - " +
            escapeHTML(
                getItemName(item)
            );
    }

    saveSelectedItem();

    updateDashboard();
}


function clearItemSearch() {

    selectedItem = null;

    const input =
        document.getElementById(
            "itemSearch"
        );

    if (input) {
        input.value = "";
    }

    localStorage.removeItem(
        "dashboardSelectedItem"
    );

    clearSelectedItemPicture();

    const info =
        document.getElementById(
            "searchInfo"
        );

    if (info) {
        info.innerHTML = "";
    }

    updateDashboard();
}


// --------------------------------------------------
// UPDATE DASHBOARD
// --------------------------------------------------

function updateDashboard() {

    updateMonthUI();

    buildMonthlyDemandCardList();

    buildPendingDemandCardList();

    buildCurrentStockTable();

    updateDashboardTotals();

    if (selectedItem) {

        showSelectedItemPicture(
            selectedItem
        );

        updateSelectedItemCards();

        showDashboardGraph(
            getItemCode(selectedItem)
        );

    } else {

        clearSelectedCards();

        clearDashboardGraph();

    }
}


// --------------------------------------------------
// DASHBOARD TOTALS
// --------------------------------------------------

function updateDashboardTotals() {

    const openingElement =
        document.getElementById(
            "openingStockValue"
        );

    const stockInElement =
        document.getElementById(
            "stockInValue"
        );

    const stockOutElement =
        document.getElementById(
            "stockOutValue"
        );

    const currentElement =
        document.getElementById(
            "currentStockValue"
        );

    let openingTotal = 0;
    let stockInTotal = 0;
    let stockOutTotal = 0;
    let currentTotal = 0;

    items.forEach(function(item) {

        openingTotal +=
            getMonthlyOpeningStock(item);

        stockInTotal +=
            getSelectedMonthStockIn(
                getItemCode(item)
            );

        stockOutTotal +=
            getSelectedMonthStockOut(
                getItemCode(item)
            );

        currentTotal +=
            getCurrentStock(item);

    });

    if (selectedItem) {

        openingTotal =
            getMonthlyOpeningStock(
                selectedItem
            );

        stockInTotal =
            getSelectedMonthStockIn(
                getItemCode(selectedItem)
            );

        stockOutTotal =
            getSelectedMonthStockOut(
                getItemCode(selectedItem)
            );

        currentTotal =
            getCurrentStock(
                selectedItem
            );
    }

    if (openingElement) {
        openingElement.textContent =
            openingTotal.toFixed(2);
    }

    if (stockInElement) {
        stockInElement.textContent =
            stockInTotal.toFixed(2);
    }

    if (stockOutElement) {
        stockOutElement.textContent =
            stockOutTotal.toFixed(2);
    }

    if (currentElement) {
        currentElement.textContent =
            currentTotal.toFixed(2);
    }
}


// --------------------------------------------------
// SELECTED ITEM CARDS
// --------------------------------------------------

function updateSelectedItemCards() {

    if (!selectedItem) {
        return;
    }

    const code =
        getItemCode(selectedItem);

    const opening =
        getMonthlyOpeningStock(
            selectedItem
        );

    const stockIn =
        getSelectedMonthStockIn(code);

    const stockOut =
        getSelectedMonthStockOut(code);

    const current =
        getCurrentStock(
            selectedItem
        );

    const rate =
        getLatestRate(code);

    const values = {

        openingStockValue:
            opening,

        stockInValue:
            stockIn,

        stockOutValue:
            stockOut,

        currentStockValue:
            current,

        latestRateValue:
            rate

    };

    Object.keys(values).forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                safeNumber(
                    values[id]
                ).toFixed(2);
        }

    });
}


// --------------------------------------------------
// CLEAR CARDS
// --------------------------------------------------

function clearSelectedCards() {

    const ids = [

        "openingStockValue",
        "stockInValue",
        "stockOutValue",
        "currentStockValue",
        "latestRateValue"

    ];

    ids.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                "0.00";
        }

    });

    const demandInfo =
        document.getElementById(
            "demandInfo"
        );

    if (demandInfo) {
        demandInfo.innerHTML = "";
    }

    const pendingInfo =
        document.getElementById(
            "pendingInfo"
        );

    if (pendingInfo) {
        pendingInfo.innerHTML = "";
    }
}


// --------------------------------------------------
// CURRENT STOCK TABLE
// --------------------------------------------------
// آخری column = Remaining Qty
// Demand Qty نہیں
// --------------------------------------------------

function buildCurrentStockTable() {

    const body =
        document.getElementById(
            "currentStockBody"
        );

    if (!body) {
        return;
    }

    body.innerHTML = "";

    const pendingList =
        getSelectedMonthPendingDemandList();

    items.forEach(function(item) {

        if (
            selectedItem &&
            getItemCode(item) !==
            getItemCode(selectedItem)
        ) {
            return;
        }

        const code =
            getItemCode(item);

        const name =
            getItemName(item);

        const unit =
            getItemUnit(item);

        const opening =
            getMonthlyOpeningStock(item);

        const stockIn =
            getSelectedMonthStockIn(code);

        const stockOut =
            getSelectedMonthStockOut(code);

        const current =
            getCurrentStock(item);

        const rate =
            getLatestRate(code);

        const pendingRow =
            pendingList.find(function(row) {

                return (
                    cleanCode(row.code) ===
                    cleanCode(code)
                );

            });

        const remaining =
            pendingRow
                ? safeNumber(
                    pendingRow.pending
                )
                : 0;

        const row =
            document.createElement("tr");

        row.innerHTML =

            "<td>" +
            escapeHTML(code) +
            "</td>" +

            "<td>" +
            escapeHTML(name || "-") +
            "</td>" +

            "<td>" +
            escapeHTML(unit || "-") +
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

            "<td class='remaining-qty-cell'>" +
            remaining.toFixed(2) +
            "</td>";

        const cell =
            row.querySelector(
                ".current-stock-cell"
            );

        if (cell) {

            if (current <= 0) {

                cell.className =
                    "current-stock-cell low";

            } else {

                cell.className =
                    "current-stock-cell normal";
            }
        }

        const remainingCell =
            row.querySelector(
                ".remaining-qty-cell"
            );

        if (remainingCell) {

            if (remaining > 0) {

                remainingCell.className =
                    "remaining-qty-cell pending";

            } else {

                remainingCell.className =
                    "remaining-qty-cell complete";
            }
        }

        body.appendChild(row);

    });
}


// --------------------------------------------------
// GRAPH
// --------------------------------------------------

function showDashboardGraph(itemCode) {

    const canvas =
        document.getElementById(
            "dashboardGraph"
        );

    const info =
        document.getElementById(
            "graphInfo"
        );

    if (!canvas) {
        return;
    }

    const item =
        getItemByCode(itemCode);

    if (!item) {

        clearDashboardGraph();

        return;
    }

    const opening =
        getMonthlyOpeningStock(item);

    const stockIn =
        getSelectedMonthStockIn(
            getItemCode(item)
        );

    const stockOut =
        getSelectedMonthStockOut(
            getItemCode(item)
        );

    const current =
        getCurrentStock(item);

    if (info) {

        info.innerHTML =
            "<b>" +
            escapeHTML(
                getItemCode(item)
            ) +
            " - " +
            escapeHTML(
                getItemName(item)
            ) +
            "</b><br>" +
            escapeHTML(
                getMonthName(
                    selectedDashboardMonth
                )
            ) +
            " — Opening: " +
            opening.toFixed(2) +
            " | In: " +
            stockIn.toFixed(2) +
            " | Out: " +
            stockOut.toFixed(2) +
            " | Current: " +
            current.toFixed(2);
    }

    if (dashboardChart) {

        dashboardChart.destroy();

        dashboardChart =
            null;
    }

    if (
        typeof Chart ===
        "undefined"
    ) {

        if (info) {
            info.innerHTML +=
                "<br>Chart library not loaded.";
        }

        return;
    }

    dashboardChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels: [
                        "Opening Stock",
                        "Stock In",
                        "Stock Out",
                        "Current Stock"
                    ],

                    datasets: [
                        {
                            label:
                                getItemName(item) +
                                " — " +
                                getMonthName(
                                    selectedDashboardMonth
                                ),

                            data: [
                                opening,
                                stockIn,
                                stockOut,
                                current
                            ],

                            borderWidth: 1
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: true
                        }
                    },

                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );
}


function clearDashboardGraph() {

    const info =
        document.getElementById(
            "graphInfo"
        );

    if (info) {

        info.innerHTML =
            "Select an Item ID to see its graph.";
    }

    if (dashboardChart) {

        dashboardChart.destroy();

        dashboardChart =
            null;
    }
}


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
    function() {

        updateMonthUI();

        const picker =
            document.getElementById(
                "dashboardMonth"
            );

        if (picker) {

            picker.addEventListener(
                "change",
                function() {

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
    function() {

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
