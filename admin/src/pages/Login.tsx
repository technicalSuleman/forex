import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import mainpage from "../assets/mainpage.png";

// Zod schemas
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

const Login = () => {
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error states
  const [errors, setErrors] = useState({ email: "", password: "" });

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = () => {
    try {
      setErrors({ email: "", password: "" });

      loginSchema.parse({ email, password });

      // Login successful
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = { email: "", password: "" };
        error.errors.forEach((e) => {
          if (e.path[0] === "email") fieldErrors.email = e.message;
          if (e.path[0] === "password") fieldErrors.password = e.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleForgotPassword = () => {
    try {
      setForgotError("");
      setSuccessMessage("");
      forgotPasswordSchema.parse({ email: forgotEmail });

      // Here you would call your API to send the reset link
      // For demo, we just show a success message
      setSuccessMessage("A reset link has been sent to your email.");
      setForgotEmail("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setForgotError(error.errors[0].message);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <img
        src={mainpage}
        alt="Trading"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen bg-black bg-opacity-50">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-96">
          <h2 className="text-3xl font-bold mb-6 text-center text-black">
            Admin Login
          </h2>

          {/* Email input */}
          <input
            type="text"
            placeholder="Username or Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 mb-1 border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mb-2">{errors.email}</p>
          )}

          {/* Password input */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-3 mb-1 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-black`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mb-2">{errors.password}</p>
          )}

          {/* Forgot Password Dialog */}
          <div className="text-right mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-blue-600 hover:underline p-0">
                  Forgot Password?
                </button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your email to receive a reset link.
                  </DialogDescription>
                </DialogHeader>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                {forgotError && (
                  <p className="text-red-500 text-sm mt-2">{forgotError}</p>
                )}
                {successMessage && (
                  <p className="text-green-500 text-sm mt-2">{successMessage}</p>
                )}

                <DialogFooter className="mt-4">
                  <button
                    onClick={handleForgotPassword}
                    className="w-full bg-black text-white p-3 rounded-lg"
                  >
                    Send Reset Link
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white p-3 rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
