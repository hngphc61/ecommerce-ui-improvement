/* put your event code here */
// Wait until the DOM is ready, then chain the event handlers.
$(function () {
    $(".panel")
        .on("mousemove", function (e) {
            $("#message").html("x=" + e.pageX + " y=" + e.pageY);
        })
        .on("mouseleave", function (e) {
            $("#message").html("goodbye!");
        })
        .on("click", function () {
            $("#message").html("stopped move reporting");
            $(".panel").off("mousemove");
        });
});

