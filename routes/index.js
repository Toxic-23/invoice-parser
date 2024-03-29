import express from 'express'
import { uploadExcelFile } from '../controllers/uploadController.js'

const router = express.Router()

router.post('/upload', uploadExcelFile)

export default router
