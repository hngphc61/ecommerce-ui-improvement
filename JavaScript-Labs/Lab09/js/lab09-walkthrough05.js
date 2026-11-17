
// this variable has global scope
var boxClass = 'movingDiv';

function outputBox(num) {
   var box = "<div class='" + boxClass + "' id='div" + num + "'>";
   box += "This is div " + num;
   box += "</div>";
   return box;
}

/* your code goes here */
// Wait until the page has loaded: div1 is created later in the body.
window.addEventListener("load", function () {
   var divToGet = document.getElementById("div1");
   alert(divToGet.innerHTML);
});
