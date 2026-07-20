import { useState } from "react";

const PASSWORD_APLIKASI = "AgungToyota123";

export default function PasswordGate({ children }) {
  const [password, setPassword] = useState("");
  const [sudahLogin, setSudahLogin] = useState(
    sessionStorage.getItem("estimasi_login") === "true"
  );
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (password === PASSWORD_APLIKASI) {
      sessionStorage.setItem("estimasi_login", "true");
      setSudahLogin(true);
      setError("");
    } else {
      setError("Password salah. Silakan coba lagi.");
      setPassword("");
    }
  }

  if (sudahLogin) {
    return children;
  }

  return (
    <div style={styles.halaman}>
      <form onSubmit={handleSubmit} style={styles.kotak}>
        <h1 style={styles.judul}>Estimasi Agung Toyota</h1>

        <p style={styles.keterangan}>
          Masukkan password untuk membuka aplikasi
        </p>

        <input
          type="password"
          placeholder="Masukkan password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={styles.input}
          autoFocus
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.tombol}>
          Masuk
        </button>
      </form>
    </div>
  );
}

const styles = {
  halaman: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
    padding: "20px",
  },
  kotak: {
    width: "100%",
    maxWidth: "380px",
    background: "#ffffff",
    padding: "32px",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  },
  judul: {
    marginTop: 0,
    marginBottom: "10px",
    textAlign: "center",
    fontSize: "24px",
  },
  keterangan: {
    textAlign: "center",
    color: "#666",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    marginBottom: "12px",
  },
  tombol: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#0067b1",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "#d32f2f",
    fontSize: "14px",
    marginTop: 0,
  },
};