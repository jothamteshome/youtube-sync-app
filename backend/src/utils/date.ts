export default function getFormattedDate(): string {
    const timestamp = Date.now();
    const formattedDate = new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    
    return formattedDate;
}