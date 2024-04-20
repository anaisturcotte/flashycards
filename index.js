// Imports
const express = require('express')
const app = express()
const port = 5100

app.use(express.static('public'));

// Listen on Port 5000
app.listen(port, () => console.info(`App listening on port ${port}`))