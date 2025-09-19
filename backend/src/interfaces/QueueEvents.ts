/** Interface for `queue:add` events */
export interface QueueAddEvent {
    roomId: string;
    eventId: number;
    videoUrl: string;
};


/** Interface for `queue:next` events */
export interface QueueNextEvent {
    roomId: string;
    eventId: number;
};