$(document).ready(function () {
	// Populate table with data returned from /moviesData
	$("#moviesTable").DataTable({
		ajax: {
			url: "/moviesData",
			dataSrc: "data",
		},
		columns: [
			{ data: "id" },
			{ data: "name" },
			{ data: "year" },
			{ data: "rank" },
			{ data: "genre" },
			{
				data: "id",
				render: function (data, type, row, meta) {
					return (
						'<button class="btn btn-danger delete-button" data-id="' + data + '">Delete</button>' +
						'<button class="btn btn-primary edit-button" data-id="'  + data + '">Edit</button>'
					);
				},
			},
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
		},
	});

	$("#moviesTable").on("click", ".delete-button", function () {
		var movieId = $(this).data("id");
		$.ajax({
			url: "/delete/" + movieId,
			type: "POST",
			success: function (result) {
				console.log(result);
				window.location.href = "/edit";
			},
			error: function (err) {
				console.log(err);
				alert("Error deleting movie. Please contact administrator.");
			},
		});
	});

	$("#moviesTable").on("click", ".edit-button", function () {
		var movieId = $(this).data("id");
		console.log(movieId);
		$.ajax({
			url: "/editForm/" + movieId,
			type: "GET",
			success: function (result) {
				console.log(result);
				window.location.href = "/editForm/" + movieId;
			},
			error: function (err) {
				console.log(err);
				alert("Error editing movie.");
			},
		});
	});
});
