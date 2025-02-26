package main

import (
	"context"
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	//讀圖片 讀目錄
	"encoding/base64"
	"io/ioutil"
	"path/filepath" // 讀副檔名

	//xml
	"io"
	"encoding/xml"

	//樹狀結構
	"os"
	"archive/zip"
	"log"
	"strings"
	"myprojectre/utils" // 匯入 utils 包

	"github.com/lxn/win"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// 在這裡調整視窗大小
	width := int(win.GetSystemMetrics(win.SM_CXSCREEN))
    height := int(win.GetSystemMetrics(win.SM_CYSCREEN))

	// 获取设备上下文
	hdc := win.GetDC(0)
	defer win.ReleaseDC(0, hdc)
	
    // 获取 DPI
    dpiX := win.GetDeviceCaps(hdc, win.LOGPIXELSX)
    dpiY := win.GetDeviceCaps(hdc, win.LOGPIXELSY)

    fmt.Printf("DPI: X: %d, Y: %d\n", dpiX, dpiY)

    // 计算缩放比例
    scaleX := float64(dpiX) / 96.0
    scaleY := float64(dpiY) / 96.0

    fmt.Printf("Scale Factor: X: %.2f, Y: %.2f\n", scaleX, scaleY)
    
	newWidth := int(float64(width) * 0.7/scaleX)
	newHeight := int(float64(height) * 0.7/scaleY)
	fmt.Println("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
	fmt.Println(newWidth)
	fmt.Println(newHeight)
	runtime.WindowSetSize(ctx, newWidth, newHeight)
	runtime.WindowCenter(ctx)
	// utils.ScraperTest()
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
func (a *App) GetScraper(title string, volume string) (*utils.BookInfo, error) {
    return utils.ScraperInfo(title , volume )
}




func (a *App) FetchDirectoryTree(path string) ([]utils.FileNode, error) {
    return utils.GetDirectoryTree2(path)
}


func (a *App) GetImageBytes(filePath string) ([]byte, error) {
    data, err := os.ReadFile(filePath)
    if err != nil {
        return nil, err
    }
	fmt.Println("File size:", len(data)) // 確保讀取的檔案大小合理
    return data, nil
}

// ListZipFiles 列出 ZIP 檔案中的所有檔案名稱
func ListZipFiles(zipPath string) {
	// 打開 ZIP 檔案
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		log.Fatalf("Failed to open zip file: %v", err)
	}
	defer r.Close()

	fmt.Printf("Files in %s:\n", zipPath)
	for _, f := range r.File {
		fmt.Println(f.Name)
	}
}


func (a *App) OpenDirectoryDialog() (string, error) {
	dirPath, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:            "選擇資料夾",
		DefaultDirectory: ".",
	})
	if err != nil || dirPath == "" {
		return "", err
	}
	return dirPath, nil
}

// OpenFileDialog 用來開啟 Windows 的選擇檔案視窗
func (a *App) OpenFileDialog() (string, error) {
	filePath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "選擇檔案",
		DefaultDirectory: ".",
		// Filters: []runtime.FileFilter{
		// 	{DisplayName: "圖片檔案", Pattern: "*.png;*.jpg;*.jpeg;*.gif"},
		// },
	})
	if err != nil || filePath == "" {
		return "", err
	}
	return filePath, nil
}

// GetImageBase64 讀取圖片檔案並返回 Base64 編碼的字符串
func (a *App) GetImageBase64(filePath string) (string, error) {
	// 讀取圖片檔案
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %v", err)
	}

	// 將圖片檔案轉換為 Base64 字串
	base64Str := base64.StdEncoding.EncodeToString(data)
	return base64Str, nil
}

// ReadZipInfo 開啟檔案選擇器並列出 ZIP 檔案內容
func (a *App) ReadZipInfo() {
	// 呼叫 OpenFileDialog 選擇 ZIP 檔案
	zipPath, err := a.OpenFileDialog()
	if err != nil {
		log.Fatalf("Failed to select file: %v", err)
	}

	// 列出 ZIP 檔案內容
	ListZipFiles(zipPath)
}

// ImageData 用來儲存檔名、Base64 字串與副檔名
type ImageData struct {
	FileName   string // 檔名
	Base64Data string // 圖片的 Base64 字串
	Extension  string // 副檔名
}

// ExtractImagesFromZip 解析 ZIP 檔並返回指定數量的圖片資料
func (a *App) ExtractImagesFromZip(zipPath string, limit int) ([]ImageData, error) {
	// 打開 ZIP 檔案
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open zip file: %v", err)
	}
	defer r.Close()

	var images []ImageData
	count := 0

	// 遍歷 ZIP 檔內的所有檔案
	for _, f := range r.File {
		// 取得副檔名並轉小寫
		ext := strings.ToLower(filepath.Ext(f.Name))
		// 檢查副檔名是否為圖片類型
		if ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".gif" {

			// 開啟圖片檔
			rc, err := f.Open()
			if err != nil {
				log.Printf("Failed to open file in zip: %v", err)
				continue
			}
			defer rc.Close()

			// 讀取圖片資料
			data, err := ioutil.ReadAll(rc)
			if err != nil {
				log.Printf("Failed to read file in zip: %v", err)
				continue
			}
			fmt.Println(f.Name)
			// 編碼為 Base64 字串
			base64Str := base64.StdEncoding.EncodeToString(data)

			// 將圖片資料存入 ImageData 結構
			imageData := ImageData{
				FileName:   f.Name,
				Base64Data: base64Str,
				Extension:  ext,
			}
			images = append(images, imageData)

			// 如果達到指定數量，就跳出
			count++
			if count >= limit {
				break
			}
		}
	}

	if len(images) == 0 {
		return nil, fmt.Errorf("no images found in the zip file")
	}
	return images, nil
}


// ExtractImagesFromZipAllPages 解析 ZIP 檔案並返回符合檔名條件的所有圖片資料
func (a *App) ExtractImagesFromZipByPages(zipPath string, page int) ([]ImageData, error) {
    // 打開 ZIP 檔案
    r, err := zip.OpenReader(zipPath)
    if err != nil {
        return nil, fmt.Errorf("failed to open zip file: %v", err)
    }
    defer r.Close()

    var images []ImageData

    // 將 page 轉為三位數字格式（例如 15 轉為 015，0 轉為 000）
    pageStr := fmt.Sprintf("%03d", page)

    // 遍歷 ZIP 檔內的所有檔案
    for _, f := range r.File {
        // 取得副檔名並轉小寫
        ext := strings.ToLower(filepath.Ext(f.Name))
        
        // 檢查副檔名是否為圖片類型
        if ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".gif" {
            // 當 page == 0 時，檢查檔名是否符合 000.xxx 或 0.xxx
            if page == 0 && (strings.HasPrefix(f.Name, "000") || strings.HasPrefix(f.Name, "0") && !strings.HasPrefix(f.Name, "01")) {
                // 開啟圖片檔
                rc, err := f.Open()
                if err != nil {
                    log.Printf("Failed to open file in zip: %v", err)
                    continue
                }
                defer rc.Close()

                // 讀取圖片資料
                data, err := ioutil.ReadAll(rc)
                if err != nil {
                    log.Printf("Failed to read file in zip: %v", err)
                    continue
                }

                // 編碼為 Base64 字串
                base64Str := base64.StdEncoding.EncodeToString(data)

                // 將圖片資料存入 ImageData 結構
                imageData := ImageData{
                    FileName:   f.Name,
                    Base64Data: base64Str,
                    Extension:  ext,
                }
                images = append(images, imageData)
            }

            // 當 page > 0 時，檢查檔名是否符合 page 的格式（例如：015.xxx 或 15.xxx）
            if page > 0 && (strings.HasPrefix(f.Name, pageStr) || strings.HasPrefix(f.Name, fmt.Sprintf("%d", page))) {
                // 開啟圖片檔
                rc, err := f.Open()
                if err != nil {
                    log.Printf("Failed to open file in zip: %v", err)
                    continue
                }
                defer rc.Close()

                // 讀取圖片資料
                data, err := ioutil.ReadAll(rc)
                if err != nil {
                    log.Printf("Failed to read file in zip: %v", err)
                    continue
                }

                // 編碼為 Base64 字串
                base64Str := base64.StdEncoding.EncodeToString(data)

                // 將圖片資料存入 ImageData 結構
                imageData := ImageData{
                    FileName:   f.Name,
                    Base64Data: base64Str,
                    Extension:  ext,
                }
                images = append(images, imageData)
            }
        }
    }

    if len(images) == 0 {
        return nil, fmt.Errorf("no images found for page %d in the zip file", page)
    }

    return images, nil
}

type ComicInfo struct {
	Title   string `xml:"Title"`
	Series  string `xml:"Series"`
	Year    int    `xml:"Year"`
	Month   int    `xml:"Month"`
	Day     int    `xml:"Day"`
	Writer  string `xml:"Writer"`
}

func (a *App) ReadComicInfoXML(zipPath string) (*ComicInfo, error) {
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		return nil, err
	}
	defer r.Close()

	var comicInfo ComicInfo

	for _, f := range r.File {
		if f.Name == "ComicInfo.xml" {
			rc, err := f.Open()
			if err != nil {
				return nil, err
			}
			defer rc.Close()

			// 讀取 XML 檔案內容
			xmlData, err := io.ReadAll(rc)
			if err != nil {
				return nil, err
			}

			// 解析 XML
			err = xml.Unmarshal(xmlData, &comicInfo)
			if err != nil {
				return nil, err
			}

			return &comicInfo, nil
		}
	}

	return nil, fmt.Errorf("ComicInfo.xml not found")
}