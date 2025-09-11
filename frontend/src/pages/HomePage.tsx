import CreateRoom from "../components/home/CreateRoom";
import JoinRoom from "../components/home/JoinRoom";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <img src="/watch-together-logo.png" alt="Watch Together Logo" className="w-78 h-auto"/>
      <div className="p-10 flex flex-col items-center gap-8 w-full max-w-sm">
        <CreateRoom />
        <JoinRoom />
      </div>
    </div>
  );
}
