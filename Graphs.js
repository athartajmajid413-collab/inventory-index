// ============================================================
// GRAPHS.JS - SUPABASE VERSION
// Separate Graphs:
// All
// Stock In
// Stock Out
// Demand
// Department
// ============================================================

let items = [];
let stockInData = [];
let stockOutData = [];
let demandHistory = [];

let currentGraphMode = "all";

let stockInChart = null;
let stockOutChart = null;
let stockInDemandChart = null;
let stockInCostChart = null;
let stockOutCostChart = null;
let demandChart = null;

let departmentStockInChart = null;
let departmentStockOutChart = null;
let departmentCostChart = null;


// ============================================================
// BASIC HELPERS
// ============================================================

function cleanCode(value) {
    return String(value ?? "").trim();
}


function safeNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
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


// ============================================================
// DATE HELPERS
// ============================================================

function getRecordDate(record) {
    return (
        record?.date ??
        record?.generate_date ??
        record?.generateDate ??
        null
    );
}


/*
   Important:
   YYYY-MM-DD ko directly new Date() karne se timezone ki wajah
   se kabhi kabhi previous date aa sakti hai.
*/
function getDateOnly(value) {

    if (!value) return null;

    if (typeof value === "string") {

        const match = value.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );

        if (match) {

            return new Date(
                Number(match[1]),
                Number(match[2]) - 1,
                Number(match[3])
            );
        }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


function dateToKey(date) {

    if (!date) return "";

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
}


function getTodayMonthKey() {

    const d = new Date();

    return `${d.getFullYear()}-${String(
        d.getMonth() + 1
    ).padStart(2, "0")}`;
}


// ============================================================
// DATA LOADING
// ============================================================

async function loadItems() {

    try {

        const result = await supabaseRequest(
            "items",
            "GET",
            null,
            "?select=*"
        );

        items = Array.isArray(result)
            ? result
            : [];

        // SI1, SI2, SI3 ... SI10
        items.sort((a, b) => {

            const codeA = getItemCode(a);
            const codeB = getItemCode(b);

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

            return codeA.localeCompare(codeB);
        });

    } catch (error) {

        console.error("Items loading error:", error);

        items = [];
    }
}


async function loadStockIn() {

    try {

        const result = await supabaseRequest(
            "stock_in",
            "GET",
            null,
            "?select=*&order=id.asc"
        );

        stockInData = Array.isArray(result)
            ? result
            : [];

    } catch (error) {

        console.error("Stock In loading error:", error);

        stockInData = [];
    }
}


async function loadStockOut() {

    try {

        const result = await supabaseRequest(
            "stock_issue",
            "GET",
            null,
            "?select=*&order=id.asc"
        );

        stockOutData = Array.isArray(result)
            ? result
            : [];

    } catch (error) {

        console.error("Stock Out loading error:", error);

        stockOutData = [];
    }
}


async function loadDemandHistory() {

    try {

        const result = await supabaseRequest(
            "demand_history",
            "GET",
            null,
            "?select=*&order=id.asc"
        );

        demandHistory = Array.isArray(result)
            ? result
            : [];

    } catch (error) {

        console.error(
            "Demand History loading error:",
            error
        );

        demandHistory = [];
    }
}


async function loadAllGraphData() {

    await Promise.all([
        loadItems(),
        loadStockIn(),
        loadStockOut(),
        loadDemandHistory()
    ]);

    loadItemSelect();
    loadYears();
    changePeriodType();

    updateGraphs();
}


// ============================================================
// ITEM SELECT
// ============================================================

function loadItemSelect() {

    const select = document.getElementById(
        "itemSelect"
    );

    if (!select) return;

    const oldValue =
        localStorage.getItem(
            "dashboardSelectedItem"
        ) || "all";

    select.innerHTML = "";

    const allOption =
        document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Items";

    select.appendChild(allOption);

    items.forEach(item => {

        const code = getItemCode(item);

        if (!code) return;

        const option =
            document.createElement("option");

        option.value = code;

        option.textContent =
            `${code} - ${getItemName(item)}`;

        select.appendChild(option);
    });

    const exists = [
        ...select.options
    ].some(
        option => option.value === oldValue
    );

    select.value = exists
        ? oldValue
        : "all";

    select.addEventListener(
        "change",
        updateGraphs
    );

    updateItemInfo();
}


// ============================================================
// YEARS
// ============================================================

function loadYears() {

    const select =
        document.getElementById(
            "yearSelect"
        );

    if (!select) return;

    const years = new Set();

    [...stockInData, ...stockOutData]
        .forEach(record => {

            const date =
                getDateOnly(
                    getRecordDate(record)
                );

            if (date) {
                years.add(
                    date.getFullYear()
                );
            }
        });

    demandHistory.forEach(record => {

        const date =
            getDateOnly(
                getRecordDate(record)
            );

        if (date) {
            years.add(
                date.getFullYear()
            );
        }
    });

    const currentYear =
        new Date().getFullYear();

    years.add(currentYear);

    const sortedYears =
        [...years].sort(
            (a, b) => b - a
        );

    const oldValue =
        select.value;

    select.innerHTML = "";

    sortedYears.forEach(year => {

        const option =
            document.createElement("option");

        option.value = year;
        option.textContent = year;

        select.appendChild(option);
    });

    if (
        sortedYears.includes(
            Number(oldValue)
        )
    ) {
        select.value = oldValue;
    } else {
        select.value = currentYear;
    }

    select.onchange = updateGraphs;
}


// ============================================================
// PERIOD
// ============================================================

function changePeriodType() {

    const periodType =
        document.getElementById(
            "periodType"
        );

    const monthLabel =
        document.getElementById(
            "monthLabel"
        );

    const monthSelect =
        document.getElementById(
            "monthSelect"
        );

    if (!periodType) return;

    if (periodType.value === "year") {

        if (monthLabel) {
            monthLabel.style.display =
                "none";
        }

        if (monthSelect) {
            monthSelect.style.display =
                "none";
        }

    } else {

        if (monthLabel) {
            monthLabel.style.display =
                "block";
        }

        if (monthSelect) {
            monthSelect.style.display =
                "block";
        }
    }

    updateGraphs();
}


function getSelectedYear() {

    const select =
        document.getElementById(
            "yearSelect"
        );

    return Number(
        select?.value ||
        new Date().getFullYear()
    );
}


function getSelectedMonth() {

    const select =
        document.getElementById(
            "monthSelect"
        );

    return Number(
        select?.value ||
        new Date().getMonth() + 1
    );
}


// ============================================================
// DEMAND DATE / CYCLE
// ============================================================

function getDemandRecordDate(record) {

    return getDateOnly(
        getRecordDate(record)
    );
}


function getSelectedDemandRecord() {

    const year =
        getSelectedYear();

    const month =
        getSelectedMonth();

    const records =
        demandHistory.filter(record => {

            const date =
                getDemandRecordDate(
                    record
                );

            if (!date) return false;

            return (
                date.getFullYear() === year &&
                date.getMonth() + 1 === month
            );
        });

    if (!records.length) {
        return null;
    }

    records.sort((a, b) => {

        const dateA =
            getDemandRecordDate(a);

        const dateB =
            getDemandRecordDate(b);

        const timeA =
            dateA ? dateA.getTime() : 0;

        const timeB =
            dateB ? dateB.getTime() : 0;

        if (timeA !== timeB) {
            return timeB - timeA;
        }

        return (
            safeNumber(b.id) -
            safeNumber(a.id)
        );
    });

    return records[0];
}


function getNextDemandDate(currentDate) {

    if (!currentDate) {
        return null;
    }

    const currentTime =
        currentDate.getTime();

    const futureDates =
        demandHistory
            .map(record =>
                getDemandRecordDate(record)
            )
            .filter(date =>
                date &&
                date.getTime() >
                currentTime
            )
            .sort(
                (a, b) =>
                    a.getTime() -
                    b.getTime()
            );

    return futureDates.length
        ? futureDates[0]
        : null;
}


function getActiveDemandCycle() {

    const currentDemand =
        getSelectedDemandRecord();

    if (!currentDemand) {

        return {
            currentDemand: null,
            startDate: null,
            endDate: null
        };
    }

    const startDate =
        getDemandRecordDate(
            currentDemand
        );

    const endDate =
        getNextDemandDate(
            startDate
        );

    return {
        currentDemand,
        startDate,
        endDate
    };
}


function dateIsInsideDemandCycle(
    dateValue,
    cycle
) {

    const date =
        getDateOnly(dateValue);

    if (!date || !cycle.startDate) {
        return false;
    }

    const time =
        date.getTime();

    const start =
        cycle.startDate.getTime();

    if (time < start) {
        return false;
    }

    if (
        cycle.endDate &&
        time >= cycle.endDate.getTime()
    ) {
        return false;
    }

    return true;
}


// ============================================================
// DEMAND HELPERS
// ============================================================

function getDemandValue(record) {

    const fields = [
        "finalDemand",
        "final_demand",
        "approvedQty",
        "approved_qty",
        "quantity",
        "demandQuantity",
        "demand_quantity"
    ];

    for (const field of fields) {

        if (
            record?.[field] !== null &&
            record?.[field] !== undefined &&
            record?.[field] !== ""
        ) {

            return safeNumber(
                record[field]
            );
        }
    }

    return 0;
}


function getDemandItems(record) {

    if (!record) return [];

    let data =
        record.demand_items ??
        record.demandItems ??
        record.items ??
        [];

    if (typeof data === "string") {

        try {
            data = JSON.parse(data);
        } catch {
            return [];
        }
    }

    return Array.isArray(data)
        ? data
        : [];
}


function getDemandForItem(itemCode) {

    const record =
        getSelectedDemandRecord();

    if (!record) return 0;

    const demandItems =
        getDemandItems(record);

    let total = 0;

    demandItems.forEach(item => {

        const code =
            getRecordItemCode(item);

        if (
            code ===
            cleanCode(itemCode)
        ) {

            total +=
                getDemandValue(item);
        }
    });

    return total;
}


// ============================================================
// STOCK IN / OUT CYCLE
// ============================================================

function getCycleStockIn(
    itemCode,
    cycle
) {

    let total = 0;

    stockInData.forEach(record => {

        if (
            getRecordItemCode(record) !==
            cleanCode(itemCode)
        ) {
            return;
        }

        if (
            !dateIsInsideDemandCycle(
                getRecordDate(record),
                cycle
            )
        ) {
            return;
        }

        total += safeNumber(
            record.quantity
        );
    });

    return total;
}


function getCycleStockOut(
    itemCode,
    cycle
) {

    let total = 0;

    stockOutData.forEach(record => {

        if (
            getRecordItemCode(record) !==
            cleanCode(itemCode)
        ) {
            return;
        }

        if (
            !dateIsInsideDemandCycle(
                getRecordDate(record),
                cycle
            )
        ) {
            return;
        }

        total += safeNumber(
            record.quantity
        );
    });

    return total;
}


// ============================================================
// STOCK IN COST
// ============================================================

function getStockInRecordCost(record) {

    const totalCost =
        record?.total_cost ??
        record?.totalCost;

    if (
        totalCost !== undefined &&
        totalCost !== null &&
        totalCost !== ""
    ) {

        return safeNumber(
            totalCost
        );
    }

    const quantity =
        safeNumber(
            record?.quantity
        );

    const unitCost =
        safeNumber(
            record?.unit_cost ??
            record?.unitCost ??
            record?.rate
        );

    return quantity * unitCost;
}


function getCyclePurchaseCost(
    itemCode,
    cycle
) {

    let total = 0;

    stockInData.forEach(record => {

        if (
            getRecordItemCode(record) !==
            cleanCode(itemCode)
        ) {
            return;
        }

        if (
            !dateIsInsideDemandCycle(
                getRecordDate(record),
                cycle
            )
        ) {
            return;
        }

        total +=
            getStockInRecordCost(
                record
            );
    });

    return total;
}


// ============================================================
// STOCK OUT COST
// ============================================================

/*
   Stock Out table mein agar cost/rate saved hai
   to wahi use hoga.

   Agar cost saved nahi hai to issue date se pehle
   latest Stock In rate use kiya jayega.
*/

function getStockInRateForItemOnDate(
    itemCode,
    issueDate
) {

    const issue =
        getDateOnly(issueDate);

    const matching =
        stockInData.filter(record => {

            if (
                getRecordItemCode(record) !==
                cleanCode(itemCode)
            ) {
                return false;
            }

            const date =
                getDateOnly(
                    getRecordDate(record)
                );

            if (!date) return false;

            if (!issue) return true;

            return (
                date.getTime() <=
                issue.getTime()
            );
        });

    matching.sort((a, b) => {

        const dateA =
            getDateOnly(
                getRecordDate(a)
            );

        const dateB =
            getDateOnly(
                getRecordDate(b)
            );

        const timeA =
            dateA ? dateA.getTime() : 0;

        const timeB =
            dateB ? dateB.getTime() : 0;

        if (timeA !== timeB) {
            return timeB - timeA;
        }

        return (
            safeNumber(b.id) -
            safeNumber(a.id)
        );
    });

    if (matching.length) {

        return safeNumber(
            matching[0]?.unit_cost ??
            matching[0]?.unitCost ??
            matching[0]?.rate
        );
    }

    // اگر issue date se pehle rate نہ ملے
    // تو latest Stock In rate use کریں
    const allMatching =
        stockInData.filter(
            record =>
                getRecordItemCode(record) ===
                cleanCode(itemCode)
        );

    allMatching.sort(
        (a, b) =>
            safeNumber(b.id) -
            safeNumber(a.id)
    );

    if (allMatching.length) {

        return safeNumber(
            allMatching[0]?.unit_cost ??
            allMatching[0]?.unitCost ??
            allMatching[0]?.rate
        );
    }

    return 0;
}


function getStockOutRecordCost(record) {

    const totalCost =
        record?.total_cost ??
        record?.totalCost ??
        record?.issue_cost ??
        record?.issueCost;

    if (
        totalCost !== undefined &&
        totalCost !== null &&
        totalCost !== ""
    ) {

        return safeNumber(
            totalCost
        );
    }

    const quantity =
        safeNumber(
            record?.quantity
        );

    const savedRate =
        record?.unit_cost ??
        record?.unitCost ??
        record?.rate ??
        record?.cost;

    if (
        savedRate !== undefined &&
        savedRate !== null &&
        savedRate !== ""
    ) {

        return (
            quantity *
            safeNumber(savedRate)
        );
    }

    const rate =
        getStockInRateForItemOnDate(
            getRecordItemCode(record),
            getRecordDate(record)
        );

    return quantity * rate;
}


function getCycleStockOutCost(
    itemCode,
    cycle
) {

    let total = 0;

    stockOutData.forEach(record => {

        if (
            getRecordItemCode(record) !==
            cleanCode(itemCode)
        ) {
            return;
        }

        if (
            !dateIsInsideDemandCycle(
                getRecordDate(record),
                cycle
            )
        ) {
            return;
        }

        total +=
            getStockOutRecordCost(
                record
            );
    });

    return total;
}


// ============================================================
// GRAPH ITEM DATA
// ============================================================

function createGraphData() {

    const select =
        document.getElementById(
            "itemSelect"
        );

    const selectedCode =
        select?.value || "all";

    const selectedItems =
        selectedCode === "all"
            ? items
            : items.filter(
                item =>
                    getItemCode(item) ===
                    cleanCode(selectedCode)
            );

    const cycle =
        getActiveDemandCycle();

    return selectedItems.map(item => {

        const code =
            getItemCode(item);

        return {

            code,

            name:
                getItemName(item),

            unit:
                getItemUnit(item),

            stockIn:
                getCycleStockIn(
                    code,
                    cycle
                ),

            stockOut:
                getCycleStockOut(
                    code,
                    cycle
                ),

            demand:
                getDemandForItem(
                    code
                ),

            stockInCost:
                getCyclePurchaseCost(
                    code,
                    cycle
                ),

            stockOutCost:
                getCycleStockOutCost(
                    code,
                    cycle
                )
        };
    });
}


// ============================================================
// DEPARTMENT DATA
// ============================================================

function getDepartment(record) {

    const department =
        record?.department ??
        record?.Department ??
        record?.dept ??
        record?.dept_name ??
        record?.deptName ??
        "";

    const value =
        String(department).trim();

    return value || "Not Assigned";
}


function createDepartmentGraphData() {

    const cycle =
        getActiveDemandCycle();

    const map = new Map();

    function getDepartmentRow(
        department
    ) {

        if (!map.has(department)) {

            map.set(
                department,
                {
                    department,
                    stockIn: 0,
                    stockOut: 0,
                    stockInCost: 0,
                    stockOutCost: 0
                }
            );
        }

        return map.get(department);
    }


    // --------------------------
    // STOCK IN
    // --------------------------

    stockInData.forEach(record => {

        if (
            !dateIsInsideDemandCycle(
                getRecordDate(record),
                cycle
            )
        ) {
            return;
        }

        const department =
            getDepartment(record);

        const row =
            getDepartmentRow(
                department
            );

        row.stockIn +=
            safeNumber(
                record.quantity
            );

        row.stockInCost +=
            getStockInRecordCost(
                record
            );
    });


    // --------------------------
    // STOCK OUT
    // --------------------------

    stockOutData.forEach(record => {

        if (
            !dateIsInsideDemandCycle(
                getRecordDate(record),
                cycle
            )
        ) {
            return;
        }

        const department =
            getDepartment(record);

        const row =
            getDepartmentRow(
                department
            );

        row.stockOut +=
            safeNumber(
                record.quantity
            );

        row.stockOutCost +=
            getStockOutRecordCost(
                record
            );
    });


    return [...map.values()];
}


// ============================================================
// SUMMARY
// ============================================================

function updateSummary(data) {

    const stockIn =
        data.reduce(
            (sum, row) =>
                sum + safeNumber(row.stockIn),
            0
        );

    const stockOut =
        data.reduce(
            (sum, row) =>
                sum + safeNumber(row.stockOut),
            0
        );

    const demand =
        data.reduce(
            (sum, row) =>
                sum + safeNumber(row.demand),
            0
        );

    const cost =
        data.reduce(
            (sum, row) =>
                sum +
                safeNumber(row.stockInCost),
            0
        );


    const elIn =
        document.getElementById(
            "summaryStockIn"
        );

    const elOut =
        document.getElementById(
            "summaryStockOut"
        );

    const elDemand =
        document.getElementById(
            "summaryDemand"
        );

    const elCost =
        document.getElementById(
            "summaryCost"
        );


    if (elIn) {
        elIn.textContent =
            stockIn.toLocaleString();
    }

    if (elOut) {
        elOut.textContent =
            stockOut.toLocaleString();
    }

    if (elDemand) {
        elDemand.textContent =
            demand.toLocaleString();
    }

    if (elCost) {
        elCost.textContent =
            stockInCostText(cost);
    }
}


function stockInCostText(value) {

    return Number(value || 0)
        .toLocaleString(
            undefined,
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );
}


// ============================================================
// ITEM INFO
// ============================================================

function updateItemInfo() {

    const el =
        document.getElementById(
            "itemInfo"
        );

    if (!el) return;

    const select =
        document.getElementById(
            "itemSelect"
        );

    const selectedCode =
        select?.value || "all";

    const cycle =
        getActiveDemandCycle();

    if (selectedCode === "all") {

        let cycleText =
            "Demand Cycle: Not Available";

        if (cycle.startDate) {

            cycleText =
                `Demand Cycle: ${dateToKey(
                    cycle.startDate
                )}`;

            if (cycle.endDate) {

                cycleText +=
                    ` → ${dateToKey(
                        cycle.endDate
                    )}`;
            }
        }

        el.innerHTML =
            `<strong>All Items</strong><br>
             ${cycleText}`;

        return;
    }


    const item =
        items.find(
            item =>
                getItemCode(item) ===
                cleanCode(selectedCode)
        );

    if (!item) {

        el.textContent =
            "Item not found.";

        return;
    }


    let cycleText =
        "Demand Cycle: Not Available";

    if (cycle.startDate) {

        cycleText =
            `Demand Cycle: ${dateToKey(
                cycle.startDate
            )}`;

        if (cycle.endDate) {

            cycleText +=
                ` → ${dateToKey(
                    cycle.endDate
                )}`;
        }
    }


    el.innerHTML =
        `<strong>${getItemCode(item)}</strong>
         - ${getItemName(item)}
         <br>
         Unit: ${getItemUnit(item)}
         <br>
         ${cycleText}`;
}


// ============================================================
// DATA TABLE
// ============================================================

function buildDataTable(data) {

    const tbody =
        document.getElementById(
            "graphDataBody"
        );

    if (!tbody) return;

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
        `;

        tbody.appendChild(tr);
    });
}


// ============================================================
// CHART OPTIONS
// ============================================================

function commonChartOptions() {

    return {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {

            legend: {
                position: "top"
            },

            tooltip: {
                callbacks: {

                    label: function(context) {

                        const value =
                            context.parsed?.y ??
                            context.parsed?.x ??
                            0;

                        return `${context.dataset.label}: ${Number(
                            value
                        ).toLocaleString()}`;
                    }
                }
            }
        }
    };
}


function horizontalBarOptions(
    titleText,
    unitText = ""
) {

    const options =
        commonChartOptions();

    options.indexAxis = "y";

    options.plugins.title = {
        display: true,
        text: titleText,
        font: {
            size: 17,
            weight: "bold"
        }
    };

    options.scales = {

        x: {
            beginAtZero: true,

            title: {
                display: true,
                text: unitText
            }
        },

        y: {
            ticks: {
                autoSkip: false
            }
        }
    };

    return options;
}


function verticalBarOptions(
    titleText,
    yTitle
) {

    const options =
        commonChartOptions();

    options.plugins.title = {
        display: true,
        text: titleText,
        font: {
            size: 17,
            weight: "bold"
        }
    };

    options.scales = {

        y: {
            beginAtZero: true,

            title: {
                display: true,
                text: yTitle
            }
        }
    };

    return options;
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


function destroyAllCharts() {

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


// ============================================================
// SECTION VISIBILITY
// ============================================================

function hideAllGraphSections() {

    const ids = [

        "stockInSection",
        "stockOutSection",
        "stockInDemandSection",
        "stockInCostSection",
        "stockOutCostSection",
        "demandSection",

        "departmentStockInSection",
        "departmentStockOutSection",
        "departmentCostSection"
    ];

    ids.forEach(id => {

        const el =
            document.getElementById(id);

        if (el) {
            el.style.display = "none";
        }
    });
}


function showSection(id) {

    const el =
        document.getElementById(id);

    if (el) {
        el.style.display = "block";
    }
}


// ============================================================
// GRAPH MODE
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
// STOCK IN GRAPH
// ============================================================

function drawStockInChart(data) {

    const canvas =
        document.getElementById(
            "stockInChart"
        );

    if (!canvas) return;

    stockInChart =
        destroyChart(stockInChart);

    const labels =
        data.map(
            row =>
                `${row.code} - ${row.name}`
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

                            data:
                                data.map(
                                    row =>
                                        row.stockIn
                                )
                        }
                    ]
                },

                options:
                    horizontalBarOptions(
                        "📥 Stock In Quantity",
                        "Quantity"
                    )
            }
        );
}


// ============================================================
// STOCK OUT GRAPH
// ============================================================

function drawStockOutChart(data) {

    const canvas =
        document.getElementById(
            "stockOutChart"
        );

    if (!canvas) return;

    stockOutChart =
        destroyChart(stockOutChart);

    const labels =
        data.map(
            row =>
                `${row.code} - ${row.name}`
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

                            data:
                                data.map(
                                    row =>
                                        row.stockOut
                                )
                        }
                    ]
                },

                options:
                    horizontalBarOptions(
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
        data.map(
            row =>
                `${row.code} - ${row.name}`
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
                                )
                        },

                        {
                            label:
                                "Demand",

                            data:
                                data.map(
                                    row =>
                                        row.demand
                                )
                        }
                    ]
                },

                options:
                    horizontalBarOptions(
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

    const labels =
        data.map(
            row =>
                `${row.code} - ${row.name}`
        );

    stockInCostChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "Stock In Cost",

                            data:
                                data.map(
                                    row =>
                                        row.stockInCost
                                )
                        }
                    ]
                },

                options:
                    horizontalBarOptions(
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

    const labels =
        data.map(
            row =>
                `${row.code} - ${row.name}`
        );

    stockOutCostChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

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
                    horizontalBarOptions(
                        "💰 Stock Out Cost",
                        "Cost"
                    )
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

    const labels =
        data.map(
            row =>
                `${row.code} - ${row.name}`
        );

    demandChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "Demand Quantity",

                            data:
                                data.map(
                                    row =>
                                        row.demand
                                )
                        }
                    ]
                },

                options:
                    horizontalBarOptions(
                        "📊 Demand Quantity",
                        "Quantity"
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
            "stockOutCostChart"
        );

    if (!canvas) return;

    stockOutCostChart =
        destroyChart(
            stockOutCostChart
        );


    const labels =
        data.map(
            row =>
                `${row.code} - ${row.name}`
        );


    const options =
        commonChartOptions();

    options.plugins.title = {

        display: true,

        text:
            "💰 Stock Out vs Cost Analysis",

        font: {
            size: 17,
            weight: "bold"
        }
    };


    options.scales = {

        y: {

            beginAtZero: true,

            position: "left",

            title: {
                display: true,
                text: "Stock Out Quantity"
            }
        },

        costAxis: {

            beginAtZero: true,

            position: "right",

            grid: {
                drawOnChartArea: false
            },

            title: {
                display: true,
                text: "Stock Out Cost"
            }
        }
    };


    stockOutCostChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {

                            type: "bar",

                            label:
                                "Stock Out Quantity",

                            data:
                                data.map(
                                    row =>
                                        row.stockOut
                                ),

                            yAxisID: "y"
                        },

                        {

                            type: "line",

                            label:
                                "Stock Out Cost",

                            data:
                                data.map(
                                    row =>
                                        row.stockOutCost
                                ),

                            yAxisID:
                                "costAxis",

                            tension: 0.25
                        }
                    ]
                },

                options
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

    const labels =
        data.map(
            row =>
                row.department
        );

    departmentStockInChart =
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
                                )
                        }
                    ]
                },

                options:
                    verticalBarOptions(
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

    if (!canvas) return;

    departmentStockOutChart =
        destroyChart(
            departmentStockOutChart
        );

    const labels =
        data.map(
            row =>
                row.department
        );

    departmentStockOutChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "Stock Out",

                            data:
                                data.map(
                                    row =>
                                        row.stockOut
                                )
                        }
                    ]
                },

                options:
                    verticalBarOptions(
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

    if (!canvas) return;

    departmentCostChart =
        destroyChart(
            departmentCostChart
        );

    const labels =
        data.map(
            row =>
                row.department
        );

    departmentCostChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "bar",

                data: {

                    labels,

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
                    verticalBarOptions(
                        "💰 Department Wise Cost",
                        "Cost"
                    )
            }
        );
}


// ============================================================
// GRAPH MODE UPDATE
// ============================================================

function updateGraphs() {

    updateItemInfo();

    const data =
        createGraphData();

    updateSummary(data);

    buildDataTable(data);

    hideAllGraphSections();

    destroyAllCharts();


    // ========================================================
    // ALL
    // ========================================================

    if (currentGraphMode === "all") {

        showSection(
            "stockInSection"
        );

        showSection(
            "stockOutSection"
        );

        showSection(
            "stockInDemandSection"
        );

        showSection(
            "stockInCostSection"
        );

        showSection(
            "stockOutCostSection"
        );

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


        const departments =
            createDepartmentGraphData();

        drawDepartmentStockInChart(
            departments
        );

        drawDepartmentStockOutChart(
            departments
        );

        drawDepartmentCostChart(
            departments
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

        showSection(
            "stockInDemandSection"
        );

        showSection(
            "stockInCostSection"
        );


        drawStockInChart(data);

        drawStockInDemandChart(data);

        drawStockInCostChart(data);

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

        showSection(
            "stockOutCostSection"
        );


        drawStockOutChart(data);

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

        drawDemandChart(data);

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

        showSection(
            "departmentStockOutSection"
        );

        showSection(
            "departmentCostSection"
        );


        const departments =
            createDepartmentGraphData();

        drawDepartmentStockInChart(
            departments
        );

        drawDepartmentStockOutChart(
            departments
        );

        drawDepartmentCostChart(
            departments
        );

        return;
    }
}


// ============================================================
// START
// ============================================================

async function startGraphs() {

    try {

        await loadAllGraphData();

    } catch (error) {

        console.error(
            "Graphs start error:",
            error
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Mode buttons
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


        // Period selector
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


        // Month selector
        const monthSelect =
            document.getElementById(
                "monthSelect"
            );

        if (monthSelect) {

            monthSelect.addEventListener(
                "change",
                updateGraphs
            );
        }


        // Start
        startGraphs();
    }
);
