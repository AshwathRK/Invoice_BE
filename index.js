const express = require('express');

require('./db');

const HTTP_Server = express();

HTTP_Server.listen(3000, (error) => {
    if (error) {
        console.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
    console.log('✅ Server is running on port 3000');
});