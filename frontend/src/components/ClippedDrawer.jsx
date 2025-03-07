import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import Button from "@mui/material/Button";

import PathTree from "./PathTree.jsx";
import path from "path"; // 確保已經匯入 path 模組
import { TextField } from "@mui/material";
// Wails API
import {
  GetImageBase64,
  OpenFileDialog,
  FetchDirectoryTree,
  GetImageBytes,
  ReadZipInfo,
  ExtractImagesFromZip,
  ExtractImagesFromZipByPages,
  ReadComicInfoXML,
  OpenDirectoryDialog,
  GetScraper,
  GetThumbnails,
} from "../../wailsjs/go/main/App";

const drawerWidth = 55;
const draweRWidth = 200;
const secondDrawerWidth = 200;

export default function DoubleDrawer() {
  const [series, setSeries] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [writer, setWriter] = useState("");

  // **新增**：顯示在圖片右側的書籍資訊
  const [displayTitle, setDisplayTitle] = useState("");
  const [displayVolume, setDisplayVolume] = useState("");
  const [displayWriter, setDisplayWriter] = useState("");
  const [displayPublisher, setDisplayPublisher] = useState("");
  const [displayReleaseDate, setDisplayReleaseDate] = useState("");
  const [displayPageCount, setDisplayPageCount] = useState("");
  const [displayEpubFormat, setDisplayEpubFormat] = useState("");
  const [displayDescription, setDisplayDescription] = useState("");

  const extractBookInfo = (filepath) => {
    const filename = filepath.split(/[/\\]/).pop(); // 取得檔案名稱，不管是 / 或 \

    // 嘗試匹配：書名 + 任意格式的集數
    const match = filename.match(
      /^(.+?)\s*[\(\[\{]?\s*(\d+)\s*[\)\]\}]?\s*(?:\.\w+)?$/
    );

    if (match) {
      return {
        bookTitle: match[1].trim(), // 書名
        bookVolume: match[2].trim(), // 集數
      };
    }

    return { bookTitle: "", bookVolume: "" }; // 匹配失敗，回傳空字串
  };

  const handleSubmit = () => {
    console.log("Series:", series);
    console.log("Title:", title);
    setOpen(false);
  };
  const [selectedPath, setSelectedPath] = useState("");
  const [imageList, setImageList] = useState([]);

  const handleSelect = async (filepath) => {
    // 把 handleSelect 標記為 async
    setSelectedPath(filepath);
    console.log("Selected file:", filepath); // 打印 filepath
    console.log("Type of filepath:", typeof filepath); // 顯示 filepath 的型態

    // 使用原生 JavaScript 字串處理檔案副檔名
    const ext = filepath
      .slice(((filepath.lastIndexOf(".") - 1) >>> 0) + 2)
      .toLowerCase();
    console.log("file ext:", ext); // 打印 filepath
    if (ext === "zip") {
      // 在 async 函式內使用 await
      const images = await ExtractImagesFromZipByPages(filepath, 0);
      if (images && images.length > 0) {
        const formattedImages = images.map((img) => ({
          fileName: img.FileName,
          extension: img.Extension,
          base64Data: img.Base64Data,
        }));
        // 打印 formattedImages 來檢視結果
        console.log("Formatted Images:", formattedImages);
        setImageList(formattedImages); // 儲存圖片 Base64 字串陣列
      } else {
        window.alert("ZIP 檔內沒有圖片");
      }

      try {
        // 讀取 ComicInfo.xml
        const comicInfo = await ReadComicInfoXML(filepath);
        console.log("ComicInfo:", comicInfo);

        if (comicInfo) {
          setSeries(comicInfo.Series || "");
          setTitle(comicInfo.Title || "");
          setYear(comicInfo.Year ? comicInfo.Year.toString() : "");
          setMonth(comicInfo.Month ? comicInfo.Month.toString() : "");
          setDay(comicInfo.Day ? comicInfo.Day.toString() : "");
          setWriter(comicInfo.Writer || "");
        }
      } catch (error) {
        console.error("Error reading ComicInfo.xml:", error);
        setSeries("");
        setTitle("");
        setYear("");
        setMonth("");
        setDay("");
        setWriter("");
      }

      try {
        setDisplayTitle("");
        setDisplayVolume("");
        setDisplayWriter("");
        setDisplayPublisher("");
        setDisplayReleaseDate("");
        setDisplayPageCount("");
        setDisplayEpubFormat("");
        setDisplayDescription("");
        const { bookTitle, bookVolume } = extractBookInfo(filepath);
        const comicInfo = await GetScraper(bookTitle, bookVolume);
        console.log("ComicInfo:", comicInfo);

        if (comicInfo) {
          setDisplayTitle(comicInfo.Title || "");
          setDisplayVolume(comicInfo.Volume || "");
          setDisplayWriter(comicInfo.Author || "");
          setDisplayPublisher(comicInfo.Publisher || "");
          setDisplayReleaseDate(comicInfo.ReleaseDate || "");
          setDisplayPageCount(comicInfo.PageCount || "");
          setDisplayEpubFormat(comicInfo.EPUBFormat || "");
          setDisplayDescription(comicInfo.Description || "");
        }
      } catch (err) {
        console.error("取得 Scraper 資訊失敗:", err);
      }

      // 縮圖
      try {
        console.log("Selected file:", filepath); // ✅ Debug: 確保有選擇 ZIP

        const thumbnails = await GetThumbnails(filepath);
        if (!thumbnails || thumbnails.length === 0) {
          console.error("❌ 沒有縮圖可用");
          return;
        }

        setThumbnailList(thumbnails); // ✅ 存入狀態
      } catch (error) {
        console.error("❌ 讀取縮圖失敗:", error);
      }
    }
  };

  const [secondDrawerOpen, setSecondDrawerOpen] = React.useState(false);

  const toggleSecondDrawer = () => {
    setSecondDrawerOpen(!secondDrawerOpen);
  };

  const [paragraphMargin, setParagraphMargin] = useState(0);

  useEffect(() => {
    if (secondDrawerOpen) {
      setParagraphMargin(0); // 第二層滑出時，段落右移
    } else {
      setParagraphMargin(-secondDrawerWidth); // 第二層收回時，段落恢復
    }
  }, [secondDrawerOpen]);

  const [selectedFolderPath, setSelectedFolderPath] = useState("./comic");

  const handleFolderSelect = (path) => {
    setSelectedFolderPath(path);
  };

  const handleOpenFileDialog = async () => {
    try {
      const path = await OpenDirectoryDialog();
      if (path) {
        setSelectedFolderPath(path);
        console.log("setSelectedFolderPath", path); // Log 讀取的目錄路徑
      }
    } catch (error) {
      console.error("Failed to select path:", error);
    }
  };
  const [thumbnailList, setThumbnailList] = useState([]); // ✅ 定義縮圖狀態

  // const [thumbnails, setThumbnails] = useState([]);
  // useEffect(() => {
  //   GetThumbnails().then(setThumbnails);
  // }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 2, height: 50 }}
      >
        <Toolbar variant="dense">
          <Typography variant="h6" noWrap component="div">
            Haha's Comic
          </Typography>
        </Toolbar>
      </AppBar>
      {/* 第一層 Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1, // 設定較高 zIndex
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Box sx={{ height: 50 }} /> {/* 使用 Box 墊高 */}
        <Box sx={{ overflow: "auto" }}>
          <List>
            {["Inbox"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  onClick={toggleSecondDrawer}
                  sx={{ paddingY: 0.0 }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      display: "flex",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    sx={{
                      width: "0", // 根據 Drawer 開啟狀態調整寬度
                      opacity: 0, // 在關閉時隱藏文本
                      overflow: "hidden", // 防止多餘的內容顯示
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          {/* <Button onClick={toggleSecondDrawer} sx={{ width: "100%" }}>
            {secondDrawerOpen ? "Close" : "Open"}
          </Button> */}
        </Box>
      </Drawer>

      {/* 第二層 Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={secondDrawerOpen}
        sx={{
          width: secondDrawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: secondDrawerWidth,
            boxSizing: "border-box",
            left: drawerWidth,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <Button
            variant="contained"
            onClick={handleOpenFileDialog}
            sx={{ mb: 2 }}
          >
            選擇路徑
          </Button>
          <PathTree
            onSelect={handleSelect}
            selectedFolderPath={selectedFolderPath}
          />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />

        <Typography
          sx={{
            transition: "margin-left 0.3s ease",
            marginLeft: `${paragraphMargin}px`,
          }}
        >
          {/* 讓圖片 & 書籍資訊並排 */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              backgroundColor: "#f5f5f5", // ✅ 設定背景顏色為淺灰色
              borderRadius: "10px", // ✅ 設定圓角
              padding: 2, // ✅ 內邊距，讓內容不貼邊
            }}
          >
            {/* 左側圖片區域 */}
            <Box sx={{ flex: 1 }}>
              {imageList.map((img, index) => (
                <img
                  key={index}
                  src={`data:image/${img.extension.replace(".", "")};base64,${
                    img.base64Data
                  }`}
                  alt={img.fileName || `Image ${index + 1}`}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    aspectRatio: "215 / 320",
                    maxHeight: "calc(100vh - 160px)",
                    objectFit: "cover",
                    margin: "5px",
                    borderRadius: "10px", // ✅ 設定圖片圓角
                  }}
                />
              ))}
            </Box>

            {/* 右側書籍資訊區域 */}
            <Box sx={{ flex: 1, textAlign: "left" }}>
              {selectedPath ? (
                <>
                  <Typography variant="h6">{displayTitle}</Typography>
                  <Typography variant="body1">集數: {displayVolume}</Typography>
                  <Typography variant="body1">作者: {displayWriter}</Typography>
                  <Typography variant="body1">
                    出版社: {displayPublisher}
                  </Typography>
                  <Typography variant="body1">
                    發售日: {displayReleaseDate}
                  </Typography>
                  <Typography variant="body1">
                    頁數: {displayPageCount}
                  </Typography>
                  <Typography variant="body1">
                    EPUB格式: {displayEpubFormat}
                  </Typography>
                  <Typography sx={{ mt: 2 }}>內容簡介:</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    margin="dense"
                    multiline
                    minRows={4}
                    value={displayDescription}
                    onChange={(e) => setDisplayDescription(e.target.value)}
                  />
                </>
              ) : (
                ""
              )}
            </Box>
          </Box>
        </Typography>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {thumbnailList
            // 將圖片根據檔名中的數字部分進行排序
  .sort((a, b) => {
    // 提取數字部分進行比較
    const numA = parseInt(a.FileName, 10);
    const numB = parseInt(b.FileName, 10);
    return numA - numB;
  })
          
          .map((img, index) => {
            // console.log("Image data for", img.FileName, ":", img.Thumbnail); // 檢查每個縮圖的資料
            console.log("Image data for", img.FileName, ":"); // 檢查每個縮圖的資料
            return (
              <img
                key={index}
                src={`data:image/jpeg;base64,${img.Thumbnail}`}
                alt={img.FileName}
                style={{
                  width: "215px",
                  height: "320px",
                  borderRadius: "10px",
                  margin: "5px",
                  boxShadow: "0px 4px 6px rgba(0,0,0,0.1)", // ✅ 陰影
                }}
              />
            );
          })}
        </div>
      </Box>
    </Box>
  );
}
