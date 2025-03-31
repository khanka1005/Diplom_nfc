"use client";
import React, { useState } from "react";
import { registerUser } from "@/app/services/authService";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await registerUser(formData.name, formData.email, formData.password);
      router.push("/login"); // Redirect after signup
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
        <h2 className="text-5xl font-semibold text-gray-700 text-center">Бүртгүүлэх</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-600">Бүртгүүлэх нэр</label>
            <input
              name="name"
              type="text"
              required
              className="block w-full px-4 py-3 rounded-lg border bg-gray-100"
              placeholder="Enter your name"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 pt-5">Емайл хаяг</label>
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
            <label className="block text-sm font-medium text-gray-60 pt-5">Нууц үг</label>
            <input
              name="password"
              type="password"
              required
              className="block w-full px-4 py-3 rounded-lg border bg-gray-100"
              placeholder="Enter your password"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 pt-5">Дахин нууц үгээ оруул</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="block w-full px-4 py-3 rounded-lg border bg-gray-100"
              placeholder="Confirm your password"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="w-full mt-5 py-3 px-4 rounded-lg text-white bg-blue-500 hover:bg-blue-600">
            Бүртгүүлэх
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
