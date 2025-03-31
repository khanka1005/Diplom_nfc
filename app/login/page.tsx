"use client";
import React, { useState } from "react";
import { loginUser } from "@/app/services/authService";
import { useRouter } from "next/navigation";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(formData.email, formData.password);
      router.push("/order"); 
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-6">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-3xl shadow-lg">
        <h2 className="text-5xl font-semibold text-gray-700 text-center">Login</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="mt-6 space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              name="email"
              type="email"
              required
              className="block w-full px-4 py-3 rounded-lg border bg-gray-100"
              placeholder="Enter your email"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              name="password"
              type="password"
              required
              className="block w-full px-4 py-3 rounded-lg border bg-gray-100"
              placeholder="Enter your password"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="w-full mt-5 py-3 px-4 rounded-lg text-white bg-blue-500 hover:bg-blue-600">
            Login
          </button>
        </form>

        <button
          onClick={() => router.push("/register")}
          className="w-full mt-3 py-3 px-4 rounded-lg text-blue-600 border border-blue-500 hover:bg-blue-100"
        >
          Create an Account
        </button>
      </div>
    </div>
  );
};

export default Login;
