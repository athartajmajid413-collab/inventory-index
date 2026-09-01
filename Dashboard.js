// =====================================
// DASHBOARD DATA - SUPABASE VERSION
// MECAS ENGINEERING PVT LIMITED SUNDAR
//
// IMPORTANT:
// 1. All stock data comes from Supabase
// 2. Demand comes ONLY from demand_history
// 3. localStorage demand is NOT used
// 4. Selected month Opening = previous closing
// 5. Current = Opening + In - Out
// =====================================

let items = [];
let history = [];
let demandHistory = [];

let selectedItem = null;
let dashboardChart = null;

let selectedDashboardMonth =
    localStorage.getItem("dashboardSelectedMonth") ||
    getTodayMonthKey();


// =====================================
// MONTH
// =====================================

function getTodayMonthKey(){

    const d = new Date();

    return d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2,"0");

}


function getSelectedMonthParts(){

    const p =
        String(selectedDashboardMonth).split("-");

    return {

        year:Number(p[0]),

        month:Number(p[1]) - 1

    };

}


function getMonthName(key){

    const p =
        String(key).split("-");

    const d =
        new Date(
            Number(p[0]),
            Number(p[1]) - 1,
            1
        );

    return d.toLocaleString(
        "en-US",
        {
            month:"long",
            year:"numeric"
        }
    );

}


function setDashboardMonth(key){

    if(!/^\d{4}-\d{2}$/.test(key))
        return;

    selectedDashboardMonth = key;

    localStorage.setItem(
        "dashboardSelectedMonth",
        key
    );

    updateMonthUI();

    updateDashboard();

}


function updateMonthUI(){

    const picker =
        document.getElementById(
            "dashboardMonth"
        );

    const label =
        document.getElementById(
            "dashboardMonthName"
        );

    const title =
        document.getElementById(
            "stockTableTitle"
        );


    if(picker)
        picker.value =
            selectedDashboardMonth;


    if(label)
        label.textContent =
            getMonthName(
                selectedDashboardMonth
            );


    if(title)
        title.textContent =
            getMonthName(
                selectedDashboardMonth
            ) +
            " Stock";

}


// =====================================
// DATE HELPERS
// =====================================

function getRecordDate(record){

    let value =
        record.date ||
        record.transactionDate ||
        record.entryDate ||
        record.transaction_date ||
        record.createdDate ||
        "";

    if(!value)
        return null;


    let text =
        String(value).trim();


    // DD/MM/YYYY

    let s =
        text.split("/");


    if(s.length === 3){

        const day =
            Number(s[0]);

        const month =
            Number(s[1]) - 1;

        const year =
            Number(s[2]);


        if(
            !isNaN(day) &&
            !isNaN(month) &&
            !isNaN(year)
        ){

            return new Date(
                year,
                month,
                day
            );

        }

    }


    // YYYY-MM-DD

    let d =
        text.split("-");


    if(d.length >= 2){

        const year =
            Number(d[0]);

        const month =
            Number(d[1]) - 1;


        if(
            !isNaN(year) &&
            !isNaN(month)
        ){

            const day =
                d.length >= 3
                ?
                Number(
                    String(d[2])
                    .substring(0,2)
                )
                :
                1;


            return new Date(
                year,
                month,
                day > 0 ? day : 1
            );

        }

    }


    const date =
        new Date(value);


    return isNaN(date.getTime())
        ? null
        : date;

}


function getRecordMonthKey(record){

    const d =
        getRecordDate(record);

    if(!d)
        return "";

    return d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2,"0");

}


function isSelectedMonth(record){

    return getRecordMonthKey(record) ===
        selectedDashboardMonth;

}


function isBeforeSelectedMonth(record){

    const d =
        getRecordDate(record);

    if(!d)
        return false;


    const m =
        getSelectedMonthParts();


    return (

        d.getFullYear() < m.year

    ) ||

    (

        d.getFullYear() === m.year &&

        d.getMonth() < m.month

    );

}


// =====================================
// ITEM
// =====================================

function getItemByCode(code){

    const c =
        String(code || "").trim();


    return items.find(
        x =>
            String(
                x.code || ""
            ).trim() === c
    ) || null;

}


// =====================================
// LOAD SUPABASE
// =====================================

async function loadDashboardFromSupabase(){

    console.log(
        "Loading Dashboard from Supabase..."
    );


    // ---------------------------------
    // ITEMS
    // ---------------------------------

    const itemsResult =
        await supabaseRequest(
            "items",
            "GET",
            null,
            "?select=*"
        );


    if(!itemsResult.success){

        showSupabaseError(
            "Items",
            itemsResult.error
        );

        return;

    }


    items =
        Array.isArray(
            itemsResult.data
        )
        ?
        itemsResult.data
        :
        [];


    // ---------------------------------
    // STOCK IN
    // ---------------------------------

    const stockInResult =
        await supabaseRequest(
            "stock_in",
            "GET",
            null,
            "?select=*"
        );


    // ---------------------------------
    // STOCK OUT
    // ---------------------------------

    const stockOutResult =
        await supabaseRequest(
            "stock_issue",
            "GET",
            null,
            "?select=*"
        );


    if(
        !stockInResult.success &&
        !stockOutResult.success
    ){

        showSupabaseError(
            "Stock",
            stockInResult.error ||
            stockOutResult.error
        );

        return;

    }


    history = [];


    // ---------------------------------
    // STOCK IN → HISTORY
    // ---------------------------------

    if(stockInResult.success){

        (
            stockInResult.data || []
        )
        .forEach(r => {

            history.push({

                id:r.id,

                date:r.date,

                time:r.time,

                itemCode:
                    r.item_code,

                itemName:
                    r.item_name,

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
                    Number(
                        r.quantity || 0
                    ),

                unitCost:
                    Number(
                        r.unit_cost || 0
                    ),

                totalCost:
                    Number(
                        r.total_cost || 0
                    ),

                type:"Stock In"

            });

        });

    }


    // ---------------------------------
    // STOCK OUT → HISTORY
    // ---------------------------------

    if(stockOutResult.success){

        (
            stockOutResult.data || []
        )
        .forEach(r => {

            history.push({

                id:r.id,

                date:r.date,

                time:r.time,

                itemCode:
                    r.item_code,

                itemName:
                    r.item_name,

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
                    Number(
                        r.quantity || 0
                    ),

                unitCost:0,

                totalCost:0,

                type:"Stock Issue"

            });

        });

    }


    // ---------------------------------
    // DEMAND HISTORY
    // ---------------------------------

    const demandResult =
        await supabaseRequest(
            "demand_history",
            "GET",
            null,
            "?select=*"
        );


    if(!demandResult.success){

        console.error(
            "Demand History Error:",
            demandResult.error
        );

        demandHistory = [];

    }
    else{

        demandHistory =
            Array.isArray(
                demandResult.data
            )
            ?
            demandResult.data
            :
            [];

    }


    console.log(
        "Items:",
        items.length
    );

    console.log(
        "Stock records:",
        history.length
    );

    console.log(
        "Demand history:",
        demandHistory.length
    );


    updateMonthUI();

    loadSavedItem();

}


// =====================================
// SUPABASE ERROR
// =====================================

function showSupabaseError(
    section,
    error
){

    console.error(
        "Supabase " +
        section +
        " Error:",
        error
    );


    const info =
        document.getElementById(
            "searchInfo"
        );


    if(info){

        info.innerHTML =
            "❌ Supabase connection error." +
            "<br>" +
            section +
            " data could not be loaded." +
            "<br><small>" +
            String(
                error || ""
            ) +
            "</small>";

    }

}


// =====================================
// MASTER OPENING
// =====================================

function getMasterOpeningStock(item){

    if(!item)
        return 0;


    return Number(

        item.opening_stock ??

        item.openingStock ??

        0

    ) || 0;

}


// =====================================
// STOCK BEFORE SELECTED MONTH
//
// Previous Stock In - Previous Stock Out
// =====================================

function getStockBeforeMonth(itemCode){

    let totalIn = 0;

    let totalOut = 0;


    const code =
        String(
            itemCode || ""
        ).trim();


    history.forEach(r => {

        if(
            String(
                r.itemCode || ""
            ).trim() !== code
        ){

            return;

        }


        if(
            !isBeforeSelectedMonth(r)
        ){

            return;

        }


        const qty =
            Number(
                r.quantity || 0
            );


        if(
            r.type === "Stock In"
        ){

            totalIn += qty;

        }


        else if(

            r.type === "Stock Issue" ||

            r.type === "Stock Out"

        ){

            totalOut += qty;

        }

    });


    return totalIn - totalOut;

}


// =====================================
// MONTH OPENING
//
// Master Opening
// +
// ALL PREVIOUS IN
// -
// ALL PREVIOUS OUT
// =====================================

function getMonthlyOpeningStock(item){

    if(!item)
        return 0;


    const opening =
        getMasterOpeningStock(item);


    const movement =
        getStockBeforeMonth(
            item.code
        );


    return Math.max(
        opening + movement,
        0
    );

}


// =====================================
// SELECTED MONTH STOCK IN
// =====================================

function getSelectedMonthStockIn(
    itemCode
){

    let total = 0;


    const code =
        String(
            itemCode || ""
        ).trim();


    history.forEach(r => {

        if(

            r.type === "Stock In" &&

            String(
                r.itemCode || ""
            ).trim() === code &&

            isSelectedMonth(r)

        ){

            total +=
                Number(
                    r.quantity || 0
                );

        }

    });


    return total;

}


// =====================================
// SELECTED MONTH STOCK OUT
// =====================================

function getSelectedMonthStockOut(
    itemCode
){

    let total = 0;


    const code =
        String(
            itemCode || ""
        ).trim();


    history.forEach(r => {

        if(

            (
                r.type === "Stock Issue" ||
                r.type === "Stock Out"
            ) &&

            String(
                r.itemCode || ""
            ).trim() === code &&

            isSelectedMonth(r)

        ){

            total +=
                Number(
                    r.quantity || 0
                );

        }

    });


    return total;

}


// =====================================
// CURRENT STOCK
//
// Opening + In - Out
// =====================================

function getCurrentStock(item){

    if(!item)
        return 0;


    const opening =
        getMonthlyOpeningStock(item);


    const stockIn =
        getSelectedMonthStockIn(
            item.code
        );


    const stockOut =
        getSelectedMonthStockOut(
            item.code
        );


    return Math.max(

        opening +
        stockIn -
        stockOut,

        0

    );

}


// =====================================
// LATEST RATE
// =====================================

function getLatestRate(itemCode){

    let latest = null;


    const code =
        String(
            itemCode || ""
        ).trim();


    history.forEach(r => {

        if(

            r.type !== "Stock In" ||

            String(
                r.itemCode || ""
            ).trim() !== code ||

            !isSelectedMonth(r)

        ){

            return;

        }


        if(!latest){

            latest = r;

            return;

        }


        const a =
            getRecordDate(r);


        const b =
            getRecordDate(latest);


        if(

            a &&
            b &&
            a >= b

        ){

            latest = r;

        }

    });


    if(latest){

        return Number(

            latest.unitCost ||

            latest.latestRate ||

            latest.rate ||

            0

        ) || 0;

    }


    const item =
        getItemByCode(
            itemCode
        );


    if(!item)
        return 0;


    return Number(

        item.latestRate ??

        item.unit_cost ??

        item.unitCost ??

        item.cost ??

        0

    ) || 0;

}


// =====================================
// DEMAND VALUE
// =====================================

function getDemandValue(record){

    if(!record)
        return 0;


    return Number(

        record.finalDemand ??

        record.final_demand ??

        record.approvedQty ??

        record.approved_qty ??

        record.demandQty ??

        record.demand_qty ??

        record.demandQuantity ??

        record.demand_quantity ??

        record.quantity ??

        record.qty ??

        0

    ) || 0;

}


// =====================================
// DEMAND CODE
// =====================================

function getDemandCode(record){

    if(!record)
        return "";


    return String(

        record.itemCode ??

        record.item_code ??

        record.code ??

        record.itemID ??

        record.item_id ??

        record.itemId ??

        record.item_code_id ??

        ""

    ).trim();

}


// =====================================
// DEMAND ITEMS
// =====================================

function getDemandList(record){

    if(!record)
        return [];


    let list =

        record.demand_items ??

        record.demandItems ??

        record.items ??

        [];


    if(typeof list === "string"){

        try{

            list =
                JSON.parse(list);

        }
        catch(e){

            console.error(
                "Demand JSON error:",
                e
            );

            return [];

        }

    }


    return Array.isArray(list)
        ? list
        : [];

}


// =====================================
// DEMAND MONTH
// =====================================

function getDemandMonth(record){

    if(!record)
        return "";


    const value =

        record.demand_month ??

        record.demandMonth ??

        "";


    return String(
        value || ""
    ).trim();

}


// =====================================
// CURRENT MONTH DEMAND
//
// ONLY demand_history
// NO localStorage demand
// =====================================

function getCurrentMonthDemand(
    itemCode
){

    const code =
        String(
            itemCode || ""
        ).trim();


    let total = 0;


    demandHistory.forEach(
        record => {

            const month =
                getDemandMonth(
                    record
                );


            // Demand must belong
            // to selected month.

            if(
                month !==
                selectedDashboardMonth
            ){

                return;

            }


            const list =
                getDemandList(
                    record
                );


            list.forEach(
                di => {

                    if(
                        getDemandCode(di)
                        === code
                    ){

                        total +=
                            getDemandValue(
                                di
                            );

                    }

                }
            );

        }
    );


    return total;

}


// =====================================
// OVERALL DEMAND
// =====================================

function getOverallDemand(){

    return items.reduce(

        (sum,item) =>

            sum +
            getCurrentMonthDemand(
                item.code
            ),

        0

    );

}


// =====================================
// PENDING
// =====================================

function getPendingForItem(item){

    const demand =
        getCurrentMonthDemand(
            item.code
        );


    const currentStock =
        getCurrentStock(
            item
        );


    const pending =
        Math.max(
            demand -
            currentStock,
            0
        );


    return {

        demand:demand,

        pendingDemand:pending,

        pendingPO:pending

    };

}


function getOverallPending(){

    let demand = 0;

    let stock = 0;


    items.forEach(item => {

        demand +=
            getCurrentMonthDemand(
                item.code
            );


        stock +=
            getCurrentStock(
                item
            );

    });


    return Math.max(
        demand - stock,
        0
    );

}


// =====================================
// COST
// =====================================

function getOverallCost(){

    let total = 0;


    history.forEach(r => {

        if(

            r.type === "Stock In" &&

            isSelectedMonth(r)

        ){

            total +=

                Number(
                    r.quantity || 0
                ) *

                Number(
                    r.unitCost || 0
                );

        }

    });


    return total;

}


function getItemCurrentCost(item){

    return (

        getCurrentStock(item) *

        getLatestRate(item.code)

    );

// =====================================
// SELECTED ITEM ONLINE PICTURE
// OIL PICTURE + DRUM FALLBACK
// =====================================

async function showSelectedItemPicture(item){

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


    if(!box || !image)
        return;


    if(!item){

        box.style.display = "none";

        image.src = "";

        return;

    }


    const itemName =
        item.item_name ??
        item.itemName ??
        item.name ??
        item.description ??
        item.code ??
        "";


    box.style.display = "block";


    if(name){

        name.innerHTML =
            "🔎 " +
            String(itemName);

    }


    if(status){

        status.innerHTML =
            "🌐 Online picture searching...";

    }


    image.src = "";


    // =================================
    // CHECK IF ITEM IS OIL
    // =================================

    const lowerName =
        String(itemName).toLowerCase();


    const isOil =
        lowerName.includes("oil") ||
        lowerName.includes("lubricant") ||
        lowerName.includes("hydraulic") ||
        lowerName.includes("engine oil") ||
        lowerName.includes("gear oil") ||
        lowerName.includes("diesel oil") ||
        lowerName.includes("motor oil");


    // =================================
    // ONLINE IMAGE SEARCH
    // =================================

    try{

        const searchText =
            encodeURIComponent(
                String(itemName).trim()
            );


        const apiURL =
            "https://api.duckduckgo.com/" +
            "?q=" +
            searchText +
            "&format=json" +
            "&no_html=1" +
            "&skip_disambig=1";


        const response =
            await fetch(apiURL);


        if(!response.ok){

            throw new Error(
                "Image search failed"
            );

        }


        const data =
            await response.json();


        let imageURL =
            data.Image || "";


        // =================================
        // RELATED TOPIC IMAGE
        // =================================

        if(
            !imageURL &&
            data.RelatedTopics &&
            Array.isArray(data.RelatedTopics)
        ){

            for(
                const topic
                of data.RelatedTopics
            ){

                if(
                    topic &&
                    topic.Icon &&
                    topic.Icon.URL
                ){

                    imageURL =
                        topic.Icon.URL;

                    break;

                }

            }

        }


        // =================================
        // IMAGE FOUND
        // =================================

        if(imageURL){

            image.src =
                imageURL;


            if(status){

                status.innerHTML =
                    "🌐 Online image";

            }


            image.onerror =
                function(){

                    handleItemPictureError(
                        isOil
                    );

                };

        }

        else{

            handleItemPictureError(
                isOil
            );

        }

    }
    catch(error){

        console.error(
            "Item picture error:",
            error
        );


        handleItemPictureError(
            isOil
        );

    }

}


// =====================================
// IMAGE ERROR / DRUM FALLBACK
// =====================================

function handleItemPictureError(
    isOil = false
){

    const image =
        document.getElementById(
            "itemOnlinePicture"
        );

    const status =
        document.getElementById(
            "itemPictureStatus"
        );


    if(!image)
        return;


    // =================================
    // OIL DRUM FALLBACK
    // =================================

    if(isOil){

        const drumSVG = `

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="500"
            height="350"
            viewBox="0 0 500 350"
        >

            <rect
                width="500"
                height="350"
                fill="#f1f5f9"
            />

            <!-- Shadow -->

            <ellipse
                cx="250"
                cy="305"
                rx="125"
                ry="18"
                fill="#cbd5e1"
            />

            <!-- Drum -->

            <ellipse
                cx="250"
                cy="75"
                rx="105"
                ry="28"
                fill="#64748b"
            />

            <rect
                x="145"
                y="75"
                width="210"
                height="190"
                fill="#94a3b8"
            />

            <ellipse
                cx="250"
                cy="265"
                rx="105"
                ry="28"
                fill="#64748b"
            />

            <!-- Top -->

            <ellipse
                cx="250"
                cy="75"
                rx="105"
                ry="28"
                fill="#94a3b8"
            />

            <ellipse
                cx="250"
                cy="75"
                rx="82"
                ry="18"
                fill="#cbd5e1"
            />

            <!-- Drum rings -->

            <rect
                x="145"
                y="115"
                width="210"
                height="10"
                fill="#475569"
            />

            <rect
                x="145"
                y="220"
                width="210"
                height="10"
                fill="#475569"
            />

            <!-- Oil label -->

            <rect
                x="175"
                y="145"
                width="150"
                height="55"
                rx="8"
                fill="#ffffff"
            />

            <text
                x="250"
                y="168"
                text-anchor="middle"
                font-size="18"
                font-family="Arial"
                font-weight="bold"
                fill="#1e293b"
            >
                OIL
            </text>

            <text
                x="250"
                y="190"
                text-anchor="middle"
                font-size="13"
                font-family="Arial"
                fill="#475569"
            >
                DRUM
            </text>

            <!-- Cap -->

            <circle
                cx="250"
                cy="75"
                r="10"
                fill="#334155"
            />

            <text
                x="250"
                y="325"
                text-anchor="middle"
                font-size="16"
                font-family="Arial"
                fill="#475569"
            >
                Oil Drum
            </text>

        </svg>

        `;


        image.src =
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(
                drumSVG
            );


        if(status){

            status.innerHTML =
                "🛢️ Oil Drum picture";

        }

    }

    // =================================
    // NORMAL ITEM FALLBACK
    // =================================

    else{

        image.src =
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`

            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="500"
                height="350"
            >

                <rect
                    width="500"
                    height="350"
                    fill="#f1f5f9"
                />

                <text
                    x="250"
                    y="165"
                    text-anchor="middle"
                    font-size="28"
                    font-family="Arial"
                    fill="#64748b"
                >
                    No Picture Found
                </text>

                <text
                    x="250"
                    y="200"
                    text-anchor="middle"
                    font-size="16"
                    font-family="Arial"
                    fill="#94a3b8"
                >
                    Item Image
                </text>

            </svg>

            `);


        if(status){

            status.innerHTML =
                "❌ Online picture not found.";

        }

    }

}


// =====================================
// HIDE ITEM PICTURE
// =====================================

function clearSelectedItemPicture(){

    const box =
        document.getElementById(
            "itemPictureBox"
        );

    const image =
        document.getElementById(
            "itemOnlinePicture"
        );


    if(box)
        box.style.display = "none";


    if(image)
        image.src = "";

}
// =====================================
// SEARCH ITEM
// =====================================

function searchItem(){

    const input =
        document.getElementById(
            "itemSearch"
        );


    if(!input)
        return;


    const code =
        input.value.trim();


    if(!code){

        selectedItem = null;

        localStorage.removeItem(
            "dashboardSelectedItem"
        );

        updateDashboard();

        return;

    }


    const found =
        getItemByCode(
            code
        );


    if(found){

        selectedItem =
            found;


        localStorage.setItem(
            "dashboardSelectedItem",
            found.code
        );

    showSelectedItemPicture(
        found
    );

        updateDashboard();

    }
    else{

        selectedItem = null;


        const info =
            document.getElementById(
                "searchInfo"
            );


        if(info){

            info.innerHTML =
                "❌ Item not found: " +
                code;

        }


        clearSelectedCards();

        buildCurrentStockTable();

        clearDashboardGraph();

    }

}


// =====================================
// CLEAR SEARCH
// =====================================

function clearItemSearch(){

    const input =
        document.getElementById(
            "itemSearch"
        );


    if(input)
        input.value = "";


    selectedItem = null;


    localStorage.removeItem(
        "dashboardSelectedItem"
    );

clearSelectedItemPicture();
    updateDashboard();

}


// =====================================
// UPDATE DASHBOARD
// =====================================

function updateDashboard(){

    const el =
        id =>
            document.getElementById(id);


    if(!el("masterValue"))
        return;


    updateMonthUI();


    // =================================
    // NO ITEM
    // =================================

    if(!selectedItem){

        if(el("searchInfo"))

            el("searchInfo").innerHTML =
                "Overall Dashboard — No item selected";


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
            getOverallCost().toFixed(2);


        el("costInfo").innerHTML =
            "Stock In Cost — " +
            getMonthName(
                selectedDashboardMonth
            );


        el("demandValue").innerHTML =
            getOverallDemand().toFixed(2);


        el("demandInfo").innerHTML =
            "Demand — " +
            getMonthName(
                selectedDashboardMonth
            );


        el("pendingValue").innerHTML =
            getOverallPending().toFixed(2);


        el("pendingInfo").innerHTML =
            "Pending Demand / PO";


        clearDashboardGraph();

        buildCurrentStockTable();

        return;

    }


    // =================================
    // SELECTED ITEM
    // =================================

    const item =
        selectedItem;


    const opening =
        getMonthlyOpeningStock(
            item
        );


    const stockIn =
        getSelectedMonthStockIn(
            item.code
        );


    const stockOut =
        getSelectedMonthStockOut(
            item.code
        );


    const current =
        getCurrentStock(
            item
        );


    const rate =
        getLatestRate(
            item.code
        );


    const demand =
        getCurrentMonthDemand(
            item.code
        );


    const pending =
        getPendingForItem(
            item
        );


    const cost =
        getItemCurrentCost(
            item
        );


    const name =

        item.item_name ??

        item.itemName ??

        "-";


    el("searchInfo").innerHTML =
        "✅ Selected: <b>" +
        item.code +
        "</b> — " +
        name;


    el("masterValue").innerHTML =
        name;


    el("masterInfo").innerHTML =

        "ID: " +
        (item.code || "-") +

        "<br>Unit: " +
        (item.unit || "-") +

        "<br>Opening (" +
        getMonthName(
            selectedDashboardMonth
        ) +
        "): " +
        opening.toFixed(2) +

        "<br>Current Stock: " +
        current.toFixed(2);


    el("stockInValue").innerHTML =
        stockIn.toFixed(2) +
        " " +
        (item.unit || "");


    el("stockInInfo").innerHTML =
        "Stock In — " +
        getMonthName(
            selectedDashboardMonth
        );


    el("stockOutValue").innerHTML =
        stockOut.toFixed(2) +
        " " +
        (item.unit || "");


    el("stockOutInfo").innerHTML =
        "Stock Out — " +
        getMonthName(
            selectedDashboardMonth
        );


    el("costValue").innerHTML =
        "Rs. " +
        cost.toFixed(2);


    el("costInfo").innerHTML =
        "Current Stock Cost — " +
        getMonthName(
            selectedDashboardMonth
        );


    el("demandValue").innerHTML =
        demand.toFixed(2) +
        " " +
        (item.unit || "");


    el("demandInfo").innerHTML =
        "Demand — " +
        getMonthName(
            selectedDashboardMonth
        );


    el("pendingValue").innerHTML =
        pending.pendingDemand.toFixed(2) +
        " " +
        (item.unit || "");


    el("pendingInfo").innerHTML =
        "Pending Demand / PO";


    showDashboardGraph(
        item.code
    );


    buildCurrentStockTable();

}


// =====================================
// CLEAR CARDS
// =====================================

function clearSelectedCards(){

    [

        "masterValue",

        "stockInValue",

        "stockOutValue",

        "demandValue",

        "pendingValue"

    ]
    .forEach(id => {

        const e =
            document.getElementById(id);


        if(e)
            e.innerHTML = "-";

    });


    const cost =
        document.getElementById(
            "costValue"
        );


    if(cost)
        cost.innerHTML =
            "Rs. 0.00";


    const info =
        document.getElementById(
            "masterInfo"
        );


    if(info)
        info.innerHTML =
            "❌ Item not found.";

}


// =====================================
// CURRENT STOCK TABLE
// =====================================

function buildCurrentStockTable(){

    const body =
        document.getElementById(
            "currentStockBody"
        );


    if(!body)
        return;


    body.innerHTML = "";


    items.forEach(item => {

        if(

            selectedItem &&

            String(
                item.code || ""
            ).trim() !==

            String(
                selectedItem.code || ""
            ).trim()

        ){

            return;

        }


        const opening =
            getMonthlyOpeningStock(
                item
            );


        const stockIn =
            getSelectedMonthStockIn(
                item.code
            );


        const stockOut =
            getSelectedMonthStockOut(
                item.code
            );


        const current =
            getCurrentStock(
                item
            );


        const rate =
            getLatestRate(
                item.code
            );


        const demand =
            getCurrentMonthDemand(
                item.code
            );


        const name =

            item.item_name ??

            item.itemName ??

            "-";


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML =

            "<td>" +
            (item.code || "-") +
            "</td>" +

            "<td>" +
            name +
            "</td>" +

            "<td>" +
            (item.unit || "-") +
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

            "<td>Rs. " +
            rate.toFixed(2) +
            "</td>" +

            "<td>" +
            demand.toFixed(2) +
            "</td>";


        const cell =
            row.querySelector(
                ".current-stock-cell"
            );


        if(current <= 0){

            cell.className =
                "current-stock-cell low";

        }

        else if(

            demand > 0 &&

            current <= demand

        ){

            cell.className =
                "current-stock-cell warning";

        }

        else{

            cell.className =
                "current-stock-cell normal";

        }


        body.appendChild(row);

    });

}


// =====================================
// GRAPH
// =====================================

function showDashboardGraph(
    itemCode
){

    const canvas =
        document.getElementById(
            "dashboardGraph"
        );


    const info =
        document.getElementById(
            "graphInfo"
        );


    if(!canvas)
        return;


    const item =
        getItemByCode(
            itemCode
        );


    if(!item){

        clearDashboardGraph();

        return;

    }


    const opening =
        getMonthlyOpeningStock(
            item
        );


    const stockIn =
        getSelectedMonthStockIn(
            item.code
        );


    const stockOut =
        getSelectedMonthStockOut(
            item.code
        );


    const current =
        getCurrentStock(
            item
        );


    if(info){

        info.innerHTML =

            "<b>" +
            item.code +
            " - " +
            (
                item.item_name ??
                item.itemName ??
                ""
            ) +
            "</b><br>" +

            getMonthName(
                selectedDashboardMonth
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


    if(dashboardChart){

        dashboardChart.destroy();

        dashboardChart = null;

    }


    if(
        typeof Chart ===
        "undefined"
    ){

        if(info)
            info.innerHTML +=
                "<br>Chart library not loaded.";

        return;

    }


    dashboardChart =
        new Chart(
            canvas,
            {

                type:"bar",

                data:{

                    labels:[

                        "Opening Stock",

                        "Stock In",

                        "Stock Out",

                        "Current Stock"

                    ],

                    datasets:[{

                        label:

                            (
                                item.item_name ??
                                item.itemName ??
                                item.code
                            ) +

                            " — " +

                            getMonthName(
                                selectedDashboardMonth
                            ),

                        data:[

                            opening,

                            stockIn,

                            stockOut,

                            current

                        ],

                        borderWidth:1

                    }]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    plugins:{

                        legend:{

                            display:true

                        }

                    },

                    scales:{

                        y:{

                            beginAtZero:true

                        }

                    }

                }

            }
        );

}


function clearDashboardGraph(){

    const info =
        document.getElementById(
            "graphInfo"
        );


    if(info)
        info.innerHTML =
            "Select an Item ID to see its graph.";


    if(dashboardChart){

        dashboardChart.destroy();

        dashboardChart = null;

    }

}


// =====================================
// NAVIGATION
// =====================================

function saveSelectedItem(){

    if(!selectedItem){

        alert(
            "Please enter a valid Item ID first."
        );

        return false;

    }


    localStorage.setItem(
        "dashboardSelectedItem",
        selectedItem.code
    );


    return true;

}


function openMasterView(){

    if(selectedItem)
        saveSelectedItem();


    window.location.href =
        "Master List .html";

}


function newMasterEntry(){

    window.location.href =
        "Master List .html";

}


function openStockInView(){

    if(!saveSelectedItem())
        return;


    localStorage.setItem(
        "historyViewType",
        "stockIn"
    );


    window.location.href =
        "Stock In History.html";

}


function newStockIn(){

    if(selectedItem){

        localStorage.setItem(
            "stockInSelectedItem",
            selectedItem.code
        );

    }


    window.location.href =
        "Stock In .html";

}


function openStockOutView(){

    if(!saveSelectedItem())
        return;


    localStorage.setItem(
        "historyViewType",
        "stockOut"
    );


    window.location.href =
        "Stock Out History.html";

}


function newStockOut(){

    if(selectedItem){

        localStorage.setItem(
            "stockOutSelectedItem",
            selectedItem.code
        );

    }


    window.location.href =
        "Stock out .html";

}


function openCostView(){

    if(selectedItem){

        localStorage.setItem(
            "dashboardSelectedItem",
            selectedItem.code
        );

    }
    else{

        localStorage.removeItem(
            "dashboardSelectedItem"
        );

    }


    window.location.href =
        "Cost .html";

}


function newCostEntry(){

    if(selectedItem){

        localStorage.setItem(
            "costSelectedItem",
            selectedItem.code
        );

    }


    window.location.href =
        "Cost .html";

}


function openDemandView(){

    if(!saveSelectedItem())
        return;


    localStorage.setItem(
        "demandViewItem",
        selectedItem.code
    );


    window.location.href =
        "Demand History.html";

}


function newDemandEntry(){

    if(selectedItem){

        localStorage.setItem(
            "demandSelectedItem",
            selectedItem.code
        );

    }


    window.location.href =
        "Monthly Demand .html";

}


function openGraph(){

    if(!saveSelectedItem())
        return;


    window.location.href =
        "Graphs.html";

}


function openUserProfile(){

    window.location.href =
        "User Profile.html";

}


// =====================================
// LOAD SAVED ITEM
// =====================================

function loadSavedItem(){

    const saved =
        localStorage.getItem(
            "dashboardSelectedItem"
        );


    if(saved){

        const item =
            getItemByCode(
                saved
            );


        if(item){

            selectedItem =
                item;


            const box =
                document.getElementById(
                    "itemSearch"
                );


            if(box)
                box.value =
                    item.code;

        }

    }


    updateMonthUI();

    updateDashboard();

}


// =====================================
// REFRESH
// =====================================

async function refreshDashboardData(){

    await loadDashboardFromSupabase();

}


// =====================================
// PAGE LOAD
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateMonthUI();


        const picker =
            document.getElementById(
                "dashboardMonth"
            );


        if(picker){

            picker.addEventListener(
                "change",
                () => {

                    setDashboardMonth(
                        picker.value
                    );

                }
            );

        }


        loadDashboardFromSupabase();

    }
);


// =====================================
// AUTO REFRESH
// =====================================

document.addEventListener(
    "visibilitychange",
    () => {

        if(
            document.visibilityState ===
            "visible"
        ){

            refreshDashboardData();

        }

    }
);
