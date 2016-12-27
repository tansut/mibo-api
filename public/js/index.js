$(document).ready(function () {
    function button() {
        $("button").trigger("click");
    }
    setTimeout(button, 500);
});