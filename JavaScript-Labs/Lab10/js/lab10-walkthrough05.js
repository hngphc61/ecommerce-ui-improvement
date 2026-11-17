/* put your DOM code here */
$(function () {
    var img = $('<img src="images/art/thumbs/13030.jpg" alt="Artwork preview">');
    var panel = $(".panel");

    // Final step of Exercise 10.5. Test one insertion method at a time.
    img.insertBefore(panel);
});

