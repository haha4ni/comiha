import React, { useState, useEffect,useRef  } from "react";
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
import { GetImageBase64, OpenFileDialog, FetchDirectoryTree, GetImageBytes,ReadZipInfo ,ExtractImagesFromZip} from "../../wailsjs/go/main/App";

const Navbar = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [open, setOpen] = useState(false);
  const [treeData, setTreeData] = useState([]);

  const [imageList, setImageList] = useState([]);

  const imageRef = useRef(null); // 引用<img>標籤

  // 開關側邊選單
  const toggleDrawer = (openState) => () => {
    setOpen(!open);
  };


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

  const handleLoad = async () => {
    try {
      const result = await OpenFileDialog(); // 呼叫 Wails API 開啟檔案選擇器
      console.log("Selected file:", result);

      if (result) {
        // const base64Image = await GetImageBase64(result);
        // const mimeType = getImageMimeType(result);
        // setImageSrc(`data:${mimeType};base64,${base64Image}`);
              // 呼叫 ExtractImagesFromZip 並傳入想要讀取的圖片數量
              // ReadZipInfo();

        const images = await ExtractImagesFromZip(result, 10); 
        if (images && images.length > 0) {
          setImageList(images); // 儲存圖片 Base64 字串陣列
        } else {
          window.alert("ZIP 檔內沒有圖片");
        }
      } else {
        window.alert("沒有選擇任何檔案");
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  const loadDirectoryTree = async () => {
    try {
      const dirPath = "C:\\Users\\Haha\\Desktop\\myprojectre"; // 修改為你要讀取的目錄
      console.log("Fetching directory tree for:", dirPath); // Log 讀取的目錄路徑

      const result = await FetchDirectoryTree(dirPath);
      console.log("Directory tree fetched successfully:", result); // Log 回傳的樹狀結構
      setTreeData(result);
    } catch (error) {
      console.error("Failed to load directory:", error);
    }
  };

  useEffect(() => {
    loadDirectoryTree();
  }, []);

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
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Website
          </Typography>

          <Button color="inherit" href="#home">Home</Button>
          <Button color="inherit" href="#news">News</Button>
          <Button color="inherit" href="#about">About</Button>
          <Button color="inherit" href="#contact">Contact</Button>
        </Toolbar>
      </AppBar>

      {/* 側邊選單 (Drawer) */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(true)}
        variant="persistent"  // 設定為 persistent 以避免背景灰色
        sx={{
          textAlign:"left",
          "& .MuiDrawer-paper": {
            position: "absolute", // 改為 absolute 使它跟隨頁面滾動
            top: scrollY + 64, // 讓側邊選單的 top 隨著滾動改變
            width: 240,
            
            boxSizing: "border-box",
          },
        }}
      >
      <SimpleTreeView>
        {renderTree(treeData)}
      </SimpleTreeView>

        {/* <List>
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
          <ListItem button onClick={handleLoad}>
            <ListItemText primary="Load" />
          </ListItem>
        </List> */}
      </Drawer>

      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(true)}
        variant="persistent"  // 設定為 persistent 以避免背景灰色
        sx={{
          textAlign:"left",
          "& .MuiDrawer-paper": {
            position: "absolute", // 改為 absolute 使它跟隨頁面滾動
            top: scrollY + 64, // 讓側邊選單的 top 隨著滾動改變
            width: 240,
            
            boxSizing: "border-box",
          },
        }}
      >
      <SimpleTreeView>
        {renderTree(treeData)}
      </SimpleTreeView>
      </Drawer>

      {/* tree demo */}
      {/* <SimpleTreeView>
        <TreeItem itemId="grid" label="Data Grid">
          <TreeItem itemId="grid-community" label="@mui/x-data-grid" />
          <TreeItem itemId="grid-pro" label="@mui/x-data-grid-pro" />
          <TreeItem itemId="grid-premium" label="@mui/x-data-grid-premium" />
        </TreeItem>
        <TreeItem itemId="pickers" label="Date and Time Pickers">
          <TreeItem itemId="pickers-community" label="@mui/x-date-pickers" />
          <TreeItem itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
        </TreeItem>
        <TreeItem itemId="charts" label="Charts">
          <TreeItem itemId="charts-community" label="@mui/x-charts" />
        </TreeItem>
        <TreeItem itemId="tree-view" label="Tree View">
          <TreeItem itemId="tree-view-community" label="@mui/x-tree-view" />
        </TreeItem>
      </SimpleTreeView> */}

      
      <div><button onClick={handleLoad}>選擇圖片</button></div>
      {/* {imageSrc && <img src={imageSrc} alt="選擇的圖片" style={{ maxWidth: "100%" }} />} */}
      {imageList.map((base64Image, index) => (
          <img
            key={index}
            src={`data:image/png;base64,${base64Image}`}
            alt={`Image ${index + 1}`}
            style={{
              width: '215px',   // 設定寬度為 100px
              height: '320px',  // 設定高度為 100px
              objectFit: 'cover', // 保持比例並截斷多餘部分
              margin: '5px'
            }}
          />
        ))}
    </>
  );
};

export default Navbar;
