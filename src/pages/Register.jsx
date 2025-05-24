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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validation
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
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response) {
        if (err.response.data) {
          setError(err.response.data.message || 
                   err.response.data.error || 
                   "Registration failed. Please check your details.");
        } else {
          setError(`Registration failed with status: ${err.response.status}`);
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
              {loading ? "Registering..." : "Register"}
            </button>
            <span>
              Already have an account? <a href="/login">Login</a>
            </span>
          </form>
        </section>
      </main>

      {/* CSS remains exactly the same */}
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
