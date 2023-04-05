$(document).ready(function() {
    // Populate table with data returned from /moviesData
    $("#moviesTable").DataTable({
        ajax: {
            url: "/moviesData",
            dataSrc: "data"
        },
        columns: [
            { data: "id" },
            { data: "name" },
            { data: "year" },
            { data: "rank" },
            { data: "genre" }
        ],
        initComplete: function () {
            $("#moviesTable").show();
        },
        beforeSend: function () {
            $("#loadingScreen").show();
            $("#moviesTable").hide();
        },
        complete: function () {
            $("#loadingScreen").hide();
            $("#moviesTable").show();
        }
    });

});