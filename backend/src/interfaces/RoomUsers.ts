/** Interface for room users record */
export interface RoomUsers {
    [roomId: string]: Set<string>;
}