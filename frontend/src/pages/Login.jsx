export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-8 bg-white shadow rounded-lg">
        <h2 className="text-2xl font-bold mb-2 text-center text-black">Log in to StudentGigs</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">Find gigs or hire students for your projects</p>

        <button className="w-full bg-white border border-gray-400 flex items-center justify-center gap-2 py-2 mb-3 rounded hover:bg-gray-100 font-medium text-black">
          <img src="/google.svg" alt="Google" className="h-5" />
          Continue with Google
        </button>
        <button className="w-full bg-white border border-gray-400 flex items-center justify-center gap-2 py-2 mb-4 rounded hover:bg-gray-100 font-medium text-black">
          <img src="/apple.svg" alt="Apple" className="h-5" />
          Continue with Apple
        </button>

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm mb-1 font-medium text-black">Email or Username</label>
            <input type="text" placeholder="Enter your email or username" className="w-full border border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1 text-black">
              <label className="block text-sm font-medium">Password</label>
              <a href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</a>
            </div>
            <input type="password" placeholder="Enter your password" className="w-full border border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="remember" className="accent-blue-600" />
            <label htmlFor="remember" className="text-sm text-black">Remember me</label>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold text-base shadow hover:bg-blue-700 transition-colors">
            Log in
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-black">
          Don't have an account? <a href="/register" className="text-blue-600 hover:underline font-medium">Sign up</a>
        </p>
      </div>
    </div>
  );
}
