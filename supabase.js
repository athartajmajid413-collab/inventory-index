// =====================================
// SUPABASE CONNECTION
// MECAS ENGINEERING PVT LIMITED SUNDAR
// =====================================

const SUPABASE_URL =
    "https://tncmmkyrpzlkupdnkyqm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_e6j_EkJescicSS3nEOnscg_INwxeukT";


// =====================================
// SUPABASE REQUEST
// =====================================

async function supabaseRequest(
    table,
    method = "GET",
    data = null,
    query = ""
){

    try{

        let options = {

            method: method,

            headers: {

                "apikey":
                    SUPABASE_KEY,

                "Authorization":
                    "Bearer " +
                    SUPABASE_KEY,

                "Content-Type":
                    "application/json",

                "Prefer":
                    "return=representation"

            }

        };


        if(data !== null){

            options.body =
                JSON.stringify(data);

        }


        let response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/" +
                table +
                query,

                options

            );


        let result =
            await response.json();


        if(!response.ok){

            console.error(
                "Supabase Error:",
                result
            );

            return {

                success: false,

                error: result

            };

        }


        return {

            success: true,

            data: result

        };

    }
    catch(error){

        console.error(
            "Supabase Connection Error:",
            error
        );

        return {

            success: false,

            error: error.message

        };

    }

}


// =====================================
// TEST CONNECTION
// =====================================

async function testSupabase(){

    console.log(
        "Testing Supabase..."
    );


    let result =
        await supabaseRequest(
            "items"
        );


    console.log(
        "Supabase Result:",
        result
    );


    if(result.success){

        console.log(
            "✅ SUPABASE CONNECTION SUCCESSFUL"
        );

        console.log(
            "Items:",
            result.data
        );

    }
    else{

        console.error(
            "❌ SUPABASE CONNECTION FAILED",
            result.error
        );

    }

}


// =====================================
// AUTO TEST
// =====================================

testSupabase();
