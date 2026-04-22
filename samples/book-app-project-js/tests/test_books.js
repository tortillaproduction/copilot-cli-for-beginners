const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { BookCollection } = require("../books");

let tempFile;

beforeEach(() => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "book-test-"));
  tempFile = path.join(tempDir, "data.json");
  fs.writeFileSync(tempFile, "[]");
});

describe("BookCollection", () => {
  it("should add a book", () => {
    const collection = new BookCollection(tempFile);
    const initialCount = collection.books.length;
    collection.addBook("1984", "George Orwell", 1949);
    assert.equal(collection.books.length, initialCount + 1);
    const book = collection.findBookByTitle("1984");
    assert.notEqual(book, null);
    assert.equal(book.author, "George Orwell");
    assert.equal(book.year, 1949);
    assert.equal(book.read, false);
  });

  it("should mark a book as read", () => {
    const collection = new BookCollection(tempFile);
    collection.addBook("Dune", "Frank Herbert", 1965);
    const result = collection.markAsRead("Dune");
    assert.equal(result, true);
    const book = collection.findBookByTitle("Dune");
    assert.equal(book.read, true);
  });

  it("should return false when marking a nonexistent book as read", () => {
    const collection = new BookCollection(tempFile);
    const result = collection.markAsRead("Nonexistent Book");
    assert.equal(result, false);
  });

  it("should remove a book", () => {
    const collection = new BookCollection(tempFile);
    collection.addBook("The Hobbit", "J.R.R. Tolkien", 1937);
    const result = collection.removeBook("The Hobbit");
    assert.equal(result, true);
    const book = collection.findBookByTitle("The Hobbit");
    assert.equal(book, null);
  });

  it("should return false when removing a nonexistent book", () => {
    const collection = new BookCollection(tempFile);
    const result = collection.removeBook("Nonexistent Book");
    assert.equal(result, false);
  });

  it("should search by title OR author using partial matching", () => {
    const collection = new BookCollection(tempFile);
    collection.addBook("The Hobbit", "J.R.R. Tolkien", 1937);
    collection.addBook("The Fellowship of the Ring", "J.R.R. Tolkien", 1954);
    collection.addBook("Harry Potter", "J.K. Rowling", 1997);
    
    const results = collection.searchByTitleOrAuthor("Tolkien");
    assert.equal(results.length, 2);
  });

  it("should find books by title through unified search", () => {
    const collection = new BookCollection(tempFile);
    collection.addBook("1984", "George Orwell", 1949);
    collection.addBook("Animal Farm", "George Orwell", 1945);
    
    const results = collection.searchByTitleOrAuthor("1984");
    assert.equal(results.length, 1);
    assert.equal(results[0].title, "1984");
  });

  it("should return empty array when no matches found in unified search", () => {
    const collection = new BookCollection(tempFile);
    collection.addBook("The Hobbit", "J.R.R. Tolkien", 1937);
    
    const results = collection.searchByTitleOrAuthor("Nonexistent");
    assert.equal(results.length, 0);
  });

  it("should perform case-insensitive unified search", () => {
    const collection = new BookCollection(tempFile);
    collection.addBook("Dune", "Frank Herbert", 1965);
    collection.addBook("Foundation", "Isaac Asimov", 1951);
    
    const results1 = collection.searchByTitleOrAuthor("FRANK");
    const results2 = collection.searchByTitleOrAuthor("dune");
    
    assert.equal(results1.length, 1);
    assert.equal(results2.length, 1);
  });
});
