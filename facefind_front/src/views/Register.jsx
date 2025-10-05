import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/common/FormInput';
import '../styles/views/Register.css';

const Register = () => {
	const navigate = useNavigate();

	return (
		<div className="login-container">
			<div className="login-card">
				<div className="left-panel">
					<div className="left-inner">
						<h1>Únete a nosotros</h1>
						
						<button className="btn-outline" onClick={() => navigate('/login')}>Sign In</button>
					</div>
				</div>

				<div className="right-panel">
					<div className="right-inner">
						<h2>CREAR CUENTA</h2>
						<form className="form">
							<label>Nombre</label>
							<FormInput type="text" placeholder="Tu nombre completo" />

							<label>Email</label>
							<FormInput type="email" placeholder="you@domain.com" />

							<label>Contraseña</label>
							<FormInput type="password" placeholder="Contraseña" />
                            
							<button type="submit" className="btn-primary">Crear cuenta</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;

