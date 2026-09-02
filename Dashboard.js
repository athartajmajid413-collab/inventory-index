// =====================================
// DASHBOARD.JS - SUPABASE VERSION
// Correct Monthly Stock + Demand History + Selected Item Picture
// =====================================

let items = [];
let history = [];
let demandHistory = [];
let selectedItem = null;
let dashboardChart = null;

let selectedDashboardMonth =
    localStorage.getItem("dashboardSelectedMonth") || getTodayMonthKey();


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

    localStorage.setItem(
        "dashboardSelectedMonth",
        selectedDashboardMonth
    );

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


        // -----------------------------------------
        // BUILD HISTORY
        // -----------------------------------------

        history = [];


        // STOCK IN

        if (stockInResult?.success) {

            (
                stockInResult.data || []
            ).forEach(r => {

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

                    unit: r.unit,

                    source: r.source,

                    supplier: r.supplier,

                    location: r.location,

                    department: r.department,

                    quantity:
                        safeNumber(r.quantity),

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

                    type: "Stock In"

                });

            });

        }


        // STOCK OUT

        if (stockOutResult?.success) {

            (
                stockOutResult.data || []
            ).forEach(r => {

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

                    unit: r.unit,

                    source: r.source,

                    supplier: r.supplier,

                    location: r.location,

                    department: r.department,

                    quantity:
                        safeNumber(r.quantity),

                    unitCost: 0,

                    totalCost: 0,

                    type: "Stock Issue"

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
//
// Opening of selected month:
//
// Master Opening Stock
// + all Stock In before selected month
// - all Stock Issue before selected month
//
// Current Stock:
//
// Opening
// + selected month Stock In
// - selected month Stock Issue
//
// --------------------------------------------------

function getMasterOpeningStock(item) {

    return safeNumber(
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
                safeNumber(r.quantity);

        }


        if (
            r.type === "Stock Issue" ||
            r.type === "Stock Out"
        ) {

            totalOut +=
                safeNumber(r.quantity);

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
                safeNumber(r.quantity);

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
                safeNumber(r.quantity);

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


// --------------------------------------------------
// BACKWARD COMPATIBILITY
// --------------------------------------------------

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
            (
                sum,
                r
            ) =>
                sum +
                safeNumber(r.quantity),
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
            (
                sum,
                r
            ) =>
                sum +
                safeNumber(r.quantity),
            0
        );
}


// --------------------------------------------------
// LATEST RATE
// --------------------------------------------------

function getLatestRate(itemCode) {

    const code =
        cleanCode(itemCode);


    const selectedMonthEntries =
        history

            .filter(

                r =>

                    r.type === "Stock In" &&

                    cleanCode(
                        r.itemCode
                    ) === code &&

                    isSelectedMonth(r)

            )

            .sort(
                (a, b) => {

                    const da =
                        getRecordDate(a);

                    const db =
                        getRecordDate(b);

                    return (
                        db
                            ? db.getTime()
                            : 0
                    ) -
                    (
                        da
                            ? da.getTime()
                            : 0
                    );

                }
            );


    if (
        selectedMonthEntries.length
    ) {

        return safeNumber(

            selectedMonthEntries[0]
                .unitCost ??

            selectedMonthEntries[0]
                .latestRate ??

            selectedMonthEntries[0]
                .rate

        );

    }


    // -----------------------------------------
    // FALLBACK MASTER RATE
    // -----------------------------------------

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
// DEMAND HISTORY
// --------------------------------------------------
//
// IMPORTANT:
// Dashboard demand comes ONLY from Supabase
// demand_history.
//
// LocalStorage demandEdits is NOT used.
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


function isDemandRecordSelectedMonth(
    record
) {

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


    return isSelectedMonth(record);
}


function getCurrentMonthDemand(
    itemCode
) {

    const code =
        cleanCode(itemCode);

    let total = 0;


    demandHistory.forEach(
        record => {

            // --------------------------------
            // ROW LEVEL DEMAND
            // --------------------------------

            const rowCode =
                getDemandCode(record);


            if (

                rowCode === code &&

                isDemandRecordSelectedMonth(
                    record
                )

            ) {

                total +=
                    getDemandValue(record);

            }


            // --------------------------------
            // NESTED DEMAND
            // --------------------------------

            const list =
                getDemandList(record);


            list.forEach(
                detail => {

                    if (

                        getDemandCode(
                            detail
                        ) === code &&

                        isDemandRecordSelectedMonth(
                            record
                        )

                    ) {

                        total +=
                            getDemandValue(
                                detail
                            );

                    }

                }
            );

        }
    );


    return total;
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


function getPendingForItem(item) {

    const demand =
        getCurrentMonthDemand(
            getItemCode(item)
        );


    const currentStock =
        getCurrentStock(item);


    const pending =
        Math.max(
            demand -
            currentStock,
            0
        );


    return {

        demand: demand,

        pendingDemand:
            pending,

        pendingPO:
            pending

    };
}


function getOverallPending() {

    let totalDemand = 0;

    let totalStock = 0;


    items.forEach(item => {

        totalDemand +=
            getCurrentMonthDemand(
                getItemCode(item)
            );


        totalStock +=
            getCurrentStock(item);

    });


    return Math.max(
        totalDemand -
        totalStock,
        0
    );
}


// --------------------------------------------------
// COST
// --------------------------------------------------

function getOverallCost() {

    return history

        .filter(

            r =>

                r.type === "Stock In" &&
                isSelectedMonth(r)

        )

        .reduce(

            (
                sum,
                r
            ) =>

                sum +

                safeNumber(
                    r.quantity
                ) *

                safeNumber(
                    r.unitCost
                ),

            0

        );
}


function getItemCurrentCost(item) {

    return (

        getCurrentStock(item) *

        getLatestRate(
            getItemCode(item)
        )

    );

}


// --------------------------------------------------
// SELECTED ITEM PICTURE
// --------------------------------------------------

function getItemImageURL(item) {

    return String(

        item?.item_image_url ??
        item?.itemImageUrl ??
        item?.image_url ??
        item?.imageUrl ??
        item?.picture_url ??
        item?.pictureUrl ??
        ""

    ).trim();
}


// --------------------------------------------------
// OIL FALLBACK IMAGE
// --------------------------------------------------

const OIL_FALLBACK_IMAGE =
    "https://www.valvolineglobal.com/4ac53b/globalassets/sitecore/asiaregion/images/products/industrialgear.png";


function isOilTypeItem(item) {

    const text =
        getItemName(item)
            .toLowerCase();


    const words = [

        "oil",

        "lubricant",

        "lubrication",

        "grease",

        "hydraulic",

        "gear oil",

        "engine oil",

        "cutting oil",

        "compressor oil",

        "transformer oil",

        "machine oil"

    ];


    return words.some(
        word =>
            text.includes(word)
    );
}


function getFallbackImage(item) {

    if (
        isOilTypeItem(item)
    ) {

        return OIL_FALLBACK_IMAGE;

    }


    // -----------------------------------------
    // LOCAL SVG FALLBACK
    // -----------------------------------------

    const svg =

        '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="320">' +

        '<rect width="100%" height="100%" fill="#eef2f7"/>' +

        '<rect x="150" y="60" width="200" height="190" rx="18" fill="#c9d2dc"/>' +

        '<text x="250" y="145" text-anchor="middle" font-size="28" font-family="Arial" fill="#334155">ITEM</text>' +

        '<text x="250" y="180" text-anchor="middle" font-size="18" font-family="Arial" fill="#64748b">No Picture</text>' +

        '</svg>';


    return (
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg)
    );

}


// --------------------------------------------------
// IMAGE ERROR HANDLER
// --------------------------------------------------

function handleItemPictureError() {

    const image =
        document.getElementById(
            "itemOnlinePicture"
        );


    const status =
        document.getElementById(
            "itemPictureStatus"
        );


    if (!image) {
        return;
    }


    const currentFallback =
        image.dataset.fallbackApplied === "1";


    if (!currentFallback) {

        image.dataset.fallbackApplied =
            "1";


        const item =
            selectedItem;


        // -----------------------------------------
        // OIL FALLBACK
        // -----------------------------------------

        if (
            item &&
            isOilTypeItem(item)
        ) {

            image.src =
                OIL_FALLBACK_IMAGE;


            if (status) {

                status.innerHTML =
                    "🛢️ Representative oil drum picture";

            }


            return;

        }


        // -----------------------------------------
        // NORMAL FALLBACK
        // -----------------------------------------

        image.src =
            getFallbackImage(
                item || {}
            );


        if (status) {

            status.innerHTML =
                "ℹ️ Picture not available — representative image";

        }


        return;

    }


    if (status) {

        status.innerHTML =
            "❌ Picture could not be loaded.";

    }

}


// --------------------------------------------------
// SHOW SELECTED ITEM PICTURE
// --------------------------------------------------

function showSelectedItemPicture(item) {

    const box =
        document.getElementById(
            "itemPictureBox"
        );


    const image =
        document.getElementById(
            "itemOnlinePicture"
        );


    const name =
        document.getElementById(
            "itemPictureName"
        );


    const status =
        document.getElementById(
            "itemPictureStatus"
        );


    if (
        !box ||
        !image
    ) {

        return;

    }


    if (!item) {

        box.style.display =
            "none";

        image.src = "";

        image.removeAttribute(
            "data-fallback-applied"
        );

        return;

    }


    selectedItem = item;


    box.style.display =
        "block";


    if (name) {

        name.textContent =
            "🔎 " +
            getItemName(item);

    }


    if (status) {

        status.textContent =
            "Loading item picture...";

    }


    image.dataset.fallbackApplied =
        "0";


    // -----------------------------------------
    // JS ERROR HANDLER
    // -----------------------------------------

    image.onerror =
        function () {

            handleItemPictureError();

        };


    // -----------------------------------------
    // SUPABASE IMAGE
    // -----------------------------------------

    const supabaseImage =
        getItemImageURL(item);


    if (supabaseImage) {

        image.src =
            supabaseImage;


        if (status) {

            status.textContent =
                "🖼️ Item picture from Supabase";

        }


        return;

    }


    // -----------------------------------------
    // FALLBACK
    // -----------------------------------------

    const fallback =
        getFallbackImage(item);


    image.src =
        fallback;


    if (status) {

        if (
            isOilTypeItem(item)
        ) {

            status.textContent =
                "🛢️ Representative oil drum picture";

        } else {

            status.textContent =
                "ℹ️ Representative item picture";

        }

    }

}


// --------------------------------------------------
// CLEAR SELECTED ITEM PICTURE
// --------------------------------------------------

function clearSelectedItemPicture() {

    const box =
        document.getElementById(
            "itemPictureBox"
        );


    const image =
        document.getElementById(
            "itemOnlinePicture"
        );


    if (box) {

        box.style.display =
            "none";

    }


    if (image) {

        image.src = "";

        image.removeAttribute(
            "data-fallback-applied"
        );

    }

}


// --------------------------------------------------
// SEARCH
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


        localStorage.removeItem(
            "dashboardSelectedItem"
        );


        clearSelectedItemPicture();

        updateDashboard();

        return;

    }


    const found =
        getItemByCode(code);


    if (found) {

        selectedItem =
            found;


        localStorage.setItem(

            "dashboardSelectedItem",

            getItemCode(found)

        );


        updateDashboard();

        showSelectedItemPicture(
            found
        );


    } else {

        selectedItem =
            null;


        const info =
            document.getElementById(
                "searchInfo"
            );


        if (info) {

            info.innerHTML =
                "❌ Item not found: " +
                escapeHTML(code);

        }


        clearSelectedItemPicture();

        clearSelectedCards();

        buildCurrentStockTable();

        clearDashboardGraph();

    }

}


function clearItemSearch() {

    const input =
        document.getElementById(
            "itemSearch"
        );


    if (input) {

        input.value = "";

    }


    selectedItem = null;


    localStorage.removeItem(
        "dashboardSelectedItem"
    );


    clearSelectedItemPicture();

    updateDashboard();

}


// --------------------------------------------------
// DASHBOARD CARDS
// --------------------------------------------------

function updateDashboard() {

    const el =
        id =>
            document.getElementById(id);


    if (
        !el("masterValue")
    ) {

        return;

    }


    updateMonthUI();


    // =========================================
    // OVERALL MODE
    // =========================================

    if (!selectedItem) {

        if (
            el("searchInfo")
        ) {

            el("searchInfo").innerHTML =
                "Overall Dashboard — No item selected";

        }


        el("masterValue").innerHTML =
            "-";


        el("masterInfo").innerHTML =
            "Select an Item ID to view item details.";


        el("stockInValue").innerHTML =
            "-";


        el("stockInInfo").innerHTML =
            "Stock In — " +
            getMonthName(
                selectedDashboardMonth
            );


        el("stockOutValue").innerHTML =
            "-";


        el("stockOutInfo").innerHTML =
            "Stock Out — " +
            getMonthName(
                selectedDashboardMonth
            );


        el("costValue").innerHTML =
            "Rs. " +
            getOverallCost()
                .toFixed(2);


        el("costInfo").innerHTML =
            "Stock In Cost — " +
            getMonthName(
                selectedDashboardMonth
            );


        el("demandValue").innerHTML =
            getOverallDemand()
                .toFixed(2);


        el("demandInfo").innerHTML =
            "Demand — " +
            getMonthName(
                selectedDashboardMonth
            );


        el("pendingValue").innerHTML =
            getOverallPending()
                .toFixed(2);


        el("pendingInfo").innerHTML =
            "Pending Demand / PO";


        clearSelectedItemPicture();

        clearDashboardGraph();

        buildCurrentStockTable();

        return;

    }


    // =========================================
    // ITEM MODE
    // =========================================

    const item =
        selectedItem;


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


    const demand =
        getCurrentMonthDemand(
            code
        );


    const pending =
        getPendingForItem(
            item
        );


    const cost =
        getItemCurrentCost(
            item
        );


    // -----------------------------------------
    // SEARCH INFO
    // -----------------------------------------

    if (
        el("searchInfo")
    ) {

        el("searchInfo").innerHTML =

            "✅ Selected: <b>" +

            escapeHTML(code) +

            "</b> — " +

            escapeHTML(name);

    }


    // -----------------------------------------
    // MASTER CARD
    // -----------------------------------------

    el("masterValue").innerHTML =
        escapeHTML(name);


    el("masterInfo").innerHTML =

        "ID: " +
        escapeHTML(code) +

        "<br>Unit: " +
        escapeHTML(unit) +

        "<br>Opening (" +
        escapeHTML(
            getMonthName(
                selectedDashboardMonth
            )
        ) +

        "): " +
        opening.toFixed(2) +

        "<br>Current Stock: " +
        current.toFixed(2);


    // -----------------------------------------
    // STOCK IN CARD
    // -----------------------------------------

    el("stockInValue").innerHTML =

        stockIn.toFixed(2) +
        " " +
        escapeHTML(unit);


    el("stockInInfo").innerHTML =

        "Stock In — " +

        escapeHTML(
            getMonthName(
                selectedDashboardMonth
            )
        );


    // -----------------------------------------
    // STOCK OUT CARD
    // -----------------------------------------

    el("stockOutValue").innerHTML =

        stockOut.toFixed(2) +
        " " +
        escapeHTML(unit);


    el("stockOutInfo").innerHTML =

        "Stock Out — " +

        escapeHTML(
            getMonthName(
                selectedDashboardMonth
            )
        );


    // -----------------------------------------
    // COST CARD
    // -----------------------------------------

    el("costValue").innerHTML =
        "Rs. " +
        cost.toFixed(2);


    el("costInfo").innerHTML =

        "Current Stock Cost — " +

        escapeHTML(
            getMonthName(
                selectedDashboardMonth
            )
        );


    // -----------------------------------------
    // DEMAND CARD
    // -----------------------------------------

    el("demandValue").innerHTML =

        demand.toFixed(2) +
        " " +
        escapeHTML(unit);


    el("demandInfo").innerHTML =

        "Demand — " +

        escapeHTML(
            getMonthName(
                selectedDashboardMonth
            )
        );


    // -----------------------------------------
    // PENDING CARD
    // -----------------------------------------

    el("pendingValue").innerHTML =

        pending.pendingDemand.toFixed(2) +
        " " +
        escapeHTML(unit);


    el("pendingInfo").innerHTML =
        "Pending Demand / PO";


    // -----------------------------------------
    // PICTURE
    // -----------------------------------------

    showSelectedItemPicture(
        item
    );


    // -----------------------------------------
    // GRAPH
    // -----------------------------------------

    showDashboardGraph(
        code
    );


    // -----------------------------------------
    // TABLE
    // -----------------------------------------

    buildCurrentStockTable();

}


// --------------------------------------------------
// CLEAR SELECTED CARDS
// --------------------------------------------------

function clearSelectedCards() {

    [

        "masterValue",

        "stockInValue",

        "stockOutValue",

        "demandValue",

        "pendingValue"

    ].forEach(

        id => {

            const e =
                document.getElementById(id);

            if (e) {

                e.innerHTML = "-";

            }

        }

    );


    const cost =
        document.getElementById(
            "costValue"
        );


    if (cost) {

        cost.innerHTML =
            "Rs. 0.00";

    }


    const masterInfo =
        document.getElementById(
            "masterInfo"
        );


    if (masterInfo) {

        masterInfo.innerHTML =
            "❌ Item not found.";

    }

}


// --------------------------------------------------
// CURRENT STOCK TABLE
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


    items.forEach(item => {

        // -----------------------------------------
        // SHOW ONLY SELECTED ITEM WHEN SEARCHED
        // -----------------------------------------

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


        const demand =
            getCurrentMonthDemand(
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
            demand.toFixed(2) +
            "</td>";


        const cell =
            row.querySelector(
                ".current-stock-cell"
            );


        if (cell) {

            // ---------------------------------
            // RED = ZERO
            // ---------------------------------

            if (
                current <= 0
            ) {

                cell.className =
                    "current-stock-cell low";

            }

            // ---------------------------------
            // YELLOW = DEMAND REACHED
            // ---------------------------------

            else if (

                demand > 0 &&

                current <= demand

            ) {

                cell.className =
                    "current-stock-cell warning";

            }

            // ---------------------------------
            // NORMAL
            // ---------------------------------

            else {

                cell.className =
                    "current-stock-cell normal";

            }

        }


        body.appendChild(row);

    });

}


// --------------------------------------------------
// GRAPH
// --------------------------------------------------

function showDashboardGraph(
    itemCode
) {

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
        getItemByCode(
            itemCode
        );


    if (!item) {

        clearDashboardGraph();

        return;

    }


    const opening =
        getMonthlyOpeningStock(
            item
        );


    const stockIn =
        getSelectedMonthStockIn(
            getItemCode(item)
        );


    const stockOut =
        getSelectedMonthStockOut(
            getItemCode(item)
        );


    const current =
        getCurrentStock(
            item
        );


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

        dashboardChart = null;

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

                    maintainAspectRatio:
                        false,


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

        dashboardChart = null;

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

        getItemCode(
            selectedItem
        )

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

            getItemCode(
                selectedItem
            )

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

            getItemCode(
                selectedItem
            )

        );

    }


    window.location.href =
        "Stock out .html";

}


function openCostView() {

    if (selectedItem) {

        localStorage.setItem(

            "dashboardSelectedItem",

            getItemCode(
                selectedItem
            )

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

            getItemCode(
                selectedItem
            )

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

        getItemCode(
            selectedItem
        )

    );


    window.location.href =
        "Demand History.html";

}


function newDemandEntry() {

    if (selectedItem) {

        localStorage.setItem(

            "demandSelectedItem",

            getItemCode(
                selectedItem
            )

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
//
// Dashboard.html may have:
// onerror="handleItemPictureError()"
//
// Therefore function is attached to window.
// --------------------------------------------------

window.handleItemPictureError =
    handleItemPictureError;


console.log(
    "✅ Dashboard.js loaded successfully."
);
