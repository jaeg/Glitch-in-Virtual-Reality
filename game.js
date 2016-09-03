function addMessage(from, message){
  var messageLog = document.getElementById("messageLog");
  var currentMessageLogText = messageLog.innerHTML;

  var newMessage = "<b>"+from+"</b>: "+message +"</br>";

  currentMessageLogText = currentMessageLogText + newMessage;

  messageLog.innerHTML = currentMessageLogText;
  console.log(messageLog);
}


addMessage("GM","Test");
addMessage("GM","Test2");
addMessage("GM","Test3");
