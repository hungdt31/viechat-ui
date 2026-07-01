# Vibma MCP Tools Reference

## Connection

### join_channel
**REQUIRED FIRST.** Connect to Figma via channel.
```javascript
mcp__Vibma__join_channel({ channel: "vibma" })
```

### ping
Verify connection. Returns `{ status: 'pong', documentName, currentPage }`.
```javascript
mcp__Vibma__ping()
```

### reset_tunnel
**DESTRUCTIVE.** Factory-reset stuck channel. Use only when channel occupied.

## Document Navigation

### get_document_info
Get document name, current page, all pages list.

### get_current_page
Get current page info and top-level children.

### set_current_page
Switch page by `pageId` or `pageName` (case-insensitive partial match).

### create_page / rename_page
Create new page or rename existing.

## Node Operations

### search_nodes
Search by name/type on current page. Paginated (default 50).
```javascript
mcp__Vibma__search_nodes({
  query: "Dashboard",
  types: ["FRAME", "TEXT"],
  limit: 50
})
```

### get_node_info
Get detailed info. Use `fields` to filter properties.
```javascript
mcp__Vibma__get_node_info({
  nodeIds: ["1:2", "1:3"],
  fields: ["absoluteBoundingBox", "fills"],
  depth: 1
})
```

### get_selection / set_selection
Get/set selected nodes. `set_selection` also scrolls viewport.

## Creation Tools

### create_frame
Create frames with auto-layout support.
```javascript
mcp__Vibma__create_frame({
  items: [{
    name: "Card",
    width: 300, height: 200,
    x: 0, y: 0,
    cornerRadius: 16,
    fillColor: { r: 1, g: 1, b: 1 },
    layoutMode: "VERTICAL",
    paddingTop: 20, paddingBottom: 20,
    paddingLeft: 20, paddingRight: 20,
    itemSpacing: 16
  }]
})
```

### create_text
Create text nodes with typography settings.
```javascript
mcp__Vibma__create_text({
  items: [{
    text: "Hello World",
    parentId: "1:2",
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "Inter",
    fontColor: { r: 0.12, g: 0.16, b: 0.22 },
    layoutSizingHorizontal: "FILL"
  }]
})
```

### create_auto_layout
Wrap existing nodes in auto-layout frame.
```javascript
mcp__Vibma__create_auto_layout({
  items: [{
    nodeIds: ["1:2", "1:3"],
    name: "Row",
    layoutMode: "HORIZONTAL",
    itemSpacing: 12
  }]
})
```

### create_section
Create section nodes for canvas organization.

### create_node_from_svg
Create nodes from SVG strings.

## Modification Tools

### patch_nodes
Update geometry, appearance, layout, text properties.
```javascript
mcp__Vibma__patch_nodes({
  items: [{
    nodeId: "1:2",
    fill: { color: { r: 0.15, g: 0.39, b: 0.92 } },
    cornerRadius: { radius: 12 },
    layout: { layoutMode: "VERTICAL", itemSpacing: 16 }
  }]
})
```

### insert_child
Move/reorder nodes into parent at specific index.

### clone_node
Duplicate nodes with optional new position.

### delete_node
Remove nodes (batch supported).

## Styles & Variables

### styles
CRUD for paint/text/effect styles.
```javascript
// List styles
mcp__Vibma__styles({ method: "list", type: "paint" })

// Create paint style
mcp__Vibma__styles({
  method: "create",
  type: "paint",
  items: [{ name: "Primary", color: { r: 0.15, g: 0.39, b: 0.92 } }]
})
```

### variables
CRUD for design variables (COLOR, FLOAT, STRING, BOOLEAN).

### set_variable_binding
Bind variables to node properties.

### get_node_variables
Get variable bindings on a node.

## Quality & Export

### lint_node
Run design linter. Rules: `no-autolayout`, `hardcoded-color`, `wcag-contrast`, etc.
```javascript
mcp__Vibma__lint_node({
  nodeId: "1:2",
  rules: ["hardcoded-color", "wcag-contrast"]
})
```

### lint_fix_autolayout
Auto-fix: convert frames to auto-layout.

### export_node_as_image
Export as PNG, JPG, SVG, or PDF.
```javascript
mcp__Vibma__export_node_as_image({
  nodeId: "1:2",
  format: "PNG",
  scale: 2
})
```

## Text Operations

### scan_text_nodes
Scan all text nodes in a subtree.

### set_text_content
Update text content of existing text nodes.
