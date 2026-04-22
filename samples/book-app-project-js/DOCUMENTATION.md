# Book Collection Module Documentation

This module provides classes for managing a collection of books with validation, persistence, and search functionality.

## Table of Contents

- [Overview](#overview)
- [Classes](#classes)
  - [Book](#book)
  - [BookCollection](#bookcollection)
- [Constants](#constants)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)

---

## Overview

The `books.js` module implements a book management system with:
- Individual book validation (title, author, publication year)
- File-based persistence using JSON
- Full-text search across books
- Read status tracking

**Module Path:** `books.js`  
**Exports:** `Book`, `BookCollection`, `DATA_FILE`

---

## Classes

### Book

Represents a single book with validation of its properties.

#### Constructor

```javascript
/**
 * Creates a new Book instance.
 *
 * @param {string} title - The book title (required, max 200 characters)
 * @param {string} author - The book author (required, max 100 characters)
 * @param {number|string} year - Publication year (required, 1000-current+10, or 0 for unknown)
 * @param {boolean} [read=false] - Whether the book has been read (optional)
 *
 * @throws {ValidationError} If title is empty or exceeds 200 characters
 * @throws {ValidationError} If author is empty or exceeds 100 characters
 * @throws {ValidationError} If year is invalid or outside acceptable range
 *
 * @example
 * const book = new Book('1984', 'George Orwell', 1949);
 * console.log(book.read); // false
 *
 * @example
 * // Year can be a string
 * const book = new Book('Dune', 'Frank Herbert', '1965');
 * console.log(book.year); // 1965
 *
 * @example
 * // Unknown publication year
 * const book = new Book('Anonymous Work', 'Unknown', 0);
 * console.log(book.year); // 0
 */
constructor(title, author, year, read = false)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | The validated book title |
| `author` | `string` | The validated book author |
| `year` | `number` | The publication year (0 if unknown) |
| `read` | `boolean` | Whether the book has been read |

#### Methods

##### validateTitle(title)

```javascript
/**
 * Validates the book title.
 *
 * @param {string} title - The title to validate
 * @returns {string} The trimmed, validated title
 *
 * @throws {ValidationError} If title is empty or exceeds 200 characters
 *
 * @private
 */
```

**Validation Rules:**
- Title is converted to string and trimmed
- Must not be empty after trimming
- Must not exceed 200 characters

**Example:**
```javascript
const book = new Book('The Great Gatsby', 'F. Scott Fitzgerald', 1925);
// Title is automatically validated
```

---

##### validateAuthor(author)

```javascript
/**
 * Validates the book author.
 *
 * @param {string} author - The author to validate
 * @returns {string} The trimmed, validated author name
 *
 * @throws {ValidationError} If author is empty or exceeds 100 characters
 *
 * @private
 */
```

**Validation Rules:**
- Author is converted to string and trimmed
- Must not be empty after trimming
- Must not exceed 100 characters

---

##### validateYear(year)

```javascript
/**
 * Validates the publication year.
 *
 * @param {number|string|null|undefined} year - The year to validate
 * @returns {number} The validated year (returns 0 if year is empty/null/undefined)
 *
 * @throws {ValidationError} If year is not a valid number
 * @throws {ValidationError} If year is not 0 and outside range [1000, current+10]
 *
 * @private
 */
```

**Validation Rules:**
- Empty/null/undefined values return `0` (unknown year)
- Must be a valid integer
- Must be between 1000 and (current year + 10), or 0
- Allows future years up to 10 years ahead

**Examples:**
```javascript
new Book('Future Book', 'Author', 2030);  // OK (within range)
new Book('Book', 'Author', 500);          // Throws: year too old
new Book('Book', 'Author', 0);            // OK (unknown year)
new Book('Book', 'Author', '');           // OK (becomes 0)
```

---

### BookCollection

Manages a collection of books with file persistence and search capabilities.

#### Constructor

```javascript
/**
 * Creates a new BookCollection instance and loads existing books from file.
 *
 * @param {string} [dataFile] - Path to the JSON data file (optional, defaults to data.json)
 *
 * @throws {Error} Re-throws unexpected errors not handled by graceful fallbacks
 *
 * @example
 * const collection = new BookCollection();
 * console.log(collection.listBooks().length); // Number of loaded books
 *
 * @example
 * // Custom data file
 * const collection = new BookCollection('./custom-books.json');
 */
constructor(dataFile)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `books` | `Array<Book>` | Array of Book instances |
| `dataFile` | `string` | Path to the JSON persistence file |

#### Methods

##### loadBooks()

```javascript
/**
 * Loads books from the data file and initializes the collection.
 * Handles file errors gracefully by starting with an empty collection.
 *
 * @returns {void}
 *
 * @throws {DataError} If JSON contains invalid book objects (logged and continues)
 * @throws {Error} If unexpected errors occur
 *
 * Graceful Handling:
 * - Missing file (ENOENT): Starts with empty collection
 * - Corrupted JSON: Logs warning, starts with empty collection
 * - Invalid book data: Logs warning, starts with empty collection
 *
 * @private
 *
 * @example
 * // Called automatically by constructor
 * const collection = new BookCollection('./data.json');
 * // Books are loaded and ready to use
 */
```

---

##### saveBooks()

```javascript
/**
 * Persists the current book collection to the data file in JSON format.
 *
 * @returns {void}
 *
 * @throws {FileError} If file cannot be written (permission denied or no space)
 * @throws {FileError} If unexpected I/O error occurs
 *
 * Error Conditions:
 * - `EACCES`: Permission denied writing to data.json
 * - `ENOSPC`: No disk space available
 *
 * @private
 *
 * @example
 * // Called automatically when books are added, removed, or marked as read
 * collection.addBook('New Book', 'Author', 2024);
 * // saveBooks() is called internally
 */
```

---

##### addBook(title, author, year)

```javascript
/**
 * Creates and adds a new book to the collection and saves to file.
 *
 * @param {string} title - The book title (max 200 characters)
 * @param {string} author - The book author (max 100 characters)
 * @param {number|string} year - Publication year (1000-current+10, or 0 for unknown)
 *
 * @returns {Book} The newly created Book instance
 *
 * @throws {ValidationError} If any book property fails validation
 * @throws {FileError} If the collection cannot be saved to file
 *
 * @example
 * const collection = new BookCollection();
 * const book = collection.addBook('To Kill a Mockingbird', 'Harper Lee', 1960);
 * console.log(collection.listBooks().length); // 1
 *
 * @example
 * // Adding with unknown year
 * const book = collection.addBook('Ancient Text', 'Unknown Author', 0);
 */
```

---

##### listBooks()

```javascript
/**
 * Returns all books in the collection.
 *
 * @returns {Array<Book>} Array of all Book instances (may be empty)
 *
 * @example
 * const books = collection.listBooks();
 * books.forEach(book => {
 *   console.log(`${book.title} by ${book.author} (${book.year})`);
 * });
 */
```

---

##### findBookByTitle(title)

```javascript
/**
 * Finds the first book with an exact title match (case-insensitive).
 *
 * @param {string} title - The title to search for
 *
 * @returns {Book|null} The matching Book instance or null if not found
 *
 * @example
 * const book = collection.findBookByTitle('1984');
 * if (book) {
 *   console.log(book.author); // 'George Orwell'
 * }
 *
 * @example
 * // Case-insensitive search
 * const book1 = collection.findBookByTitle('1984');
 * const book2 = collection.findBookByTitle('1984'); // Same result
 */
```

---

##### markAsRead(title)

```javascript
/**
 * Marks a book as read by exact title match and saves the collection.
 *
 * @param {string} title - The title of the book to mark as read (case-insensitive)
 *
 * @returns {boolean} True if book was found and marked, false otherwise
 *
 * @throws {FileError} If the collection cannot be saved to file
 *
 * @example
 * const collection = new BookCollection();
 * collection.addBook('Pride and Prejudice', 'Jane Austen', 1813);
 * const success = collection.markAsRead('Pride and Prejudice');
 * console.log(success); // true
 *
 * @example
 * const success = collection.markAsRead('Nonexistent Book');
 * console.log(success); // false
 */
```

---

##### removeBook(title)

```javascript
/**
 * Removes a book from the collection by exact title match and saves the collection.
 *
 * @param {string} title - The title of the book to remove (case-insensitive)
 *
 * @returns {boolean} True if book was found and removed, false otherwise
 *
 * @throws {FileError} If the collection cannot be saved to file
 *
 * @example
 * const collection = new BookCollection();
 * collection.addBook('Temporary Book', 'Author', 2024);
 * const success = collection.removeBook('Temporary Book');
 * console.log(success); // true
 * console.log(collection.listBooks().length); // 0
 *
 * @example
 * const success = collection.removeBook('Nonexistent Book');
 * console.log(success); // false
 */
```

---

##### findBooksByTitlePartial(query)

```javascript
/**
 * Finds all books with titles containing the query string (case-insensitive).
 *
 * @param {string} query - The search string
 *
 * @returns {Array<Book>} Array of matching Book instances (may be empty)
 *
 * @example
 * collection.addBook('The Lord of the Rings', 'J.R.R. Tolkien', 1954);
 * collection.addBook('The Hobbit', 'J.R.R. Tolkien', 1937);
 * 
 * const results = collection.findBooksByTitlePartial('The');
 * console.log(results.length); // 2
 *
 * @example
 * const results = collection.findBooksByTitlePartial('Nonexistent');
 * console.log(results.length); // 0
 */
```

---

##### searchByTitleOrAuthor(query)

```javascript
/**
 * Searches for books by title OR author using partial matching (case-insensitive).
 *
 * @param {string} query - The search query string
 *
 * @returns {Array<Book>} Array of books matching the query in title or author field
 *
 * @example
 * collection.addBook('1984', 'George Orwell', 1949);
 * collection.addBook('Animal Farm', 'George Orwell', 1945);
 * 
 * // Search by author
 * const books = collection.searchByTitleOrAuthor('Orwell');
 * console.log(books.length); // 2
 *
 * @example
 * // Search by title partial match
 * const books = collection.searchByTitleOrAuthor('1984');
 * console.log(books.length); // 1
 *
 * @example
 * // Search term matches both title and author in different books
 * collection.addBook('The Stranger', 'Albert Camus', 1942);
 * const results = collection.searchByTitleOrAuthor('The');
 * // Returns all books with 'The' in title or author
 */
```

---

## Constants

```javascript
/**
 * Default path to the data file (relative to module directory).
 * @constant {string}
 */
DATA_FILE = path.join(__dirname, "data.json")

/**
 * Maximum allowed length for book titles.
 * @constant {number}
 */
TITLE_MAX_LENGTH = 200

/**
 * Maximum allowed length for author names.
 * @constant {number}
 */
AUTHOR_MAX_LENGTH = 100

/**
 * Minimum valid publication year.
 * @constant {number}
 */
MIN_YEAR = 1000

/**
 * Maximum valid publication year (current year + 10).
 * @constant {number}
 */
MAX_YEAR = new Date().getFullYear() + 10
```

---

## Error Handling

This module uses custom error classes from `errors.js`:

### ValidationError
Thrown when book properties fail validation (invalid title, author, or year).

```javascript
try {
  new Book('', 'Author', 2024); // Empty title
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(err.message); // "Title cannot be empty."
  }
}
```

### FileError
Thrown when file I/O operations fail (permission denied, no disk space, etc.).

```javascript
try {
  collection.saveBooks();
} catch (err) {
  if (err instanceof FileError) {
    console.error(err.message); // "Permission denied: cannot write to data.json"
  }
}
```

### DataError
Thrown when loaded data from file is invalid (non-array, invalid book objects).

**Note:** Logged to console and collection starts empty rather than throwing.

---

## Usage Examples

### Basic Collection Management

```javascript
const { BookCollection } = require('./books');

// Create a new collection
const collection = new BookCollection();

// Add books
collection.addBook('The Catcher in the Rye', 'J.D. Salinger', 1951);
collection.addBook('Brave New World', 'Aldous Huxley', 1932);
collection.addBook('Fahrenheit 451', 'Ray Bradbury', 1953);

// List all books
const allBooks = collection.listBooks();
console.log(`Total books: ${allBooks.length}`);

// Find a specific book
const book = collection.findBookByTitle('1984');
if (book) {
  console.log(`Found: ${book.title} by ${book.author}`);
}

// Mark as read
collection.markAsRead('The Catcher in the Rye');

// Search functionality
const results = collection.searchByTitleOrAuthor('Bradbury');
console.log(`Found ${results.length} books by Bradbury`);

// Remove a book
collection.removeBook('Fahrenheit 451');
```

### Search Examples

```javascript
const { BookCollection } = require('./books');

const collection = new BookCollection();

// Setup test data
collection.addBook('The Lord of the Rings', 'J.R.R. Tolkien', 1954);
collection.addBook('The Hobbit', 'J.R.R. Tolkien', 1937);
collection.addBook('The Name of the Wind', 'Patrick Rothfuss', 2007);

// Partial title search
const titleMatches = collection.findBooksByTitlePartial('The');
console.log(titleMatches.length); // 3

// Combined search by title or author
const authorSearch = collection.searchByTitleOrAuthor('Tolkien');
console.log(authorSearch.length); // 2

const titleSearch = collection.searchByTitleOrAuthor('Hobbit');
console.log(titleSearch.length); // 1
```

### Error Handling Example

```javascript
const { Book, BookCollection } = require('./books');
const { ValidationError, FileError } = require('./errors');

const collection = new BookCollection();

try {
  // This will throw ValidationError - title too long
  collection.addBook('A'.repeat(201), 'Author', 2024);
} catch (err) {
  if (err instanceof ValidationError) {
    console.error(`Validation failed: ${err.message}`);
  } else if (err instanceof FileError) {
    console.error(`Save failed: ${err.message}`);
  }
}

try {
  // Invalid year
  new Book('Title', 'Author', 'not-a-year');
} catch (err) {
  console.error(err.message); // "Year must be a valid number."
}
```

---

## Data File Format

The collection is persisted as JSON in the format:

```json
[
  {
    "title": "1984",
    "author": "George Orwell",
    "year": 1949,
    "read": false
  },
  {
    "title": "Brave New World",
    "author": "Aldous Huxley",
    "year": 1932,
    "read": true
  }
]
```

---

## Summary

The `books.js` module provides a robust book collection management system with:

✓ Full validation of book properties  
✓ File-based persistence with error recovery  
✓ Flexible search capabilities (exact match, partial match, combined)  
✓ Read status tracking  
✓ Clear error handling with custom exceptions  
✓ Graceful degradation when data is corrupted  
