function enroll(){
  $.post('/api/enroll',{
    classId: localStorage.getItem("classId"),
    token: localStorage.getItem("token")
  })
  .done((data) =>{
    if(data.status == 'ok/redirect'){
      localStorage.setItem('fromRedirectSuccess', 'Enrolled in a class');
      localStorage.removeItem('classId');
      window.location.replace(data.url);
    }
    else if(data.status == 'error'){
      localStorage.setItem('fromRedirectError', data.details);
      localStorage.removeItem('classId');
      window.location.replace('/studenthomepage.html')
    }
  })
  .fail((error) =>{
    alert('something went wrong, please wait and try again');
    localStorage.removeItem('classId');
  })
}

document.getElementById("enroll").addEventListener("click", (event) =>{
  event.preventDefault();  
  enroll();
});