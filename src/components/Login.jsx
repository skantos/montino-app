import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import "../styles/login.css";

function Login() {
  const [emailUsuario, setEmailUsuario] = useState("");
  const [passwordUsuario, setPasswordUsuario] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signIn, role } = UserAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signIn(emailUsuario, passwordUsuario);
    } catch (error) {
      setError("Usuario o contraseña incorrectos");
      console.error("Error al iniciar sesión:", error);
    }
  };

  useEffect(() => {
    if (role) {
      if (role === "admin") {
        navigate("/ventas");
      } else if (role === "vendedor") {
        navigate("/vendedor/ventas");
      } else {
        setError("Rol de usuario no reconocido");
      }
    }
  }, [role, navigate]);

  return (
    <div>
      <div className="login-box">
        <form className="form" onSubmit={handleSubmit}>
          <p className="form-title">
            Los Tios <br />
            Iniciar Sesión
          </p>
          <div className="input-container">
            <input
              type="email"
              placeholder="Email"
              value={emailUsuario}
              onChange={(e) => setEmailUsuario(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <input
              type="password"
              placeholder="Contraseña"
              value={passwordUsuario}
              onChange={(e) => setPasswordUsuario(e.target.value)}
              required
            />
          </div>
          {error && <p className="signup-link">{error}</p>}
          <button type="submit" className="submit">
            Ingresar
          </button>
          <p className="signup-link">
            <Link to="/resetPassword" className="resetPassword">
              Olvidé mi Contraseña
            </Link>
            {/* <Link to="/registro" className="resetPassword">
              no tienes cuenta?
            </Link> */}
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
