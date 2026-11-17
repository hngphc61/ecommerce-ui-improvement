$(function () {
    $("#consume").on("click", function () {
        var url = "http://www.randyconnolly.com/funwebdev/services/travel/cities.php";
        if (window.location.protocol === "https:") {
            url = "data/cities.json";
            $("#dataSource").text("HTTPS: using the bundled JSON snapshot from the textbook service.");
        } else {
            $("#dataSource").text("Using the live textbook HTTP service.");
        }
        $("#results").html("<ul></ul>");
        $.get(url, function (data, status) {
            if (status === "success") {
                $.each(data, function (index, value) {
                    var li = $("<li/>").text(value.name);
                    li.appendTo("div#results ul");
                });
            }
        }, "json").fail(function (xhr, status, error) {
            $("#results").text("Failed loading cities: " + status + " " + error);
        });
    });
});
