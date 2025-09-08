import { Search } from "lucide-react";

type SearchBarProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
};

export default function SearchBar({ onChange, onClick}: SearchBarProps) {
  return (
    <div className="flex w-4/5 max-w-3xl border border-gray-300 rounded-full overflow-hidden shadow-sm mb-8">
      <input
        type="text"
        placeholder="Search"
        onChange={onChange}
        className="w-full px-4 py-2 outline-none"
      />
      <button className="px-4 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-full hover:bg-gray-200"
        onClick={onClick}>
        <Search className="w-5 h-5 text-gray-600" />
      </button>

    </div>
  );
}
