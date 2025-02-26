import React, { useState, useEffect } from "react";
import {
  GetImageBase64,
  OpenFileDialog,
  FetchDirectoryTree,
} from "../../wailsjs/go/main/App";
import IndeterminateCheckBoxRoundedIcon from "@mui/icons-material/IndeterminateCheckBoxRounded";
import DisabledByDefaultRoundedIcon from "@mui/icons-material/DisabledByDefaultRounded";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import { styled, alpha } from "@mui/material/styles";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";

const PathTree = (props) => {
    const { onSelect,selectedFolderPath } = props;  // 從 props 中解構取得 onSelect


  const [treeData, setTreeData] = useState([]);
  const loadDirectoryTree = async () => {
    try {
      const dirPath = selectedFolderPath; // 修改為你要讀取的目錄
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
  }, [selectedFolderPath]);

  const handleItemClick = (path) => {
    console.log("Clicked:", path);
    if (onSelect) {
      onSelect(path); // 回傳路徑給外部
    }
  };

  const renderTree = (nodes) =>
    nodes.map((node) => (
      <CustomTreeItem
        key={node.path}
        itemId={node.path}
        label={node.name}
        onClick={() => handleItemClick(node.path)} // 點擊事件
      >
        {node.children && node.children.length > 0
          ? renderTree(node.children)
          : null}
      </CustomTreeItem>
    ));

  const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
    [`& .${treeItemClasses.content}`]: {
      padding: theme.spacing(0.5, 1),
      margin: theme.spacing(0.2, 0),
      [`& .${treeItemClasses.label}`]: {
        fontSize: '0.8rem', // 這裡控制字體大小
        fontWeight: 500,
      },
    },
    [`& .${treeItemClasses.iconContainer}`]: {
      "& .close": {
        opacity: 0.3,
      },
    },
    [`& .${treeItemClasses.groupTransition}`]: {
      marginLeft: 15,
      paddingLeft: 8,
      borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    },
  }));

  function ExpandIcon(props) {
    return <AddBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
  }

  function CollapseIcon(props) {
    return (
      <IndeterminateCheckBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />
    );
  }

  function EndIcon(props) {
    return <DisabledByDefaultRoundedIcon {...props} sx={{ opacity: 0.3 }} />;
  }

  return (
    <div className="stack-small">
      <SimpleTreeView
        aria-label="customized"
        defaultExpandedItems={["1", "3"]}
        slots={{
          expandIcon: ExpandIcon,
          collapseIcon: CollapseIcon,
          endIcon: EndIcon,
        }}
        sx={{
          overflowX: "hidden",
          textAlign: "left",
          minHeight: 270,
          flexGrow: 1,
          maxWidth: 300,
        }}
      >
        {renderTree(treeData)}
      </SimpleTreeView>
    </div>
  );
};

export default PathTree;
