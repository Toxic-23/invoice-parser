import express from 'express'
import routes from './routes/index.js'
import { errorHandler } from './services/errorService.js'

const app = express()
const port = process.env.PORT || 3000

app.use('/', routes)
app.use(errorHandler)

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
export default server
