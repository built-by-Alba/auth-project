
import { useState, useEffect } from "react";
import "./App.css";

const API = "https://auth-project-3azc.onrender.com";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  async function getProfile(token) {
    const response = await fetch(`${API}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not load profile.");
    }

    return data;
  }

  useEffect(() => {
    async function checkLogin() {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getProfile(token);
        setProfile(data);
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    const endpoint = isLogin ? "login" : "signup";

    const userData = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const response = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);

        const userProfile = await getProfile(data.token);

        setProfile(userProfile);
        setIsLoggedIn(true);
      } else {
        setMessage("Account created successfully! Please log in.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (error) {
      setMessage(error.message || "Cannot connect to the server.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setProfile(null);
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setMessage("You have logged out successfully.");
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Checking your session...</h2>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="dashboard">
          <h1>Welcome! 🎉</h1>
          <p>You are successfully authenticated.</p>

          <div className="profile-info">
            <h2>Your Profile</h2>
            <p>
              <strong>User ID:</strong>{" "}
              {profile?.userId || "Not available"}
            </p>
            <p>
              <strong>Status:</strong> Logged in
            </p>
          </div>

          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isLogin ? "Welcome Back!" : "Create Account"}</h1>

        <p>
          {isLogin
            ? "Login to your account"
            : "Sign up to get started"}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <p className="switch-text">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            className="switch-button"
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default App;
