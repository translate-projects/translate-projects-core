import WebSocket from "ws";
import { Logger } from "./logger";

export const listenProgress = async (taskId: string, callback: (progress: number) => void): Promise<void> => {
    const url = `wss://translateprojects.dev/ws/progress/${taskId}/`;

    const websocket = new WebSocket(url);

    websocket.onmessage = (event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);
            const progress = parseFloat(data.progress || "0");
            if (progress > 100) {
                websocket.close();
            }
            callback(progress);
        } catch (error) {
            Logger.error("❌ Error: Failed to decode JSON", error);
        }
    };

    websocket.onerror = (error: Event) => {
        Logger.error("❌ Error: WebSocket error", error);
    };

    websocket.onclose = () => {
        Logger.info("ℹ️ Info: WebSocket connection closed");
    };
};