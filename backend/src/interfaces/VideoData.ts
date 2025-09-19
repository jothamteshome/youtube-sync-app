/** Interface for video information pulled from Youtube Data API v3 */
export interface VideoData {
  videoDescription: string;
  videoLikeCount: number;
  videoPublishedAt: number;
  videoTitle: string;
  videoThumbnail: string;
  videoViewCount: number;
  channelIcon: string;
  channelTitle: string;
  channelUrl: string;
  subscriberCount: number;
};


/** Interface for channel information pulled from Youtube Data API v3 */
export interface ChannelData {
  channelIcon: string,
  channelTitle: string,
  channelUrl: string,
  subscriberCount: number
};