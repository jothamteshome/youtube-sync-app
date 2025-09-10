import { useState, useEffect } from "react";
import { Info } from "lucide-react";

export default function RoomInfo({ roomId }: { roomId: string }) {
  const [latency, setLatency] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ping = async () => {
      const start = Date.now();
      try {
        await fetch("/api/health");
        setLatency(Date.now() - start);
      } catch {
        setLatency(null);
      }
    };
    ping();
    const interval = setInterval(ping, 5000);
    return () => clearInterval(interval);
  }, []);


  const getLatencyColor = () => {
    if (latency === null) return "bg-gray-400";
    if (latency < 100) return "bg-green-500";
    if (latency < 250) return "bg-yellow-500";
    return "bg-red-500";
  };

  
  const getCopyColor = () => {
    if (copied) return "text-green-600";
    else return "text-blue-600";
  }


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);

      // Reset text after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };



  return (
    <div className="relative self-start">
      {/* Info Button */}
      <button
        className="p-2 rounded-full hover:bg-gray-100"
        onClick={() => setShow((s) => !s)}
      >
        <Info className="w-5 h-5 text-gray-600" />
      </button>

      {/* Info Box */}
      {show && (
        <div className="absolute left-0 mt-2 w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="text-sm text-gray-700">
            <p className="font-semibold">Room:</p>
            <p className="font-mono flex items-center justify-between">
              {roomId}
              <button
                onClick={handleCopy}
                className={`ml-2 text-xs ${getCopyColor()} hover:underline cursor-pointer`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </p>

            <p className="mt-2 font-semibold">Latency:</p>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${getLatencyColor()}`}
              ></span>
              <span>{latency !== null ? `${latency}ms` : "-"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
