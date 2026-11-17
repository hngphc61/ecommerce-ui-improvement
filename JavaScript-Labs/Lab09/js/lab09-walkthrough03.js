/* code goes here */
// Create a paragraph and append it to the first section.
var first = document.getElementById("first");
var text = document.createTextNode("this is programmatically created");
var p = document.createElement("p");
p.appendChild(text);
first.appendChild(p);

// Remove the chapters item from its parent list.
var icons = document.getElementById("iconList");
icons.removeChild(document.getElementById("deleteThisOne"));
