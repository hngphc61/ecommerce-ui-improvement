$(function () {
    $(".animLoading").hide();

    $("#consume").on("click", function () {
        var button = $(this);
        button.prop("disabled", true);
        $("#results ul").empty();
        $(".animLoading").stop(true, true).show();
        var url = "http://www.randyconnolly.com/funwebdev/services/travel/cities.php";
        if (window.location.protocol === "https:") {
            url = "data/cities.json";
            $("#dataSource").text("HTTPS: using the bundled JSON snapshot from the textbook service.");
        } else {
            $("#dataSource").text("Using the live textbook HTTP service.");
        }

        $.get(url, null, null, "json")
            .done(function (data) {
                $.each(data, function (index, value) {
                    $("<li/>").text(value.name).appendTo("#results ul");
                });
            })
            .fail(function (xhr, status, error) {
                alert("failed loading data - status=" + status + " error=" + error);
            })
            .always(function () {
                $(".animLoading").fadeOut("slow");
                button.prop("disabled", false);
            });
    });
});
