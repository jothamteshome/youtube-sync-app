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
}


export interface ChannelData {
  channelIcon: string,
  channelTitle: string,
  channelUrl: string,
  subscriberCount: number
}


export const cachedVideoData: Map<string, VideoData> = new Map<string, VideoData>();