$(document).ready(function () {
    console.log('Loaded webpage')
	// Grab connections
    $.ajax({
        url: "/connections",
        type: "GET",
        success: function (data) {
            // Print for now
            console.log(data);

            $.each(data, function(index, value) {
              console.log("Checking Availabiltiy");
              const className = ".avail" + (index + 1);
              if (value == 1) {
                status = "ONLINE";
                $(className).css('color', 'green');
              }
              else {
                status = "OFFLINE";
                $(className).css('color', 'grey');
              }
              $(className).text(status);
            });

        },
        error: function (err) {
            console.log(err);
        }
    });

});
