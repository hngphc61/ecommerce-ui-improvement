
/* add code here */
var daysOfWeek = new Array("Mon", "Tues", "Wed", "Thur", "Fri");
daysOfWeek.push("Sat");
daysOfWeek.unshift("Sun");

// The completed exercise displays the array as calendar headings.
// document.write(daysOfWeek + "<br/>");
document.write("<table border='1'>");
document.write("<tr>");
for (var i = 0; i < daysOfWeek.length; i++) {
    var day;
    if (daysOfWeek[i].length < 4) {
        day = daysOfWeek[i];
    } else {
        day = "<em>" + daysOfWeek[i] + "</em>";
    }
    document.write("<th>" + day + "</th>");
}
document.write("</tr>");

// Day 1 falls on Sunday. Each row contains seven cells.
for (var weekStart = 1; weekStart <= 30; weekStart += 7) {
    document.write("<tr>");
    for (var weekday = 0; weekday < daysOfWeek.length; weekday++) {
        var date = weekStart + weekday;
        if (date <= 30) {
            document.write("<td>" + date + "</td>");
        } else {
            document.write("<td></td>");
        }
    }
    document.write("</tr>");
}
document.write("</table>");

