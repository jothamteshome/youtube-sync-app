import { ThumbsUp, ThumbsDown } from "lucide-react";
import ChannelInfo from "./ChannelInfo";
import { formatCount } from "../../utils/formatVideoInfo";

/**
 * Props for VideoLikes component.
 */
interface VideoLikesProps {
    videoLikeCount: number;
}


/**
 * Props for VideoStats component.
 */
interface VideoStatsProps {
    videoLikeCount: number;
    channelIcon: string;
    channelTitle: string;
    channelUrl: string;
    subscriberCount: number;
}


/**
 * Renders video likes.
 */
function VideoLikes({ videoLikeCount }: VideoLikesProps) {
    return (
        <div className="w-36 flex h-10 bg-neutral-700 items-center rounded-full">
            <button className="w-2/3 flex items-center h-full hover:bg-neutral-600 rounded-l-full cursor-not-allowed">
                <ThumbsUp className="ml-2"></ThumbsUp>
                <p className="m-auto font-bold">{formatCount(videoLikeCount)}</p>
            </button>
            <div className="w-px h-6 bg-gray-400"></div>
            <button className="w-1/3 flex items-center justify-center h-full hover:bg-neutral-600 rounded-r-full cursor-not-allowed">
                <ThumbsDown className="mr-2"></ThumbsDown>
            </button>
        </div>
    );
}


/**
 * Renders video stats including channel info and likes.
 */
export default function VideoStats({ videoLikeCount, channelIcon, channelTitle, channelUrl, subscriberCount }: VideoStatsProps) {
    return (
        <div className="flex items-center justify-between flex-wrap mt-2">
            <ChannelInfo channelIcon={channelIcon} channelTitle={channelTitle} channelUrl={channelUrl} subscriberCount={subscriberCount} />
            <VideoLikes videoLikeCount={videoLikeCount} />
        </div>
    );
}