/* try the different advanced selection calls here */
// Steps 2-3: test this selector separately, then comment it out.
// $(":password").css("background-color", "yellow");

// Select descendants of form that are the 4th, 8th, ... child of their parent.
$("form :nth-child(4n)").css("background-color", "yellow");

// Match labels whose text contains the case-sensitive substring "word".
$("label:contains('word')").css("color", "black");

