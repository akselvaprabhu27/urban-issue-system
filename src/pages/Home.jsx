import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-gray-900 to-black flex flex-col justify-center items-center text-white">

      <h1 className="text-4xl font-bold mb-10">
        Urban Issue Reporting System
      </h1>

      <div className="flex gap-6">
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-4 bg-blue-500 rounded-xl text-lg font-semibold"
        >
          👤 User
        </button>

        <button
          onClick={() => navigate("/admin-login")}
          className="px-8 py-4 bg-red-500 rounded-xl text-lg font-semibold"
        >
          🛠 Admin
        </button>
      </div>
    </div>
  );
}

export default Home;