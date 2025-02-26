import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";



// Wails API
import { GetImageBase64,OpenFileDialog, FetchDirectoryTree} from "../../wailsjs/go/main/App";

const Navbar = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [open, setOpen] = useState(false);

  //
  const [treeData, setTreeData] = useState([]);

  // 開關側邊選單
  const toggleDrawer = (openState) => () => {
    setOpen(openState);
  };


  // C:\Users\Haha\Desktop\未提供相片說明。.jpg
  
  const getImageMimeType = (filePath) => {
    const ext = filePath.split(".").pop().toLowerCase();
    switch (ext) {
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "webp":
        return "image/webp";
      default:
        return "image/jpeg"; // 預設使用 JPEG
    }
  };
  // 選擇檔案並顯示圖片
  const handleLoad = async () => {
    try {
      const result = await OpenFileDialog(); // 呼叫 Wails API 開啟檔案選擇器
    // const result = "C:\\Users\\Haha\\Desktop\\555.jpg";
    console.log("Selected file:", result);

    if (result) {
        // 呼叫後端 API 將圖片轉換為 Base64 字串
        // const base64String = await GetImageBase64(result);
        // const imageBase64 = `data:image/jpeg;base64,${base64String}`;
        // setImageSrc(imageBase64);  // 顯示圖片

        const base64Image = await GetImageBase64(result);
        // console.log("Base64 Image:", base64Image);
        const mimeType = getImageMimeType(result);
        setImageSrc(`data:${mimeType};base64,${base64Image}`);
    } else {
      window.alert("沒有選擇任何檔案");
    }
  } catch (error) {
    console.error("Failed to open file:", error);
  }
};


  // 讀取目錄樹狀結構
  const loadDirectoryTree = async () => {
    try {
      const dirPath = "C:\\Users\\Haha\\Desktop\\myprojectre"; // 修改為你要讀取的目錄
      console.log("Fetching directory tree for:", dirPath); // Log 讀取的目錄路徑
  
      const result = await FetchDirectoryTree(dirPath);
      
      console.log("Directory tree fetched successfully:", result); // Log 回傳的樹狀結構
      console.log("Fetch count:", (window.fetchCount = (window.fetchCount || 0) + 1)); // 計算 fetch 次數
      
      setTreeData(result);
    } catch (error) {
      console.error("Failed to load directory:", error);
    }
  };

  // 初次載入時讀取目錄
  useEffect(() => {
    loadDirectoryTree();
  }, []);

  // 遞迴渲染樹狀結構
  const renderTree = (nodes) => (
    nodes.map((node) => (
      <TreeItem key={node.path} itemId={node.path} label={node.name}>
        {node.children && node.children.length > 0 ? renderTree(node.children) : null}
      </TreeItem>
    ))
  );

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          {/* 漢堡選單按鈕 */}
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>

          {/* 標題 */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Website
          </Typography>

          {/* 導覽連結 */}
          <Button color="inherit" href="#home">Home</Button>
          <Button color="inherit" href="#news">News</Button>
          <Button color="inherit" href="#about">About</Button>
          <Button color="inherit" href="#contact">Contact</Button>
        </Toolbar>

        {/* 側邊選單 (Drawer) */}
        <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
          <List>
            <ListItem button component="a" href="#home" onClick={toggleDrawer(false)}>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button component="a" href="#news" onClick={toggleDrawer(false)}>
              <ListItemText primary="News" />
            </ListItem>
            <ListItem button component="a" href="#about" onClick={toggleDrawer(false)}>
              <ListItemText primary="About" />
            </ListItem>
            <ListItem button component="a" href="#contact" onClick={toggleDrawer(false)}>
              <ListItemText primary="Contact" />
            </ListItem>
            {/* Load 按鈕，點擊後開啟選檔案視窗 */}
            <ListItem button onClick={handleLoad}>
              <ListItemText primary="Load" />
            </ListItem>
          </List>
        </Drawer>

      {/* 顯示選擇的圖片 */}
      
      </AppBar>
      <SimpleTreeView>
  {renderTree(treeData)}
</SimpleTreeView>
      <button onClick={handleLoad}>選擇圖片</button>
      {imageSrc && <img src={imageSrc} alt="選擇的圖片" style={{ maxWidth: "100%" }} />}

    </>
  );
};

export default Navbar;
