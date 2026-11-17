/* put your animation code here */
function removePreview() {
    $(this).removeClass("gray");
    $("#preview").remove();
}

function movePreview(e) {
    $("#preview")
        .css("top", (e.pageY - 10) + "px")
        .css("left", (e.pageX + 30) + "px");
}

$(function () {
    $("figure img").on("mouseover", function (e) {
        $("#preview").remove();
        var alt = $(this).attr("alt");
        var src = $(this).attr("src");
        var newsrc = src.replace("small", "medium");

        var preview = $('<div id="preview"></div>');
        var image = $("<img>").attr({ src: newsrc, alt: alt });
        var caption = $("<p>").text(alt);
        preview.append(image);
        preview.append(caption);
        $("body").append(preview);

        $(this).addClass("gray");
        movePreview(e);
        $("#preview").fadeIn(1000);
    });
    $("figure img").on("mouseleave", removePreview);
    $("figure img").on("mousemove", movePreview);
});

