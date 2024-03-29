import express from 'express'
import routes from './routes/index.js' // Import the routes file
import { errorHandler } from './services/errorService.js'

const app = express()
const port = process.env.PORT || 3000

// Use the routes
app.use('/', routes)
app.use(errorHandler)

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
