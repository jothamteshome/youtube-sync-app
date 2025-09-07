export interface VideoEvent {
    roomId: string;
    event: "play" | "pause" | "seek";
    time: number;
}