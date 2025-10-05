import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import AuthCard from '../Login/AuthCard';
import './Register.css';

const Register = () => {
	const navigate = useNavigate();

	const handleLeftButton = () => navigate('/login')

	const handleSubmit = (e) => {
		e.preventDefault()
		// TODO: implement register logic
	}

	return (
		<AuthCard
			leftTitle="Únete a nosotros"
			leftLead="Crea una cuenta para empezar a usar FaceFind"
			leftButtonLabel="Iniciar sesión"
			onLeftButton={handleLeftButton}
			rightTitle="Crear cuenta"
		>
			<form className="form" onSubmit={handleSubmit}>
				<label>Nombre</label>
				<FormInput type="text" placeholder="Nombre completo" />

				<label>Email</label>
				<FormInput type="email" placeholder="abcde@gmail.com" />

				<label>Contraseña</label>
				<FormInput type="password" placeholder="Contraseña" />

				<button type="submit" className="btn-primary">Crear cuenta</button>
			</form>
		</AuthCard>
	);
};

export default Register;

