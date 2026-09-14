// ============================================================
// GRAPHS.JS - SUPABASE VERSION
// ============================================================
// Graph Modes:
//
// ALL
//   1. Stock In Quantity
//   2. Stock Out Quantity
//   3. Stock In vs Demand
//   4. Stock In Cost
//   5. Stock Out Cost
//   6. Department Wise Analysis
//
// STOCK IN
//   1. Stock In Quantity
//   2. Stock In vs Demand
//   3. Stock In Cost
//
// STOCK OUT
//   1. Stock Out Quantity
//   2. Stock Out vs Cost Analysis
//
// DEMAND
//   1. Demand Quantity
//
// DEPARTMENT
//   1. Department Wise Stock In
//   2. Department Wise Stock Out
//   3. Department Wise Cost
//
// DATA SOURCE:
//   items          -> Supabase
//   stock_in       -> Supabase
//   stock_issue    -> Supabase
//   demand_history -> Supabase
//
// LocalStorage is used ONLY for UI selections.
// ============================================================


// ============================================================
// GLOBAL DATA
// ============================================================

let items = [];
let stockInData = [];
let stockOutData = [];
let demandHistory = [];

let currentGraphMode = "all";


// ============================================================
// CHART VARIABLES
// ============================================================

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


// ============================================================
// BASIC HELPERS
// ============================================================

function safeNumber(value) {

    if (value === null || value === undefined || value === "") {
        return 0;
    }

    const n = Number(value);

    return Number.isFinite(n) ? n : 0;
}


function cleanCode(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .trim()
        .toUpperCase();
}


function getItemCode(item) {

    if (!item) return "";

    return cleanCode(
        item.code ??
        item.item_code ??
        item.itemCode ??
        ""
    );
}


function getItemName(item) {

    if (!item) return "";

    return String(
        item.item_name ??
        item.itemName ??
        item.name ??
        ""
    ).trim();
}


function getItemUnit(item) {

    if (!item) return "";

    return String(
        item.unit ??
        item.packed_unit ??
        ""
    ).trim();
}


function getRecordItemCode(record) {

    if (!record) return "";

    return cleanCode(
        record.item_code ??
        record.itemCode ??
        record.code ??
        ""
    );
}


function getRecordItemName(record) {

    if (!record) return "";

    return String(
        record.item_name ??
        record.itemName ??
        record.name ??
        ""
    ).trim();
}


function getRecordDepartment(record) {

    if (!record) return "";

    const value =
        record.department ??
        record.Department ??
        record.dept ??
        "";

    const text = String(value).trim();

    return text || "Not Assigned";
}


// ============================================================
// DATE HELPERS
// ============================================================

function getDateOnly(value) {

    if (!value) return null;

    const text = String(value).trim();

    // YYYY-MM-DD
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {

        return (
            match[1] +
            "-" +
            match[2] +
            "-" +
            match[3]
        );
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return null;
    }

    const y = d.getFullYear();

    const m = String(d.getMonth() + 1).padStart(2, "0");

    const day = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;
}


function getRecordDate(record) {

    if (!record) return null;

    return getDateOnly(
        record.date ??
        record.generate_date ??
        record.generateDate ??
        record.created_at ??
        null
    );
}


function getMonthKeyFromDate(dateValue) {

    const date = getDateOnly(dateValue);

    if (!date) return "";

    return date.substring(0, 7);
}


// ============================================================
// SELECTED MONTH
// ============================================================




function getSelectedMonthKey() {

    const monthSelect =
        document.getElementById("monthSelect");

    const yearSelect =
        document.getElementById("yearSelect");


    // Month Select موجود ہو تو اسی کی value استعمال کریں
    if (
        monthSelect &&
        monthSelect.value
    ) {

        let monthValue =
            String(monthSelect.value).trim();


        // اگر value پہلے ہی YYYY-MM ہے
        if (
            /^\d{4}-\d{2}$/.test(monthValue)
        ) {

            return monthValue;
        }


        // اگر value صرف month number ہے
        // مثال: 01, 02, 03 ... 12
        if (
            /^\d{1,2}$/.test(monthValue)
        ) {

            const month =
                monthValue.padStart(2, "0");


            let year =
                new Date().getFullYear();


            if (
                yearSelect &&
                yearSelect.value
            ) {

                year =
                    Number(yearSelect.value);
            }


            return `${year}-${month}`;
        }
    }


    // LocalStorage fallback
    const stored =
        localStorage.getItem(
            "dashboardSelectedMonth"
        );


    if (
        stored &&
        /^\d{4}-\d{2}$/.test(stored)
    ) {

        return stored;
    }


    return getTodayMonthKey();
}


// ============================================================
// YEAR / MONTH SELECTOR
// ============================================================

function getSelectedYear() {

    const yearSelect =
        document.getElementById("yearSelect");

    if (
        yearSelect &&
        yearSelect.value
    ) {

        return Number(yearSelect.value);
    }


    const monthKey = getSelectedMonthKey();

    return Number(monthKey.substring(0, 4));
}


function getSelectedMonthNumber() {

    const monthKey = getSelectedMonthKey();

    return Number(
        monthKey.substring(5, 7)
    );
}


function updateMonthLabel() {

    const label =
        document.getElementById("monthLabel");

    if (!label) return;

    const monthKey = getSelectedMonthKey();

    const parts = monthKey.split("-");

    if (parts.length !== 2) return;

    const year = Number(parts[0]);

    const month = Number(parts[1]);

    const date =
        new Date(year, month - 1, 1);

    label.textContent =
        date.toLocaleString("en-US", {
            month: "long",
            year: "numeric"
        });
}


// ============================================================
// SUPABASE DATA LOADERS
// ============================================================

async function loadItems() {

    try {

        const result =
            await supabaseRequest(
                "items",
                "GET",
                null,
                "?select=*"
            );


        if (!result || !result.success) {

            console.error(
                "Graphs - Items loading error:",
                result?.error
            );

            items = [];

            return;
        }


        items = Array.isArray(result.data)
            ? result.data
            : [];


        console.log(
            "Graphs - Supabase Items:",
            items.length
        );

    } catch (error) {

        console.error(
            "Graphs - loadItems error:",
            error
        );

        items = [];
    }
}


async function loadStockIn() {

    try {

        const result =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*"
            );


        if (!result || !result.success) {

            console.error(
                "Graphs - Stock In loading error:",
                result?.error
            );

            stockInData = [];

            return;
        }


        stockInData =
            Array.isArray(result.data)
                ? result.data
                : [];


        console.log(
            "Graphs - Supabase Stock In:",
            stockInData.length
        );

    } catch (error) {

        console.error(
            "Graphs - loadStockIn error:",
            error
        );

        stockInData = [];
    }
}


async function loadStockOut() {

    try {

        const result =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*"
            );


        if (!result || !result.success) {

            console.error(
                "Graphs - Stock Out loading error:",
                result?.error
            );

            stockOutData = [];

            return;
        }


        stockOutData =
            Array.isArray(result.data)
                ? result.data
                : [];


        console.log(
            "Graphs - Supabase Stock Out:",
            stockOutData.length
        );

    } catch (error) {

        console.error(
            "Graphs - loadStockOut error:",
            error
        );

        stockOutData = [];
    }
}


async function loadDemandHistory() {

    try {

        const result =
            await supabaseRequest(
                "demand_history",
                "GET",
                null,
                "?select=*"
            );


        if (!result || !result.success) {

            console.error(
                "Graphs - Demand History loading error:",
                result?.error
            );

            demandHistory = [];

            return;
        }


        demandHistory =
            Array.isArray(result.data)
                ? result.data
                : [];


        console.log(
            "Graphs - Supabase Demand History:",
            demandHistory.length
        );

    } catch (error) {

        console.error(
            "Graphs - loadDemandHistory error:",
            error
        );

        demandHistory = [];
    }
}


// ============================================================
// DEBUG DATA
// ============================================================

function logGraphData() {

    console.log(
        "================ GRAPHS DATA ================"
    );

    console.log(
        "Items:",
        items
    );

    console.log(
        "Stock In:",
        stockInData
    );

    console.log(
        "Stock Out:",
        stockOutData
    );

    console.log(
        "Demand History:",
        demandHistory
    );

    console.log(
        "Counts:",
        {
            items: items.length,
            stockIn: stockInData.length,
            stockOut: stockOutData.length,
            demand: demandHistory.length
        }
    );

    console.log(
        "Selected Month:",
        getSelectedMonthKey()
    );

    console.log(
        "Current Graph Mode:",
        currentGraphMode
    );

    console.log(
        "=============================================="
    );
}


// ============================================================
// DEMAND HELPERS
// ============================================================

function getDemandItems(record) {

    if (!record) return [];


    let value =
        record.demand_items ??
        record.demandItems ??
        record.items ??
        [];


    if (typeof value === "string") {

        try {

            value = JSON.parse(value);

        } catch (error) {

            console.warn(
                "Unable to parse demand items:",
                value
            );

            return [];
        }
    }


    if (Array.isArray(value)) {

        return value;
    }


    if (
        value &&
        typeof value === "object"
    ) {

        return Object.values(value);
    }


    return [];
}


function getDemandValue(item) {

    if (!item) return 0;


    return safeNumber(
        item.finalDemand ??
        item.final_demand ??
        item.approvedQty ??
        item.approved_qty ??
        item.quantity ??
        item.demandQty ??
        item.demand_qty ??
        item.demand ??
        item.qty ??
        0
    );
}


function getDemandItemCode(item) {

    if (!item) return "";

    return cleanCode(
        item.code ??
        item.item_code ??
        item.itemCode ??
        ""
    );
}


// ============================================================
// FIND DEMAND RECORD FOR SELECTED MONTH
// ============================================================

function getDemandRecordDate(record) {

    return getDateOnly(
        record?.generate_date ??
        record?.generateDate ??
        record?.date ??
        record?.created_at ??
        null
    );
}


function getSelectedDemandRecord() {

    const monthKey =
        getSelectedMonthKey();


    const matching =
        demandHistory
            .filter(record => {

                const date =
                    getDemandRecordDate(record);

                if (!date) return false;

                return date.startsWith(monthKey);
            })
            .sort((a, b) => {

                const da =
                    getDemandRecordDate(a) || "";

                const db =
                    getDemandRecordDate(b) || "";

                return db.localeCompare(da);
            });


    return matching.length
        ? matching[0]
        : null;
}


function getNextDemandDate() {

    const selectedMonth =
        getSelectedMonthKey();


    const selectedRecord =
        getSelectedDemandRecord();


    if (!selectedRecord) {

        return null;
    }


    const selectedDate =
        getDemandRecordDate(
            selectedRecord
        );


    if (!selectedDate) {

        return null;
    }


    const laterRecords =
        demandHistory
            .map(record => {

                return {
                    record,
                    date:
                        getDemandRecordDate(record)
                };
            })
            .filter(x => {

                return (
                    x.date &&
                    x.date > selectedDate
                );
            })
            .sort((a, b) =>
                a.date.localeCompare(b.date)
            );


    if (!laterRecords.length) {

        return null;
    }


    return laterRecords[0].date;
}


function dateIsInsideDemandCycle(dateValue) {

    const date =
        getDateOnly(dateValue);

    if (!date) return false;


    const selectedRecord =
        getSelectedDemandRecord();


    // اگر selected month کی demand موجود نہیں
    // تو selected month کو ہی cycle سمجھیں
    if (!selectedRecord) {

        return (
            getMonthKeyFromDate(dateValue) ===
            getSelectedMonthKey()
        );
    }


    const startDate =
        getDemandRecordDate(
            selectedRecord
        );


    if (!startDate) {

        return (
            getMonthKeyFromDate(dateValue) ===
            getSelectedMonthKey()
        );
    }


    const nextDate =
        getNextDemandDate();


    if (date < startDate) {

        return false;
    }


    if (
        nextDate &&
        date >= nextDate
    ) {

        return false;
    }


    return true;
}


// ============================================================
// GET DEMAND FOR ITEM
// ============================================================

function getDemandForItem(code) {

    const targetCode =
        cleanCode(code);


    const selectedRecord =
        getSelectedDemandRecord();


    if (!selectedRecord) {

        return 0;
    }


    const demandItems =
        getDemandItems(
            selectedRecord
        );


    let total = 0;


    demandItems.forEach(item => {

        const itemCode =
            getDemandItemCode(item);


        if (
            itemCode === targetCode
        ) {

            total +=
                getDemandValue(item);
        }
    });


    return total;
}


// ============================================================
// FILTER STOCK DATA BY DEMAND CYCLE
// ============================================================

function getCycleStockInData() {

    return stockInData.filter(record => {

        const date =
            getRecordDate(record);

        return date &&
            dateIsInsideDemandCycle(date);
    });
}


function getCycleStockOutData() {

    return stockOutData.filter(record => {

        const date =
            getRecordDate(record);

        return date &&
            dateIsInsideDemandCycle(date);
    });
}


// ============================================================
// COST HELPERS
// ============================================================

function getStockInRecordCost(record) {

    if (!record) return 0;


    const totalCost =
        safeNumber(
            record.total_cost ??
            record.totalCost ??
            0
        );


    if (totalCost > 0) {

        return totalCost;
    }


    const quantity =
        safeNumber(
            record.quantity ??
            record.qty ??
            0
        );


    const rate =
        safeNumber(
            record.unit_cost ??
            record.unitCost ??
            record.rate ??
            record.cost ??
            0
        );


    return quantity * rate;
}


function getStockInRate(record) {

    if (!record) return 0;


    return safeNumber(
        record.unit_cost ??
        record.unitCost ??
        record.rate ??
        record.cost ??
        0
    );
}


function getCyclePurchaseCost(code) {

    const targetCode =
        cleanCode(code);


    let total = 0;


    getCycleStockInData()
        .forEach(record => {

            if (
                getRecordItemCode(record) ===
                targetCode
            ) {

                total +=
                    getStockInRecordCost(record);
            }
        });


    return total;
}


// ============================================================
// STOCK OUT RATE
// ============================================================

function getStockInRateForItemOnDate(
    code,
    issueDate
) {

    const targetCode =
        cleanCode(code);


    const targetDate =
        getDateOnly(issueDate);


    const records =
        stockInData
            .filter(record => {

                if (
                    getRecordItemCode(record) !==
                    targetCode
                ) {

                    return false;
                }


                const date =
                    getRecordDate(record);


                if (!date) return false;


                if (
                    targetDate &&
                    date > targetDate
                ) {

                    return false;
                }


                return true;
            })
            .sort((a, b) => {

                const da =
                    getRecordDate(a) || "";

                const db =
                    getRecordDate(b) || "";

                return db.localeCompare(da);
            });


    if (!records.length) {

        return 0;
    }


    return getStockInRate(
        records[0]
    );
}


// ============================================================
// STOCK OUT COST
// ============================================================

function getStockOutRecordCost(record) {

    if (!record) return 0;


    const savedTotal =
        safeNumber(
            record.total_cost ??
            record.totalCost ??
            0
        );


    if (savedTotal > 0) {

        return savedTotal;
    }


    const quantity =
        safeNumber(
            record.quantity ??
            record.qty ??
            0
        );


    const savedRate =
        safeNumber(
            record.unit_cost ??
            record.unitCost ??
            record.rate ??
            record.cost ??
            0
        );


    if (savedRate > 0) {

        return quantity * savedRate;
    }


    const code =
        getRecordItemCode(record);


    const date =
        getRecordDate(record);


    const latestRate =
        getStockInRateForItemOnDate(
            code,
            date
        );


    return quantity * latestRate;
}


function getCycleStockOutCost(code) {

    const targetCode =
        cleanCode(code);


    let total = 0;


    getCycleStockOutData()
        .forEach(record => {

            if (
                getRecordItemCode(record) ===
                targetCode
            ) {

                total +=
                    getStockOutRecordCost(record);
            }
        });


    return total;
}


// ============================================================
// CREATE ITEM GRAPH DATA
// ============================================================

function createGraphData() {

    const cycleStockIn =
        getCycleStockInData();

    const cycleStockOut =
        getCycleStockOutData();


    const map = new Map();


    // --------------------------------------------------------
    // Add Master List Items
    // --------------------------------------------------------

    items.forEach(item => {

        const code =
            getItemCode(item);


        if (!code) return;


        map.set(code, {

            code,

            name:
                getItemName(item),

            unit:
                getItemUnit(item),

            stockIn: 0,

            stockOut: 0,

            demand:
                getDemandForItem(code),

            stockInCost: 0,

            stockOutCost: 0

        });
    });


    // --------------------------------------------------------
    // Stock In
    // --------------------------------------------------------

    cycleStockIn.forEach(record => {

        const code =
            getRecordItemCode(record);


        if (!code) return;


        if (!map.has(code)) {

            map.set(code, {

                code,

                name:
                    getRecordItemName(record),

                unit:
                    String(
                        record.unit ?? ""
                    ),

                stockIn: 0,

                stockOut: 0,

                demand:
                    getDemandForItem(code),

                stockInCost: 0,

                stockOutCost: 0

            });
        }


        const row =
            map.get(code);


        row.stockIn +=
            safeNumber(
                record.quantity ??
                record.qty ??
                0
            );


        row.stockInCost +=
            getStockInRecordCost(
                record
            );
    });


    // --------------------------------------------------------
    // Stock Out
    // --------------------------------------------------------

    cycleStockOut.forEach(record => {

        const code =
            getRecordItemCode(record);


        if (!code) return;


        if (!map.has(code)) {

            map.set(code, {

                code,

                name:
                    getRecordItemName(record),

                unit:
                    String(
                        record.unit ?? ""
                    ),

                stockIn: 0,

                stockOut: 0,

                demand:
                    getDemandForItem(code),

                stockInCost: 0,

                stockOutCost: 0

            });
        }


        const row =
            map.get(code);


        row.stockOut +=
            safeNumber(
                record.quantity ??
                record.qty ??
                0
            );


        row.stockOutCost +=
            getStockOutRecordCost(
                record
            );
    });


    // --------------------------------------------------------
    // Recalculate Demand
    // --------------------------------------------------------

    map.forEach(row => {

        row.demand =
            getDemandForItem(
                row.code
            );
    });


    // --------------------------------------------------------
    // Numeric Item Code Sorting
    // SI1, SI2, SI3 ... SI10
    // --------------------------------------------------------

    return Array.from(
        map.values()
    ).sort((a, b) => {

        const aMatch =
            String(a.code).match(/\d+/);

        const bMatch =
            String(b.code).match(/\d+/);


        if (
            aMatch &&
            bMatch
        ) {

            return (
                Number(aMatch[0]) -
                Number(bMatch[0])
            );
        }


        return String(a.code)
            .localeCompare(
                String(b.code)
            );
    });
}


// ============================================================
// DEPARTMENT DATA
// ============================================================

function createDepartmentData() {

    const cycleStockIn =
        getCycleStockInData();

    const cycleStockOut =
        getCycleStockOutData();


    const map = new Map();


    function getDepartmentRow(
        department
    ) {

        const dept =
            department || "Not Assigned";


        if (!map.has(dept)) {

            map.set(dept, {

                department: dept,

                stockIn: 0,

                stockOut: 0,

                stockInCost: 0,

                stockOutCost: 0

            });
        }


        return map.get(dept);
    }


    // --------------------------------------------------------
    // Stock In Department
    // --------------------------------------------------------

    cycleStockIn.forEach(record => {

        const dept =
            getRecordDepartment(
                record
            );


        const row =
            getDepartmentRow(dept);


        row.stockIn +=
            safeNumber(
                record.quantity ??
                record.qty ??
                0
            );


        row.stockInCost +=
            getStockInRecordCost(
                record
            );
    });


    // --------------------------------------------------------
    // Stock Out Department
    // --------------------------------------------------------

    cycleStockOut.forEach(record => {

        const dept =
            getRecordDepartment(
                record
            );


        const row =
            getDepartmentRow(dept);


        row.stockOut +=
            safeNumber(
                record.quantity ??
                record.qty ??
                0
            );


        row.stockOutCost +=
            getStockOutRecordCost(
                record
            );
    });


    return Array.from(
        map.values()
    ).sort((a, b) =>
        a.department.localeCompare(
            b.department
        )
    );
}


// ============================================================
// DESTROY CHART
// ============================================================

function destroyChart(chart) {

    if (chart) {

        try {

            chart.destroy();

        } catch (error) {

            console.warn(
                "Chart destroy warning:",
                error
            );
        }
    }


    return null;
}


// ============================================================
// HIDE ALL GRAPH SECTIONS
// ============================================================

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

        const section =
            document.getElementById(id);

        if (section) {

            section.style.display = "none";
        }
    });
}


// ============================================================
// SHOW SECTION
// ============================================================

function showSection(id) {

    const section =
        document.getElementById(id);

    if (section) {

        section.style.display = "";
    }
}


// ============================================================
// CLEAR CHARTS
// ============================================================

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
        destroyChart(departmentStockInChart);

    departmentStockOutChart =
        destroyChart(departmentStockOutChart);

    departmentCostChart =
        destroyChart(departmentCostChart);
}


// ============================================================
// CHART OPTIONS
// ============================================================

function getCommonOptions(
    title,
    yTitle
) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {

                display: true,

                position: "top"

            },

            title: {

                display: true,

                text: title

            }

        },

        scales: {

            x: {

                ticks: {

                    autoSkip: false,

                    maxRotation: 60,

                    minRotation: 30

                }

            },

            y: {

                beginAtZero: true,

                title: {

                    display: true,

                    text: yTitle

                }

            }

        }

    };
}


// ============================================================
// STOCK IN QUANTITY GRAPH
// ============================================================

function drawStockInChart(data) {

    const canvas =
        document.getElementById(
            "stockInChart"
        );

    if (!canvas) return;


    stockInChart =
        destroyChart(
            stockInChart
        );


    const labels =
        data.map(row =>
            row.code
        );


    const values =
        data.map(row =>
            row.stockIn
        );


    stockInChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "Stock In Quantity",

                            data: values,

                            borderWidth: 1

                        }

                    ]

                },

                options:
                    getCommonOptions(
                        "📥 Stock In Quantity",
                        "Quantity"
                    )

            }
        );
}


// ============================================================
// STOCK OUT QUANTITY GRAPH
// ============================================================

function drawStockOutChart(data) {

    const canvas =
        document.getElementById(
            "stockOutChart"
        );

    if (!canvas) return;


    stockOutChart =
        destroyChart(
            stockOutChart
        );


    const labels =
        data.map(row =>
            row.code
        );


    const values =
        data.map(row =>
            row.stockOut
        );


    stockOutChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "Stock Out Quantity",

                            data: values,

                            borderWidth: 1

                        }

                    ]

                },

                options:
                    getCommonOptions(
                        "📤 Stock Out Quantity",
                        "Quantity"
                    )

            }
        );
}


// ============================================================
// STOCK IN VS DEMAND
// ============================================================

function drawStockInDemandChart(data) {

    const canvas =
        document.getElementById(
            "stockInDemandChart"
        );

    if (!canvas) return;


    stockInDemandChart =
        destroyChart(
            stockInDemandChart
        );


    const labels =
        data.map(row =>
            row.code
        );


    stockInDemandChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {

                            label:
                                "Stock In",

                            data:
                                data.map(
                                    row =>
                                        row.stockIn
                                ),

                            borderWidth: 1

                        },

                        {

                            label:
                                "Demand",

                            data:
                                data.map(
                                    row =>
                                        row.demand
                                ),

                            borderWidth: 1

                        }

                    ]

                },

                options:
                    getCommonOptions(
                        "📊 Stock In vs Demand",
                        "Quantity"
                    )

            }
        );
}


// ============================================================
// STOCK IN COST
// ============================================================

function drawStockInCostChart(data) {

    const canvas =
        document.getElementById(
            "stockInCostChart"
        );

    if (!canvas) return;


    stockInCostChart =
        destroyChart(
            stockInCostChart
        );


    stockInCostChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels:
                        data.map(
                            row =>
                                row.code
                        ),

                    datasets: [

                        {

                            label:
                                "Stock In Cost",

                            data:
                                data.map(
                                    row =>
                                        row.stockInCost
                                ),

                            borderWidth: 1

                        }

                    ]

                },

                options:
                    getCommonOptions(
                        "💰 Stock In Cost",
                        "Cost"
                    )

            }
        );
}


// ============================================================
// STOCK OUT COST
// ============================================================

function drawStockOutCostChart(data) {

    const canvas =
        document.getElementById(
            "stockOutCostChart"
        );

    if (!canvas) return;


    stockOutCostChart =
        destroyChart(
            stockOutCostChart
        );


    stockOutCostChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels:
                        data.map(
                            row =>
                                row.code
                        ),

                    datasets: [

                        {

                            label:
                                "Stock Out Cost",

                            data:
                                data.map(
                                    row =>
                                        row.stockOutCost
                                ),

                            borderWidth: 1

                        }

                    ]

                },

                options:
                    getCommonOptions(
                        "💰 Stock Out Cost",
                        "Cost"
                    )

            }
        );
}


// ============================================================
// STOCK OUT VS COST ANALYSIS
// ============================================================

function drawStockOutVsCostChart(data) {

    const canvas =
        document.getElementById(
            "stockOutVsCostChart"
        );

    if (!canvas) return;


    stockOutVsCostChart =
        destroyChart(
            stockOutVsCostChart
        );


    stockOutVsCostChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels:
                        data.map(
                            row =>
                                row.code
                        ),

                    datasets: [

                        {

                            label:
                                "Stock Out Quantity",

                            data:
                                data.map(
                                    row =>
                                        row.stockOut
                                ),

                            yAxisID:
                                "yQuantity",

                            borderWidth: 1

                        },

                        {

                            label:
                                "Stock Out Cost",

                            data:
                                data.map(
                                    row =>
                                        row.stockOutCost
                                ),

                            yAxisID:
                                "yCost",

                            borderWidth: 1

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            display: true,

                            position: "top"

                        },

                        title: {

                            display: true,

                            text:
                                "📊 Stock Out vs Cost Analysis"

                        }

                    },

                    scales: {

                        x: {

                            ticks: {

                                autoSkip: false,

                                maxRotation: 60,

                                minRotation: 30

                            }

                        },

                        yQuantity: {

                            beginAtZero: true,

                            position: "left",

                            title: {

                                display: true,

                                text:
                                    "Stock Out Quantity"

                            }

                        },

                        yCost: {

                            beginAtZero: true,

                            position: "right",

                            grid: {

                                drawOnChartArea: false

                            },

                            title: {

                                display: true,

                                text:
                                    "Stock Out Cost"

                            }

                        }

                    }

                }

            }
        );
}


// ============================================================
// DEMAND GRAPH
// ============================================================

function drawDemandChart(data) {

    const canvas =
        document.getElementById(
            "demandChart"
        );

    if (!canvas) return;


    demandChart =
        destroyChart(
            demandChart
        );


    demandChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels:
                        data.map(
                            row =>
                                row.code
                        ),

                    datasets: [

                        {

                            label:
                                "Demand Quantity",

                            data:
                                data.map(
                                    row =>
                                        row.demand
                                ),

                            borderWidth: 1

                        }

                    ]

                },

                options:
                    getCommonOptions(
                        "📈 Demand Quantity",
                        "Demand"
                    )

            }
        );
}


// ============================================================
// DEPARTMENT STOCK IN
// ============================================================

function drawDepartmentStockInChart(
    data
) {

    const canvas =
        document.getElementById(
            "departmentStockInChart"
        );

    if (!canvas) return;


    departmentStockInChart =
        destroyChart(
            departmentStockInChart
        );


    departmentStockInChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels:
                        data.map(
                            row =>
                                row.department
                        ),

                    datasets: [

                        {

                            label:
                                "Department Stock In",

                            data:
                                data.map(
                                    row =>
                                        row.stockIn
                                ),

                            borderWidth: 1

                        }

                    ]

                },

                options:
                    getCommonOptions(
                        "🏢 Department Wise Stock In",
                        "Quantity"
                    )

            }
        );
}


// ============================================================
// DEPARTMENT STOCK OUT
// ============================================================

function drawDepartmentStockOutChart(
    data
) {

    const canvas =
        document.getElementById(
            "departmentStockOutChart"
        );

    if (!canvas) return;


    departmentStockOutChart =
        destroyChart(
            departmentStockOutChart
        );


    departmentStockOutChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels:
                        data.map(
                            row =>
                                row.department
                        ),

                    datasets: [

                        {

                            label:
                                "Department Stock Out",

                            data:
                                data.map(
                                    row =>
                                        row.stockOut
                                ),

                            borderWidth: 1

                        }

                    ]

                },

                options:
                    getCommonOptions(
                        "🏢 Department Wise Stock Out",
                        "Quantity"
                    )

            }
        );
}


// ============================================================
// DEPARTMENT COST
// ============================================================

function drawDepartmentCostChart(
    data
) {

    const canvas =
        document.getElementById(
            "departmentCostChart"
        );

    if (!canvas) return;


    departmentCostChart =
        destroyChart(
            departmentCostChart
        );


    departmentCostChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels:
                        data.map(
                            row =>
                                row.department
                        ),

                    datasets: [

                        {

                            label:
                                "Stock In Cost",

                            data:
                                data.map(
                                    row =>
                                        row.stockInCost
                                ),

                            borderWidth: 1

                        },

                        {

                            label:
                                "Stock Out Cost",

                            data:
                                data.map(
                                    row =>
                                        row.stockOutCost
                                ),

                            borderWidth: 1

                        }

                    ]

                },

                options:
                    getCommonOptions(
                        "🏢 Department Wise Cost",
                        "Cost"
                    )

            }
        );
}


// ============================================================
// UPDATE SUMMARY
// ============================================================

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
                sum +
                safeNumber(
                    row.stockInCost
                ),
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


// ============================================================
// UPDATE DATA TABLE
// ============================================================

function updateDataTable(data) {

    const tbody =
        document.getElementById(
            "graphDataBody"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    if (!data.length) {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `
            <td colspan="8" style="text-align:center;">
                No graph data found for selected period.
            </td>
        `;


        tbody.appendChild(tr);

        return;
    }


    data.forEach(row => {

        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>${escapeHtml(row.code)}</td>

            <td>${escapeHtml(row.name)}</td>

            <td>${escapeHtml(row.unit)}</td>

            <td>${safeNumber(row.stockIn).toLocaleString()}</td>

            <td>${safeNumber(row.stockOut).toLocaleString()}</td>

            <td>${safeNumber(row.demand).toLocaleString()}</td>

            <td>${safeNumber(row.stockInCost).toLocaleString()}</td>

            <td>${safeNumber(row.stockOutCost).toLocaleString()}</td>

        `;


        tbody.appendChild(tr);
    });
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// SET GRAPH MODE
// ============================================================

function setGraphMode(mode) {

    currentGraphMode =
        mode || "all";


    document
        .querySelectorAll(
            ".graph-mode-btn"
        )
        .forEach(button => {

            const buttonMode =
                button.dataset.mode;


            button.classList.toggle(
                "active",
                buttonMode ===
                currentGraphMode
            );
        });


    updateGraphs();
}


// ============================================================
// UPDATE ALL GRAPHS
// ============================================================

function updateGraphs() {

    hideAllGraphSections();

    clearAllCharts();


    const data =
        createGraphData();


    const departmentData =
        createDepartmentData();


    updateSummary(data);

    updateDataTable(data);


    // ========================================================
    // ALL
    // ========================================================

    if (
        currentGraphMode === "all"
    ) {

        showSection(
            "stockInSection"
        );

        drawStockInChart(data);


        showSection(
            "stockOutSection"
        );

        drawStockOutChart(data);


        showSection(
            "stockInDemandSection"
        );

        drawStockInDemandChart(data);


        showSection(
            "stockInCostSection"
        );

        drawStockInCostChart(data);


        showSection(
            "stockOutCostSection"
        );

        drawStockOutCostChart(data);


        showSection(
            "departmentStockInSection"
        );

        drawDepartmentStockInChart(
            departmentData
        );


        showSection(
            "departmentStockOutSection"
        );

        drawDepartmentStockOutChart(
            departmentData
        );


        showSection(
            "departmentCostSection"
        );

        drawDepartmentCostChart(
            departmentData
        );


        return;
    }


    // ========================================================
    // STOCK IN
    // ========================================================

    if (
        currentGraphMode === "stockIn"
    ) {

        showSection(
            "stockInSection"
        );

        drawStockInChart(data);


        showSection(
            "stockInDemandSection"
        );

        drawStockInDemandChart(data);


        showSection(
            "stockInCostSection"
        );

        drawStockInCostChart(data);


        return;
    }


    // ========================================================
    // STOCK OUT
    // ========================================================

    if (
        currentGraphMode === "stockOut"
    ) {

        showSection(
            "stockOutSection"
        );

        drawStockOutChart(data);


        showSection(
            "stockOutVsCostSection"
        );

        drawStockOutVsCostChart(data);


        return;
    }


    // ========================================================
    // DEMAND
    // ========================================================

    if (
        currentGraphMode === "demand"
    ) {

        showSection(
            "demandSection"
        );

        drawDemandChart(data);


        return;
    }


    // ========================================================
    // DEPARTMENT
    // ========================================================

    if (
        currentGraphMode === "department"
    ) {

        showSection(
            "departmentStockInSection"
        );

        drawDepartmentStockInChart(
            departmentData
        );


        showSection(
            "departmentStockOutSection"
        );

        drawDepartmentStockOutChart(
            departmentData
        );


        showSection(
            "departmentCostSection"
        );

        drawDepartmentCostChart(
            departmentData
        );


        return;
    }
}


// ============================================================
// LOAD YEAR OPTIONS
// ============================================================

function populateYearSelect() {

    const select =
        document.getElementById(
            "yearSelect"
        );


    if (!select) return;


    const years = new Set();


    stockInData.forEach(record => {

        const date =
            getRecordDate(record);

        if (date) {

            years.add(
                Number(
                    date.substring(0, 4)
                )
            );
        }
    });


    stockOutData.forEach(record => {

        const date =
            getRecordDate(record);

        if (date) {

            years.add(
                Number(
                    date.substring(0, 4)
                )
            );
        }
    });


    demandHistory.forEach(record => {

        const date =
            getDemandRecordDate(record);

        if (date) {

            years.add(
                Number(
                    date.substring(0, 4)
                )
            );
        }
    });


    const currentYear =
        new Date().getFullYear();


    years.add(currentYear);


    const selectedYear =
        getSelectedYear();


    select.innerHTML = "";


    Array.from(years)
        .sort((a, b) => a - b)
        .forEach(year => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                year;


            option.textContent =
                year;


            if (
                year === selectedYear
            ) {

                option.selected = true;
            }


            select.appendChild(option);
        });
}


// ============================================================
// MONTH CHANGE
// ============================================================

function handleMonthChange() {

    const monthSelect =
        document.getElementById("monthSelect");

    const yearSelect =
        document.getElementById("yearSelect");


    if (
        !monthSelect ||
        !monthSelect.value
    ) {

        return;
    }


    let monthValue =
        String(monthSelect.value).trim();


    let year =
        new Date().getFullYear();


    if (
        yearSelect &&
        yearSelect.value
    ) {

        year =
            Number(yearSelect.value);
    }


    let monthKey;


    // اگر monthSelect کی value YYYY-MM ہے
    if (
        /^\d{4}-\d{2}$/.test(monthValue)
    ) {

        monthKey =
            monthValue;

    }

    // اگر صرف 01-12 ہے
    else {

        monthKey =
            `${year}-${monthValue.padStart(2, "0")}`;
    }


    // صرف selected month یاد رکھیں
    localStorage.setItem(
        "dashboardSelectedMonth",
        monthKey
    );


    updateMonthLabel();

    updateGraphs();
}


// ============================================================
// YEAR CHANGE
// ============================================================

function handleYearChange() {

    const yearSelect =
        document.getElementById("yearSelect");

    const monthSelect =
        document.getElementById("monthSelect");


    if (
        !yearSelect ||
        !yearSelect.value
    ) {

        return;
    }


    const year =
        Number(yearSelect.value);


    let month =
        "01";


    if (
        monthSelect &&
        monthSelect.value
    ) {

        const value =
            String(
                monthSelect.value
            ).trim();


        // اگر month value YYYY-MM ہے
        if (
            /^\d{4}-\d{2}$/.test(value)
        ) {

            month =
                value.substring(5, 7);

        } else {

            // صرف month number
            month =
                value.padStart(2, "0");
        }
    }


    const monthKey =
        `${year}-${month}`;


    localStorage.setItem(
        "dashboardSelectedMonth",
        monthKey
    );


    // اگر HTML کا monthSelect صرف 01-12 لیتا ہے
    if (
        monthSelect &&
        !/^\d{4}-\d{2}$/.test(
            String(monthSelect.value)
        )
    ) {

        monthSelect.value =
            month;
    }


    updateMonthLabel();

    updateGraphs();
}

// ============================================================
// ITEM SELECT
// ============================================================

function populateItemSelect() {

    const select =
        document.getElementById(
            "itemSelect"
        );


    if (!select) return;


    const previousValue =
        localStorage.getItem(
            "dashboardSelectedItem"
        ) || "";


    select.innerHTML = `
        <option value="">All Items</option>
    `;


    items
        .slice()
        .sort((a, b) => {

            return String(
                getItemCode(a)
            ).localeCompare(
                String(
                    getItemCode(b)
                ),
                undefined,
                {
                    numeric: true
                }
            );
        })
        .forEach(item => {

            const code =
                getItemCode(item);


            if (!code) return;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                code;


            option.textContent =
                `${code} - ${getItemName(item)}`;


            if (
                code === previousValue
            ) {

                option.selected = true;
            }


            select.appendChild(option);
        });


    updateItemInfo();
}


function updateItemInfo() {

    const select =
        document.getElementById(
            "itemSelect"
        );


    const info =
        document.getElementById(
            "itemInfo"
        );


    if (!select || !info) return;


    const code =
        cleanCode(
            select.value
        );


    if (!code) {

        info.textContent =
            "All Items";

        return;
    }


    const item =
        items.find(
            x =>
                getItemCode(x) ===
                code
        );


    if (!item) {

        info.textContent =
            code;

        return;
    }


    info.textContent =
        `${getItemName(item)} (${getItemUnit(item)})`;
}


// ============================================================
// ITEM FILTER
// ============================================================

function applyItemFilter(data) {

    const select =
        document.getElementById(
            "itemSelect"
        );


    if (!select || !select.value) {

        return data;
    }


    const code =
        cleanCode(
            select.value
        );


    return data.filter(row =>
        cleanCode(row.code) === code
    );
}


// ============================================================
// START GRAPHS
// ============================================================

async function startGraphs() {

    console.log(
        "Graphs: Loading data from Supabase..."
    );


    await Promise.all([

        loadItems(),

        loadStockIn(),

        loadStockOut(),

        loadDemandHistory()

    ]);


    // Debug
    logGraphData();


    populateYearSelect();

    populateItemSelect();

    updateMonthLabel();


    // --------------------------------------------------------
    // IMPORTANT:
    // If item filtering is required, updateGraphs() can be
    // extended later without changing the Supabase loading.
    // --------------------------------------------------------

    updateGraphs();


    console.log(
        "Graphs: Ready."
    );
}


// ============================================================
// DOM CONTENT LOADED
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ----------------------------------------------------
        // Graph Mode Buttons
        // ----------------------------------------------------

        document
            .querySelectorAll(
                ".graph-mode-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        setGraphMode(
                            button.dataset.mode
                        );
                    }
                );
            });


        // ----------------------------------------------------
        // Month Select
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // Year Select
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // Item Select
        // ----------------------------------------------------

        const itemSelect =
            document.getElementById(
                "itemSelect"
            );


        if (itemSelect) {

            itemSelect.addEventListener(
                "change",
                () => {

                    if (
                        itemSelect.value
                    ) {

                        localStorage.setItem(
                            "dashboardSelectedItem",
                            itemSelect.value
                        );

                    } else {

                        localStorage.removeItem(
                            "dashboardSelectedItem"
                        );
                    }


                    updateItemInfo();

                    updateGraphs();
                }
            );
        }


        // ----------------------------------------------------
        // Start
        // ----------------------------------------------------

        startGraphs();

    }
);
