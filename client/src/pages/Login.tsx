import React, { useState } from "react";
import { useNavigate } from "react-router";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailExists = localStorage.getItem(email);
    if (emailExists) {
      localStorage.setItem("currentUserEmail", email);
    } else {
      localStorage.setItem(email, JSON.stringify({ cards: [] }));
    }
    navigate("/dashboard");
  };

  return (
    <div className="p-4">
      <main className="grid place-center">
        <h1 className="text-lg font-medium">Login</h1>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            // type="email"
            placeholder="Enter your email"
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </main>
    </div>
  );
};

export default Login;
