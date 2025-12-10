import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    nav("/login");
  };

  return (
    <div className="p-6 bg-white h-screen">

      <h1 className="text-3xl font-bold text-primary mb-6">
        Teacher Dashboard
      </h1>

      <div className="flex gap-4">

        <button
          className="bg-primary-light text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90"
          onClick={() => nav("/create-session")}
        >
          Create Session
        </button>

        <button
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90"
          onClick={() => nav("/attendance")}
        >
          View Attendance
        </button>

        <button
          className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90"
          onClick={logout}
        >
          Logout
        </button>

      </div>
    </div>
  );
}
