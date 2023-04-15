$(document).ready(function () {
    console.log('Loaded webpage')
	// Grab connections
    $.ajax({
        url: "/connections",
        type: "GET",
        success: function (data) {
            // Print for now
            console.log(data);
        },
        error: function (err) {
            console.log(err);
        }
    });

});
