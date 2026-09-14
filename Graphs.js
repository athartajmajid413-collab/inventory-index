// ============================================================
// GRAPHS.JS - COMPLETE SUPABASE VERSION
// ============================================================
//
// GRAPH MODES
//
// ALL
//   1. Stock In Quantity
//   2. Stock Out Quantity
//   3. Stock In vs Demand
//   4. Stock In Cost
//   5. Stock Out Cost
//   6. Department Wise Stock In
//   7. Department Wise Stock Out
//   8. Department Wise Cost
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
// DATA:
//   items
//   stock_in
//   stock_issue
//   demand_history
//
// LocalStorage صرف UI selection کے لیے
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

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : 0;
}


function cleanCode(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .toUpperCase();
}


function getItemCode(item) {

    if (!item) {
        return "";
    }

    return cleanCode(
        item.code ??
        item.item_code ??
        item.itemCode ??
        ""
    );
}


function getItemName(item) {

    if (!item) {
        return "";
    }

    return String(
        item.item_name ??
        item.itemName ??
        item.name ??
        ""
    ).trim();
}


function getItemUnit(item) {

    if (!item) {
        return "";
    }

    return String(
        item.unit ??
        item.packed_unit ??
        ""
    ).trim();
}


function getRecordItemCode(record) {

    if (!record) {
        return "";
    }

    return cleanCode(
        record.item_code ??
        record.itemCode ??
        record.code ??
        ""
    );
}


function getRecordItemName(record) {

    if (!record) {
        return "";
    }

    return String(
        record.item_name ??
        record.itemName ??
        record.name ??
        ""
    ).trim();
}


function getRecordDepartment(record) {

    if (!record) {
        return "Not Assigned";
    }

    const department =
        record.department ??
        record.Department ??
        record.dept ??
        "";

    const text =
        String(department).trim();

    return text || "Not Assigned";
}


// ============================================================
// DATE HELPERS
// ============================================================

function getDateOnly(value) {

    if (!value) {
        return null;
    }

    const text =
        String(value).trim();

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

    const d =
        new Date(value);

    if (
        Number.isNaN(
            d.getTime()
        )
    ) {
        return null;
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


function getRecordDate(record) {

    if (!record) {
        return null;
    }

    return getDateOnly(
        record.date ??
        record.generate_date ??
        record.generateDate ??
        record.created_at ??
        null
    );
}


function getMonthKeyFromDate(value) {

    const date =
        getDateOnly(value);

    if (!date) {
        return "";
    }

    return date.substring(0, 7);
}


// ============================================================
// PERIOD HELPERS
// ============================================================

function getPeriodType() {

    const select =
        document.getElementById(
            "periodType"
        );

    if (
        select &&
        select.value === "year"
    ) {
        return "year";
    }

    return "month";
}


function getSelectedYear() {

    const select =
        document.getElementById(
            "yearSelect"
        );

    if (
        select &&
        select.value
    ) {

        const year =
            Number(select.value);

        if (year) {
            return year;
        }
    }

    const saved =
        localStorage.getItem(
            "dashboardSelectedMonth"
        );

    if (
        saved &&
        /^\d{4}-\d{2}$/.test(saved)
    ) {

        return Number(
            saved.substring(0, 4)
        );
    }

    return new Date()
        .getFullYear();
}


function getSelectedMonthNumber() {

    const select =
        document.getElementById(
            "monthSelect"
        );

    if (
        select &&
        select.value
    ) {

        const month =
            Number(select.value);

        if (
            month >= 1 &&
            month <= 12
        ) {
            return month;
        }
    }

    const saved =
        localStorage.getItem(
            "dashboardSelectedMonth"
        );

    if (
        saved &&
        /^\d{4}-\d{2}$/.test(saved)
    ) {

        return Number(
            saved.substring(5, 7)
        );
    }

    return new Date()
        .getMonth() + 1;
}


function getSelectedMonthKey() {

    return (
        String(
            getSelectedYear()
        ) +
        "-" +
        String(
            getSelectedMonthNumber()
        ).padStart(2, "0")
    );
}


// ============================================================
// DEMAND MONTH
// ============================================================

function getDemandMonthKey(record) {

    if (!record) {
        return "";
    }

    // Demand generation کے وقت selected month
    // demand_month میں save ہوا ہے۔
    const directMonth =
        record.demand_month ??
        record.demandMonth ??
        record.demand_month_key ??
        record.demandMonthKey ??
        record.month_key ??
        record.monthKey ??
        null;

    if (
        directMonth !== null &&
        directMonth !== undefined
    ) {

        const text =
            String(
                directMonth
            ).trim();

        // YYYY-MM
        if (
            /^\d{4}-\d{2}$/.test(text)
        ) {
            return text;
        }

        // صرف month number ہو
        if (
            /^\d{1,2}$/.test(text)
        ) {

            const month =
                Number(text);

            if (
                month >= 1 &&
                month <= 12
            ) {

                const recordDate =
                    getDateOnly(
                        record.generate_date ??
                        record.generateDate ??
                        record.date ??
                        record.created_at ??
                        ""
                    );

                if (recordDate) {

                    return (
                        recordDate.substring(0, 4) +
                        "-" +
                        String(month)
                            .padStart(2, "0")
                    );
                }
            }
        }
    }

    // fallback
    const date =
        getDateOnly(
            record.generate_date ??
            record.generateDate ??
            record.date ??
            record.created_at ??
            ""
        );

    return date
        ? date.substring(0, 7)
        : "";
}


// ============================================================
// STOCK RECORD PERIOD MATCH
// ============================================================

function recordMatchesSelectedPeriod(record) {

    const date =
        getRecordDate(record);

    if (!date) {
        return false;
    }

    const period =
        getPeriodType();

    // Year
    if (period === "year") {

        return (
            date.substring(0, 4) ===
            String(
                getSelectedYear()
            )
        );
    }

    // Month
    return (
        getMonthKeyFromDate(date) ===
        getSelectedMonthKey()
    );
}


// ============================================================
// DEMAND RECORD MATCH
// ============================================================

function demandRecordMatchesSelectedPeriod(record) {

    const demandMonth =
        getDemandMonthKey(record);

    if (!demandMonth) {
        return false;
    }

    const period =
        getPeriodType();

    // Year
    if (period === "year") {

        return (
            demandMonth.substring(0, 4) ===
            String(
                getSelectedYear()
            )
        );
    }

    // Month
    return (
        demandMonth ===
        getSelectedMonthKey()
    );
}


// ============================================================
// GET LATEST DEMAND RECORD
// ============================================================

function getSelectedDemandRecord() {

    const matching =
        demandHistory
            .filter(record => {

                return demandRecordMatchesSelectedPeriod(
                    record
                );
            })
            .sort((a, b) => {

                const dateA =
                    getDateOnly(
                        a?.generate_date ??
                        a?.generateDate ??
                        a?.date ??
                        a?.created_at ??
                        ""
                    ) || "";

                const dateB =
                    getDateOnly(
                        b?.generate_date ??
                        b?.generateDate ??
                        b?.date ??
                        b?.created_at ??
                        ""
                    ) || "";

                const dateCompare =
                    dateB.localeCompare(
                        dateA
                    );

                if (
                    dateCompare !== 0
                ) {
                    return dateCompare;
                }

                const idA =
                    Number(
                        a?.id || 0
                    );

                const idB =
                    Number(
                        b?.id || 0
                    );

                return idB - idA;
            });

    // Month mode میں selected month کی
    // latest Demand record
    if (
        getPeriodType() === "month"
    ) {

        return matching.length
            ? matching[0]
            : null;
    }

    // Year mode میں ہم individual record
    // نہیں بلکہ پورے year کی demands جمع کریں گے
    return null;
}


// ============================================================
// DEMAND ITEMS
// ============================================================

function getDemandItems(record) {

    if (!record) {
        return [];
    }

    let value =
        record.demand_items ??
        record.demandItems ??
        record.items ??
        [];

    if (
        typeof value === "string"
    ) {

        try {

            value =
                JSON.parse(
                    value
                );

        } catch (error) {

            console.warn(
                "Demand JSON parse error:",
                error
            );

            return [];
        }
    }

    if (
        Array.isArray(value)
    ) {

        return value;
    }

    if (
        value &&
        typeof value === "object"
    ) {

        return Object.values(
            value
        );
    }

    return [];
}


// ============================================================
// DEMAND ITEM CODE
// ============================================================

function getDemandItemCode(item) {

    if (!item) {
        return "";
    }

    return cleanCode(
        item.code ??
        item.item_code ??
        item.itemCode ??
        item.itemCode ??
        ""
    );
}


// ============================================================
// DEMAND VALUE
// ============================================================

function getDemandValue(item) {

    if (!item) {
        return 0;
    }

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


// ============================================================
// DEMAND FOR ITEM
// ============================================================

function getDemandForItem(code) {

    const targetCode =
        cleanCode(code);

    let total = 0;

    // --------------------------------------------------------
    // YEAR MODE
    // پورے selected year کی demand
    // --------------------------------------------------------

    if (
        getPeriodType() === "year"
    ) {

        demandHistory
            .filter(record => {

                const month =
                    getDemandMonthKey(
                        record
                    );

                return (
                    month &&
                    month.substring(0, 4) ===
                    String(
                        getSelectedYear()
                    )
                );
            })
            .forEach(record => {

                getDemandItems(
                    record
                ).forEach(item => {

                    if (
                        getDemandItemCode(
                            item
                        ) === targetCode
                    ) {

                        total +=
                            getDemandValue(
                                item
                            );
                    }
                });
            });

        return total;
    }


    // --------------------------------------------------------
    // MONTH MODE
    // صرف selected month کی latest demand
    // --------------------------------------------------------

    const record =
        getSelectedDemandRecord();

    if (!record) {
        return 0;
    }

    getDemandItems(
        record
    ).forEach(item => {

        if (
            getDemandItemCode(
                item
            ) === targetCode
        ) {

            total +=
                getDemandValue(
                    item
                );
        }
    });

    return total;
}


// ============================================================
// STOCK IN COST
// ============================================================

function getStockInRecordCost(record) {

    if (!record) {
        return 0;
    }

    const savedTotal =
        safeNumber(
            record.total_cost ??
            record.totalCost ??
            0
        );

    if (
        savedTotal > 0
    ) {
        return savedTotal;
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

    return (
        quantity * rate
    );
}


// ============================================================
// STOCK IN RATE
// ============================================================

function getStockInRate(record) {

    if (!record) {
        return 0;
    }

    return safeNumber(
        record.unit_cost ??
        record.unitCost ??
        record.rate ??
        record.cost ??
        0
    );
}


// ============================================================
// FIND PURCHASE RATE BEFORE STOCK OUT
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
                    getRecordItemCode(
                        record
                    ) !== targetCode
                ) {
                    return false;
                }

                const date =
                    getRecordDate(
                        record
                    );

                if (!date) {
                    return false;
                }

                if (
                    targetDate &&
                    date > targetDate
                ) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {

                const dateA =
                    getRecordDate(a) || "";

                const dateB =
                    getRecordDate(b) || "";

                return dateB.localeCompare(
                    dateA
                );
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

    if (!record) {
        return 0;
    }

    // اگر Stock Out table میں cost save ہے
    const savedTotal =
        safeNumber(
            record.total_cost ??
            record.totalCost ??
            0
        );

    if (
        savedTotal > 0
    ) {
        return savedTotal;
    }

    const quantity =
        safeNumber(
            record.quantity ??
            record.qty ??
            0
        );

    // اگر issue record میں rate save ہے
    const savedRate =
        safeNumber(
            record.unit_cost ??
            record.unitCost ??
            record.rate ??
            record.cost ??
            0
        );

    if (
        savedRate > 0
    ) {

        return (
            quantity *
            savedRate
        );
    }

    // ورنہ اس تاریخ تک کا latest purchase rate
    const rate =
        getStockInRateForItemOnDate(
            getRecordItemCode(
                record
            ),
            getRecordDate(
                record
            )
        );

    return (
        quantity *
        rate
    );
}


// ============================================================
// FILTERED STOCK IN
// ============================================================

function getSelectedStockInData() {

    return stockInData.filter(
        record =>
            recordMatchesSelectedPeriod(
                record
            )
    );
}


// ============================================================
// FILTERED STOCK OUT
// ============================================================

function getSelectedStockOutData() {

    return stockOutData.filter(
        record =>
            recordMatchesSelectedPeriod(
                record
            )
    );
}


// ============================================================
// CREATE ITEM GRAPH DATA
// ============================================================

function createGraphData() {

    const selectedStockIn =
        getSelectedStockInData();

    const selectedStockOut =
        getSelectedStockOutData();

    const map =
        new Map();


    // --------------------------------------------------------
    // MASTER ITEMS
    // --------------------------------------------------------

    items.forEach(item => {

        const code =
            getItemCode(item);

        if (!code) {
            return;
        }

        map.set(
            code,
            {
                code: code,

                name:
                    getItemName(
                        item
                    ),

                unit:
                    getItemUnit(
                        item
                    ),

                stockIn: 0,
                stockOut: 0,
                demand: 0,
                stockInCost: 0,
                stockOutCost: 0
            }
        );
    });


    // --------------------------------------------------------
    // STOCK IN
    // --------------------------------------------------------

    selectedStockIn.forEach(
        record => {

            const code =
                getRecordItemCode(
                    record
                );

            if (!code) {
                return;
            }

            if (!map.has(code)) {

                map.set(
                    code,
                    {
                        code: code,

                        name:
                            getRecordItemName(
                                record
                            ),

                        unit:
                            String(
                                record.unit ??
                                ""
                            ),

                        stockIn: 0,
                        stockOut: 0,
                        demand: 0,
                        stockInCost: 0,
                        stockOutCost: 0
                    }
                );
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
        }
    );


    // --------------------------------------------------------
    // STOCK OUT
    // --------------------------------------------------------

    selectedStockOut.forEach(
        record => {

            const code =
                getRecordItemCode(
                    record
                );

            if (!code) {
                return;
            }

            if (!map.has(code)) {

                map.set(
                    code,
                    {
                        code: code,

                        name:
                            getRecordItemName(
                                record
                            ),

                        unit:
                            String(
                                record.unit ??
                                ""
                            ),

                        stockIn: 0,
                        stockOut: 0,
                        demand: 0,
                        stockInCost: 0,
                        stockOutCost: 0
                    }
                );
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
        }
    );


    // --------------------------------------------------------
    // DEMAND
    // --------------------------------------------------------

    map.forEach(row => {

        row.demand =
            getDemandForItem(
                row.code
            );
    });


    // --------------------------------------------------------
    // NUMERIC SORT
    // SI1, SI2 ... SI10
    // --------------------------------------------------------

    return Array.from(
        map.values()
    ).sort((a, b) => {

        const aMatch =
            String(a.code)
                .match(/\d+/);

        const bMatch =
            String(b.code)
                .match(/\d+/);

        if (
            aMatch &&
            bMatch
        ) {

            return (
                Number(
                    aMatch[0]
                ) -
                Number(
                    bMatch[0]
                )
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
// IMPORTANT:
// اگر Item منتخب ہے تو صرف اسی Item کے departments دکھائے جائیں گے.
// اگر "All Items" ہے تو تمام items کے departments دکھائے جائیں گے.
// ============================================================

function createDepartmentData() {

    let selectedStockIn =
        getSelectedStockInData();

    let selectedStockOut =
        getSelectedStockOutData();


    // --------------------------------------------------------
    // SELECTED ITEM FILTER
    // --------------------------------------------------------

    const itemSelect =
        document.getElementById(
            "itemSelect"
        );

    const selectedItemCode =
        itemSelect && itemSelect.value
            ? cleanCode(
                itemSelect.value
            )
            : "";


    // اگر کوئی item selected ہے
    // تو Stock In اور Stock Out دونوں کو
    // صرف اسی item تک محدود کریں۔
    if (selectedItemCode) {

        selectedStockIn =
            selectedStockIn.filter(
                record =>
                    getRecordItemCode(
                        record
                    ) === selectedItemCode
            );


        selectedStockOut =
            selectedStockOut.filter(
                record =>
                    getRecordItemCode(
                        record
                    ) === selectedItemCode
            );
    }


    // --------------------------------------------------------
    // DEPARTMENT MAP
    // --------------------------------------------------------

    const map =
        new Map();


    function getDepartmentRow(
        department
    ) {

        const dept =
            String(
                department ||
                "Not Assigned"
            ).trim() ||
            "Not Assigned";


        if (!map.has(dept)) {

            map.set(
                dept,
                {
                    department: dept,

                    stockIn: 0,

                    stockOut: 0,

                    stockInCost: 0,

                    stockOutCost: 0
                }
            );
        }


        return map.get(
            dept
        );
    }


    // --------------------------------------------------------
    // STOCK IN BY DEPARTMENT
    // --------------------------------------------------------

    selectedStockIn.forEach(
        record => {

            const quantity =
                safeNumber(
                    record.quantity ??
                    record.qty ??
                    0
                );


            // اگر quantity zero ہے
            // تو department graph میں
            // unnecessary department نہ آئے۔
            if (quantity === 0) {
                return;
            }


            const department =
                getRecordDepartment(
                    record
                );


            const row =
                getDepartmentRow(
                    department
                );


            row.stockIn +=
                quantity;


            row.stockInCost +=
                getStockInRecordCost(
                    record
                );
        }
    );


    // --------------------------------------------------------
    // STOCK OUT BY DEPARTMENT
    // --------------------------------------------------------

    selectedStockOut.forEach(
        record => {

            const quantity =
                safeNumber(
                    record.quantity ??
                    record.qty ??
                    0
                );


            // Zero quantity والا record
            // department graph میں نہیں آئے گا۔
            if (quantity === 0) {
                return;
            }


            const department =
                getRecordDepartment(
                    record
                );


            const row =
                getDepartmentRow(
                    department
                );


            row.stockOut +=
                quantity;


            row.stockOutCost +=
                getStockOutRecordCost(
                    record
                );
        }
    );


    // --------------------------------------------------------
    // صرف وہ departments رکھیں
    // جن میں actual transaction ہوا ہے۔
    // --------------------------------------------------------

    const result =
        Array.from(
            map.values()
        ).filter(row => {

            return (
                safeNumber(
                    row.stockIn
                ) > 0 ||

                safeNumber(
                    row.stockOut
                ) > 0 ||

                safeNumber(
                    row.stockInCost
                ) > 0 ||

                safeNumber(
                    row.stockOutCost
                ) > 0
            );
        });


    // --------------------------------------------------------
    // DEPARTMENT NAME SORT
    // --------------------------------------------------------

    return result.sort(
        (a, b) =>
            a.department.localeCompare(
                b.department
            )
    );
}

// ============================================================
// CHART DESTROY
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
// CLEAR ALL CHARTS
// ============================================================

function clearAllCharts() {

    stockInChart =
        destroyChart(
            stockInChart
        );

    stockOutChart =
        destroyChart(
            stockOutChart
        );

    stockInDemandChart =
        destroyChart(
            stockInDemandChart
        );

    stockInCostChart =
        destroyChart(
            stockInCostChart
        );

    stockOutCostChart =
        destroyChart(
            stockOutCostChart
        );

    stockOutVsCostChart =
        destroyChart(
            stockOutVsCostChart
        );

    demandChart =
        destroyChart(
            demandChart
        );

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


// ============================================================
// HIDE ALL SECTIONS
// ============================================================

function hideAllGraphSections() {

    const ids = [

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

    ids.forEach(id => {

        const section =
            document.getElementById(id);

        if (section) {
            section.style.display =
                "none";
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

        section.style.display =
            "block";
    }
}


// ============================================================
// COMMON CHART OPTIONS
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
// STOCK IN QUANTITY
// ============================================================

function drawStockInChart(data) {

    const canvas =
        document.getElementById(
            "stockInChart"
        );

    if (!canvas) {
        return;
    }

    stockInChart =
        destroyChart(
            stockInChart
        );

    stockInChart =
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
                                "Stock In Quantity",

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
                        "📥 Stock In Quantity",
                        "Quantity"
                    )
            }
        );
}


// ============================================================
// STOCK OUT QUANTITY
// ============================================================

function drawStockOutChart(data) {

    const canvas =
        document.getElementById(
            "stockOutChart"
        );

    if (!canvas) {
        return;
    }

    stockOutChart =
        destroyChart(
            stockOutChart
        );

    stockOutChart =
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

function drawStockInDemandChart(
    data
) {

    const canvas =
        document.getElementById(
            "stockInDemandChart"
        );

    if (!canvas) {
        return;
    }

    stockInDemandChart =
        destroyChart(
            stockInDemandChart
        );

    stockInDemandChart =
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

function drawStockInCostChart(
    data
) {

    const canvas =
        document.getElementById(
            "stockInCostChart"
        );

    if (!canvas) {
        return;
    }

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

function drawStockOutCostChart(
    data
) {

    const canvas =
        document.getElementById(
            "stockOutCostChart"
        );

    if (!canvas) {
        return;
    }

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
                        "💰 Stock Out Cost Analysis",
                        "Cost"
                    )
            }
        );
}


// ============================================================
// STOCK OUT VS COST
// ============================================================

function drawStockOutVsCostChart(
    data
) {

    const canvas =
        document.getElementById(
            "stockOutVsCostChart"
        );

    if (!canvas) {
        return;
    }

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
                                "quantityAxis",

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
                                "costAxis",

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

                            display: true,

                            position:
                                "top"
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

                                autoSkip:
                                    false,

                                maxRotation:
                                    60,

                                minRotation:
                                    30
                            }
                        },

                        quantityAxis: {

                            beginAtZero:
                                true,

                            position:
                                "left",

                            title: {

                                display:
                                    true,

                                text:
                                    "Stock Out Quantity"
                            }
                        },

                        costAxis: {

                            beginAtZero:
                                true,

                            position:
                                "right",

                            grid: {

                                drawOnChartArea:
                                    false
                            },

                            title: {

                                display:
                                    true,

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
// DEMAND QUANTITY
// ============================================================

function drawDemandChart(data) {

    const canvas =
        document.getElementById(
            "demandChart"
        );

    if (!canvas) {
        return;
    }

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
                        "📊 Demand Quantity",
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

    if (!canvas) {
        return;
    }

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
                        "📥 Department Wise Stock In",
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

    if (!canvas) {
        return;
    }

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
                        "📤 Department Wise Stock Out",
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

    if (!canvas) {
        return;
    }

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
                        "💰 Department Wise Cost",
                        "Cost"
                    )
            }
        );
}


// ============================================================
// SUMMARY
// ============================================================

function updateSummary(data) {

    const totalStockIn =
        data.reduce(
            (sum, row) =>
                sum +
                safeNumber(
                    row.stockIn
                ),
            0
        );

    const totalStockOut =
        data.reduce(
            (sum, row) =>
                sum +
                safeNumber(
                    row.stockOut
                ),
            0
        );

    const totalDemand =
        data.reduce(
            (sum, row) =>
                sum +
                safeNumber(
                    row.demand
                ),
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
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// DATA TABLE
// ============================================================

function updateDataTable(data) {

    const tbody =
        document.getElementById(
            "graphDataBody"
        );

    if (!tbody) {
        return;
    }

    tbody.innerHTML = "";


    if (!data.length) {

        const row =
            document.createElement(
                "tr"
            );

        row.innerHTML = `
            <td colspan="8"
                style="text-align:center;">
                No graph data found for selected period.
            </td>
        `;

        tbody.appendChild(row);

        return;
    }


    data.forEach(row => {

        const tr =
            document.createElement(
                "tr"
            );

        tr.innerHTML = `

            <td>
                ${escapeHtml(
                    row.code
                )}
            </td>

            <td>
                ${escapeHtml(
                    row.name
                )}
            </td>

            <td>
                ${escapeHtml(
                    row.unit
                )}
            </td>

            <td>
                ${safeNumber(
                    row.stockIn
                ).toLocaleString()}
            </td>

            <td>
                ${safeNumber(
                    row.stockOut
                ).toLocaleString()}
            </td>

            <td>
                ${safeNumber(
                    row.demand
                ).toLocaleString()}
            </td>

            <td>
                ${safeNumber(
                    row.stockInCost
                ).toLocaleString()}
            </td>

            <td>
                ${safeNumber(
                    row.stockOutCost
                ).toLocaleString()}
            </td>

        `;

        tbody.appendChild(tr);
    });
}


// ============================================================
// ITEM FILTER
// ============================================================

function applyItemFilter(data) {

    const select =
        document.getElementById(
            "itemSelect"
        );

    if (
        !select ||
        !select.value
    ) {
        return data;
    }

    const code =
        cleanCode(
            select.value
        );

    return data.filter(
        row =>
            cleanCode(
                row.code
            ) === code
    );
}


// ============================================================
// ITEM SELECT
// ============================================================

function populateItemSelect() {

    const select =
        document.getElementById(
            "itemSelect"
        );

    if (!select) {
        return;
    }

    const previous =
        localStorage.getItem(
            "dashboardSelectedItem"
        ) || "";


    select.innerHTML = `
        <option value="">
            All Items
        </option>
    `;


    items
        .slice()
        .sort((a, b) => {

            const codeA =
                getItemCode(a);

            const codeB =
                getItemCode(b);

            const numberA =
                codeA.match(/\d+/);

            const numberB =
                codeB.match(/\d+/);

            if (
                numberA &&
                numberB
            ) {

                return (
                    Number(
                        numberA[0]
                    ) -
                    Number(
                        numberB[0]
                    )
                );
            }

            return codeA.localeCompare(
                codeB
            );
        })
        .forEach(item => {

            const code =
                getItemCode(item);

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
                getItemName(
                    item
                );

            if (
                code === previous
            ) {
                option.selected =
                    true;
            }

            select.appendChild(
                option
            );
        });


    updateItemInfo();
}


// ============================================================
// ITEM INFO
// ============================================================

function updateItemInfo() {

    const select =
        document.getElementById(
            "itemSelect"
        );

    const info =
        document.getElementById(
            "itemInfo"
        );

    if (
        !select ||
        !info
    ) {
        return;
    }

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
                getItemCode(
                    x
                ) === code
        );

    if (!item) {

        info.textContent =
            code;

        return;
    }

    info.textContent =
        getItemName(item) +
        " (" +
        getItemUnit(item) +
        ")";
}


// ============================================================
// UPDATE GRAPH MODE
// ============================================================

function setGraphMode(mode) {

    currentGraphMode =
        mode || "all";


    document
        .querySelectorAll(
            ".graph-mode-btn"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.mode ===
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


    let data =
        createGraphData();

    data =
        applyItemFilter(
            data
        );


    let departmentData =
        createDepartmentData();


    updateSummary(
        data
    );

    updateDataTable(
        data
    );


    // ========================================================
    // ALL
    // ========================================================

    if (
        currentGraphMode ===
        "all"
    ) {

        showSection(
            "stockInSection"
        );

        drawStockInChart(
            data
        );


        showSection(
            "stockOutSection"
        );

        drawStockOutChart(
            data
        );


        showSection(
            "stockInDemandSection"
        );

        drawStockInDemandChart(
            data
        );


        showSection(
            "stockInCostSection"
        );

        drawStockInCostChart(
            data
        );


        showSection(
            "stockOutCostSection"
        );

        drawStockOutCostChart(
            data
        );


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
        currentGraphMode ===
        "stockIn"
    ) {

        showSection(
            "stockInSection"
        );

        drawStockInChart(
            data
        );


        showSection(
            "stockInDemandSection"
        );

        drawStockInDemandChart(
            data
        );


        showSection(
            "stockInCostSection"
        );

        drawStockInCostChart(
            data
        );


        return;
    }


    // ========================================================
    // STOCK OUT
    // ========================================================

    if (
        currentGraphMode ===
        "stockOut"
    ) {

        showSection(
            "stockOutSection"
        );

        drawStockOutChart(
            data
        );


        showSection(
            "stockOutVsCostSection"
        );

        drawStockOutVsCostChart(
            data
        );


        return;
    }


    // ========================================================
    // DEMAND
    // ========================================================

    if (
        currentGraphMode ===
        "demand"
    ) {

        showSection(
            "demandSection"
        );

        drawDemandChart(
            data
        );


        return;
    }


    // ========================================================
    // DEPARTMENT
    // ========================================================

    if (
        currentGraphMode ===
        "department"
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
// YEAR SELECT
// ============================================================

function populateYearSelect() {

    const select =
        document.getElementById(
            "yearSelect"
        );

    if (!select) {
        return;
    }


    const years =
        new Set();


    stockInData.forEach(
        record => {

            const date =
                getRecordDate(
                    record
                );

            if (date) {

                years.add(
                    Number(
                        date.substring(
                            0,
                            4
                        )
                    )
                );
            }
        }
    );


    stockOutData.forEach(
        record => {

            const date =
                getRecordDate(
                    record
                );

            if (date) {

                years.add(
                    Number(
                        date.substring(
                            0,
                            4
                        )
                    )
                );
            }
        }
    );


    demandHistory.forEach(
        record => {

            const month =
                getDemandMonthKey(
                    record
                );

            if (month) {

                years.add(
                    Number(
                        month.substring(
                            0,
                            4
                        )
                    )
                );
            }
        }
    );


    years.add(
        new Date().getFullYear()
    );


    const saved =
        localStorage.getItem(
            "dashboardSelectedMonth"
        );


    let selectedYear =
        getSelectedYear();


    if (
        saved &&
        /^\d{4}-\d{2}$/.test(saved)
    ) {

        selectedYear =
            Number(
                saved.substring(
                    0,
                    4
                )
            );
    }


    select.innerHTML = "";


    Array.from(years)
        .sort(
            (a, b) =>
                a - b
        )
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
                year ===
                selectedYear
            ) {

                option.selected =
                    true;
            }

            select.appendChild(
                option
            );
        });
}


// ============================================================
// MONTH CHANGE
// ============================================================

function handleMonthChange() {

    const monthSelect =
        document.getElementById(
            "monthSelect"
        );

    const yearSelect =
        document.getElementById(
            "yearSelect"
        );

    if (
        !monthSelect ||
        !monthSelect.value
    ) {
        return;
    }


    const month =
        Number(
            monthSelect.value
        );

    const year =
        yearSelect &&
        yearSelect.value
            ? Number(
                yearSelect.value
            )
            : new Date()
                .getFullYear();


    if (
        month < 1 ||
        month > 12 ||
        !year
    ) {
        return;
    }


    const key =
        year +
        "-" +
        String(
            month
        ).padStart(2, "0");


    localStorage.setItem(
        "dashboardSelectedMonth",
        key
    );


    updateGraphs();
}


// ============================================================
// YEAR CHANGE
// ============================================================

function handleYearChange() {

    const yearSelect =
        document.getElementById(
            "yearSelect"
        );

    const monthSelect =
        document.getElementById(
            "monthSelect"
        );

    if (!yearSelect) {
        return;
    }


    const year =
        Number(
            yearSelect.value
        );

    let month =
        monthSelect
            ? Number(
                monthSelect.value
            )
            : new Date()
                .getMonth() + 1;


    if (!year) {
        return;
    }


    if (
        month < 1 ||
        month > 12
    ) {
        month = 1;
    }


    const key =
        year +
        "-" +
        String(
            month
        ).padStart(2, "0");


    localStorage.setItem(
        "dashboardSelectedMonth",
        key
    );


    updateGraphs();
}


// ============================================================
// PERIOD CHANGE
// ============================================================

function changePeriodType() {

    const period =
        getPeriodType();

    const monthGroup =
        document.getElementById(
            "monthFilterGroup"
        );


    if (monthGroup) {

        monthGroup.style.display =
            period === "year"
                ? "none"
                : "";
    }


    updateGraphs();
}


// ============================================================
// SUPABASE LOAD ITEMS
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


        if (
            !result ||
            !result.success
        ) {

            console.error(
                "Graphs Items Error:",
                result?.error
            );

            items = [];

            return;
        }


        items =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        console.log(
            "Graphs Items:",
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


// ============================================================
// SUPABASE LOAD STOCK IN
// ============================================================

async function loadStockIn() {

    try {

        const result =
            await supabaseRequest(
                "stock_in",
                "GET",
                null,
                "?select=*"
            );


        if (
            !result ||
            !result.success
        ) {

            console.error(
                "Graphs Stock In Error:",
                result?.error
            );

            stockInData = [];

            return;
        }


        stockInData =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        console.log(
            "Graphs Stock In:",
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


// ============================================================
// SUPABASE LOAD STOCK OUT
// ============================================================

async function loadStockOut() {

    try {

        const result =
            await supabaseRequest(
                "stock_issue",
                "GET",
                null,
                "?select=*"
            );


        if (
            !result ||
            !result.success
        ) {

            console.error(
                "Graphs Stock Out Error:",
                result?.error
            );

            stockOutData = [];

            return;
        }


        stockOutData =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        console.log(
            "Graphs Stock Out:",
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


// ============================================================
// SUPABASE LOAD DEMAND
// ============================================================

async function loadDemandHistory() {

    try {

        const result =
            await supabaseRequest(
                "demand_history",
                "GET",
                null,
                "?select=*"
            );


        if (
            !result ||
            !result.success
        ) {

            console.error(
                "Graphs Demand Error:",
                result?.error
            );

            demandHistory = [];

            return;
        }


        demandHistory =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        console.log(
            "Graphs Demand History:",
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


// ============================================================
// DEBUG
// ============================================================

function logGraphData() {

    console.log(
        "=============================="
    );

    console.log(
        "GRAPHS DATA"
    );

    console.log(
        "Items:",
        items.length
    );

    console.log(
        "Stock In:",
        stockInData.length
    );

    console.log(
        "Stock Out:",
        stockOutData.length
    );

    console.log(
        "Demand:",
        demandHistory.length
    );

    console.log(
        "Selected Period:",
        getPeriodType()
    );

    console.log(
        "Selected Month:",
        getSelectedMonthKey()
    );

    console.log(
        "Selected Demand:",
        getSelectedDemandRecord()
    );

    console.log(
        "Graph Mode:",
        currentGraphMode
    );

    console.log(
        "=============================="
    );
}


// ============================================================
// START
// ============================================================

async function startGraphs() {

    console.log(
        "Graphs: Loading Supabase data..."
    );


    await Promise.all([

        loadItems(),

        loadStockIn(),

        loadStockOut(),

        loadDemandHistory()
    ]);


    populateYearSelect();


    // --------------------------------------------------------
    // Restore saved month/year
    // --------------------------------------------------------

    const saved =
        localStorage.getItem(
            "dashboardSelectedMonth"
        );


    const monthSelect =
        document.getElementById(
            "monthSelect"
        );

    const yearSelect =
        document.getElementById(
            "yearSelect"
        );


    if (
        saved &&
        /^\d{4}-\d{2}$/.test(saved)
    ) {

        const parts =
            saved.split("-");

        if (yearSelect) {

            yearSelect.value =
                parts[0];
        }

        if (monthSelect) {

            monthSelect.value =
                String(
                    Number(
                        parts[1]
                    )
                );
        }

    } else {

        const now =
            new Date();

        const year =
            now.getFullYear();

        const month =
            now.getMonth() + 1;


        if (yearSelect) {

            yearSelect.value =
                String(year);
        }


        if (monthSelect) {

            monthSelect.value =
                String(month);
        }


        localStorage.setItem(
            "dashboardSelectedMonth",

            year +
            "-" +
            String(
                month
            ).padStart(
                2,
                "0"
            )
        );
    }


    populateItemSelect();


    logGraphData();


    updateGraphs();


    console.log(
        "Graphs: Ready."
    );
}


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // ----------------------------------------------------
        // GRAPH MODE BUTTONS
        // ----------------------------------------------------

        document
            .querySelectorAll(
                ".graph-mode-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        setGraphMode(
                            button.dataset.mode
                        );
                    }
                );
            });


        // ----------------------------------------------------
        // MONTH
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
        // YEAR
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
        // ITEM
        // ----------------------------------------------------

        const itemSelect =
            document.getElementById(
                "itemSelect"
            );

        if (itemSelect) {

            itemSelect.addEventListener(
                "change",
                function () {

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
        // START
        // ----------------------------------------------------

        startGraphs();
    }
);


// ============================================================
// CONSOLE
// ============================================================

console.log(
    "✅ Complete Graphs.js loaded successfully."
);
