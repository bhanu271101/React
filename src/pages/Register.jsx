import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const User = import.meta.env.VITE_USER;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phoneNumber) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${User}/user/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phoneNumber: formData.phoneNumber
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setError("");
        setTimeout(() => {
          navigate("/login");
        }, 15000);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          setError(data);
        }
        else if (data.detail) {
          setError(data.detail);
        }
        else if (data.message) {
          setError(data.message);
        }
        else if (data.error) {
          setError(data.error);
        }
        else {
          setError(JSON.stringify(data));
        }
      } else if (err.request) {
        setError("No response from server. Please try again.");
      } else {
        setError("Registration error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="register-container" aria-label="Register form">
        <section className="login" role="region" aria-labelledby="register-header">
          <header className="hader">
            <h1 id="register-header">Create an Account</h1>
            <p>It's quick and easy.</p>
          </header>

          {error && (
            <div className="error-message" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {success ? (
            <div className="verification-message" role="status" aria-live="polite">
              <div className="verification-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#388e3c">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3>Registration Successful!</h3>
              <p>We've sent a verification link to your email address.</p>
              <p className="verification-note">
                Please check your inbox and verify your email before logging in.
                <br />
                Didn't receive the email? Check your spam folder.
              </p>
              <p className="redirect-notice">
                You'll be redirected to login page in 15 seconds...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                aria-required="true"
                autoComplete="name"
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                aria-required="true"
                autoComplete="email"
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                aria-required="true"
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                aria-required="true"
                minLength={8}
                autoComplete="new-password"
                disabled={loading}
              />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                aria-required="true"
                autoComplete="tel"
                disabled={loading}
              />
              <button type="submit" disabled={loading} aria-busy={loading}>
                {loading ? (
                  <>
                    <svg className="spinner" viewBox="0 0 50 50">
                      <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                    </svg>
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </button>
              <span>
                Already have an account? <a href="/login">Login</a>
              </span>
            </form>
          )}
        </section>
      </main>
      <style>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f3f4f6;
          padding: 1rem;
        }

        .login {
          max-width: 320px;
          width: 100%;
          background-color: #ffffff;
          border-radius: 8px;
          padding: 2.5rem 2rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s ease;
        }
        .login:hover {
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
        }

        .hader {
          text-align: center;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #222;
        }

        .hader p {
          font-size: 18px;
          font-weight: 400;
          color: #706b6b;
          margin-top: 4px;
        }

        .error-message {
          color: #d32f2f;
          background-color: #fce4ec;
          border-radius: 6px;
          padding: 10px 15px;
          text-align: center;
          margin-bottom: 15px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(211, 47, 47, 0.3);
        }

        .verification-message {
          text-align: center;
          padding: 20px 0;
        }

        .verification-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 15px;
          background-color: #e8f5e9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .verification-icon svg {
          width: 30px;
          height: 30px;
        }

        .verification-message h3 {
          color: #388e3c;
          font-size: 20px;
          margin-bottom: 10px;
        }

        .verification-message p {
          color: #616161;
          font-size: 15px;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .verification-note {
          font-size: 14px;
          color: #757575;
          margin-top: 15px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 6px;
        }

        .redirect-notice {
          font-size: 13px;
          color: #9e9e9e;
          margin-top: 20px;
          font-style: italic;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 20px;
        }

        form input {
          height: 44px;
          outline: none;
          border: 1.5px solid #cccccc;
          padding: 0 12px;
          font-size: 16px;
          border-radius: 10px;
          transition: border-color 0.3s ease;
        }
        form input:focus {
          border-color: rgba(17, 17, 226, 0.8);
          box-shadow: 0 0 6px rgba(17, 17, 226, 0.4);
        }
        form input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        form button {
          height: 44px;
          background-color: rgba(17, 17, 226, 0.7);
          color: #ffffff;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
          border: none;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        form button:hover:not(:disabled) {
          background-color: rgba(17, 17, 226, 0.9);
        }
        form button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .spinner {
          animation: rotate 1s linear infinite;
          width: 20px;
          height: 20px;
        }
        
        .spinner circle {
          stroke: #ffffff;
          stroke-linecap: round;
          animation: dash 1.5s ease-in-out infinite;
        }
        
        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes dash {
          0% {
            stroke-dasharray: 1, 150;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -35;
          }
          100% {
            stroke-dasharray: 90, 150;
            stroke-dashoffset: -124;
          }
        }

        form span {
          text-align: center;
          font-size: 16px;
          padding-top: 12px;
          color: #706b6b;
        }

        form span a {
          text-decoration: none;
          color: rgba(36, 36, 207, 0.8);
          font-weight: 600;
          transition: color 0.3s ease;
        }

        form span a:hover {
          text-decoration: underline;
          color: rgba(36, 36, 207, 1);
        }
      `}</style>
    </>
  );
}