document.getElementById("newClassForm").addEventListener("submit", (event) =>{
    event.preventDefault();
    const courseSeason = $("#semester").val()[0];
    const courseYear = $("#semester").val()[1];
    const fromTime = $("#fromTime").val();
    const toTime = $("#toTime").val();
    const className = $("#className").val();
    const capacity = $("#classCapacity").val();
    const courseNum = $("#courseNum").val();
    const instructor = $("#courseInstructor").val();
    const department = $("#dept").val();
    const courseDesc = $("#courseDesc").val();
    const enrollmentDate = $("#enrDt").val();
    const moBtn = $("#moBtn").val();
    const tuBtn = $("#tuBtn").val();
    const weBtn = $("#weBtn").val();
    const thBtn = $("#thBtn").val();
    const frBtn = $("#frBtn").val();
    $.post('/api/createClass',{
        season: courseSeason,
        year: courseYear,
        fromTime: fromTime,
        toTime: toTime,
        name: className,
        capacity: capacity,
        number: courseNum,
        instructor: instructor,
        department: department,
        courseDesc: courseDesc,
        enrollmentDate: enrollmentDate,
        moBtn: moBtn,
        tuBtn: tuBtn,
        weBtn: weBtn,
        thBtn: thBtn,
        frBtn: frBtn
    })
    .done((data) =>{
        console.log(data);
    })
});