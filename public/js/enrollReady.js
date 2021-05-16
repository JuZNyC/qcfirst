$(document).ready(()=>{
    const dayShort = {
        monday: 'Mo',
        tuesday: 'Tu',
        wednesday: 'We',
        thursday: 'Th',
        friday: 'Fr'
    };
    if(localStorage.getItem("token") != null){
      $("#navbarNavAltMarkup").append('<a class="nav-item nav-link active" href="/" onclick="return removeJWT()"><strong>Logout</strong></a>');
    }
    if(localStorage.getItem("classId") != null){
        $("#cid").val(localStorage.getItem("classId"));
        $.get(`/api/course?classId=${localStorage.getItem("classId")}`)
        .done((data)=>{
            // localStorage.removeItem("classId");
            var comDays = "";
            $.each(data.schedule.days, (idx, val) =>{
                comDays = comDays.concat(`${dayShort[val]}/`);
            })
            comDays = comDays.slice(0, -1);
            console.log(`${data.schedule.from} - ${data.schedule.to}`);
            $("#className").attr("placeholder", data.name);
            $("#classCapacity").attr("placeholder", `${data.roster.length}/${data.capacity}`);
            $("#enrmntDate").attr("placeholder", new Date(data.enrollmentDeadline).toDateString());
            $("#courseDesc").attr("placeholder", data.description);
            $("#semester").attr("placeholder", `${data.semester.season.charAt(0).toUpperCase() + data.semester.season.slice(1)} ${data.semester.year}`);
            $("#scheduleDays").attr("placeholder", `${comDays}`);
            $("#scheduleTime").attr("placeholder", `${data.schedule.from} - ${data.schedule.to}`);
        })
        }
  });
  function removeJWT(){
    localStorage.removeItem("token");
  }