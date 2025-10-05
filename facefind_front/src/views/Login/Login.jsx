import React from 'react'
import { useNavigate } from 'react-router-dom'
import FormInput from '../../components/FormInput'
import AuthCard from './AuthCard'
import './Login.css'

const Login = () => {
    const navigate = useNavigate()

    const handleLeftButton = () => navigate('/register')

    const handleSubmit = (e) => {
        e.preventDefault()
        // TODO: implement login logic
    }

    return (
        <AuthCard
            leftTitle="Bienvenido a FaceFind"
            leftLead="Por favor, inicia sesión para continuar."
            leftNote="¿No tienes una cuenta?"
            leftButtonLabel="Regístrate aquí"
            onLeftButton={handleLeftButton}
            rightTitle="Iniciar sesión"
        >
            <form className='form' onSubmit={handleSubmit}>
                <label>Usuario</label>
				<FormInput type="text" placeholder="Usuario" />

				<label>Contraseña</label>
				<FormInput type="password" placeholder="Contraseña" />

                <div className='form-group-options'>
                    <div className="recuerdame">
                        <input type="checkbox" id="rememberMe" />
                        <label htmlFor="rememberMe">Recuérdame</label>
                    </div>
                    <a href="#!">¿Olvidaste tu contraseña?</a>
                </div>
                <button className='btn-primary'  type='submit'>Iniciar Sesión</button>                
            </form>
        </AuthCard>
    )
}

export default Login