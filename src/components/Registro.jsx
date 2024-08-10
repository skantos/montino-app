import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

const RegistrarUsuario = () => {
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [emailUsuario, setEmailUsuario] = useState("");
    const [passwordUsuario, setPasswordUsuario] = useState("");
    const [rolUsuario, setRolUsuario] = useState("vendedor");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate(); // Hook para redireccionar

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Validaciones adicionales
            if (passwordUsuario.length < 6) {
                setError("La contraseña debe tener al menos 6 caracteres.");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                emailUsuario,
                passwordUsuario
            );
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                nombreUsuario,
                emailUsuario,
                rolUsuario,
            });

            setSuccess("Usuario registrado exitosamente");
            setNombreUsuario("");
            setEmailUsuario("");
            setPasswordUsuario("");
            setRolUsuario("vendedor");

            // Redirigir al usuario a otra página después del registro
            navigate("/dashboard"); // Ajusta la ruta según tu aplicación

        } catch (error) {
            console.error("Error al registrar el usuario:", error);

            if (error.code === "auth/email-already-in-use") {
                setError("El correo electrónico ya está en uso. Por favor, use otro.");
            } else if (error.code === "permission-denied") {
                setError("Permiso denegado. Verifica las reglas de seguridad.");
            } else {
                setError("Error al registrar el usuario");
            }
        }
    };

    return (
        <div>

            <div className="login-box">
                <p className="form-title">Registrar Usuario</p>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="Nombre de Usuario"
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            required
                        />
                    </div>

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

                    <div className="input-container">
                        <select
                            value={rolUsuario}
                            onChange={(e) => setRolUsuario(e.target.value)}
                            required
                        >
                            <option value="vendedor">Vendedor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <button className="submit" type="submit">
                        Registrar Usuario
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrarUsuario;
