const extractYouTubeId = (parsed: URL): { videoId?: string, service: string } => {
    const service: string = "youtube";
    let videoId: string | undefined;

    try {
        const hostname = parsed.hostname;

        if (hostname.includes("youtu.be")) {
            videoId = parsed.pathname.slice(1);
        } else if (hostname.includes("youtube.com")) {

            if (parsed.pathname.startsWith("/watch")) videoId = parsed.searchParams.get("v") ?? undefined;
            else if (parsed.pathname.startsWith("/shorts/")) videoId = parsed.pathname.split("/")[2];

        }

        if (!videoId || videoId.length !== 11) videoId = undefined; 

        return { videoId, service };
    } catch {
        return { videoId, service };
    }
};


export default function extractVideoId (url: string): { videoId?: string, service?: string } {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    if (hostname.includes("youtu.be") || hostname.includes("youtube.com")) {
        return extractYouTubeId(parsed);
    }

    return { videoId: undefined, service: undefined };
};