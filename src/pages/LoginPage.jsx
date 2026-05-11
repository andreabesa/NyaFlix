// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const { user, error, loading, loginWithEmail, registerWithEmail, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      await registerWithEmail(email, password);
    } else {
      await loginWithEmail(email, password);
    }
  };

  if (loading) return <div className="login-loading">Cargando...</div>;

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🎌 NyaFlix</h1>
        <h2>{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h2>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            {isRegister ? "Registrarse" : "Entrar"}
          </button>
        </form>

        <div className="login-divider">o</div>

        <button className="btn-google" onClick={loginWithGoogle}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
          Continuar con Google
        </button>

        <p className="login-toggle">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </span>
        </p>
      </div>
    </div>
  );
}