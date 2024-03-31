import request from 'supertest'
import path from 'path'
import server from '../../app.js'
import fs from 'fs'
import { ERROR_MESSAGES as EXCEL_SERVICE_ERROR_MESSAGES } from '../../services/excelService.js'
import { ERROR_MESSAGES as UPLOAD_CONTROLLER_ERROR_MESSAGES } from '../../controllers/uploadController.js'
import { ERROR_MESSAGES as SCHEMAS_ERROR_MESSAGES } from '../../models/schemas.js'

jest.spyOn(console, 'error').mockImplementation(() => {})

const EXCEL_TABLE_HEADER =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const invoicingMonth = '2023-09'

const invoicingMonthWrong = '2023-08'
describe('POST /upload', () => {
    afterAll((done) => {
        server.close(done)
    })

    it('should return 200 if there is valid file with records', async () => {
        const fileDataPath = path.join(__dirname, '../fixtures/file.xlsx')
        const binaryData = fs.readFileSync(fileDataPath)
        const res = await request(server)
            .post('/upload')
            .set('Content-Type', EXCEL_TABLE_HEADER)
            .send(binaryData)
            .query({ invoicingMonth })
            .expect(200)
        expect(res.body.currencyRates.length).toBe(3)
        expect(res.body.invoicesData.length).toBe(16)
        expect(res.body.InvoicingMonth).toBe(invoicingMonth)
    })

    it('should return 200 if there is valid file with an additinal headings and currency rates', async () => {
        const fileDataPath = path.join(
            __dirname,
            '../fixtures/file_add_currecies_and_fields.xlsx',
        )
        const binaryData = fs.readFileSync(fileDataPath)
        const res = await request(server)
            .post('/upload')
            .set('Content-Type', EXCEL_TABLE_HEADER)
            .send(binaryData)
            .query({ invoicingMonth })
            .expect(200)
        expect(res.body.currencyRates.length).toBe(5)
        expect(res.body.invoicesData.length).toBe(16)
        expect(res.body.InvoicingMonth).toBe(invoicingMonth)
        res.body.invoicesData.forEach((invoice) => {
            expect(invoice).toHaveProperty('Status_old')
            expect(invoice).toHaveProperty('status_new')
        })
    })

    it('should return 200 if there is valid file with an additinal empty lines before the table', async () => {
        const fileDataPath = path.join(
            __dirname,
            '../fixtures/file_empty_lines.xlsx',
        )
        const binaryData = fs.readFileSync(fileDataPath)
        const res = await request(server)
            .post('/upload')
            .set('Content-Type', EXCEL_TABLE_HEADER)
            .send(binaryData)
            .query({ invoicingMonth })
            .expect(200)
        expect(res.body.currencyRates.length).toBe(3)
        expect(res.body.invoicesData.length).toBe(16)
        expect(res.body.InvoicingMonth).toBe(invoicingMonth)
    })

    it('should return 400 if no invoicingMonth query parameter is provided', async () => {
        await request(server).post('/upload').expect(400, {
            message: UPLOAD_CONTROLLER_ERROR_MESSAGES.NO_INVOICING_MONTH,
        })
    })

    it('should return 400 if query parameter is not equal to the table file date', async () => {
        const fileDataPath = path.join(__dirname, '../fixtures/file.xlsx')
        const binaryData = fs.readFileSync(fileDataPath)
        await request(server)
            .post('/upload')
            .set('Content-Type', EXCEL_TABLE_HEADER)
            .send(binaryData)
            .query({ invoicingMonth: invoicingMonthWrong })
            .expect(400, {
                message: EXCEL_SERVICE_ERROR_MESSAGES.INCOMPATIBLE_DATES,
            })
    })

    it('should return 400 if there is not correct date format at file', async () => {
        const ERROR_MSG =
            'Invalid date format at file: January 2023. Expected: MMM yyyy'
        const fileDataPath = path.join(
            __dirname,
            '../fixtures/file_broken_date.xlsx',
        )
        const binaryData = fs.readFileSync(fileDataPath)
        await request(server)
            .post('/upload')
            .set('Content-Type', EXCEL_TABLE_HEADER)
            .send(binaryData)
            .query({ invoicingMonth })
            .expect(400, {
                message: ERROR_MSG,
            })
    })

    it('should return 400 if there is no excel file', async () => {
        const fileDataPath = path.join(__dirname, '../fixtures/txt_file.txt')
        const binaryData = fs.readFileSync(fileDataPath)
        await request(server)
            .post('/upload')
            .set('Content-Type', 'text/plain')
            .send(binaryData)
            .query({ invoicingMonth })
            .expect(400, {
                message: UPLOAD_CONTROLLER_ERROR_MESSAGES.NO_FILE_PRESENT,
            })
    })

    it('should return 400 if there is no file present', async () => {
        await request(server)
            .post('/upload')
            .query({ invoicingMonth })
            .expect(400, {
                message: UPLOAD_CONTROLLER_ERROR_MESSAGES.NO_FILE_PRESENT,
            })
    })

    it('should return 400 if there is no currencies rates present', async () => {
        const fileDataPath = path.join(
            __dirname,
            '../fixtures/file_no_rates.xlsx',
        )
        const binaryData = fs.readFileSync(fileDataPath)
        await request(server)
            .post('/upload')
            .set('Content-Type', EXCEL_TABLE_HEADER)
            .send(binaryData)
            .query({ invoicingMonth })
            .expect(400, {
                message: EXCEL_SERVICE_ERROR_MESSAGES.WRONG_INPUT,
                details: [SCHEMAS_ERROR_MESSAGES.NO_CURRENCIES_PRESENT],
            })
    })

    it('should return 400 if there is missed mandatory headings', async () => {
        const fileDataPath = path.join(
            __dirname,
            '../fixtures/file_missed_headings.xlsx',
        )
        const binaryData = fs.readFileSync(fileDataPath)
        await request(server)
            .post('/upload')
            .set('Content-Type', EXCEL_TABLE_HEADER)
            .send(binaryData)
            .query({ invoicingMonth })
            .expect(400, {
                message: EXCEL_SERVICE_ERROR_MESSAGES.WRONG_INPUT,
                details: [
                    SCHEMAS_ERROR_MESSAGES.MISSED_MANDATORY_HEADINGS([
                        "Cust No'",
                        'Total Price',
                        'Invoice Currency',
                    ]),
                ],
            })
    })
})
