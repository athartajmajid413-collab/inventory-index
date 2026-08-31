// =====================================
// USER PROFILE
// SUPABASE AUTH VERSION
// MECAS ENGINEERING PVT LIMITED SUNDAR
// =====================================


// =====================================
// LOAD USER PROFILE
// =====================================

async function loadUserProfile(){

    try{

        // =================================
        // GET CURRENT SUPABASE USER
        // =================================

        const result =
            await supabaseRequest(
                "users",
                "GET",
                null,
                "?select=*&auth_user_id=eq." +
                encodeURIComponent(
                    localStorage.getItem("auth_user_id") || ""
                )
            );


        if(!result.success){

            console.error(
                "User Profile Error:",
                result.error
            );

            return;

        }


        const users =
            result.data || [];


        if(users.length === 0){

            console.warn(
                "User profile not found."
            );

            return;

        }


        const user =
            users[0];


        // =================================
        // SHOW USER INFORMATION
        // =================================

        setProfileText(
            "profileUsername",
            user.username || "-"
        );


        setProfileText(
            "profileFullName",
            user.full_name || "-"
        );


        setProfileText(
            "profileEmail",
            user.email || "-"
        );


        setProfileText(
            "profileRole",
            user.role || "User"
        );


        setProfileText(
            "profileCreated",
            user.created_at
            ? new Date(
                user.created_at
              ).toLocaleDateString(
                "en-GB"
              )
            : "-"
        );


        // =================================
        // SAVE USER INFO
        // =================================

        localStorage.setItem(
            "current_username",
            user.username || ""
        );


        localStorage.setItem(
            "current_full_name",
            user.full_name || ""
        );


        localStorage.setItem(
            "current_email",
            user.email || ""
        );


        localStorage.setItem(
            "current_role",
            user.role || "User"
        );


        console.log(
            "✅ User profile loaded:",
            user
        );


    }
    catch(error){

        console.error(
            "Profile Load Error:",
            error
        );

    }

}


// =====================================
// SET PROFILE TEXT
// =====================================

function setProfileText(
    id,
    value
){

    const element =
        document.getElementById(id);


    if(element){

        element.textContent =
            value;

    }

}


// =====================================
// UPDATE PASSWORD
// =====================================

async function updatePassword(){

    const newPassword =
        document.getElementById(
            "newPassword"
        ).value;


    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        ).value;


    const message =
        document.getElementById(
            "passwordMessage"
        );


    if(!newPassword){

        message.textContent =
            "❌ Enter new password.";

        return;

    }


    if(newPassword.length < 6){

        message.textContent =
            "❌ Password must be at least 6 characters.";

        return;

    }


    if(newPassword !== confirmPassword){

        message.textContent =
            "❌ Passwords do not match.";

        return;

    }


    // =================================
    // GET CURRENT EMAIL
    // =================================

    const email =
        localStorage.getItem(
            "current_email"
        );


    if(!email){

        message.textContent =
            "❌ User email not found.";

        return;

    }


    try{

        // =================================
        // SEND PASSWORD RESET EMAIL
        // =================================

        const response =
            await fetch(
                SUPABASE_URL +
                "/auth/v1/recover",
                {

                    method:"POST",

                    headers:{

                        "apikey":
                            SUPABASE_KEY,

                        "Content-Type":
                            "application/json"

                    },

                    body:JSON.stringify({

                        email:email

                    })

                }
            );


        const result =
            await response.json();


        if(!response.ok){

            console.error(
                "Password Reset Error:",
                result
            );


            message.textContent =
                "❌ Password reset email نہیں بھیجی جا سکی۔";


            return;

        }


        message.style.color =
            "green";


        message.textContent =
            "✅ Password reset link آپ کے Email پر بھیج دیا گیا ہے۔";


        document.getElementById(
            "newPassword"
        ).value = "";


        document.getElementById(
            "confirmPassword"
        ).value = "";


    }
    catch(error){

        console.error(
            "Password Reset Error:",
            error
        );


        message.textContent =
            "❌ Password reset میں مسئلہ آیا۔";

    }

}


// =====================================
// LOGOUT
// =====================================

async function logoutUser(){

    try{

        // =================================
        // SUPABASE LOGOUT
        // =================================

        if(
            typeof supabaseLogout ===
            "function"
        ){

            await supabaseLogout();

        }


    }
    catch(error){

        console.error(
            "Logout Error:",
            error
        );

    }


    // =================================
    // CLEAR LOCAL USER DATA
    // =================================

    localStorage.removeItem(
        "auth_user_id"
    );

    localStorage.removeItem(
        "current_username"
    );

    localStorage.removeItem(
        "current_full_name"
    );

    localStorage.removeItem(
        "current_email"
    );

    localStorage.removeItem(
        "current_role"
    );


    // =================================
    // BACK TO LOGIN
    // =================================

    window.location.href =
        "index.html";

}


// =====================================
// BACK TO DASHBOARD
// =====================================

function backToDashboard(){

    window.location.href =
        "Dashboard.html";

}


// =====================================
// PAGE START
// =====================================

window.addEventListener(
    "load",
    function(){

        loadUserProfile();

    }
);
