package main

import (
	"encoding/json"
	"os"
	"strings"
)

type Book struct {
	Title  string `json:"title"`
	Author string `json:"author"`
	Year   int    `json:"year"`
	Read   bool   `json:"read"`
}

// LoadBooks - data.jsonから書籍データを読み込む
func LoadBooks(filepath string) ([]Book, error) {
	data, err := os.ReadFile(filepath)
	if err != nil {
		return nil, err
	}

	var books []Book
	if err := json.Unmarshal(data, &books); err != nil {
		return nil, err
	}
	return books, nil
}

// SearchBooksByTitle - titleで書籍を検索 (部分一致, 大文字小文字を区別しない)
func SearchBooksByTitle(books []Book, query string) []Book {
	var results []Book
	queryLower := strings.ToLower(query)

	for _, book := range books {
		if strings.Contains(strings.ToLower(book.Title), queryLower) {
			results = append(results, book)
		}
	}
	return results
}

// SearchBooksByAuthor - authorで書籍を検索
func SearchBooksByAuthor(books []Book, query string) []Book {
	var results []Book
	queryLower := strings.ToLower(query)

	for _, book := range books {
		if strings.Contains(strings.ToLower(book.Author), queryLower) {
			results = append(results, book)
		}
	}
	return results
}
