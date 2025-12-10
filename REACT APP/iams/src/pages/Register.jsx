import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          employee_id: form.employeeId,
          role: "teacher",
        },
      },
    });

    if (signUpError) return setError(signUpError.message);

    nav("/login");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-96 p-8 bg-white rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-primary mb-2">
          Teacher Registration
        </h1>
        <p className="text-gray-500 mb-6">Create your teacher account.</p>

        <input
          className="w-full p-3 rounded-xl bg-input mb-3 outline-primary"
          placeholder="Full Name"
          onChange={(e) =>
            setForm({ ...form, fullName: e.target.value })
          }
        />
        <input
          className="w-full p-3 rounded-xl bg-input mb-3 outline-primary"
          placeholder="Employee ID"
          onChange={(e) =>
            setForm({ ...form, employeeId: e.target.value })
          }
        />
        <input
          className="w-full p-3 rounded-xl bg-input mb-3 outline-primary"
          placeholder="Email"
          type="email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />
        <input
          className="w-full p-3 rounded-xl bg-input mb-3 outline-primary"
          placeholder="Password"
          type="password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          className="w-full p-3 rounded-xl text-white bg-primary-light font-semibold hover:opacity-90 mt-2"
          onClick={handleRegister}
        >
          Register
        </button>

        <p className="mt-4 text-center text-primary">
          <a href="/login">Back to Login</a>
        </p>

      </div>
    </div>
  );
}
