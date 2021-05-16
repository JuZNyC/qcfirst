$(document).ready(()=>{
    if(localStorage.getItem("token") != null){
        $("#navbarNavAltMarkup").append('<a class="nav-item nav-link active" href="/" onclick="return removeJWT()"><strong>Logout</strong></a>');
      }
    if(localStorage.getItem("classId") != null){
        $("#cid").val(localStorage.getItem("classId"));
        $.get(`/api/course?classId=${localStorage.getItem("classId")}`)
        .done((data)=>{
            const resultArea = $(".ibox-content");
            $("#classNameFaculty").text(data.name);
            $("#classCapFaculty").text(`${data.roster.length}/${data.capacity}`);
            console.log(data.roster.length === 0)
            if(data.roster.length === 0){
                console.log("made it to the if");
                resultArea.append('<div>',{class: "search-result"})
                .append($('<h3>', {
                    text:`No students Registered`
                }));
            }
            else{
                resultArea.append($("<div>", {class:"hr-line-dashed"}));
                console.log('Made it to the else');
                $.each(data.roster, (idx, val) =>{
                    var newResult = $('<div>', {class:"search-result"})
                    .append($('<h3>', {
                        text:`${val.firstName} ${val.lastName}`
                    })
                    )
                    .append($('<p>',{
                        text: val.email
                    }))
                    resultArea.append(newResult);
                    resultArea.append($("<div>", {class:"hr-line-dashed"}))
                })
            }
        })
      }
})
function removeJWT(){
    localStorage.removeItem("token");
}