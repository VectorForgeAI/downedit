use std::fs;
use std::path::Path;
use std::sync::mpsc;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};
use base64::{Engine as _, engine::general_purpose};

// Read a file and return its content
#[tauri::command]
fn read_file(path: &str) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

// Write content to a file
#[tauri::command]
fn write_file(path: &str, content: &str) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

// Write binary content to a file (for PDF, DOCX, etc.)
#[tauri::command]
fn write_binary_file(path: &str, data: Vec<u8>) -> Result<(), String> {
    fs::write(path, data).map_err(|e| e.to_string())
}

// Get file name from path
#[tauri::command]
fn get_file_name(path: &str) -> String {
    Path::new(path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Untitled")
        .to_string()
}

// Open file dialog and return selected paths
#[tauri::command]
async fn open_file_dialog(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let (tx, rx) = mpsc::channel();

    app.dialog()
        .file()
        .add_filter("Markdown", &["md", "markdown"])
        .add_filter("Text", &["txt"])
        .add_filter("All Supported", &["md", "markdown", "txt"])
        .pick_files(move |file_paths| {
            let paths = file_paths
                .map(|paths| {
                    paths
                        .iter()
                        .map(|p| p.to_string())
                        .collect::<Vec<String>>()
                })
                .unwrap_or_default();
            let _ = tx.send(paths);
        });

    rx.recv()
        .map_err(|e| format!("Failed to receive dialog result: {}", e))
}

// Save file dialog and return selected path
#[tauri::command]
async fn save_file_dialog(app: tauri::AppHandle, default_name: &str) -> Result<Option<String>, String> {
    let (tx, rx) = mpsc::channel();

    // Determine file type from extension
    let extension = Path::new(default_name)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("md");

    let mut dialog = app.dialog().file();

    // Add appropriate filter based on file type
    dialog = match extension.to_lowercase().as_str() {
        "pdf" => dialog.add_filter("PDF Document", &["pdf"]),
        "docx" => dialog.add_filter("Word Document", &["docx"]),
        "html" | "htm" => dialog.add_filter("HTML Document", &["html", "htm"]),
        "txt" => dialog.add_filter("Text File", &["txt"]),
        _ => dialog
            .add_filter("Markdown", &["md", "markdown"])
            .add_filter("Text", &["txt"]),
    };

    dialog
        .set_file_name(default_name)
        .save_file(move |file_path| {
            let path = file_path.map(|p| p.to_string());
            let _ = tx.send(path);
        });

    rx.recv()
        .map_err(|e| format!("Failed to receive dialog result: {}", e))
}

// Show confirmation dialog
#[tauri::command]
async fn confirm_dialog(app: tauri::AppHandle, title: &str, message: &str) -> Result<bool, String> {
    let (tx, rx) = mpsc::channel();

    app.dialog()
        .message(message)
        .title(title)
        .buttons(MessageDialogButtons::OkCancelCustom("Save".into(), "Don't Save".into()))
        .show(move |result| {
            let _ = tx.send(result);
        });

    rx.recv()
        .map_err(|e| format!("Failed to receive dialog result: {}", e))
}

// Open image file dialog
#[tauri::command]
async fn open_image_dialog(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let (tx, rx) = mpsc::channel();

    app.dialog()
        .file()
        .add_filter("Images", &["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"])
        .pick_file(move |file_path| {
            let path = file_path.map(|p| p.to_string());
            let _ = tx.send(path);
        });

    rx.recv()
        .map_err(|e| format!("Failed to receive dialog result: {}", e))
}

// Read image file and return as base64 data URI
#[tauri::command]
fn read_image_as_base64(path: &str) -> Result<String, String> {
    let data = fs::read(path).map_err(|e| e.to_string())?;
    
    // Determine MIME type from extension
    let extension = Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("png")
        .to_lowercase();
    
    let mime_type = match extension.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "svg" => "image/svg+xml",
        "bmp" => "image/bmp",
        _ => "image/png",
    };
    
    let base64_data = general_purpose::STANDARD.encode(&data);
    Ok(format!("data:{};base64,{}", mime_type, base64_data))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            write_binary_file,
            get_file_name,
            open_file_dialog,
            save_file_dialog,
            confirm_dialog,
            open_image_dialog,
            read_image_as_base64
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
