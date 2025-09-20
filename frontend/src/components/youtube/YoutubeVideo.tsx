import type VideoData from "../../models/VideoData";
import VideoInfo from "../youtube/VideoInfo";
import VideoDescription from "../youtube/VideoDescription";
import YoutubeFrame from "../youtube/YoutubeFrame";

/**
 * Props for YoutubeVideo component.
 */
interface YoutubeVideoProps {
    videoData?: VideoData;
}


/**
 * Renders the YouTube video player and related info.
 * Only displays content if videoData is provided.
 */
export default function YoutubeVideo({ videoData }: YoutubeVideoProps) {
    // If no video data, hide the component
    const displayType = videoData ? "flex" : "hidden";

    return (
        <div className={`w-full ${displayType} flex-col items-center`}>
            <div className="w-4/5 max-w-7xl flex flex-col">
                {/* YouTube video frame */}
                <YoutubeFrame />

                {videoData &&
                    <>
                        {/* Video information */}
                        <VideoInfo
                            videoLikeCount={videoData.videoLikeCount}
                            videoTitle={videoData.videoTitle}
                            channelIcon={videoData.channelIcon}
                            channelTitle={videoData.channelTitle}
                            channelUrl={videoData.channelUrl}
                            subscriberCount={videoData.subscriberCount}
                        />

                        {/* Video description */}
                        <VideoDescription
                            videoDescription={videoData.videoDescription}
                            videoPublishedAt={videoData.videoPublishedAt}
                            videoViewCount={videoData.videoViewCount}
                        />
                    </>
                }
            </div>
        </div>
    );
}