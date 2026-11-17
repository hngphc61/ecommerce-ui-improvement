/* code goes here */
// Step 6: inspect every child node, including whitespace text nodes.
var stories = document.getElementById("stories");
for (var i = 0; i < stories.childNodes.length; i++) {
    console.log("child " + i + " =" + stories.childNodes[i] +
        " nodeType=" + stories.childNodes[i].nodeType);
}

// Step 7 specifies #first: style element nodes, skipping text nodes.
var first = document.getElementById("first");
for (var i = 0; i < first.childNodes.length; i++) {
    var child = first.childNodes[i];
    if (child.nodeType === 1) {
        child.style.backgroundColor = "yellow";
    }
}
