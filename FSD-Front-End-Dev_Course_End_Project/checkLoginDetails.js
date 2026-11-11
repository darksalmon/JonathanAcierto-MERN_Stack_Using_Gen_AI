
function checkLoginDetails() {
    let emailId = document.getElementById("emailId").value;
    let password = document.getElementById("password").value;
    // if you want to do custom validation you can write the logic 
    // here also 
    // if we check multiple account from server side technology 
    if(emailId == "user@email.com" && password == "12345") {
        //alert("Login Successful");
        // sessionStorage is a 
        // pre defined object which helps to share 
        // the data between different pages of same application
        sessionStorage.setItem("emailId", emailId)
        return true;
    }else {
        // todo: remove following before prod release, but leave for code review testing
        alert("Login Failed (Test User: user@email.com , Password: 12345)");
        return false;
    }
}