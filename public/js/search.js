document.getElementById("searchBox").addEventListener("submit", (event) =>{
    event.preventDefault();
    getData();
});

function getData(){
    const href = window.location.pathname == '/facultyhomepage.html' ? 'classinfo.html' : 'enroll.html';
    const dept = $("#departmentsDropdown");
    const userQuery = $("#userQuery");
    const resultArea = $("#box-of-results");
    $.get(`/api/${dept.val()}/courses?courseNum=${userQuery.val()}&token=${localStorage.getItem("token")}`)
    .done((data) =>{
        resultArea.empty();
        if(data){
            resultArea.append($("<div>", {class:"hr-line-dashed"}));
            $.each(data, (idx, val) =>{
                var newResult = $('<div>', {class:"search-result"})
                .append($('<h3>')
                .append($('<a>',{
                    href:`${href}`,
                    text: `${val.number}`,
                    onclick: `return passOID('${val._id}')`
                })))
                .append($('<p>',{
                    text: val.name
                }))
                .append($('<input>',{
                    value: val._id,
                    type:"hidden"
                }));
                resultArea.append(newResult);
                resultArea.append($("<div>", {class:"hr-line-dashed"}))
            })
        }
    })
}

function passOID(oid){
    console.log("hello")
    localStorage.setItem("classId", oid);
    return true;
}