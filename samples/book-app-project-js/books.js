const fs = require("fs");
const path = require("path");
const { DataError, FileError, ValidationError } = require("./errors");

const DATA_FILE = path.join(__dirname, "data.json");
const TITLE_MAX_LENGTH = 200;
const AUTHOR_MAX_LENGTH = 100;
const MIN_YEAR = 1000;
const MAX_YEAR = new Date().getFullYear() + 10;

class Book {
  constructor(title, author, year, read = false) {
    this.title = this.validateTitle(title);
    this.author = this.validateAuthor(author);
    this.year = this.validateYear(year);
    this.read = read || false;
  }

  validateTitle(title) {
    const trimmed = String(title || "").trim();
    if (trimmed.length === 0) {
      throw new ValidationError("Title cannot be empty.");
    }
    if (trimmed.length > TITLE_MAX_LENGTH) {
      throw new ValidationError(`Title cannot exceed ${TITLE_MAX_LENGTH} characters.`);
    }
    return trimmed;
  }

  validateAuthor(author) {
    const trimmed = String(author || "").trim();
    if (trimmed.length === 0) {
      throw new ValidationError("Author cannot be empty.");
    }
    if (trimmed.length > AUTHOR_MAX_LENGTH) {
      throw new ValidationError(`Author cannot exceed ${AUTHOR_MAX_LENGTH} characters.`);
    }
    return trimmed;
  }

  validateYear(year) {
    if (year === "" || year === null || year === undefined) {
      return 0;
    }
    const numYear = parseInt(year, 10);
    if (isNaN(numYear)) {
      throw new ValidationError("Year must be a valid number.");
    }
    if (numYear !== 0 && (numYear < MIN_YEAR || numYear > MAX_YEAR)) {
      throw new ValidationError(`Year must be between ${MIN_YEAR} and ${MAX_YEAR}, or 0 for unknown.`);
    }
    return numYear;
  }
}

class BookCollection {
  constructor(dataFile) {
    this.dataFile = dataFile || DATA_FILE;
    this.books = [];
    this.loadBooks();
  }

  loadBooks() {
    try {
      const raw = fs.readFileSync(this.dataFile, "utf-8");
      const data = JSON.parse(raw);
      
      if (!Array.isArray(data)) {
        throw new DataError("data.json must contain an array of books");
      }
      
      this.books = data.map((b, index) => {
        if (typeof b !== 'object' || b === null) {
          throw new DataError(`Book at index ${index} is not a valid object`);
        }
        try {
          return new Book(b.title, b.author, b.year, b.read);
        } catch (err) {
          if (err instanceof ValidationError) {
            throw new DataError(`Book at index ${index}: ${err.message}`);
          }
          throw err;
        }
      });
    } catch (err) {
      if (err.code === "ENOENT") {
        this.books = [];
      } else if (err instanceof SyntaxError) {
        console.error("⚠️  Warning: data.json is corrupted. Starting with empty collection.");
        this.books = [];
      } else if (err instanceof DataError) {
        console.error(`⚠️  Warning: ${err.message} Starting with empty collection.`);
        this.books = [];
      } else {
        throw err;
      }
    }
  }

  saveBooks() {
    try {
      const data = this.books.map((b) => ({
        title: b.title,
        author: b.author,
        year: b.year,
        read: b.read,
      }));
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (err) {
      if (err.code === "EACCES") {
        throw new FileError("Permission denied: cannot write to data.json");
      } else if (err.code === "ENOSPC") {
        throw new FileError("No space left on device: cannot write to data.json");
      } else {
        throw new FileError(`Failed to save books: ${err.message}`);
      }
    }
  }

  addBook(title, author, year) {
    const book = new Book(title, author, year);
    this.books.push(book);
    this.saveBooks();
    return book;
  }

  listBooks() {
    return this.books;
  }

  findBookByTitle(title) {
    return this.books.find((b) => b.title.toLowerCase() === title.toLowerCase()) || null;
  }

  markAsRead(title) {
    const book = this.findBookByTitle(title);
    if (book) {
      book.read = true;
      this.saveBooks();
      return true;
    }
    return false;
  }

  removeBook(title) {
    const book = this.findBookByTitle(title);
    if (book) {
      this.books = this.books.filter((b) => b !== book);
      this.saveBooks();
      return true;
    }
    return false;
  }

  findBooksByTitlePartial(query) {
    const q = query.toLowerCase();
    return this.books.filter((b) => b.title.toLowerCase().includes(q));
  }

  /**
   * Searches for books by title OR author using partial matching
   * @param {string} query - The search query string
   * @returns {Array<Book>} Array of books matching the query in title or author
   */
  searchByTitleOrAuthor(query) {
    const q = query.toLowerCase();
    return this.books.filter((b) => 
      b.title.toLowerCase().includes(q) || 
      b.author.toLowerCase().includes(q)
    );
  }
}

module.exports = { Book, BookCollection, DATA_FILE };
