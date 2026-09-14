// ==========================================================
// GRAPHS.JS
// Store Management System
// Supabase Version
// ==========================================================

let items = [];
let stockInData = [];
let stockOutData = [];
let demandHistory = [];

let currentGraphMode = "all";


// ==========================================================
// CHART VARIABLES
// ==========================================================

let stockInChart = null;
let stockOutChart = null;
let stockInDemandChart = null;
let stockInCostChart = null;
let stockOutCostChart = null;
let stockOutVsCostChart = null;
let demandChart = null;

let departmentStockInChart = null;
let departmentStockOutChart = null;
let departmentCostChart = null;


// ==========================================================
// BASIC HELPERS
// ==========================================================

function safeNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}


function cleanCode(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}


function getItemCode(item) {
    return cleanCode(
        item?.code ??
        item?.item_code ??
        item?.itemCode ??
        ""
    );
}


function getItemName(item) {
    return String(
        item?.item_name ??
        item?.itemName ??
        item?.name ??
        ""
    ).trim();
}


function getItemUnit(item) {
    return String(
        item?.unit ??
        item?.packed_unit ??
        ""
    ).trim();
}


function getRecordItemCode(record) {
    return cleanCode(
        record?.item_code ??
        record?.itemCode ??
        record?.code ??
        ""
    );
}


function getRecordItemName(record) {
    return String(
        record?.item_name ??
        record?.itemName ??
        record?.name ??
        ""
    ).trim();
}


function getRecordDepartment(record) {
    return String(
        record?.department ??
        record?.Department ??
        record?.dept ??
        "Unknown"
    ).trim() || "Unknown";
}


// ==========================================================
// DATE HELPERS
// ==========================================================

function getDateOnly(value) {

    if (!value) {
        return "";
    }

    const text = String(value).trim();

    if (!text) {
        return "";
    }

    return text.substring(0, 10);
}


function getRecordDate(record) {

    return getDateOnly(
        record?.date ??
        record?.generate_date ??
        record?.generateDate ??
        record?.created_at ??
        ""
    );
}


function getMonthKeyFromDate(value) {

    const date = getDateOnly(value);

    if (!date || date.length < 7) {
        return "";
    }

    return date.substring(0, 7);
}


// ==========================================================
// SELECTED MONTH / YEAR
// ==========================================================

function getSelectedPeriodType() {

    const periodType = document.getElementById("periodType");

    if (!periodType) {
        return "month";
    }

    return periodType.value || "month";
}


function getSelectedMonthKey() {

    const monthSelect = document.getElementById("monthSelect");
    const yearSelect = document.getElementById("yearSelect");

    let year = yearSelect && yearSelect.value
        ? Number(yearSelect.value)
        : new Date().getFullYear();

    let month = monthSelect && monthSelect.value
        ? Number(monthSelect.value)
        : new Date().getMonth() + 1;

    if (!year || year < 2000) {
        year = new Date().getFullYear();
    }

    if (!month || month < 1 || month > 12) {
        month = new Date().getMonth() + 1;
    }

    return `${year}-${String(month).padStart(2, "0")}`;
}


function getSelectedYear() {

    const yearSelect = document.getElementById("yearSelect");

    if (yearSelect && yearSelect.value) {
        return Number(yearSelect.value);
    }

    return new Date().getFullYear();
}


function getSelectedMonthNumber() {

    const monthSelect = document.getElementById("monthSelect");

    if (monthSelect && monthSelect.value) {
        return Number(monthSelect.value);
    }

    return new Date().getMonth() + 1;
}


// ==========================================================
// PERIOD CHANGE
// ==========================================================

function changePeriodType() {

    const periodType = getSelectedPeriodType();

    const monthGroup =
        document.getElementById("monthFilterGroup") ||
        document.getElementById("monthLabel");

    if (monthGroup) {

        if (periodType === "year") {
            monthGroup.style.display = "none";
        } else {
            monthGroup.style.display = "";
        }
    }

    updateGraphs();
}


// ==========================================================
// MONTH LABEL
// IMPORTANT:
// DO NOT CHANGE monthLabel.textContent
// because monthLabel may contain the dropdown.
// ==========================================================

function updateMonthLabel() {

    const monthSelect = document.getElementById("monthSelect");

    if (!monthSelect) {
        return;
    }

    if (!monthSelect.value) {
        monthSelect.value = String(
            new Date().getMonth() + 1
        );
    }
}


// ==========================================================
// RECORD PERIOD CHECK
// ==========================================================

function recordMatchesSelectedPeriod(record) {

    const date = getRecordDate(record);

    if (!date) {
        return false;
    }

    const periodType = getSelectedPeriodType();

    if (periodType === "year") {

        const selectedYear = String(
            getSelectedYear()
        );

        return date.substring(0, 4) === selectedYear;
    }

    return getMonthKeyFromDate(date) === getSelectedMonthKey();
}


// ==========================================================
// DEMAND HELPERS
// ==========================================================

function getDemandItems(record) {

    let value =
        record?.demand_items ??
        record?.demandItems ??
        record?.items ??
        [];

    if (typeof value === "string") {

        try {
            value = JSON.parse(value);
        } catch (error) {
            return [];
        }
    }

    if (Array.isArray(value)) {
        return value;
    }

    if (value && typeof value === "object") {

        if (Array.isArray(value.items)) {
            return value.items;
        }

        return Object.values(value);
    }

    return [];
}


function getDemandValue(item) {

    return safeNumber(
        item?.finalDemand ??
        item?.final_demand ??
        item?.approvedQty ??
        item?.approved_qty ??
        item?.quantity ??
        item?.demandQty ??
        item?.demand_qty ??
        item?.demand ??
        item?.qty ??
        0
    );
}


function getDemandItemCode(item) {

    return cleanCode(
        item?.code ??
        item?.item_code ??
        item?.itemCode ??
        ""
    );
}


// ==========================================================
// DEMAND MONTH
// IMPORTANT:
// First use the month saved during demand generation.
// Only use generation date as fallback.
// ==========================================================

function getDemandMonthKey(record) {

    const possibleMonth =
        record?.demand_month ??
        record?.demandMonth ??
        record?.demand_month_key ??
        record?.demandMonthKey ??
        record?.month_key ??
        record?.monthKey ??
        record?.selected_month ??
        record?.selectedMonth ??
        record?.for_month ??
        record?.forMonth ??
        null;

    if (possibleMonth) {

        const text = String(possibleMonth).trim();

        // YYYY-MM
        if (/^\d{4}-\d{2}$/.test(text)) {
            return text;
        }

        // YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
            return text.substring(0, 7);
        }

        // MM/YYYY
        if (/^\d{1,2}\/\d{4}$/.test(text)) {

            const parts = text.split("/");

            return `${parts[1]}-${String(
                Number(parts[0])
            ).padStart(2, "0")}`;
        }
    }

    // Fallback only if no dedicated demand month exists
    return getMonthKeyFromDate(
        record?.generate_date ??
        record?.generateDate ??
        record?.date ??
        record?.created_at ??
        ""
    );
}


function demandRecordMatchesSelectedPeriod(record) {

    const demandMonth = getDemandMonthKey(record);

    if (!demandMonth) {
        return false;
    }

    const periodType = getSelectedPeriodType();

    if (periodType === "year") {

        return demandMonth.substring(0, 4) === String(
            getSelectedYear()
        );
    }

    return demandMonth === getSelectedMonthKey();
}


function getSelectedDemandRecord() {

    const matching = demandHistory
        .filter(record => demandRecordMatchesSelectedPeriod(record))
        .sort((a, b) => {

            const aDate =
                getDemandMonthKey(a) ||
                getRecordDate(a) ||
                "";

            const bDate =
                getDemandMonthKey(b) ||
                getRecordDate(b) ||
                "";

            return bDate.localeCompare(aDate);
        });

    return matching.length
        ? matching[0]
        : null;
}


// ==========================================================
// STOCK IN COST
// ==========================================================

function getStockInRate(record) {

    return safeNumber(
        record?.unit_cost ??
        record?.unitCost ??
        record?.rate ??
        record?.cost ??
        0
    );
}


function getStockInRecordCost(record) {

    const savedCost = safeNumber(
        record?.total_cost ??
        record?.totalCost ??
        0
    );

    if (savedCost > 0) {
        return savedCost;
    }

    return (
        safeNumber(record?.quantity) *
        getStockInRate(record)
    );
}


// ==========================================================
// STOCK OUT COST
// ==========================================================

function getStockInRateForItemOnDate(
    itemCode,
    issueDate
) {

    const code = cleanCode(itemCode);
    const date = getDateOnly(issueDate);

    const matching = stockInData
        .filter(record => {

            const recordCode =
                getRecordItemCode(record);

            const recordDate =
                getRecordDate(record);

            return (
                recordCode === code &&
                recordDate &&
                recordDate <= date
            );
        })
        .sort((a, b) => {

            const da = getRecordDate(a);
            const db = getRecordDate(b);

            return db.localeCompare(da);
        });

    if (matching.length) {
        return getStockInRate(matching[0]);
    }

    return 0;
}


function getStockOutRecordCost(record) {

    const savedCost = safeNumber(
        record?.total_cost ??
        record?.totalCost ??
        0
    );

    if (savedCost > 0) {
        return savedCost;
    }

    const quantity = safeNumber(
        record?.quantity
    );

    const savedRate = safeNumber(
        record?.unit_cost ??
        record?.unitCost ??
        record?.rate ??
        record?.cost ??
        0
    );

    const rate = savedRate > 0
        ? savedRate
        : getStockInRateForItemOnDate(
            getRecordItemCode(record),
            getRecordDate(record)
        );

    return quantity * rate;
}


// ==========================================================
// SORT ITEM CODES
// ==========================================================

function numericCodeSort(a, b) {

    const codeA = cleanCode(a);
    const codeB = cleanCode(b);

    const numA = parseInt(
        codeA.replace(/\D/g, ""),
        10
    );

    const numB = parseInt(
        codeB.replace(/\D/g, ""),
        10
    );

    if (
        Number.isFinite(numA) &&
        Number.isFinite(numB)
    ) {
        return numA - numB;
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


// ==========================================================
// LOAD ITEMS
// ==========================================================

async function loadItems() {

    try {

        const result = await supabaseRequest(
            "items",
            "GET"
        );

        if (!result || !result.success) {

            console.error(
                "Items load error:",
                result
            );

            items = [];
            return;
        }

        items = Array.isArray(result.data)
            ? result.data
            : [];

        console.log(
            "Items loaded:",
            items.length
        );

    } catch (error) {

        console.error(
            "loadItems error:",
            error
        );

        items = [];
    }
}


// ==========================================================
// LOAD STOCK IN
// ==========================================================

async function loadStockIn() {

    try {

        const result = await supabaseRequest(
            "stock_in",
            "GET"
        );

        if (!result || !result.success) {

            console.error(
                "Stock In load error:",
                result
            );

            stockInData = [];
            return;
        }

        stockInData = Array.isArray(result.data)
            ? result.data
            : [];

        console.log(
            "Stock In records:",
            stockInData.length
        );

    } catch (error) {

        console.error(
            "loadStockIn error:",
            error
        );

        stockInData = [];
    }
}


// ==========================================================
// LOAD STOCK OUT
// ==========================================================

async function loadStockOut() {

    try {

        const result = await supabaseRequest(
            "stock_issue",
            "GET"
        );

        if (!result || !result.success) {

            console.error(
                "Stock Out load error:",
                result
            );

            stockOutData = [];
            return;
        }

        stockOutData = Array.isArray(result.data)
            ? result.data
            : [];

        console.log(
            "Stock Out records:",
            stockOutData.length
        );

    } catch (error) {

        console.error(
            "loadStockOut error:",
            error
        );

        stockOutData = [];
    }
}


// ==========================================================
// LOAD DEMAND HISTORY
// ==========================================================

async function loadDemandHistory() {

    try {

        const result = await supabaseRequest(
            "demand_history",
            "GET"
        );

        if (!result || !result.success) {

            console.error(
                "Demand history load error:",
                result
            );

            demandHistory = [];
            return;
        }

        demandHistory = Array.isArray(result.data)
            ? result.data
            : [];

        console.log(
            "Demand history records:",
            demandHistory.length
        );

    } catch (error) {

        console.error(
            "loadDemandHistory error:",
            error
        );

        demandHistory = [];
    }
}


// ==========================================================
// POPULATE YEAR SELECT
// ==========================================================

function populateYearSelect() {

    const yearSelect =
        document.getElementById("yearSelect");

    if (!yearSelect) {
        return;
    }

    const years = new Set();

    const currentYear =
        new Date().getFullYear();

    years.add(currentYear);

    stockInData.forEach(record => {

        const date = getRecordDate(record);

        if (date.length >= 4) {
            years.add(Number(date.substring(0, 4)));
        }
    });

    stockOutData.forEach(record => {

        const date = getRecordDate(record);

        if (date.length >= 4) {
            years.add(Number(date.substring(0, 4)));
        }
    });

    demandHistory.forEach(record => {

        const monthKey =
            getDemandMonthKey(record);

        if (monthKey.length >= 4) {
            years.add(
                Number(monthKey.substring(0, 4))
            );
        }
    });

    const selectedYear =
        Number(
            localStorage.getItem(
                "dashboardSelectedMonth"
            )?.substring(0, 4)
        ) || currentYear;

    years.add(selectedYear);

    const sortedYears =
        Array.from(years)
            .filter(year => Number.isFinite(year))
            .sort((a, b) => b - a);

    yearSelect.innerHTML = "";

    sortedYears.forEach(year => {

        const option =
            document.createElement("option");

        option.value = String(year);
        option.textContent = String(year);

        if (year === selectedYear) {
            option.selected = true;
        }

        yearSelect.appendChild(option);
    });
}


// ==========================================================
// POPULATE MONTH
// ==========================================================

function populateMonthSelect() {

    const monthSelect =
        document.getElementById("monthSelect");

    if (!monthSelect) {
        return;
    }

    const stored =
        localStorage.getItem(
            "dashboardSelectedMonth"
        );

    let month =
        stored &&
        /^\d{4}-\d{2}$/.test(stored)
            ? Number(stored.substring(5, 7))
            : new Date().getMonth() + 1;

    if (
        !month ||
        month < 1 ||
        month > 12
    ) {
        month = new Date().getMonth() + 1;
    }

    monthSelect.value = String(month);
}


// ==========================================================
// POPULATE ITEM SELECT
// ==========================================================

function populateItemSelect() {

    const itemSelect =
        document.getElementById("itemSelect");

    if (!itemSelect) {
        return;
    }

    const previousValue =
        itemSelect.value || "all";

    itemSelect.innerHTML = "";

    const allOption =
        document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Items";

    itemSelect.appendChild(allOption);

    const sortedItems =
        [...items].sort((a, b) =>
            numericCodeSort(
                getItemCode(a),
                getItemCode(b)
            )
        );

    sortedItems.forEach(item => {

        const code = getItemCode(item);

        if (!code) {
            return;
        }

        const option =
            document.createElement("option");

        option.value = code;

        option.textContent =
            `${code} - ${getItemName(item)}`;

        itemSelect.appendChild(option);
    });

    const exists =
        Array.from(itemSelect.options)
            .some(option =>
                option.value === previousValue
            );

    itemSelect.value =
        exists
            ? previousValue
            : "all";

    updateItemInfo();
}


// ==========================================================
// ITEM INFO
// ==========================================================

function updateItemInfo() {

    const itemSelect =
        document.getElementById("itemSelect");

    const itemInfo =
        document.getElementById("itemInfo");

    if (!itemInfo) {
        return;
    }

    if (
        !itemSelect ||
        itemSelect.value === "all"
    ) {
        itemInfo.innerHTML = "";
        return;
    }

    const item =
        items.find(
            row =>
                getItemCode(row) ===
                itemSelect.value
        );

    if (!item) {
        itemInfo.innerHTML = "";
        return;
    }

    itemInfo.innerHTML = `
        <strong>${getItemCode(item)}</strong>
        -
        ${getItemName(item)}
        ${getItemUnit(item)
            ? ` | Unit: ${getItemUnit(item)}`
            : ""}
    `;
}


// ==========================================================
// ITEM FILTER
// ==========================================================

function applyItemFilter(data) {

    const itemSelect =
        document.getElementById("itemSelect");

    if (
        !itemSelect ||
        itemSelect.value === "all"
    ) {
        return data;
    }

    return data.filter(
        row =>
            cleanCode(row.code) ===
            cleanCode(itemSelect.value)
    );
}


// ==========================================================
// CREATE ITEM GRAPH DATA
// ==========================================================

function createGraphData() {

    const map = {};

    // ------------------------------------------------------
    // Add all master items first
    // ------------------------------------------------------

    items.forEach(item => {

        const code = getItemCode(item);

        if (!code) {
            return;
        }

        map[code] = {

            code: code,

            name: getItemName(item),

            unit: getItemUnit(item),

            stockIn: 0,

            stockOut: 0,

            demand: 0,

            stockInCost: 0,

            stockOutCost: 0
        };
    });


    // ------------------------------------------------------
    // Stock In
    // ------------------------------------------------------

    stockInData.forEach(record => {

        if (!recordMatchesSelectedPeriod(record)) {
            return;
        }

        const code =
            getRecordItemCode(record);

        if (!code) {
            return;
        }

        if (!map[code]) {

            map[code] = {

                code: code,

                name:
                    getRecordItemName(record),

                unit:
                    String(
                        record?.unit ?? ""
                    ),

                stockIn: 0,

                stockOut: 0,

                demand: 0,

                stockInCost: 0,

                stockOutCost: 0
            };
        }

        map[code].stockIn +=
            safeNumber(record.quantity);

        map[code].stockInCost +=
            getStockInRecordCost(record);
    });


    // ------------------------------------------------------
    // Stock Out
    // ------------------------------------------------------

    stockOutData.forEach(record => {

        if (!recordMatchesSelectedPeriod(record)) {
            return;
        }

        const code =
            getRecordItemCode(record);

        if (!code) {
            return;
        }

        if (!map[code]) {

            map[code] = {

                code: code,

                name:
                    getRecordItemName(record),

                unit:
                    String(
                        record?.unit ?? ""
                    ),

                stockIn: 0,

                stockOut: 0,

                demand: 0,

                stockInCost: 0,

                stockOutCost: 0
            };
        }

        map[code].stockOut +=
            safeNumber(record.quantity);

        map[code].stockOutCost +=
            getStockOutRecordCost(record);
    });


    // ------------------------------------------------------
    // Demand
    // ------------------------------------------------------

    const demandRecord =
        getSelectedDemandRecord();

    if (demandRecord) {

        const demandItems =
            getDemandItems(demandRecord);

        demandItems.forEach(demandItem => {

            const code =
                getDemandItemCode(demandItem);

            if (!code) {
                return;
            }

            if (!map[code]) {

                const masterItem =
                    items.find(
                        item =>
                            getItemCode(item) === code
                    );

                map[code] = {

                    code: code,

                    name:
                        masterItem
                            ? getItemName(masterItem)
                            : String(
                                demandItem?.item_name ??
                                demandItem?.itemName ??
                                ""
                            ),

                    unit:
                        masterItem
                            ? getItemUnit(masterItem)
                            : String(
                                demandItem?.unit ??
                                ""
                            ),

                    stockIn: 0,

                    stockOut: 0,

                    demand: 0,

                    stockInCost: 0,

                    stockOutCost: 0
                };
            }

            map[code].demand +=
                getDemandValue(demandItem);
        });
    }


    const data =
        Object.values(map).sort(
            (a, b) =>
                numericCodeSort(
                    a.code,
                    b.code
                )
        );

    return applyItemFilter(data);
}


// ==========================================================
// DEPARTMENT DATA
// ==========================================================

function createDepartmentData() {

    const map = {};

    function ensureDepartment(name) {

        if (!map[name]) {

            map[name] = {

                department: name,

                stockIn: 0,

                stockOut: 0,

                stockInCost: 0,

                stockOutCost: 0
            };
        }
    }


    stockInData.forEach(record => {

        if (!recordMatchesSelectedPeriod(record)) {
            return;
        }

        const department =
            getRecordDepartment(record);

        ensureDepartment(department);

        map[department].stockIn +=
            safeNumber(record.quantity);

        map[department].stockInCost +=
            getStockInRecordCost(record);
    });


    stockOutData.forEach(record => {

        if (!recordMatchesSelectedPeriod(record)) {
            return;
        }

        const department =
            getRecordDepartment(record);

        ensureDepartment(department);

        map[department].stockOut +=
            safeNumber(record.quantity);

        map[department].stockOutCost +=
            getStockOutRecordCost(record);
    });


    return Object.values(map).sort(
        (a, b) =>
            a.department.localeCompare(
                b.department
            )
    );
}


// ==========================================================
// DESTROY CHART
// ==========================================================

function destroyChart(chart) {

    if (chart) {

        try {
            chart.destroy();
        } catch (error) {
            console.warn(
                "Chart destroy error:",
                error
            );
        }
    }

    return null;
}


// ==========================================================
// CHART COMMON OPTIONS
// ==========================================================

function getBarOptions(title) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: true
            },

            title: {
                display: false,
                text: title
            }
        },

        scales: {

            y: {
                beginAtZero: true
            }
        }
    };
}


// ==========================================================
// STOCK IN GRAPH
// ==========================================================

function drawStockInChart(data) {

    const canvas =
        document.getElementById(
            "stockInChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    stockInChart =
        destroyChart(stockInChart);

    stockInChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    data.map(row => row.code),

                datasets: [

                    {
                        label: "Stock In Quantity",

                        data:
                            data.map(
                                row => row.stockIn
                            )
                    }
                ]
            },

            options:
                getBarOptions(
                    "📥 Stock In Quantity"
                )
        });
}


// ==========================================================
// STOCK OUT GRAPH
// ==========================================================

function drawStockOutChart(data) {

    const canvas =
        document.getElementById(
            "stockOutChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    stockOutChart =
        destroyChart(stockOutChart);

    stockOutChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    data.map(row => row.code),

                datasets: [

                    {
                        label: "Stock Out Quantity",

                        data:
                            data.map(
                                row => row.stockOut
                            )
                    }
                ]
            },

            options:
                getBarOptions(
                    "📤 Stock Out Quantity"
                )
        });
}


// ==========================================================
// STOCK IN VS DEMAND
// ==========================================================

function drawStockInDemandChart(data) {

    const canvas =
        document.getElementById(
            "stockInDemandChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    stockInDemandChart =
        destroyChart(stockInDemandChart);

    stockInDemandChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    data.map(row => row.code),

                datasets: [

                    {
                        label: "Stock In",

                        data:
                            data.map(
                                row => row.stockIn
                            )
                    },

                    {
                        label: "Demand",

                        data:
                            data.map(
                                row => row.demand
                            )
                    }
                ]
            },

            options:
                getBarOptions(
                    "📊 Stock In vs Demand"
                )
        });
}


// ==========================================================
// STOCK IN COST
// ==========================================================

function drawStockInCostChart(data) {

    const canvas =
        document.getElementById(
            "stockInCostChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    stockInCostChart =
        destroyChart(stockInCostChart);

    stockInCostChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    data.map(row => row.code),

                datasets: [

                    {
                        label: "Stock In Cost",

                        data:
                            data.map(
                                row => row.stockInCost
                            )
                    }
                ]
            },

            options:
                getBarOptions(
                    "💰 Stock In Cost"
                )
        });
}


// ==========================================================
// STOCK OUT COST - ALL MODE
// ==========================================================

function drawStockOutCostChart(data) {

    const canvas =
        document.getElementById(
            "stockOutCostChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    stockOutCostChart =
        destroyChart(stockOutCostChart);

    stockOutCostChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    data.map(row => row.code),

                datasets: [

                    {
                        label: "Stock Out Cost",

                        data:
                            data.map(
                                row => row.stockOutCost
                            )
                    }
                ]
            },

            options:
                getBarOptions(
                    "💰 Stock Out Cost Analysis"
                )
        });
}


// ==========================================================
// STOCK OUT VS COST
// ==========================================================

function drawStockOutVsCostChart(data) {

    const canvas =
        document.getElementById(
            "stockOutVsCostChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    stockOutVsCostChart =
        destroyChart(stockOutVsCostChart);

    stockOutVsCostChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    data.map(row => row.code),

                datasets: [

                    {
                        label: "Stock Out Quantity",

                        data:
                            data.map(
                                row => row.stockOut
                            )
                    },

                    {
                        label: "Stock Out Cost",

                        data:
                            data.map(
                                row => row.stockOutCost
                            )
                    }
                ]
            },

            options:
                getBarOptions(
                    "💰 Stock Out Cost Analysis"
                )
        });
}


// ==========================================================
// DEMAND GRAPH
// ==========================================================

function drawDemandChart(data) {

    const canvas =
        document.getElementById(
            "demandChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    demandChart =
        destroyChart(demandChart);

    demandChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    data.map(row => row.code),

                datasets: [

                    {
                        label: "Demand Quantity",

                        data:
                            data.map(
                                row => row.demand
                            )
                    }
                ]
            },

            options:
                getBarOptions(
                    "📊 Demand Quantity"
                )
        });
}


// ==========================================================
// DEPARTMENT STOCK IN
// ==========================================================

function drawDepartmentStockInChart(data) {

    const canvas =
        document.getElementById(
            "departmentStockInChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    departmentStockInChart =
        destroyChart(
            departmentStockInChart
        );

    departmentStockInChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    data.map(
                        row => row.department
                    ),

                datasets: [

                    {
                        label:
                            "Department Stock In",

                        data:
                            data.map(
                                row => row.stockIn
                            )
                    }
                ]
            },

            options:
                getBarOptions(
                    "📥 Department Wise Stock In"
                )
        });
}


// ==========================================================
// DEPARTMENT STOCK OUT
// ==========================================================

function drawDepartmentStockOutChart(data) {

    const canvas =
        document.getElementById(
            "departmentStockOutChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    departmentStockOutChart =
        destroyChart(
            departmentStockOutChart
        );

    departmentStockOutChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    data.map(
                        row => row.department
                    ),

                datasets: [

                    {
                        label:
                            "Department Stock Out",

                        data:
                            data.map(
                                row => row.stockOut
                            )
                    }
                ]
            },

            options:
                getBarOptions(
                    "📤 Department Wise Stock Out"
                )
        });
}


// ==========================================================
// DEPARTMENT COST
// ==========================================================

function drawDepartmentCostChart(data) {

    const canvas =
        document.getElementById(
            "departmentCostChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    departmentCostChart =
        destroyChart(
            departmentCostChart
        );

    departmentCostChart =
        new Chart(canvas, {

            type: "bar",

            data: {

                labels:
                    data.map(
                        row => row.department
                    ),

                datasets: [

                    {
                        label:
                            "Stock In Cost",

                        data:
                            data.map(
                                row =>
                                    row.stockInCost
                            )
                    },

                    {
                        label:
                            "Stock Out Cost",

                        data:
                            data.map(
                                row =>
                                    row.stockOutCost
                            )
                    }
                ]
            },

            options:
                getBarOptions(
                    "💰 Department Wise Cost"
                )
        });
}


// ==========================================================
// SHOW / HIDE GRAPH SECTIONS
// ==========================================================

function hideAllGraphSections() {

    const sections = [

        "stockInSection",
        "stockOutSection",
        "stockInDemandSection",
        "stockInCostSection",
        "stockOutCostSection",
        "stockOutVsCostSection",
        "demandSection",
        "departmentStockInSection",
        "departmentStockOutSection",
        "departmentCostSection"
    ];

    sections.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.style.display = "none";
        }
    });
}


function showSection(id) {

    const element =
        document.getElementById(id);

    if (element) {
        element.style.display = "";
    }
}


// ==========================================================
// CLEAR ALL CHARTS
// ==========================================================

function clearAllCharts() {

    stockInChart =
        destroyChart(stockInChart);

    stockOutChart =
        destroyChart(stockOutChart);

    stockInDemandChart =
        destroyChart(stockInDemandChart);

    stockInCostChart =
        destroyChart(stockInCostChart);

    stockOutCostChart =
        destroyChart(stockOutCostChart);

    stockOutVsCostChart =
        destroyChart(stockOutVsCostChart);

    demandChart =
        destroyChart(demandChart);

    departmentStockInChart =
        destroyChart(
            departmentStockInChart
        );

    departmentStockOutChart =
        destroyChart(
            departmentStockOutChart
        );

    departmentCostChart =
        destroyChart(
            departmentCostChart
        );
}


// ==========================================================
// SUMMARY
// ==========================================================

function updateSummary(data) {

    const totalStockIn =
        data.reduce(
            (sum, row) =>
                sum + safeNumber(row.stockIn),
            0
        );

    const totalStockOut =
        data.reduce(
            (sum, row) =>
                sum + safeNumber(row.stockOut),
            0
        );

    const totalDemand =
        data.reduce(
            (sum, row) =>
                sum + safeNumber(row.demand),
            0
        );

    const totalCost =
        data.reduce(
            (sum, row) =>
                sum + safeNumber(row.stockInCost),
            0
        );

    const stockInElement =
        document.getElementById(
            "summaryStockIn"
        );

    const stockOutElement =
        document.getElementById(
            "summaryStockOut"
        );

    const demandElement =
        document.getElementById(
            "summaryDemand"
        );

    const costElement =
        document.getElementById(
            "summaryCost"
        );

    if (stockInElement) {
        stockInElement.textContent =
            totalStockIn.toLocaleString();
    }

    if (stockOutElement) {
        stockOutElement.textContent =
            totalStockOut.toLocaleString();
    }

    if (demandElement) {
        demandElement.textContent =
            totalDemand.toLocaleString();
    }

    if (costElement) {
        costElement.textContent =
            totalCost.toLocaleString();
    }
}


// ==========================================================
// DATA TABLE
// ==========================================================

function updateGraphTable(data) {

    const tbody =
        document.getElementById(
            "graphDataBody"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";

    data.forEach(row => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>${row.code}</td>

            <td>${row.name}</td>

            <td>${row.unit}</td>

            <td>${safeNumber(
                row.stockIn
            ).toLocaleString()}</td>

            <td>${safeNumber(
                row.stockOut
            ).toLocaleString()}</td>

            <td>${safeNumber(
                row.demand
            ).toLocaleString()}</td>

            <td>${safeNumber(
                row.stockInCost
            ).toLocaleString()}</td>

            <td>${safeNumber(
                row.stockOutCost
            ).toLocaleString()}</td>
        `;

        tbody.appendChild(tr);
    });
}


// ==========================================================
// GRAPH MODE
// ==========================================================

function setGraphMode(mode) {

    currentGraphMode =
        mode || "all";

    document
        .querySelectorAll(".graph-mode-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.mode ===
                currentGraphMode
            );
        });

    updateGraphs();
}


// ==========================================================
// UPDATE GRAPHS
// ==========================================================

function updateGraphs() {

    hideAllGraphSections();

    clearAllCharts();

    const data =
        createGraphData();

    const departmentData =
        createDepartmentData();

    updateSummary(data);

    updateGraphTable(data);


    // ======================================================
    // ALL
    // ======================================================

    if (currentGraphMode === "all") {

        showSection("stockInSection");

        showSection("stockOutSection");

        showSection("stockInDemandSection");

        showSection("stockInCostSection");

        showSection("stockOutCostSection");

        showSection(
            "departmentStockInSection"
        );

        showSection(
            "departmentStockOutSection"
        );

        showSection(
            "departmentCostSection"
        );

        drawStockInChart(data);

        drawStockOutChart(data);

        drawStockInDemandChart(data);

        drawStockInCostChart(data);

        drawStockOutCostChart(data);

        drawDepartmentStockInChart(
            departmentData
        );

        drawDepartmentStockOutChart(
            departmentData
        );

        drawDepartmentCostChart(
            departmentData
        );

        return;
    }


    // ======================================================
    // STOCK IN
    // ======================================================

    if (currentGraphMode === "stockIn") {

        showSection("stockInSection");

        showSection(
            "stockInDemandSection"
        );

        showSection("stockInCostSection");

        drawStockInChart(data);

        drawStockInDemandChart(data);

        drawStockInCostChart(data);

        return;
    }


    // ======================================================
    // STOCK OUT
    // ======================================================

    if (currentGraphMode === "stockOut") {

        showSection("stockOutSection");

        // Prefer Stock Out vs Cost section
        if (
            document.getElementById(
                "stockOutVsCostSection"
            )
        ) {

            showSection(
                "stockOutVsCostSection"
            );

            drawStockOutChart(data);

            drawStockOutVsCostChart(data);

        } else {

            // Fallback if old HTML does not yet
            // have stockOutVsCostSection

            showSection(
                "stockOutCostSection"
            );

            drawStockOutChart(data);

            drawStockOutCostChart(data);
        }

        return;
    }


    // ======================================================
    // DEMAND
    // ======================================================

    if (currentGraphMode === "demand") {

        showSection("demandSection");

        drawDemandChart(data);

        return;
    }


    // ======================================================
    // DEPARTMENT
    // ======================================================

    if (currentGraphMode === "department") {

        showSection(
            "departmentStockInSection"
        );

        showSection(
            "departmentStockOutSection"
        );

        showSection(
            "departmentCostSection"
        );

        drawDepartmentStockInChart(
            departmentData
        );

        drawDepartmentStockOutChart(
            departmentData
        );

        drawDepartmentCostChart(
            departmentData
        );

        return;
    }
}


// ==========================================================
// MONTH CHANGE
// ==========================================================

function handleMonthChange() {

    const month =
        getSelectedMonthNumber();

    const year =
        getSelectedYear();

    localStorage.setItem(
        "dashboardSelectedMonth",
        `${year}-${String(month).padStart(2, "0")}`
    );

    updateGraphs();
}


// ==========================================================
// YEAR CHANGE
// ==========================================================

function handleYearChange() {

    const year =
        getSelectedYear();

    const month =
        getSelectedMonthNumber();

    localStorage.setItem(
        "dashboardSelectedMonth",
        `${year}-${String(month).padStart(2, "0")}`
    );

    updateGraphs();
}


// ==========================================================
// START GRAPHS
// ==========================================================

async function startGraphs() {

    try {

        await Promise.all([

            loadItems(),

            loadStockIn(),

            loadStockOut(),

            loadDemandHistory()
        ]);

        populateYearSelect();

        populateMonthSelect();

        populateItemSelect();

        changePeriodType();

        updateGraphs();

    } catch (error) {

        console.error(
            "Graphs start error:",
            error
        );
    }
}


// ==========================================================
// DOM READY
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ----------------------------------------------
        // Graph mode buttons
        // ----------------------------------------------

        document
            .querySelectorAll(
                ".graph-mode-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        setGraphMode(
                            this.dataset.mode
                        );
                    }
                );
            });


        // ----------------------------------------------
        // Item
        // ----------------------------------------------

        const itemSelect =
            document.getElementById(
                "itemSelect"
            );

        if (itemSelect) {

            itemSelect.addEventListener(
                "change",
                function () {

                    updateItemInfo();

                    updateGraphs();
                }
            );
        }


        // ----------------------------------------------
        // Period
        // ----------------------------------------------

        const periodType =
            document.getElementById(
                "periodType"
            );

        if (periodType) {

            periodType.addEventListener(
                "change",
                changePeriodType
            );
        }


        // ----------------------------------------------
        // Month
        // ----------------------------------------------

        const monthSelect =
            document.getElementById(
                "monthSelect"
            );

        if (monthSelect) {

            monthSelect.addEventListener(
                "change",
                handleMonthChange
            );
        }


        // ----------------------------------------------
        // Year
        // ----------------------------------------------

        const yearSelect =
            document.getElementById(
                "yearSelect"
            );

        if (yearSelect) {

            yearSelect.addEventListener(
                "change",
                handleYearChange
            );
        }


        // ----------------------------------------------
        // Start
        // ----------------------------------------------

        startGraphs();
    }
);
