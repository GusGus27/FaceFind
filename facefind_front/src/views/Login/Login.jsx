import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import FormInput from '../../components/FormInput'
import AuthCard from './AuthCard'
import './Login.css'

const Login = () => {
    const navigate = useNavigate()
    const { loginAsAdmin, loginAsUser } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleLeftButton = () => navigate('/register')

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (username === 'admin' && password === 'admin1234') {
            loginAsAdmin()
            navigate('/admin')
            return
        }

        if (username === 'usuario' && password === 'user1234') {
            loginAsUser()
            navigate('/cases')
            return
        }

        setError('Usuario o contraseña incorrectos')
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
                {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}
                
                <label>Usuario</label>
				<FormInput 
                    type="text" 
                    placeholder="Usuario" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

				<label>Contraseña</label>
				<FormInput 
                    type="password" 
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

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