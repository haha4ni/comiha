package utils

import (
	"os"
	"path/filepath"
)

// FileNode 表示檔案或目錄的節點
type FileNode struct {
	Name     string     `json:"name"`
	Path     string     `json:"path"`
	Children []FileNode `json:"children,omitempty"`
}

// GetDirectoryTree 遞迴讀取目錄
func GetDirectoryTree(dirPath string) ([]FileNode, error) {
	var nodes []FileNode

	files, err := os.ReadDir(dirPath)
	if err != nil {
		return nil, err
	}

	for _, file := range files {
		node := FileNode{
			Name: file.Name(),
			Path: filepath.Join(dirPath, file.Name()),
		}

		if file.IsDir() {
			children, err := GetDirectoryTree(node.Path)
			if err != nil {
				return nil, err
			}
			node.Children = children
		}

		nodes = append(nodes, node)
	}

	return nodes, nil
}


// FetchDirectoryTree 包裝成以選擇的目錄作為根結點
// func GetDirectoryTree2(rootPath string) ([]FileNode, error) {
// 	rootNode := &FileNode{
// 		Name: filepath.Base(rootPath), // 設定為根目錄名稱
// 		Path: rootPath,
// 	}

// 	children, err := GetDirectoryTree(rootPath)
// 	if err != nil {
// 		return nil, err
// 	}

// 	rootNode.Children = children
// 	return rootNode, nil
// }

func GetDirectoryTree2(rootPath string) ([]FileNode, error) {
	rootNode := FileNode{
		Name: filepath.Base(rootPath), // 設定為根目錄名稱
		Path: rootPath,
	}

	children, err := GetDirectoryTree(rootPath)
	if err != nil {
		return nil, err
	}

	rootNode.Children = children
	return []FileNode{rootNode}, nil // 以陣列形式回傳
}