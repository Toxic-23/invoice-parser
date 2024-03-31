# Invoice Parser

## Description

Invoice Parser is a Node.js application designed to parse Excel files containing invoice data.

**Note:** You can find file examples under `tests/fixtures` directory.

## Installation

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    ```

2. **Navigate to the project directory:**

    ```bash
    cd invoice-parser
    ```

3. **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

**Start the application:**

```bash
npm start
```

Access the application at [http://localhost:3000](http://localhost:3000).

## Testing

**Run tests:**

```bash
npm test
```

## Dependencies

-   [date-fns](https://github.com/date-fns/date-fns) - Date utility functions.
-   [express](https://github.com/expressjs/express) - Web framework for Node.js.
-   [formidable](https://github.com/node-formidable/formidable) - Library for parsing form data.
-   [joi](https://github.com/sideway/joi) - Schema validation library.
-   [xlsx](https://github.com/SheetJS/sheetjs) - Library for Excel file manipulation.
