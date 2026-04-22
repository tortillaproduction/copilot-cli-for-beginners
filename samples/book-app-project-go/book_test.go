package main

import (
	"testing"
)

func TestSearchBooksByTitle(t *testing.T) {
	books := []Book{
		{Title: "The Hobbit", Author: "J.R.R. Tolkien", Year: 1937, Read: false},
		{Title: "1984", Author: "George Orwell", Year: 1949, Read: true},
		{Title: "Dune", Author: "Frank Herbert", Year: 1965, Read: false},
		{Title: "To Kill a Mockingbird", Author: "Harper Lee", Year: 1960, Read: false},
	}

	tests := []struct {
		name      string
		query     string
		wantCount int
		wantTitle string
	}{
		{
			name:      "exact match",
			query:     "Dune",
			wantCount: 1,
			wantTitle: "Dune",
		},
		{
			name:      "partial match",
			query:     "Hobbit",
			wantCount: 1,
			wantTitle: "The Hobbit",
		},
		{
			name:      "case insensitive",
			query:     "hobbit",
			wantCount: 1,
			wantTitle: "The Hobbit",
		},
		{
			name:      "substring match",
			query:     "Kill",
			wantCount: 1,
			wantTitle: "To Kill a Mockingbird",
		},
		{
			name:      "no match",
			query:     "nonexistent",
			wantCount: 0,
		},
		{
			name:      "empty query",
			query:     "",
			wantCount: 4,
			wantTitle: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			results := SearchBooksByTitle(books, tt.query)

			if len(results) != tt.wantCount {
				t.Errorf("got %d results, want %d", len(results), tt.wantCount)
			}

			if tt.wantCount > 0 && tt.wantTitle != "" && results[0].Title != tt.wantTitle {
				t.Errorf("got title %q, want %q", results[0].Title, tt.wantTitle)
			}
		})
	}
}

func TestSearchBooksByAuthor(t *testing.T) {
	books := []Book{
		{Title: "The Hobbit", Author: "J.R.R. Tolkien", Year: 1937, Read: false},
		{Title: "The Lord of the Rings", Author: "J.R.R. Tolkien", Year: 1954, Read: true},
		{Title: "1984", Author: "George Orwell", Year: 1949, Read: true},
	}

	tests := []struct {
		name       string
		query      string
		wantCount  int
		wantAuthor string
	}{
		{
			name:       "exact author match",
			query:      "George Orwell",
			wantCount:  1,
			wantAuthor: "George Orwell",
		},
		{
			name:       "partial author match",
			query:      "Tolkien",
			wantCount:  2,
			wantAuthor: "J.R.R. Tolkien",
		},
		{
			name:       "case insensitive author",
			query:      "george",
			wantCount:  1,
			wantAuthor: "George Orwell",
		},
		{
			name:       "no author match",
			query:      "unknown",
			wantCount:  0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			results := SearchBooksByAuthor(books, tt.query)

			if len(results) != tt.wantCount {
				t.Errorf("got %d results, want %d", len(results), tt.wantCount)
			}

			if tt.wantCount > 0 && results[0].Author != tt.wantAuthor {
				t.Errorf("got author %q, want %q", results[0].Author, tt.wantAuthor)
			}
		})
	}
}

func TestLoadBooks(t *testing.T) {
	books, err := LoadBooks("../book-app-project/data.json")
	if err != nil {
		t.Fatalf("failed to load books: %v", err)
	}

	if len(books) == 0 {
		t.Error("expected books to be loaded, got 0")
	}

	// 最初のレコードを検証
	if books[0].Title != "The Hobbit" {
		t.Errorf("expected first book to be 'The Hobbit', got %q", books[0].Title)
	}
	if books[0].Author != "J.R.R. Tolkien" {
		t.Errorf("expected author to be 'J.R.R. Tolkien', got %q", books[0].Author)
	}
}
