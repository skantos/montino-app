import React, { useState } from "react";
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

        try {
            await signIn(emailUsuario, passwordUsuario);
            // Redirigir basándote en el rol del usuario
            if (role === "admin") {
                navigate("/ventas");
            } else if (role === "vendedor") {
                navigate("/vendedor/ventas");
            } else {
                setError("Rol de usuario no reconocido");
            }
        } catch (error) {
            setError("Usuario o contraseña incorrectos");
            console.error("Error al iniciar sesión:", error);
        }
    };

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
                        No tienes una cuenta? <br />
                        <Link to="/agregarUsuario">Regístrate aquí</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
