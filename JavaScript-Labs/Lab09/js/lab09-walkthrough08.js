/* code goes here */
function init() {
    document.getElementById("sampleForm").addEventListener("submit", checkForEmptyFields);
}

window.addEventListener("load", init);

function checkForEmptyFields(e) {
    var errorArea = document.getElementById("errors");
    errorArea.className = "hidden";
    errorArea.textContent = "";

    var cssSelector = "input[type=text],input[type=password]";
    var fields = document.getElementById("sampleForm").querySelectorAll(cssSelector);
    var fieldList = [];
    for (var i = 0; i < fields.length; i++) {
        if (fields[i].value.trim() === "") {
            e.preventDefault();
            fieldList.push(fields[i].id);
        }
    }

    if (fieldList.length > 0) {
        var p = document.createElement("p");
        p.textContent = "The following fields can't be empty: " + fieldList.join(", ");
        errorArea.appendChild(p);
        errorArea.className = "visible";
    }
}

