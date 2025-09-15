/**
 * Renders the YouTube player frame.
 * The actual player is initialized via the YouTube IFrame API.
 */
export default function YoutubeFrame() {
    return (
        <div className="aspect-video rounded-xl">
            <div id="youtube-player" className="w-full h-full rounded-xl" />
        </div>
    );
}