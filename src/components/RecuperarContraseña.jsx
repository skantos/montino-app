import "../styles/RecuperarContrasena.css";
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const RecuperarContrasena = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleForgotPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setEmailSent(true);
        setTimeout(() => {
          navigate("/");
        }, 6000);
      })
      .catch((error) => {
        setError(
          "No se pudo enviar el correo electrónico de restablecimiento de contraseña."
        );
      });
  };

  return (
    <div className="login-box">
      <p className="form-title">
        Recuperar<br />
        Contraseña
      </p>      
        {emailSent ? (
        <p>
          Se ha enviado un correo electrónico con instrucciones para restablecer
          tu contraseña.
        </p>
      ) : (
        <>
        <div className="input-container">
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button onClick={handleForgotPassword} variant="outlined" className="submit">
          Enviar
        </button>
        </>
      )}
      <p className="signup-link">
        <Link to="/login" className="resetPassword">
          Iniciar Sesion
        </Link>
      </p>
    </div>

  );
};

export default RecuperarContrasena;
