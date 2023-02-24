exports = async function(changeEvent) {
    let enteredTime = new Date();
    let ehours = enteredTime.getHours();
    let eminutes = enteredTime.getMinutes();
    let eseconds = enteredTime.getSeconds();
    let emilliseconds = enteredTime.getMilliseconds();

    console.log(`Entered date and time: ${enteredTime.toLocaleDateString()} ${ehours}:${eminutes}:${eseconds}:${emilliseconds}`);

    console.log(JSON.stringify(changeEvent.fullDocument));
    let body = {};
    let alert = {};
    let payload = {};
    let aps = {};
    let triggerData = {};
    let token = "";
    //for (let i = 0; i <= 100; i++) {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    const xhr = new XMLHttpRequest();

    //await sleep(25);
    
    sendNotifications(changeEvent,xhr);
    //console.log("Final Ready State : ", xhr.readyState);
    
       // console.log(i);
    //}

    let exitTime = new Date();
    let xhours = exitTime.getHours();
    let xminutes = exitTime.getMinutes();
    let xseconds = exitTime.getSeconds();
    let xmilliseconds = exitTime.getMilliseconds();

    console.log(`Exited date and time: ${exitTime.toLocaleDateString()} ${xhours}:${xminutes}:${xseconds}:${xmilliseconds}`);
};


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendNotifications(changeEvent,xhr)
{
        
        let body = {};
        let alert = {};
        let payload = {};
        let aps = {};
        let triggerData = {};
        let token = "";
        
        var url = "http://4.227.137.1:5000/api/trigger";
        xhr.open('POST', url, true);
        xhr.timeout = 5000; 
        xhr.setRequestHeader('Content-Type', 'application/json');
        // xhr.setRequestHeader('x-api-key', 'df65g4df64h6d1gh3c21gh4f6ugdfertrty');
        //xhr.setRequestHeader('x-access-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzg5NTk5M2U0NTJlN2VlY2U0Zjg5OTMiLCJlbWFpbCI6ImluZm9Ad2Vhci10ZWNoLmNvbSIsImlhdCI6MTY3NTA3NzYyMiwiZXhwIjoxNjc3NjY5NjIyfQ.JdLaXWo8C2zeeKYQk5HQxHDC5iV5QG_Rqss_0G0xcGk');
        const fullDocument = changeEvent.fullDocument;
        alert = fullDocument.alertObj;
        //console.log("Alert Data",JSON.stringify(fullDocument.alertObj));
        payload = fullDocument.payload;
        //console.log("Payload Data",JSON.stringify(fullDocument.payload));
        body.alert = alert;
        body.payload = payload;
        body.sound = "chime.aiff";
        console.log("Body Data", JSON.stringify(body));
        triggerData.aps = body;
        token = fullDocument.token;
        triggerData.token = token;
        console.log("Trigger Data", JSON.stringify(triggerData));

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                //console.log(JSON.parse(xhr.responseText));
                return JSON.parse(xhr.readyState);
                //xhr.send(JSON.stringify(triggerData));
              
            }
            else if(xhr.readyState==3){
              
            }
            else if (xhr.readyState==2){
                console.log("Final State :", JSON.stringify(xhr.readyState));
            }
            //console.log(JSON.stringify(xhr.readyState)); 
        };
        
        xhr.send(JSON.stringify(triggerData));
        console.log(xhr.readyState);
}