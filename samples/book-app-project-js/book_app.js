const readline = require("readline");
const { BookCollection } = require("./books");
const { printBooks } = require("./utils");
const { ValidationError, DataError, FileError } = require("./errors");

const collection = new BookCollection();
const INVALID_INDEX = -1;

let rl = null;

function getReadlineInterface() {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  return rl;
}

function closeReadlineInterface() {
  if (rl) {
    rl.close();
    rl = null;
  }
}



/**
 * Handles the list command - displays all books in the collection
 * @async
 * @returns {Promise<void>}
 */
async function handleList() {
  const books = collection.listBooks();
  printBooks(books);
}

/**
 * Prompts the user for input and returns their answer
 * @param {string} question - The question to ask the user
 * @returns {Promise<string>} The trimmed user input
 */
function prompt(question) {
  return new Promise((resolve) => {
    getReadlineInterface().question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Validates that an input value is not empty and within length limits
 * @param {string} value - The value to validate
 * @param {string} fieldName - The name of the field being validated
 * @param {number} [maxLength=500] - Maximum allowed length
 * @returns {string} The trimmed, validated value
 * @throws {ValidationError} If the value is empty or exceeds max length
 */
function validateInput(value, fieldName, maxLength = 500) {
  const trimmed = String(value || "").trim();
  if (trimmed.length === 0) {
    throw new ValidationError(`${fieldName} cannot be empty.`);
  }
  if (trimmed.length > maxLength) {
    throw new ValidationError(`${fieldName} cannot exceed ${maxLength} characters.`);
  }
  return trimmed;
}

/**
 * Centralized error handler for CLI commands
 * @param {Error} err - The error to handle
 * @returns {void}
 */
function handleError(err) {
  if (err instanceof ValidationError) {
    console.error(`\n✗ Input Error: ${err.message}\n`);
  } else if (err instanceof FileError) {
    console.error(`\n✗ Storage Error: ${err.message}\n`);
  } else if (err instanceof DataError) {
    console.error(`\n✗ Data Error: ${err.message}\n`);
  } else {
    console.error(`\n✗ Error: ${err.message}\n`);
  }
}

/**
 * Wraps an async function with centralized error handling
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
function withErrorHandling(fn) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (err) {
      handleError(err);
    }
  };
}

/**
 * Handles the add command - adds a new book to the collection
 * @async
 * @returns {Promise<void>}
 */
async function handleAddImpl() {
  console.log("\nAdd a New Book\n");

  const title = await prompt("Title: ");
  validateInput(title, "Title", 200);
  
  const author = await prompt("Author: ");
  validateInput(author, "Author", 100);
  
  const yearStr = await prompt("Year (optional, or 0 for unknown): ");
  
  let year = 0;
  if (yearStr && yearStr.trim().length > 0) {
    year = parseInt(yearStr, 10);
    if (isNaN(year)) {
      throw new ValidationError("Year must be a valid number.");
    }
    if (year < 1000 || year > new Date().getFullYear() + 10) {
      throw new ValidationError(`Year must be between 1000 and ${new Date().getFullYear() + 10}, or leave blank/0 for unknown.`);
    }
  }
  
  collection.addBook(title, author, year);
  console.log("\n✓ Book added successfully.\n");
}

const handleAdd = withErrorHandling(handleAddImpl);

/**
 * Handles the remove command - removes a book from the collection
 * @async
 * @returns {Promise<void>}
 */
async function handleRemoveImpl() {
  console.log("\nRemove a Book\n");
  
  const title = await prompt("Enter the title of the book to remove: ");
  validateInput(title, "Title");
  
  const ok = collection.removeBook(title);
  if (ok) {
    console.log("\n✓ Book removed successfully.\n");
  } else {
    console.log("\n⚠ Book not found.\n");
  }
}

const handleRemove = withErrorHandling(handleRemoveImpl);

/**
 * Handles the find command - searches for books by title or author
 * @async
 * @returns {Promise<void>}
 */
async function handleFindImpl() {
  console.log("\nFind Books\n");

  const query = await prompt("Search by title or author: ");
  validateInput(query, "Search term");
  const books = collection.searchByTitleOrAuthor(query);
  printBooks(books);
}

const handleFind = withErrorHandling(handleFindImpl);

/**
 * Handles the mark command - marks a book as read
 * @async
 * @param {string} [titleArg] - Optional title argument from command line
 * @returns {Promise<void>}
 */
async function handleMarkImpl(titleArg) {
  console.log("\nMark Book as Read\n");
  
  let query;
  if (titleArg) {
    query = titleArg.trim();
  } else {
    query = await prompt("Enter the book title (or part of it): ");
    validateInput(query, "Title");
  }
  
  const matches = collection.findBooksByTitlePartial(query);
  await processMarkSelection(matches, query);
}

const handleMark = withErrorHandling(handleMarkImpl);

/**
 * Processes user selection for marking a book as read
 * @async
 * @param {Array<Object>} matches - Array of matching book objects
 * @param {string} query - The search query used to find the books
 * @returns {Promise<void>}
 */
async function processMarkSelection(matches, query) {
  if (matches.length === 0) {
    console.log(`\n⚠ No books found matching: "${query}"\n`);
    return;
  }
  
  if (matches.length === 1) {
    await markBookAsRead(matches[0]);
    return;
  }
  
  console.log(`\nFound ${matches.length} matching books:\n`);
  printBooks(matches);
  
  const indexStr = await prompt("Enter the number to mark as read: ");
  const idx = parseInt(indexStr, 10) - 1;
  
  if (idx >= 0 && idx < matches.length) {
    await markBookAsRead(matches[idx]);
  } else {
    console.error("\n✗ Invalid selection.\n");
  }
}

/**
 * Marks a book as read and displays result
 * @async
 * @param {Object} book - The book object to mark as read
 * @returns {Promise<void>}
 */
async function markBookAsRead(book) {
  try {
    const ok = collection.markAsRead(book.title);
    if (ok) {
      console.log(`\n✓ Marked "${book.title}" as read.\n`);
    } else {
      console.log("\n✗ Failed to mark book.\n");
    }
  } catch (err) {
    handleError(err);
  }
}

/**
 * Displays the help menu with available commands
 * @returns {void}
 */
function showHelp() {
  console.log(`
Book Collection Helper

Commands:
  list     - Show all books
  add      - Add a new book
  remove   - Remove a book by title
  find     - Search for books by title or author
  mark     - Mark a book as read
  help     - Show this help message
`);
}

/**
 * Main entry point for the application
 * @async
 * @returns {Promise<void>}
 */
async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      showHelp();
      return;
    }

    const command = args[0].toLowerCase();

    switch (command) {
      case "list":
        await handleList();
        break;
      case "add":
        await handleAdd(args[1]);
        break;
      case "remove":
        await handleRemove(args[1]);
        break;
      case "find":
        await handleFind(args[1]);
        break;
      case "mark":
        await handleMark(args[1]);
        break;
      case "help":
        showHelp();
        break;
      default:
        console.log("Unknown command.\n");
        showHelp();
        break;
    }
  } finally {
    closeReadlineInterface();
  }
}

main();
