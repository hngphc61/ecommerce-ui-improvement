// define functions in this file
// This variable has global scope.
var boxClass = "movingDiv";

function outputBox(num) {
    // Keep box local to this function in the submitted version.
    var box = "<div class='" + boxClass + "' id='div" + num + "'>";
    box += "This is div " + num;
    box += "</div>";
    return box;
}

