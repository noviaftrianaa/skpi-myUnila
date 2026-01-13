package openapi

import (
	"embed"
	"fmt"
	"io/fs"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

//go:embed *.yaml paths/*.yaml schemas/*.yaml responses/*.yaml
var specFiles embed.FS

// Spec represents the compiled OpenAPI specification
type Spec struct {
	raw      map[string]interface{}
	compiled []byte
}

// LoadSpec loads and compiles the OpenAPI specification from YAML files
func LoadSpec() (*Spec, error) {
	spec := &Spec{
		raw: make(map[string]interface{}),
	}

	// Load main openapi.yaml
	mainContent, err := specFiles.ReadFile("openapi.yaml")
	if err != nil {
		return nil, fmt.Errorf("failed to read openapi.yaml: %w", err)
	}

	if err := yaml.Unmarshal(mainContent, &spec.raw); err != nil {
		return nil, fmt.Errorf("failed to parse openapi.yaml: %w", err)
	}

	// Resolve all $ref references
	if err := spec.resolveRefs(""); err != nil {
		return nil, fmt.Errorf("failed to resolve references: %w", err)
	}

	// Compile to YAML
	spec.compiled, err = yaml.Marshal(spec.raw)
	if err != nil {
		return nil, fmt.Errorf("failed to compile spec: %w", err)
	}

	return spec, nil
}

// GetYAML returns the compiled spec as YAML
func (s *Spec) GetYAML() []byte {
	return s.compiled
}

func (s *Spec) resolveRefs(basePath string) error {
	return s.resolveRefsInMap(s.raw, basePath)
}

func (s *Spec) resolveRefsInMap(m map[string]interface{}, basePath string) error {
	for key, value := range m {
		switch v := value.(type) {
		case map[string]interface{}:
			if ref, ok := v["$ref"].(string); ok {
				resolved, err := s.resolveRef(ref, basePath)
				if err != nil {
					return fmt.Errorf("failed to resolve $ref %s: %w", ref, err)
				}
				m[key] = resolved
			} else {
				if err := s.resolveRefsInMap(v, basePath); err != nil {
					return err
				}
			}
		case []interface{}:
			if err := s.resolveRefsInSlice(v, basePath); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *Spec) resolveRefsInSlice(slice []interface{}, basePath string) error {
	for i, value := range slice {
		switch v := value.(type) {
		case map[string]interface{}:
			if ref, ok := v["$ref"].(string); ok {
				resolved, err := s.resolveRef(ref, basePath)
				if err != nil {
					return fmt.Errorf("failed to resolve $ref %s: %w", ref, err)
				}
				slice[i] = resolved
			} else {
				if err := s.resolveRefsInMap(v, basePath); err != nil {
					return err
				}
			}
		case []interface{}:
			if err := s.resolveRefsInSlice(v, basePath); err != nil {
				return err
			}
		}
	}
	return nil
}

func (s *Spec) resolveRef(ref string, basePath string) (interface{}, error) {
	parts := strings.SplitN(ref, "#", 2)
	filePath := parts[0]
	jsonPath := ""
	if len(parts) > 1 {
		jsonPath = parts[1]
	}

	if filePath == "" {
		return s.resolveLocalRef(jsonPath), nil
	}

	filePath = strings.TrimPrefix(filePath, "./")
	if basePath != "" {
		filePath = filepath.Join(basePath, filePath)
	}
	filePath = filepath.ToSlash(filePath)

	content, err := specFiles.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read %s: %w", filePath, err)
	}

	var data map[string]interface{}
	if err := yaml.Unmarshal(content, &data); err != nil {
		return nil, fmt.Errorf("failed to parse %s: %w", filePath, err)
	}

	newBasePath := filepath.Dir(filePath)

	var result interface{} = data
	if jsonPath != "" {
		pathParts := strings.Split(strings.TrimPrefix(jsonPath, "/"), "/")
		for _, part := range pathParts {
			if part == "" {
				continue
			}
			if m, ok := result.(map[string]interface{}); ok {
				result = m[part]
			} else {
				return nil, fmt.Errorf("invalid path %s in %s", jsonPath, filePath)
			}
		}
	}

	if m, ok := result.(map[string]interface{}); ok {
		if err := s.resolveRefsInMap(m, newBasePath); err != nil {
			return nil, err
		}
	}

	return result, nil
}

func (s *Spec) resolveLocalRef(path string) interface{} {
	pathParts := strings.Split(strings.TrimPrefix(path, "/"), "/")
	var result interface{} = s.raw
	for _, part := range pathParts {
		if part == "" {
			continue
		}
		if m, ok := result.(map[string]interface{}); ok {
			result = m[part]
		}
	}
	return result
}

// ListFiles returns all embedded YAML files
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
