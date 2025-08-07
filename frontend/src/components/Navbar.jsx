import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm px-8 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Logo" className="h-7" />
        <span className="text-xl font-bold text-blue-600">StudentGigs</span>
      </div>

      {/* Center: Nav Links */}
      <div className="flex gap-6 items-center">
        <Link to="/login" className="text-gray-700 text-sm hover:underline">Find Work</Link>
        <Link to="/register" className="text-gray-700 text-sm hover:underline">Post a Job</Link>
        <Link to="/browse-talent" className="text-gray-700 text-sm hover:underline">Browse Talent</Link>
        <Link to="/resources" className="text-gray-700 text-sm hover:underline">Resources</Link>
      </div>

      {/* Right: Search, Icons, Profile */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
          className="bg-gray-100 rounded px-3 py-1 text-sm focus:outline-none border border-gray-200 w-44"
        />
      </div>
    </nav>
  );
}