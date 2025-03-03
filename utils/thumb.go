package utils

import (
	"archive/zip"
	"bytes"
		"database/sql"
	"image"
	"image/jpeg"
	_ "image/png" // 支援 PNG 圖片
	"log"
	"sort"
	"strconv"
	"strings"
	"fmt"
	"github.com/nfnt/resize" // ✅ 用於縮圖
	_ "modernc.org/sqlite"   // ✅ SQLite 驅動
)

// 縮圖尺寸
const ThumbWidth = 215
const ThumbHeight = 320

// 圖片結構
type ImageData struct {
	FileName string
	Thumbnail []byte // 縮圖的 Base64 資料
}

// 讀取 ZIP 並取得所有圖片
func ReadImagesFromZip(zipPath string) ([]ImageData, error) {
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		return nil, err
	}
	defer r.Close()

	var images []ImageData

	// 先將圖片名稱存入 slice
	fileMap := make(map[int]*zip.File)
	var keys []int

	for _, f := range r.File {
		if !strings.HasSuffix(f.Name, ".png") && !strings.HasSuffix(f.Name, ".jpg") {
			continue // 只處理 PNG / JPG 圖片
		}

		// 提取數字部分來排序，例如 "001.png" 解析成 1
		base := strings.TrimSuffix(f.Name, ".png")
		base = strings.TrimSuffix(base, ".jpg")
		num, err := strconv.Atoi(base)
		if err != nil {
			log.Println("❌ 無法解析檔名:", f.Name)
			continue
		}

		keys = append(keys, num)
		fileMap[num] = f
	}

	// 按照數字排序檔名
	sort.Ints(keys)
	fmt.Println(keys)
	// 依序讀取圖片，並縮小尺寸
	for _, k := range keys {
		f := fileMap[k]

		rc, err := f.Open()
		if err != nil {
			return nil, err
		}
		defer rc.Close()

		// 解析圖片
		img, _, err := image.Decode(rc)
		if err != nil {
			log.Println("❌ 無法解析圖片:", f.Name)
			continue
		}

		// 產生縮圖
		thumbnail := resize.Resize(ThumbWidth, ThumbHeight, img, resize.Lanczos3)

		// 轉成 JPEG 格式
		var buf bytes.Buffer
		err = jpeg.Encode(&buf, thumbnail, &jpeg.Options{Quality: 90})
		if err != nil {
			return nil, err
		}

		// 存入結果
		images = append(images, ImageData{
			FileName: f.Name,
			Thumbnail: buf.Bytes(),
		})
	}

	return images, nil
}


func CacheThumbnails(db *sql.DB, zipPath string) error {
	images, err := ReadImagesFromZip(zipPath)
	if err != nil {
		return err
	}

	// 創建快取表格（如果不存在）
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS thumbnails (
        filename TEXT PRIMARY KEY,
        data BLOB
    )`)
	if err != nil {
		return err
	}

	// 存入縮圖
	for _, img := range images {
		_, err := db.Exec(`INSERT OR REPLACE INTO thumbnails (filename, data) VALUES (?, ?)`,
			img.FileName, img.Thumbnail)
		if err != nil {
			return err
		}
		log.Println("✅ 已快取縮圖:", img.FileName)
	}

	return nil
}


func GetCachedThumbnails(db *sql.DB) ([]ImageData, error) {
	rows, err := db.Query("SELECT filename, data FROM thumbnails ORDER BY filename ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []ImageData
	for rows.Next() {
		var img ImageData
		err = rows.Scan(&img.FileName, &img.Thumbnail)
		if err != nil {
			return nil, err
		}
		images = append(images, img)
	}

	// 如果快取是空的，返回錯誤
	if len(images) == 0 {
		log.Println("⚠️  快取內沒有縮圖")
		return nil, fmt.Errorf("沒有縮圖快取")
	}

	return images, nil
}


// 初始化縮圖快取的 SQLite 資料庫
func InitThumbnailDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite", "thumbnails.db") // ✅ 使用 `thumbnails.db`
	if err != nil {
		log.Println("❌ 無法開啟縮圖快取資料庫:", err)
		return nil, err
	}

	// 建立 `thumbnails` 資料表（如果不存在）
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS thumbnails (
        filename TEXT PRIMARY KEY,
        data BLOB
    )`)
	if err != nil {
		log.Println("❌ 無法建立縮圖資料表:", err)
		return nil, err
	}

	log.Println("✅ 成功初始化縮圖快取資料庫")
	return db, nil
}