package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
)

// MCPRequest - MCP JSON-RPC形式のリクエスト
type MCPRequest struct {
	Jsonrpc string            `json:"jsonrpc"`
	Method  string            `json:"method"`
	Params  map[string]string `json:"params"`
	ID      int               `json:"id"`
}

// MCPResponse - MCP JSON-RPC形式のレスポンス
type MCPResponse struct {
	Jsonrpc string      `json:"jsonrpc"`
	Result  interface{} `json:"result"`
	ID      int         `json:"id"`
}

// MCPTool - MCP ツール定義
type MCPTool struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	InputSchema map[string]interface{} `json:"inputSchema"`
}

func main() {
	// MCPサーバーが実行されるディレクトリから相対パスで data.json を探す
	dataPath := "samples/book-app-project/data.json"
	
	// 複数の場所を試す
	possiblePaths := []string{
		dataPath,
		"../book-app-project/data.json",
		"../../book-app-project/data.json",
		"./data.json",
	}
	
	var books []Book
	var err error
	for _, path := range possiblePaths {
		books, err = LoadBooks(path)
		if err == nil {
			break
		}
	}
	
	if err != nil {
		log.Fatalf("Failed to load books from any path: %v", err)
	}

	// MCPサーバーツール定義
	tools := []MCPTool{
		{
			Name:        "search_books_by_title",
			Description: "Search books by title (case-insensitive, partial match)",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"query": map[string]interface{}{
						"type":        "string",
						"description": "Search query for book title",
					},
				},
				"required": []string{"query"},
			},
		},
		{
			Name:        "search_books_by_author",
			Description: "Search books by author (case-insensitive, partial match)",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"query": map[string]interface{}{
						"type":        "string",
						"description": "Search query for author name",
					},
				},
				"required": []string{"query"},
			},
		},
	}

	// ツール定義を出力 (MCPプロトコル用)
	toolsResponse := map[string]interface{}{
		"tools": tools,
	}
	
	data, _ := json.MarshalIndent(toolsResponse, "", "  ")
	fmt.Println(string(data))

	// 標準入力からリクエストを待機 (MCPサーバーモード)
	decoder := json.NewDecoder(os.Stdin)
	encoder := json.NewEncoder(os.Stdout)

	for {
		var req MCPRequest
		if err := decoder.Decode(&req); err != nil {
			break
		}

		var result interface{}
		switch req.Method {
		case "search_books_by_title":
			query := req.Params["query"]
			results := SearchBooksByTitle(books, query)
			result = results

		case "search_books_by_author":
			query := req.Params["query"]
			results := SearchBooksByAuthor(books, query)
			result = results

		default:
			result = map[string]string{"error": "unknown method"}
		}

		response := MCPResponse{
			Jsonrpc: "2.0",
			Result:  result,
			ID:      req.ID,
		}
		encoder.Encode(response)
	}
}
