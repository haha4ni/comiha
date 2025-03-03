package utils

import (
	"database/sql"

	_ "modernc.org/sqlite" // 改用 modernc 版本，不需要 CGO
)

// 初始化 SQLite 資料庫
func InitDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite", "books.db")
	if err != nil {
		return nil, err
	}

	// 建立 `books` 資料表（如果不存在）
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS books (
        name TEXT,
        volume TEXT,
        author TEXT,
        tags TEXT,
        publisher TEXT,
        release_date TEXT,
        page_count TEXT,
        epub_format TEXT,
        description TEXT,
        PRIMARY KEY (name, volume)
    )`)
	if err != nil {
		return nil, err
	}

	return db, nil
}


