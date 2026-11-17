/* Exercise 10.2 - Basic selectors */
var msg = $("#msgArea");
msg.val("here is some new text");

// The exercise replaces all content inside #first, including the textarea.
$("#first").html("new Title");

// At this point #msgArea no longer exists, so this selection is empty.
$("#msgArea").val("My class is " + $("#msgArea").attr("class"));

var buttons = $("button");
buttons.css("background-color", "red");

var temp = $("body");
temp.css("background-color", "ivory");

$(".center-icons").addClass("selected");
