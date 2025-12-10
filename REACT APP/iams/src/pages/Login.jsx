import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (loginError) return setError(loginError.message);

    nav("/");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-96 p-8 bg-white rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-primary mb-2">Teacher Login</h1>
        <p className="text-gray-500 mb-6">Welcome back! Please login.</p>

        <input
          className="w-full p-3 rounded-xl bg-input mb-3 outline-primary"
          placeholder="Email"
          type="email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full p-3 rounded-xl bg-input mb-3 outline-primary"
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          className="w-full p-3 rounded-xl text-white bg-primary-light font-semibold hover:opacity-90 mt-2"
          onClick={handleLogin}
        >
          Login
        </button>

        <p className="mt-4 text-center text-primary">
          <a href="/register">Create an Account</a>
        </p>

      </div>
    </div>
  );
}
