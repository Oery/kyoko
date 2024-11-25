use kagami::minecraft::packets::play::client::Chat;
use kagami::minecraft::packets::status::server::ServerInfo;
use kagami::minecraft::{GlobalPacket, Packet};
use kagami::tcp::context::Context;
use kagami::Kagami;
use std::net::SocketAddr;
use std::sync::Arc;
use tauri::{Emitter, State};
use tokio::sync::Mutex;
use tokio::task::JoinHandle;

#[derive(serde::Serialize, Clone)]
struct KyokoPacket {
    id: String,
    source: String,
    state: String,
}

struct ProxyControl {
    handle: Option<JoinHandle<()>>,
}

impl ProxyControl {
    fn new() -> Self {
        ProxyControl { handle: None }
    }
}

#[tauri::command]
async fn start_proxy(
    state: State<'_, Arc<Mutex<ProxyControl>>>,
    app: tauri::AppHandle,
) -> Result<(), ()> {
    let mut control = state.lock().await;

    if control.handle.is_some() {
        println!("Task is already running");
        return Ok(());
    }

    let handle = tokio::spawn(async move {
        let remote_addr = SocketAddr::new(
            std::net::IpAddr::V4(std::net::Ipv4Addr::new(127, 0, 0, 1)),
            25565,
        );
        let mut proxy = Kagami::new(remote_addr);

        proxy.register_callback(|ctx: &mut Context<ServerInfo>| {
            ctx.packet.server_info.description = Some("Connected through Kyoko".to_string());
            kagami::Actions::Modify
        });

        let app_clone = app.clone();
        proxy.register_callback(move |ctx: &mut Context<Chat>| {
            println!("Chat: {}", ctx.packet.message);
            let id = ctx.packet.get_id();

            let _ = app_clone.emit(
                "new-packet",
                KyokoPacket {
                    id: format!("0x{:2X}", id),
                    source: ctx.packet.get_origin().to_string(),
                    state: "Unknown".to_string(),
                },
            );

            kagami::Actions::Transfer
        });

        proxy.register_global_callback(move |global: &GlobalPacket| {
            let id = global.packet.as_packet().get_id();

            let _ = app.emit(
                "new-packet",
                KyokoPacket {
                    id: format!("0x{:2X}", id),
                    source: global.packet.as_packet().get_origin().to_string(),
                    state: "Unknown".to_string(),
                },
            );
        });

        let _ = proxy.run().await;
    });

    control.handle = Some(handle);
    Ok(())
}

#[tauri::command]
async fn stop_proxy(state: State<'_, Arc<Mutex<ProxyControl>>>) -> Result<(), ()> {
    let mut control = state.lock().await;

    if let Some(handle) = control.handle.take() {
        handle.abort();
        println!("Task stopped");
    } else {
        println!("No task to stop");
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(ProxyControl::new())))
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![start_proxy, stop_proxy])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
