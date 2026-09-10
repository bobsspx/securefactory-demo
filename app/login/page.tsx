"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="loginPage">
      <section className="loginPanel">
        <a href="/" className="loginLogo">
          SECURE<span>FACTORY</span>
        </a>

        <div className="loginHeading">
          <p>SECURE ADMIN ACCESS</p>
          <h1>Sign in.</h1>

          <span>
            Authorized personnel only.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="loginForm">
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <div className="loginError">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <a href="/" className="backHome">
          ← Return to website
        </a>
      </section>

      <section className="loginVisual">
        <div>
          <span>SECURITY STATUS</span>
          <strong>Protected Access</strong>
        </div>

        <div className="securityIndicators">
          <p>Encrypted session</p>
          <p>HttpOnly cookie</p>
          <p>Protected admin routes</p>
          <p>Authentication logging</p>
        </div>
      </section>
    </main>
  );
}