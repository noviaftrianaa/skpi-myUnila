// Package openapi — load dan compile OpenAPI spec dari YAML files dengan
// preserve field order (penting supaya UI docs tampilin properti sesuai
// urutan source: mis. username → password, bukan alfabet).
//
// Pakai yaml.Node di seluruh pipeline karena map[string]interface{} di Go
// tidak order-stable.
package openapi

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

//go:embed *.yaml paths/*.yaml schemas/*.yaml responses/*.yaml
var specFiles embed.FS

// Spec represents the compiled OpenAPI specification (order-preserving).
type Spec struct {
	root *yaml.Node // yaml.DocumentNode, content[0] = mapping node
}

// LoadSpec loads + compile OpenAPI spec. Semua $ref di-resolve inline.
func LoadSpec() (*Spec, error) {
	mainContent, err := specFiles.ReadFile("openapi.yaml")
	if err != nil {
		return nil, fmt.Errorf("read openapi.yaml: %w", err)
	}

	var root yaml.Node
	if err := yaml.Unmarshal(mainContent, &root); err != nil {
		return nil, fmt.Errorf("parse openapi.yaml: %w", err)
	}

	s := &Spec{root: &root}
	if err := resolveRefsInNode(s.mappingNode(), ""); err != nil {
		return nil, fmt.Errorf("resolve refs: %w", err)
	}
	return s, nil
}

// mappingNode returns the root mapping node (skip DocumentNode wrapper).
func (s *Spec) mappingNode() *yaml.Node {
	if s.root == nil {
		return nil
	}
	if s.root.Kind == yaml.DocumentNode && len(s.root.Content) > 0 {
		return s.root.Content[0]
	}
	return s.root
}

// GetYAML mengembalikan compiled spec sebagai YAML (order preserved).
func (s *Spec) GetYAML() []byte {
	out, err := yaml.Marshal(s.root)
	if err != nil {
		return nil
	}
	return out
}

// GetJSON mengembalikan compiled spec sebagai JSON (order preserved via custom walk).
func (s *Spec) GetJSON() ([]byte, error) {
	obj := nodeToJSONOrdered(s.mappingNode())
	return json.Marshal(obj)
}

// ============================================================================
// Ref resolution (yaml.Node-based — preserve order)
// ============================================================================

// resolveRefsInNode walks recursively. Saat nemu mapping `$ref: ...`, replace
// mapping tersebut dengan content file yang di-refer.
func resolveRefsInNode(node *yaml.Node, basePath string) error {
	if node == nil {
		return nil
	}

	switch node.Kind {
	case yaml.MappingNode:
		// Check if this mapping contains $ref as sole key (or any key, since we
		// splice the whole mapping). OpenAPI convention: $ref siblings are ignored.
		for i := 0; i < len(node.Content); i += 2 {
			keyNode := node.Content[i]
			valNode := node.Content[i+1]
			if keyNode.Value == "$ref" && valNode.Kind == yaml.ScalarNode {
				resolved, err := loadRef(valNode.Value, basePath)
				if err != nil {
					return fmt.Errorf("$ref %s: %w", valNode.Value, err)
				}
				// Overwrite this mapping node in-place dengan resolved node.
				*node = *resolved
				return nil // done for this node
			}
		}
		// Recurse into each value.
		for i := 1; i < len(node.Content); i += 2 {
			if err := resolveRefsInNode(node.Content[i], basePath); err != nil {
				return err
			}
		}

	case yaml.SequenceNode:
		for _, child := range node.Content {
			if err := resolveRefsInNode(child, basePath); err != nil {
				return err
			}
		}
	}
	return nil
}

// loadRef reads the target file + navigates JSON-pointer path + returns its
// yaml.Node. Nested $ref di dalam file target juga di-resolve.
func loadRef(ref, basePath string) (*yaml.Node, error) {
	parts := strings.SplitN(ref, "#", 2)
	filePath := strings.TrimPrefix(parts[0], "./")
	jsonPath := ""
	if len(parts) > 1 {
		jsonPath = parts[1]
	}

	if filePath == "" {
		return nil, fmt.Errorf("local $ref tidak di-support")
	}

	if basePath != "" {
		filePath = filepath.ToSlash(filepath.Join(basePath, filePath))
	}

	content, err := specFiles.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", filePath, err)
	}

	var fileRoot yaml.Node
	if err := yaml.Unmarshal(content, &fileRoot); err != nil {
		return nil, fmt.Errorf("parse %s: %w", filePath, err)
	}
	// DocumentNode → MappingNode
	var entry *yaml.Node
	if fileRoot.Kind == yaml.DocumentNode && len(fileRoot.Content) > 0 {
		entry = fileRoot.Content[0]
	} else {
		entry = &fileRoot
	}

	// Navigate JSON pointer
	if jsonPath != "" {
		segments := strings.Split(strings.TrimPrefix(jsonPath, "/"), "/")
		for _, seg := range segments {
			if seg == "" {
				continue
			}
			if entry.Kind != yaml.MappingNode {
				return nil, fmt.Errorf("path %s: current node bukan mapping", jsonPath)
			}
			var next *yaml.Node
			for i := 0; i < len(entry.Content); i += 2 {
				if entry.Content[i].Value == seg {
					next = entry.Content[i+1]
					break
				}
			}
			if next == nil {
				return nil, fmt.Errorf("path %s: segment %s tidak ketemu", jsonPath, seg)
			}
			entry = next
		}
	}

	// Resolve nested $refs dalam entry (base path = folder file yang di-load).
	newBase := filepath.ToSlash(filepath.Dir(filePath))
	if newBase == "." {
		newBase = ""
	}
	if err := resolveRefsInNode(entry, newBase); err != nil {
		return nil, err
	}

	return entry, nil
}

// ============================================================================
// yaml.Node → JSON (order preserving via json.RawMessage + custom ordering)
// ============================================================================

// nodeToJSONOrdered converts yaml.Node tree ke Go object yang ketika di-
// json.Marshal mempertahankan urutan kunci. Untuk mapping kita pakai
// []json.RawMessage pair — tapi Go map default di json.Marshal itu sorted.
// Jadi: kita manual build json bytes via ordered slice of key-value lalu wrap
// sebagai json.RawMessage.
func nodeToJSONOrdered(n *yaml.Node) interface{} {
	if n == nil {
		return nil
	}
	switch n.Kind {
	case yaml.ScalarNode:
		return scalarValue(n)
	case yaml.SequenceNode:
		out := make([]interface{}, 0, len(n.Content))
		for _, child := range n.Content {
			out = append(out, nodeToJSONOrdered(child))
		}
		return out
	case yaml.MappingNode:
		// Build ordered JSON raw message
		pairs := make([]string, 0, len(n.Content)/2)
		for i := 0; i < len(n.Content); i += 2 {
			keyBytes, _ := json.Marshal(n.Content[i].Value)
			valBytes, _ := json.Marshal(nodeToJSONOrdered(n.Content[i+1]))
			pairs = append(pairs, string(keyBytes)+":"+string(valBytes))
		}
		raw := "{" + strings.Join(pairs, ",") + "}"
		return json.RawMessage(raw)
	case yaml.DocumentNode:
		if len(n.Content) > 0 {
			return nodeToJSONOrdered(n.Content[0])
		}
	case yaml.AliasNode:
		if n.Alias != nil {
			return nodeToJSONOrdered(n.Alias)
		}
	}
	return nil
}

// scalarValue converts YAML scalar tag → Go type (preserve int/float/bool/null).
func scalarValue(n *yaml.Node) interface{} {
	switch n.Tag {
	case "!!null", "":
		if n.Value == "" || n.Value == "~" || n.Value == "null" {
			if n.Tag == "!!null" {
				return nil
			}
			// empty string
			return n.Value
		}
		return n.Value
	case "!!bool":
		return n.Value == "true"
	case "!!int":
		var i int64
		fmt.Sscanf(n.Value, "%d", &i)
		return i
	case "!!float":
		var f float64
		fmt.Sscanf(n.Value, "%g", &f)
		return f
	default:
		return n.Value
	}
}

// ============================================================================
// Debug helper
// ============================================================================

// ListFiles returns all embedded YAML files (for debugging)
func ListFiles() ([]string, error) {
	var files []string
	err := fs.WalkDir(specFiles, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() && strings.HasSuffix(path, ".yaml") {
			files = append(files, path)
		}
		return nil
	})
	return files, err
}
