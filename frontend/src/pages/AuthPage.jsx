import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.6 } },
  exit: { opacity: 0, y: -40, transition: { duration: 0.3 } },
};

const inputClass =
  "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const errorClass = "text-red-500 text-sm mt-1";

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let errs = {};
    if (mode === "signup" && !fields.name.trim()) errs.name = "Name is required";
    if (!fields.email.trim()) errs.email = "Email is required";
    else if (!validateEmail(fields.email)) errs.email = "Invalid email";
    if (!fields.password) errs.password = "Password is required";
    if (mode === "signup") {
      if (!fields.confirmPassword) errs.confirmPassword = "Confirm your password";
      else if (fields.password !== fields.confirmPassword)
        errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        localStorage.setItem('isLoggedIn', 'true');
        navigate("/dashboard");
      }, 900);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            {mode === "login" ? "Login" : "Sign Up"}
          </h2>
          <form onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  className={inputClass}
                  value={fields.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {errors.name && <div className={errorClass}>{errors.name}</div>}
              </div>
            )}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                className={inputClass}
                value={fields.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <div className={errorClass}>{errors.email}</div>}
            </div>
            <div className="mb-4 relative">
              <label className="block mb-1 font-medium">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={inputClass}
                value={fields.password}
                onChange={handleChange}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-9 text-gray-500 hover:text-blue-600"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.7 10.7a3 3 0 104.6 4.6M6.1 6.1A9.77 9.77 0 002 12s3.6 6 10 6c1.7 0 3.2-.3 4.5-.8M17.9 17.9A9.77 9.77 0 0022 12s-3.6-6-10-6c-1.1 0-2.1.1-3 .3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
              {errors.password && <div className={errorClass}>{errors.password}</div>}
            </div>
            {mode === "signup" && (
              <div className="mb-4">
                <label className="block mb-1 font-medium">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  className={inputClass}
                  value={fields.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <div className={errorClass}>{errors.confirmPassword}</div>
                )}
              </div>
            )}
            {mode === "login" && (
              <div className="mb-4 text-right">
                <button
                  type="button"
                  className="text-blue-600 text-sm hover:underline"
                  onClick={() => alert("Forgot password flow not implemented.")}
                >
                  Forgot password?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold mt-2 hover:bg-blue-700 transition disabled:opacity-60"
            >
              {submitting
                ? mode === "login"
                  ? "Logging in..."
                  : "Signing up..."
                : mode === "login"
                ? "Login"
                : "Sign Up"}
            </button>
          </form>
          <div className="mt-6 text-center text-gray-600">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() => {
                    setMode("signup");
                    setErrors({});
                  }}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() => {
                    setMode("login");
                    setErrors({});
                  }}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}