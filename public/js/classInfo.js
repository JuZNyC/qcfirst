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
            if(data.roster.length === 0){
                resultArea.append('<div>',{class: "search-result"})
                .append($('<h3>', {
                    text:`No students Registered`
                }));
            }
            else{
                resultArea.append($("<div>", {class:"hr-line-dashed"}));
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

    //   TODO Get dropdown menu working
      $.get(`/api/course?token=${localStorage.getItem("token")}`)
      .done((data)=>{
        const menu = $("#classesDropdown");
        if(data.length != 0){
            console.log(`data returned: ${data}`);
            $.each(data, (idx, val) =>{
            var newLink = $('<a>',{
                class:'dropdown-item',
                href:`/classInfo.html`,
                text:val.name,
                onclick:`return passOID('${val._id}')`
            })
            console.log(`new link: ${newLink}`)
            menu.append(newLink);
        })
        }
        else{
            console.log(`No data returned, appending new thing`);
            menu.append($('<a>'),{
                class:'dropdown-item',
                href: "#",
                value:'Nope',
                text: 'You have no classes'
            })
        }
      })
})
function removeJWT(){
    localStorage.removeItem("token");
}

function passOID(oid){
    localStorage.setItem("classId", oid);
    return true;
}