# MarkdownViewer Test Document

Welcome to MarkdownViewer! This document tests all the markdown features.

## Text Formatting

This is **bold text** and this is *italic text*. You can also use ***bold and italic*** together.

Here's some ~~strikethrough~~ text.

## Links and Images

Visit [GitHub](https://github.com) for more information.

Auto-linked URL: https://www.example.com

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

### Task List
- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task

## Code

Inline `code` looks like this.

### JavaScript Code Block
```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
    return true;
}

const result = greet("World");
```

### Python Code Block
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))
```

### Rust Code Block
```rust
fn main() {
    let message = "Hello from Rust!";
    println!("{}", message);
}
```

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> And have multiple paragraphs.

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Headers | Working | All levels H1-H6 |
| Lists | Working | Ordered, unordered, tasks |
| Code | Working | Syntax highlighting |
| Tables | Working | Full GFM support |

## Horizontal Rule

---

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

## Nested Content

1. First level
   - Nested bullet
   - Another nested bullet
     1. Deep nested number
     2. Another deep nested
   - Back to bullets
2. Back to numbers

## Math-like Content

When `x = 3`, the equation `y = x² + 2x + 1` gives us `y = 16`.

## Conclusion

This document demonstrates the full capabilities of MarkdownViewer's GFM support!
