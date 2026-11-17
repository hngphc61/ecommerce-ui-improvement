var boxClass = "movingDiv";

function outputBox(num) {
   var box = "<div class='" + boxClass + "' id='div" + num + "'>";
   box += "This is div " + num;
   box += "</div>";
   return box;
}

window.addEventListener("load", function () {
   var divs = document.querySelectorAll(".movingDiv");
   for (var i = 0; i < divs.length; i++) {
      divs[i].addEventListener("mouseover", function (e) {
         // Set a breakpoint on the following line to inspect e and e.target.
         alert("triggered by " + e.target.id);
      });
   }
});
