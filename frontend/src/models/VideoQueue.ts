import type { QueueState } from "../interfaces/States";

export default class Queue {
    private items: string[] = [];
    private currentIndex: number = -1;
    private isLooping: boolean = false;

    public add(item: string) {
        this.items.push(item);
    };


    public next() {
        // Return if queue is empty
        if (this.items.length === 0) return;

        // Return if not looping and at end of queue
        if (!this.isLooping && this.currentIndex === this.items.length - 1) return;

        // Move to next item
        if (this.isLooping) {
            this.currentIndex = (this.currentIndex + 1) % this.items.length;
        } else {
            this.currentIndex++;
        }
    };


    public sync(state: QueueState) {
        this.items = state.items;
        this.currentIndex = state.currentIndex;
        this.isLooping = state.isLooping;
    }


    get current(): string | undefined {
        return this.items[this.currentIndex];
    }


}