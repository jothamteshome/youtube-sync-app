import { useState } from "react";
import { formatCount, formatYoutubeDate } from "../../utils/formatVideoInfo";


/**
 * Props for DescriptionStats component.
 */
interface DescriptionStatsProps {
    videoPublishedAt: number;
    videoViewCount: number;
}


/**
 * Props for VideoDescriptionText component.
 */
interface VideoDescriptionTextProps {
    videoDescription: string;
}


/**
 * Props for VideoDescription component.
 */
interface VideoDescriptionProps {
    maxChars?: number;
    videoDescription: string;
    videoPublishedAt: number;
    videoViewCount: number;
}


/**
 * Renders video stats (views and publish date).
 */
function DescriptionStats({ videoPublishedAt, videoViewCount }: DescriptionStatsProps) {
    const viewsText = videoViewCount === 1 ? "view" : "views";

    return (
        <div className="flex">
            <p className="font-bold text-sm">{`${formatCount(videoViewCount, 1)} ${viewsText}`}</p>
            <p className="font-bold text-sm ml-2">{formatYoutubeDate(videoPublishedAt)}</p>
        </div>
    );
}


/**
 * Renders the video description, converting URLs to links.
 */
function VideoDescriptionText({ videoDescription }: VideoDescriptionTextProps) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let parts = videoDescription?.split(urlRegex);

    if (!parts) parts = [];

    return (
        <div className="whitespace-pre-wrap">
            {parts.map((part, i) =>
                part.match(urlRegex) ? (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        {part}
                    </a>
                ) : (
                    part
                )
            )}
        </div>
    );
};


/**
 * Renders the video description section with expand/collapse.
 */
export default function VideoDescription({ maxChars = 200, videoDescription, videoPublishedAt, videoViewCount }: VideoDescriptionProps) {
    const [expanded, setExpanded] = useState(false);
    if (!videoDescription) videoDescription = "";

    const isLong = videoDescription.length > maxChars;
    const videoDescriptionText = expanded || !isLong ? videoDescription : videoDescription?.slice(0, maxChars) + "...";

    return (
        <div className="flex flex-col rounded-xl bg-neutral-800 mt-2 p-4">
            <DescriptionStats videoPublishedAt={videoPublishedAt!} videoViewCount={videoViewCount!} />
            <VideoDescriptionText videoDescription={videoDescriptionText} />
            {
                isLong &&
                <button className="font-light text-xs"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? "Show Less" : "Show More"}
                </button>
            }

        </div>
    );
}