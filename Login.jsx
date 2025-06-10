import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase"; // importa desde donde tengas tu archivo

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Sesión iniciada correctamente ✅");
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Cuenta creada correctamente 🎉");
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar sessió / Registrar-se</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contrasenya"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="auth-buttons">
        <button onClick={handleLogin}>Iniciar sessió</button>
        <button onClick={handleRegister}>Registrar-se</button>
      </div>
    </div>
  );
};

export default AuthForm;

