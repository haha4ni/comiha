package utils

import (
	"fmt"
	"log"
	"net/url"
    "strings"
    "time"
    "math/rand"

	"github.com/gocolly/colly/v2"
)

type BookInfo struct {
	Title       string
	Volume      string
	Author      string
	Tags        []string
	Publisher   string
	ReleaseDate string
	PageCount   string
	EPUBFormat  string
	Description string // 新增「內容簡介」欄位
}


// 初始化隨機種子
func init() {
	rand.Seed(time.Now().UnixNano()) // 使用當前時間作為種子，確保每次執行隨機
}

// 隨機延遲 1.0 ~ 2.0 秒（包含小數點）
func randomDelay() {
	delay := time.Duration(rand.Float64()*3000+3000) * time.Millisecond // 1000~2000 毫秒
	log.Printf("隨機延遲: %.3f 秒\n", float64(delay)/float64(time.Second)) // 轉換為秒並顯示小數點
	time.Sleep(delay)
}

var userAgents = []string{
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:38.0) Gecko/20100101 Firefox/38.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:63.0) Gecko/20100101 Firefox/63.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.37",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/85.0.564.51",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36",
}


// 隨機選擇 User-Agent
func randomUserAgent() string {
	rand.Seed(time.Now().UnixNano())
	return userAgents[rand.Intn(len(userAgents))]
}

func FindBookURL(bookName string) (string, error) {
	c := colly.NewCollector()

	// 設定 User-Agent 和 Referer
	c.OnRequest(func(r *colly.Request) {
		log.Println("正在訪問:", r.URL.String()) // 紀錄訪問的網址
		// r.Headers.Set("User-Agent", randomUserAgent())
		r.Headers.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
		r.Headers.Set("Accept-Language", "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7") // 模擬語言
		r.Headers.Set("Connection", "keep-alive") // 保持連線
		r.Headers.Set("Referer", "https://www.bookwalker.com.tw/")
	})

	// 在收到回應時印出 HTML
	c.OnResponse(func(r *colly.Response) {
		log.Println("收到 HTML，長度:", len(r.Body)) // 印出 HTML 的長度

		// 避免超出字串長度
		if len(r.Body) > 500 {
			log.Println("HTML 頭 500 字:", string(r.Body[:500]))
		} else {
			log.Println("完整 HTML:", string(r.Body))
		}
	})

	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 2,               // Parallelism 是匹配域名的最大允许并发请求数
		Delay:       time.Duration(rand.Float64()*1000+1000) * time.Millisecond, // 隨機延遲 1~3 秒
	})

	// 轉換搜尋字串為 URL 格式
	query := url.QueryEscape(bookName)
	searchURL := fmt.Sprintf("https://www.bookwalker.com.tw/search?w=%s&series_display=1", query)
	log.Println("搜尋 URL:", searchURL)

	var bookURL string

	// 解析搜尋結果列表，尋找第一本書的超連結
	c.OnHTML(".bwbookitem a", func(e *colly.HTMLElement) {
		href := e.Attr("href")
		// title := e.Text
		// log.Println("找到鏈接:", href, "標題:", title)
        log.Println("找到鏈接:", href)

		if bookURL == "" { // 只抓取第一本書的網址
			bookURL = href
			log.Println("選擇的書籍網址:", bookURL)
		}
	})

	// randomDelay() // 訪問前隨機延遲

	// 開始爬取
	err := c.Visit(searchURL)
	if err != nil {
		log.Println("Error visiting page:", err)
		return "", err
	}

	// 檢查是否成功取得書籍網址
	if bookURL == "" {
		log.Println("未找到符合的書籍")
		return "", fmt.Errorf("未找到書籍: %s", bookName)
	}

	// 返回書籍的完整網址
	finalURL := "https://www.bookwalker.com.tw" + bookURL
	log.Println("最終書籍網址:", finalURL)
	return finalURL, nil
}

func FindBookDetails(seriesURL string, targetVolume string) (string, error) {
	c := colly.NewCollector()

	// 設定 User-Agent 和 Referer
	c.OnRequest(func(r *colly.Request) {
		r.Headers.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
		r.Headers.Set("Accept-Language", "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7") // 模擬語言
		r.Headers.Set("Connection", "keep-alive") // 保持連線
		r.Headers.Set("Referer", "https://www.bookwalker.com.tw/")
	})

	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 2,               // Parallelism 是匹配域名的最大允许并发请求数
		Delay:       time.Duration(rand.Float64()*1000+1000) * time.Millisecond, // 隨機延遲 1~3 秒
	})


	var bookURL string

	// 抓取該系列頁面上的所有書籍
    c.OnHTML(".listbox_bwmain2 a", func(e *colly.HTMLElement) {
        bookTitle := strings.TrimSpace(e.DOM.Find("h4.bookname").Text()) // 抓取書名
        href := e.Attr("href")                                         // 抓取超連結
    
        log.Println("找到鏈接:", href, "標題:", bookTitle)
    
        // 檢查書名是否包含目標卷數 (targetVolume)，例如 "(6)"
        if strings.Contains(bookTitle, "("+targetVolume+")") {
            bookURL = href
            log.Println("找到符合的書籍:", bookTitle, "網址:", bookURL)
        }
    })

	// 開始抓取該系列的頁面
	err := c.Visit(seriesURL)
	if err != nil {
		log.Println("Error visiting page:", err)
		return "", err
	}

	if bookURL == "" {
		return "", fmt.Errorf("未找到符合卷數 (%s) 的書籍", targetVolume)
	}

	// 返回完整書籍詳細頁面 URL
	return bookURL, nil
}

func FindBookInfo(bookURL string) (*BookInfo, error) {
	// 確保 bookURL 是完整網址
	if !strings.HasPrefix(bookURL, "http") {
		bookURL = "https://www.bookwalker.com.tw" + bookURL
	}

	fmt.Println("找到的書籍詳細頁面網址:", bookURL)

	c := colly.NewCollector()

	var bookInfo BookInfo

	// 設定 User-Agent 和 Referer
	c.OnRequest(func(r *colly.Request) {
		r.Headers.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
		r.Headers.Set("Accept-Language", "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7") // 模擬語言
		r.Headers.Set("Connection", "keep-alive") // 保持連線
		r.Headers.Set("Referer", "https://www.bookwalker.com.tw/")
	})

	c.Limit(&colly.LimitRule{
		DomainGlob:  "*",
		Parallelism: 2,               // Parallelism 是匹配域名的最大允许并发请求数
		Delay:       time.Duration(rand.Float64()*1000+1000) * time.Millisecond, // 隨機延遲 1~3 秒
	})


	// 解析書籍的詳細資訊
	c.OnHTML("#writerinfo", func(e *colly.HTMLElement) {
		// 取得所有作者
		e.ForEach(".writer_data dd a", func(i int, el *colly.HTMLElement) {
			if i > 0 {
				bookInfo.Author += ", " // 多個作者時用逗號分隔
			}
			// bookInfo.Author += el.Text
			bookInfo.Author += strings.TrimSpace(strings.ReplaceAll(el.Text, "\n", " "))

		})

		// 取得所有類型標籤
		e.ForEach(".bookinfo_more li", func(_ int, el *colly.HTMLElement) {
			label := el.ChildText("span.title") // 找到標籤名稱
			// value := strings.TrimSpace(el.Text)
			value := strings.TrimSpace(strings.ReplaceAll(strings.Replace(el.Text, label, "", 1), "\n", " ")) // 移除標籤名稱並清理換行


			switch label {
			case "類型標籤：":
				el.ForEach("a", func(_ int, tag *colly.HTMLElement) {
					bookInfo.Tags = append(bookInfo.Tags, tag.Text)
				})
			case "出版社：":
				bookInfo.Publisher = value
			case "發售日：":
				bookInfo.ReleaseDate = value
			case "頁數：":
				bookInfo.PageCount = value
			case "EPUB格式：":
				bookInfo.EPUBFormat = value
			}
		})
	})

	// 抓取內容簡介
	c.OnHTML(".product-introduction-container", func(e *colly.HTMLElement) {
		bookInfo.Description = strings.TrimSpace(e.Text)
		log.Println("內容簡介:", bookInfo.Description)
	})


	// 開始抓取該書籍的詳細頁面
	err := c.Visit(bookURL)
	if err != nil {
		log.Println("Error visiting page:", err)
		return nil, err
	}

	return &bookInfo, nil
}


func ScraperTest(){
	seriesURL, err := FindBookURL("結緣甘神神社")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("#找到的書籍網址:", seriesURL)

	// 查詢該系列的指定書籍
	bookURL, err := FindBookDetails(seriesURL, "3")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("找到的書籍詳細頁面網址:", bookURL)

	bookInfo, err := FindBookInfo(bookURL)
	if err != nil {
		log.Fatal(err)
	}
	bookInfo.Title = "結緣甘神神社"
	bookInfo.Volume = "3"
	fmt.Println("書名:", bookInfo.Title)
	fmt.Println("集數:", bookInfo.Volume)
	fmt.Println("作者:", bookInfo.Author)
	fmt.Println("類型標籤:", bookInfo.Tags)
	fmt.Println("出版社:", bookInfo.Publisher)
	fmt.Println("發售日:", bookInfo.ReleaseDate)
	fmt.Println("頁數:", bookInfo.PageCount)
	fmt.Println("EPUB格式:", bookInfo.EPUBFormat)
	fmt.Println("內容簡介:", bookInfo.Description) // 新增輸出
}

func ScraperInfo(title string, volume string) (*BookInfo, error) {
	seriesURL, err := FindBookURL(title)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("#找到的書籍網址:", seriesURL)

	// 查詢該系列的指定書籍
	bookURL, err := FindBookDetails(seriesURL, volume)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("找到的書籍詳細頁面網址:", bookURL)

	bookInfo, err := FindBookInfo(bookURL)
	if err != nil {
		log.Fatal(err)
	}
	bookInfo.Title = title
	bookInfo.Volume = volume

	return bookInfo, nil
}