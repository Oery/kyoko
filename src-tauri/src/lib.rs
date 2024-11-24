#[derive(serde::Serialize, Clone)]
struct Packet {
    id: u8,
    source: String,
    state: String,
}

#[tauri::command]
fn new_packet(app: tauri::AppHandle) -> Packet {
    const SOURCES: [&str; 2] = ["Client", "Server"];
    const STATES: [&str; 4] = ["Handshake", "Status", "Login", "Play"];

    let id = rand::random::<u8>();
    let source_rand = rand::random::<usize>() % SOURCES.len();
    let source = SOURCES[source_rand].to_string();
    let state_rand = rand::random::<usize>() % STATES.len();
    let state = STATES[state_rand].to_string();

    Packet { id, source, state }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![new_packet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
