import React from 'react'
import FormInput from '../../components/FormInput'
import './Login.css'
const Login = () => {
  return (
    <>
    <div className="container-login">
        <div className="login">
            <div className='welcome-login'>
                <div className="bienvenido-facefind">
                    <img src="https://img.icons8.com/ios-filled/100/000000/face-id.png" alt="Login Icon" />
                    <h1>Bienvenido a FACEFIND</h1>
                    <p>Por favor, inicia sesión para continuar.</p>
                </div>
                <div className="registrate">
                    <p className="text-registrate"> ¿No tienes una cuenta?</p>
                    <a className="link-register" href="/register">Regístrate aquí</a>
                </div>
            </div>
            <div className='login-form'>
                <p>Iniciar sesión</p>
                <form>
                    <div className='form-group'>
                        <label htmlFor='username'>Usuario</label>
                        <FormInput id='username' type='text' placeholder='Ingresa tu usuario' />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Contraseña</label>
                        <FormInput id='password' type='password' placeholder='Ingresa tu contraseña' />
                    </div>
                    <div className='form-group-options'>
                        <div className="recuerdame">
                            <input type="checkbox" id="rememberMe" />
                            <label htmlFor="rememberMe">Recuérdame</label>
                        </div>
                        <a href="#!">¿Olvidaste tu contraseña?</a>
                    </div>
                    <button type='submit'>Iniciar Sesión</button>
                    
                </form>
            </div>
        </div>
    </div>
    </>
  )
}

export default Login;