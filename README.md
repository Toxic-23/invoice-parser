Invoices XLS parsing

You have a table with some invoices data:

https://docs.google.com/spreadsheets/d/1zam20k_daCG8ezxvORVDhQAS0cnig2jR/edit?usp=sharing&ouid=111810151834131963227&rtpof=true&sd=true

Need to write NodeJS (ES6 or TypeScript) code + ExpressJS which can process the file, it should have a single endpoint for file upload where user can pass the XLS file and parameter called “invoicingMonth” in a format YYYY-MM.

Only relevant lines should be processed. A relevant line is a line with status ready or a line that has invoice # filled.

As an output endpoint should return the data in a format like:
{
InvoicingMonth: “YYYY-MM” - from the file,
currencyRates: {
  USD: 
  EUR:
  GBP: 
},
invoicesData: [
   .. all the invoices data, columns according to the file…
]
}


In addition, invoicesData records should have additional column validationErrors which contains all the line validation errors, assuming:
Mandatory fields: Customer, Cust No', Project Type, Quantity, Price Per Item, Item Price Currency, Total Price, Invoice Currency, Status;	
Add any relevant validations you think is necessary, based on the input data analysis;
When no validation errors - keep validationErrors empty;

For each record on the “invoicesData ” calculate “Invoice Total” which is equal to “Total Price” converted to “Total Invoice Currency” using the currency rates defined on the file.

Take into account that users can add to the table additional columns or change their order. New currencies also can be added.

Add generic validation before parsing to make sure that file structure is valid.

Make sure that invoicing date in the XLS file matches with invoicing date passed during upload.
