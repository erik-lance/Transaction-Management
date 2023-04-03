const express = require('express'); // Import express
const app = express();              // Create express app
const port = 3000;                  // Define port

// Serve static files
app.use(express.static('public'));


// Start server
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


// Start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));