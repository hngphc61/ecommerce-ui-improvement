/* code goes here */
// Steps 2-4: select by ID and change values/content.
var msg = document.getElementById("msgArea");
msg.value = "here is some text";
var title = document.getElementById("pageTitle");
title.innerHTML = "New Title";
document.getElementById("pageTitle").innerHTML = "Even newer title";

// Steps 5-7: compare markup, visible text and an attribute.
msg.value = document.getElementById("first").innerHTML;
msg.value = document.getElementById("first").innerText;
msg.value = "My class is " + msg.getAttribute("class");

// Steps 8-9: select by tag name and iterate through the collection.
var elem = document.getElementsByTagName("textarea");
elem[0].value = "selected by tag name";
elem = document.getElementsByTagName("span");
for (var i = 0; i < elem.length; i++) {
    msg.value += "\n" + elem[i].innerText;
}

// Step 10: select elements sharing a class.
msg.value = "";
var counts = document.getElementsByClassName("count-number");
for (var i = 0; i < counts.length; i++) {
    msg.value += "\n" + counts[i].innerText;
}

// Steps 11-12: use CSS selectors for the first match or all matches.
var ps = document.querySelector("#first p");
msg.value = ps.innerHTML;
ps = document.querySelectorAll("#first p");
for (var i = 0; i < ps.length; i++) {
    msg.value += ps[i].innerHTML + "\n";
}

// Steps 13-14: hide the textarea using Bootstrap and set a background.
msg.setAttribute("class", "hidden");
document.getElementById("features").style.backgroundColor = "green";
