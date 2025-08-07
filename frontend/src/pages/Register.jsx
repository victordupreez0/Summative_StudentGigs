export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-8 bg-white shadow rounded-lg">
        <h2 className="text-2xl font-bold mb-2 text-center text-black">Create your account</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">Join StudentGigs to find work or hire talent</p>

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

        <form className="space-y-4 ">
          <div className="flex gap-2">
            <input type="text" placeholder="First name" className="w-1/2 border border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 text-black" />
            <input type="text" placeholder="Last name" className="w-1/2 border border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 text-black" />
          </div>
          <div>
            <input type="email" placeholder="Email" className="w-full border border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 text-black" />
          </div>
          <div>
            <input type="password" placeholder="Password" className="w-full border border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-black">I want to:</label>
            <div className="flex gap-2">
              <button type="button" className="flex-1 border border-gray-400 py-2 rounded hover:bg-gray-100 font-medium text-black">Hire for a project</button>
              <button type="button" className="flex-1 border border-gray-400 py-2 rounded hover:bg-gray-100 font-medium text-black">Work as a student</button>
            </div>
          </div>
          <div className="flex items-start text-sm space-x-2">
            <input type="checkbox" id="terms" className="accent-blue-600 mt-1" />
            <label htmlFor="terms" className="text-black">I agree to the <a className="text-blue-600 hover:underline">Terms of Service</a> and <a className="text-blue-600 hover:underline">Privacy Policy</a></label>
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded font-semibold text-base shadow hover:bg-orange-600 transition-colors">
            Create my account
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-black">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline font-medium">Log in</a>
        </p>
      </div>
    </div>
  );
}
