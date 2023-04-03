const express = require('express'); // Import express
const app = express();              // Create express app
const port = 3000;                  // Define port

// Start server
app.get('/', (req, res) => res.send('Hello World!'));


// Start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));