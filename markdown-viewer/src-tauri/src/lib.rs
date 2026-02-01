use std::fs;
use std::path::Path;
use std::sync::mpsc;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

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

    app.dialog()
        .file()
        .add_filter("Markdown", &["md", "markdown"])
        .add_filter("Text", &["txt"])
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            get_file_name,
            open_file_dialog,
            save_file_dialog,
            confirm_dialog
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
