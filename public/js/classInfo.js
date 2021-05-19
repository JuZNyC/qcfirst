$(document).ready(()=>{
    if(localStorage.getItem("token") != null){
        $("#navbarNavAltMarkup").append('<a class="nav-item nav-link active" href="/" onclick="return removeJWT()"><strong>Logout</strong></a>');
      }
    if(localStorage.getItem("classId") != null){
        $("#cid").val(localStorage.getItem("classId"));
        $.get(`/api/course?classId=${localStorage.getItem("classId")}`)
        .done((data)=>{
            const resultArea = $(".ibox-content");
            const concSem = data.semester.season.slice(0,2) + data.semester.year.slice(2,);
            $("#classNameFaculty").text(data.name);
            $("#classCapFaculty").text(`${data.roster.length}/${data.capacity}`);
            $("#semester").text(`${data.semester.season} ${data.semester.year}`);
            $("#semToSend").val(concSem); 
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

      // Dropdown menu of teachers classes
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
            });
            console.log(`new link: ${newLink}`)
            menu.append(newLink);
        })
        }
        else{
            console.log(`No data returned, appending new thing`);
            var newLink = $('<a>',{
                class:'dropdown-item',
                href: "#",
                value:'Nope',
                text: 'You have no classes'
            });
            menu.append(newLink);
        }
      })

      // Delete a class functionality
      $("#deleteClass").click(()=>{
        if(confirm('Are you sure you would like to delete this class?')){
            $.ajax({
                url:`/api/${localStorage.getItem("classId")}/deleteCourse/${$("#semToSend").val()}`,
                type: 'DELETE',
                success:((result)=>{
                    if(result.status == 'ok/redirect'){
                        sessionStorage.setItem('fromRedirectSuccess', `${result.details}`);
                        window.location.replace(result.url);
                    }
                    else if(data.status == 'error'){
                        sessionStorage.setItem('fromRedirectError', `${result.details}`);
                        window.location.replace(result.url);
                    }
                })
            })}
        else{
            return false; 
        }
        });
})
function removeJWT(){
    localStorage.removeItem("token");
}

function passOID(oid){
    localStorage.setItem("classId", oid);
    return true;
}

