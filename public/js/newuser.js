const email = document.querySelector("#qMail");
const pswd = document.querySelector("#password");
const confPass = document.querySelector("#passwordConfirm");
const firstN = document.querySelector("#firstName");
const lastN = document.querySelector("#lastName");

function checkForm(){
    
    var foundErrors = false; // This is used to check if there are any errors. If there are, this is set to true and we don't POST the form
    var posErrors = {
        invAdd:"Invalid email address. Must be QC Email", 
        match:"Passwords do not match."
        };

    // The email must be a queens email
    const re = /^[a-zA-Z0-9._-]+@(qmail|qc)+\.cuny.edu$/;
    let passErr = false;
    if(!re.test(email.value)){
        handleError(email, posErrors.invAdd);
        foundErrors = true; 
    }
    else{
        email.classList.remove("error");
        email.classList.add("success");
        $(email).next().removeClass("error");
        $(email).next().addClass("success");
    }
    if(pswd.value != confPass.value){
        handleError(pswd, posErrors.match);
        handleError(confPass, posErrors.match);
        foundErrors = true; 
    }
    else{
        pswd.classList.remove("error");
        pswd.classList.add("success");
        $(pswd).next().removeClass("error");
        $(pswd).next().addClass("success");
        confPass.classList.remove("error");
        confPass.classList.add("success");
        $(confPass).next().removeClass("error");
        $(confPass).next().addClass("success");
    }
    // If we didn't find any errors, this will send a post request to /api/createUser with all the filled in forms
    // Depending on the response, we will either be redirected to the main page or an error alert will apear
    if(!foundErrors){
        const qMail = document.getElementById('qMail').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const password = document.getElementById('password').value.trim();
        const TeacherStudent = document.getElementById('TeacherStudent').value.trim();
        $.post('/api/createUser', {
            qMail: qMail, 
            firstName:firstName,
            lastName:lastName,
            password:password,
            TeacherStudent:TeacherStudent
        })
        .done((data)=>{
            // console.log(data.status)
            if(data.status == 'ok/redirect'){
                localStorage.setItem('fromRedirect', 'Created a new user');
                window.location.replace(data.url);
                // console.log(localStorage.getItem("fromRedirect"));
            }
        else if(data.status == 'error'){
                alert(data.error)
            }
        })
        .fail((error)=>{
            alert('Something went wrong, please try again');
        });
    }
    
}
document.getElementById("regForm").addEventListener("submit", function(event) {
    event.preventDefault();
    var err = checkForm();
 });

 function handleError(elmt, err){
     elmt.classList.remove("success");
     elmt.classList.add("error");
    //  console.log(elmt.nextSibling);
     $(elmt).next().removeClass("success");
     $(elmt).next().addClass("error");
     $(elmt).next().text(err);
 }
 
