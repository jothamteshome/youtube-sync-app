interface RoomUsers {
    [roomId: string]: Set<string>;
}

export const roomUsers: RoomUsers = {};