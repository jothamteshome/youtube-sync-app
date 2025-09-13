export const extractYouTubeId = (url: string | undefined): string | undefined => {
    if (!url) return;
    
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : undefined;
};