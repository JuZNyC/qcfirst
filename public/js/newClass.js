function checkForm(){
    const courseSeason = $("#semester").val()[0];
    const courseYear = $("#semester").val()[1];
    const fromTime = $("#fromTime");
    const toTime = $("#toTime");
    const className = $("#className");
    const capacity = $("#classCapacity");
    const courseNum = $("#courseNum");
    const instructor = $("#courseInstructor").val();
    const department = $("#dept").val();
    const courseDesc = $("#courseDesc").val();
    const enrollmentDate = $("#enrDt").val();
    const moBtn = $("#moBtn").val();
    const tuBtn = $("#tuBtn").val();
    const weBtn = $("#weBtn").val();
    const thBtn = $("#thBtn").val();
    const frBtn = $("#frBtn").val();
    const timeBlock = $("#timeBlock");
    var foundErrors = false; // This is used to check if there are any errors. If there are, this is set to true and we don't POST the form
    var posErrors = {
        invName:"Invalid Course Name", 
        invCapacity:"Invalid capacity",
        invCourseNum:"Invalid Course Number",
        invDepartment:"Invalid Department",
        invTimes:"'From' must be before 'To'"
    };

    const inputName = /[a-zA-Z]{2,}/;
    const inputCap = /\d{1,3}/;
    if(!inputName.test(className.val())){
        handleError(className, posErrors.invName);
        foundErrors = true;
    }
    else{
        handleSuccess(className);
    }

    if(!inputCap.test(capacity.val())){
        handleError(capacity, posErrors.invCapacity);
        foundErrors = true;
    }
    else{
        handleSuccess(capacity);
    }

    if(!inputCap.test(courseNum.val())){
        handleError(courseNum, posErrors.invCourseNum);
        foundErrors = true;
    }
    else{
        handleSuccess(courseNum);
    }
    console.log(fromTime.val() >= toTime.val());
    if(fromTime.val() >= toTime.val()){
        handleError(timeBlock, posErrors.invTimes);
        foundErrors = true;
    }
    else{
        handleSuccess(timeBlock);
    }
    if(!foundErrors){
        $.post('/api/createClass',{
            season: courseSeason,
            year: courseYear,
            fromTime: fromTime.val(),
            toTime: toTime.val(),
            name: className.val(),
            capacity: capacity.val(),
            number: courseNum.val(),
            instructor: instructor,
            department: department,
            courseDesc: courseDesc,
            enrollmentDate: enrollmentDate,
            moBtn: moBtn,
            tuBtn: tuBtn,
            weBtn: weBtn,
            thBtn: thBtn,
            frBtn: frBtn,
            token: localStorage.getItem("token")
        })
        .done((data) =>{
            console.log(data.status);
            if(data.status == 'ok/redirect'){
                sessionStorage.setItem('fromRedirect', 'Created a new class');
                window.location.replace(data.url);
            }
            else if(data.status == 'error'){
                alert(data.error);
            }
        })
        .fail((error) =>{
            alert('Something went wrong, please wait and try again');
        })
    }
}

document.getElementById("newClassForm").addEventListener("submit", (event) =>{
    event.preventDefault();
    checkForm();
});

function handleError(elmt, err){
    elmt.removeClass("success");
    elmt.addClass("error");
    elmt.next().removeClass("success");
    elmt.next().addClass("error");
    elmt.next().text(err);
}

function handleSuccess(elmt){
    elmt.removeClass("error");
    elmt.addClass("success");
    elmt.next().removeClass("error");
    elmt.next().addClass("success");
}