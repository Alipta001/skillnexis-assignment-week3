import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function AuthPage({ mode }) {
  const registering = mode === "register",
    { user, login, register } = useAuth(),
    navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (registering) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not authenticate.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="brand light">◈ TaskFlow</div>
        <div>
          <p className="eyebrow">MAKE ROOM FOR WHAT MATTERS</p>
          <h1>
            Less juggling.
            <br />
            <em>More doing.</em>
          </h1>
          <p>
            A calmer way to keep track of your work, priorities, and progress.
          </p>
        </div>
        <small>Your personal workspace, ready when you are.</small>
      </aside>
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <p className="eyebrow">
            {registering ? "GET STARTED" : "WELCOME BACK"}
          </p>
          <h2>{registering ? "Create your account" : "Sign in to TaskFlow"}</h2>
          <p className="muted">
            {registering
              ? "Set up your workspace in seconds."
              : "Enter your details to continue."}
          </p>
          {registering && (
            <label>
              Full name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              minLength="8"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="At least 8 characters"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary full" disabled={busy}>
            {busy ? "Please wait…" : registering ? "Create account" : "Sign in"}
          </button>
          <p className="switch">
            {registering ? "Already have an account?" : "New to TaskFlow?"}{" "}
            <Link to={registering ? "/login" : "/register"}>
              {registering ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
