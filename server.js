const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to search hurricanes by name
app.get('/api/hurricanes', (req, res) => {
    const hurricaneName = req.query.name.toLowerCase();  // Get hurricane name from query parameter
    const results = [];

    fs.createReadStream('./storms.csv')
        .pipe(csv())
        .on('data', (data) => {
            // Convert name to lowercase for case-insensitive search
            if (data.name.toLowerCase() === hurricaneName) {
                results.push(data);  // Add the matching hurricane to results
            }
        })
        .on('end', () => {
            res.json(results);  // Send the matching hurricanes as a JSON response
        });
});

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
