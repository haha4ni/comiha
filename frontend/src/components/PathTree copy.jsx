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
  const { onSelect, selectedFolderPath } = props;

  const [treeData, setTreeData] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);

  // 讀取目錄樹狀結構
  const loadDirectoryTree = async () => {
    try {
      const dirPath = selectedFolderPath;
      console.log("Fetching directory tree for:", dirPath);

      const result = await FetchDirectoryTree(dirPath);
      console.log("Directory tree fetched successfully:", result);
      setTreeData(result);

      // 遞迴處理樹狀資料，將所有節點的 `itemId` 收集到 expandedItems 中
      const collectExpandedItems = (nodes) => {
        let itemIds = [];
        nodes.forEach((node) => {
          itemIds.push(node.path); // 收集每個節點的 path
          if (node.children && node.children.length > 0) {
            itemIds = [...itemIds, ...collectExpandedItems(node.children)];
          }
        });
        return itemIds;
      };

      // 收集並設置所有節點的 `itemId`
      const allExpandedItems = collectExpandedItems(result);
      setExpandedItems(allExpandedItems); // 設定 expandedItems

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
        expandedItems={expandedItems} // 這裡將所有節點 ID 傳遞進去，確保所有節點都展開
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
