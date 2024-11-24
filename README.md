# Kyoko

> [!CAUTION]
> Kyoko is currently in development and is not yet ready for use. I still need to implement JSON serializing to Kagami for Kyoko to be able to read packets.

**Kyoko** is a powerful GUI-based application designed to debug Minecraft packets. Built with modern tools and efficiency in mind, Kyoko offers a seamless experience for inspecting, filtering, and visualizing Minecraft network packets. Whether you're a Minecraft mod developer, a network engineer, or just a curious enthusiast, Kyoko simplifies the complex task of analyzing Minecraft's network traffic.

> [!WARNING]
> Kyoko was made for the 1.8.9 version of Minecraft because its primary use is to debug plugins made with [Kagami](https://github.com/Oery/Kagami) which itself is made for 1.8.9 as most closed source clients are made for that version.

---

## Features

- **Proxy-Based Debugging**  
  Launch a lightweight proxy that Minecraft can connect to, enabling you to capture and analyze network traffic in real-time.
- **Packet Inspection**  
  View a detailed list of incoming and outgoing packets, complete with content visualization.

- **Filtering**  
  Apply filters to narrow down the packets of interest, making it easier to focus on specific traffic.

- **Rust-Powered Performance**  
  Built entirely in Rust, leveraging the safety, speed, and concurrency features of the language:

  - The GUI is powered by [Tauri](https://tauri.app/), ensuring a lightweight, cross-platform desktop experience.
  - The packet proxy is built using [Kagami](https://github.com/Oery/Kagami), a Rust crate specifically designed for Minecraft packet handling.

- **Cross-Platform Compatibility**  
  Works on Windows, macOS, and Linux.

---

## Usage

1. **Start the Proxy**  
   Launch Kyoko and start the proxy server from the application interface. You’ll see the connection details (IP and port) to use.

2. **Connect Minecraft**  
   Open Minecraft and connect to the proxy using the provided IP and port.

3. **Inspect Packets**  
   Once connected, Kyoko will display a real-time list of incoming and outgoing packets. Use the filtering options to refine the displayed packets.

4. **Visualize Packet Content**  
   Click on a packet to view its detailed content and structure.
