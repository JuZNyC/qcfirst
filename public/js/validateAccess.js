
if(localStorage.getItem("token") != null){
    $.post('/api/validateAccess', {token: localStorage.getItem("token")})
    .done((data)=>{
        if(data.status=='redirect'){
            window.location.replace(data.url);
            alert('You are not supposed to be here...\nRedirecting');
        }
        else if(data.status == 'error'){
            localStorage.removeItem("token");
            window.location.replace('/');
            alert(`Not cool: ${data.details}`)
        }
    })
    .fail((error) =>{
        localStorage.removeItem("token");
        window.location.replace('/');
        alert('Not cool')
    })
}
else{
    document.location = 'index.html';
    alert('Must be logged in')
}