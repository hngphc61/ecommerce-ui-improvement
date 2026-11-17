/* code goes here */
var btn = document.getElementById("testButton");
var transitionTimer;

function simpleHandler(event) {
    var content = document.getElementById("content");
    // Cancel a pending change if the user clicks again quickly.
    clearTimeout(transitionTimer);
    if (btn.innerHTML === "Hide") {
        btn.innerHTML = "Show";
        content.className = "makeItDisappear";
        transitionTimer = setTimeout(function () {
            content.style.display = "none";
        }, 1000);
    } else {
        btn.innerHTML = "Hide";
        content.style.display = "block";
        transitionTimer = setTimeout(function () {
            content.className = "makeItNormal";
        }, 500);
    }
}

btn.addEventListener("click", simpleHandler);

var img = document.getElementById("mainImage");
img.addEventListener("mouseover", function (event) {
    img.className = "makeItGray";
});
img.addEventListener("mouseout", function (event) {
    img.className = "makeItNormal";
});

