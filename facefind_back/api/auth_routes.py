from flask import Blueprint, request, jsonify
from services.supabase_client import supabase
from services.user_service import UserService
from models.usuario import UsuarioBase, UsuarioRegistrado, UsuarioAdministrador
from models.enums import Rol

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    Registra un nuevo usuario usando Supabase Auth
    Refactorizado para usar clases OOP (UsuarioRegistrado, UsuarioAdministrador)
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        nombre = data.get('nombre')
        dni = data.get('dni')
        celular = data.get('celular')
        num_telefono = data.get('num_telefono')
        role_id = data.get('role_id', 2)  # Por defecto: 2 (Usuario)

        # 🔹 Validaciones básicas
        if not email or not password:
            return jsonify({"error": "Email y contraseña son requeridos"}), 400

        if not nombre or len(nombre.strip()) < 2:
            return jsonify({"error": "El nombre debe tener al menos 2 caracteres"}), 400

        if dni and len(dni.strip()) != 8:
            return jsonify({"error": "El DNI debe tener exactamente 8 dígitos"}), 400
        
        if num_telefono and len(num_telefono.strip()) != 9:
            return jsonify({"error": "El número de teléfono debe tener exactamente 9 dígitos"}), 400

        if len(password) < 6:
            return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

        # 🔹 Crear usuario en Supabase Auth (hashea la contraseña automáticamente)
        result = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "nombre": nombre
                }
            }
        })

        if result.user is None:
            error_msg = result.error_message if hasattr(result, 'error_message') else "Error al crear usuario"
            return jsonify({"error": error_msg}), 400

        # 🔹 Convertir UUID a string
        user_id = str(result.user.id)
        user_email = str(result.user.email)

        # 🔹 Crear instancia OOP según el rol (role_id: 1=Admin, 2=Usuario)
        rol_enum = Rol.ADMINISTRADOR if role_id == 1 else Rol.USUARIO

        if rol_enum == Rol.ADMINISTRADOR:
            usuario = UsuarioAdministrador(
                nombre=nombre,
                email=user_email,
                password="NO_SE_USA",  # Dummy - la real está en auth.users
                rol=rol_enum,
                dni=dni.strip() if dni else None,
                status="active"
            )
        else:
            usuario = UsuarioRegistrado(
                nombre=nombre,
                email=user_email,
                password="NO_SE_USA",
                rol=rol_enum,
                celular=celular,
                dni=dni.strip() if dni else None,
                status="active"
            )

        # 🔹 Usar método registrar() de la clase Usuario (según UML)
        insert_data = usuario.registrar()
        
        # 🔹 Agregar num_telefono si está presente
        if num_telefono:
            insert_data["num_telefono"] = num_telefono.strip()

        # 🔹 Insertar en tabla Usuario
        insert_result = supabase.table("Usuario").insert(insert_data).execute()

        # Obtener el ID generado
        inserted_user = insert_result.data[0] if insert_result.data else None
        db_user_id = inserted_user["id"] if inserted_user else None

        print(f"✅ Usuario registrado: {user_email} con Auth ID: {user_id}, DB ID: {db_user_id}, Tipo: {usuario.__class__.__name__}")

        return jsonify({
            "message": "Usuario registrado con éxito",
            "data": {
                "id": user_id,  # UUID de Auth
                "db_id": db_user_id,  # ID numérico de la tabla Usuario
                "email": user_email,
                "nombre": nombre,
                "role_id": role_id,
                "tipo_usuario": usuario.__class__.__name__  # UsuarioRegistrado o UsuarioAdministrador
            }
        }), 201

    except Exception as e:
        print(f"❌ Error en /auth/signup: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/signin", methods=["POST"])
def sign_in():
    """
    Inicia sesión usando Supabase Auth
    Refactorizado para usar clases OOP y método login()
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # 🔹 Validaciones básicas
    if not email or not password:
        return jsonify({"error": "Email y contraseña son requeridos"}), 400

    try:
        # 🔹 Supabase Auth verifica la contraseña hasheada automáticamente
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not res.user:
            return jsonify({"error": "Credenciales inválidas"}), 401

        # 🔹 Convertir a string
        user_email = str(res.user.email)
        auth_id = str(res.user.id)

        # 🔹 Buscar el usuario en la tabla Usuario POR EMAIL
        # Incluir JOIN con Rol para obtener datos del rol
        from repositories.user_repository import UserRepository
        usuario_db = UserRepository.find_by_email(user_email)

        if not usuario_db:
            # Si no existe en la tabla Usuario, crearlo con rol por defecto (Usuario)
            nombre = res.user.user_metadata.get("nombre", "Usuario") if res.user.user_metadata else "Usuario"
            insert_result = supabase.table("Usuario").insert({
                "nombre": nombre,
                "email": user_email,
                "password": "NO_SE_USA",  # Dummy - la real está en auth.users
                "role_id": 2,  # Por defecto: Usuario
                "status": "active"
            }).execute()

            # Cargar el usuario recién creado con JOIN
            usuario_db = UserRepository.find_by_email(user_email)
            if not usuario_db:
                # Fallback si algo falla
                usuario_db = insert_result.data[0] if insert_result.data else {
                    "id": None,
                    "nombre": nombre,
                    "email": user_email,
                    "role_id": 2
                }
            print(f"✅ Usuario creado en tabla Usuario: {user_email}")

        # 🔹 Crear instancia OOP del usuario (Factory Pattern)
        usuario = UsuarioBase.from_dict(usuario_db)

        # 🔹 Llamar método login() de la clase (según UML)
        login_exitoso = usuario.login(password)

        if not login_exitoso:
            return jsonify({"error": "Error en el proceso de login"}), 401

        # 🔹 Construir respuesta con datos serializables usando to_dict()
        user_data = usuario.to_dict()
        user_data["auth_id"] = auth_id  # Agregar UUID de Auth
        user_data["tipo_usuario"] = usuario.__class__.__name__  # UsuarioRegistrado o UsuarioAdministrador

        # Agregar celular si es UsuarioRegistrado
        if isinstance(usuario, UsuarioRegistrado) and usuario.celular:
            user_data["celular"] = usuario.celular

        session_data = {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "expires_in": res.session.expires_in,
            "expires_at": res.session.expires_at if hasattr(res.session, 'expires_at') else None
        }

        print(f"✅ Login exitoso: {user_email}, Tipo: {usuario.__class__.__name__}")

        return jsonify({
            "user": user_data,
            "session": session_data,
            "message": "Inicio de sesión exitoso"
        }), 200

    except Exception as e:
        print(f"❌ Error en /auth/signin: {e}")
        # Distinguir entre error de autenticación y error del servidor
        error_message = str(e)
        if "Invalid login credentials" in error_message or "Invalid" in error_message:
            return jsonify({"error": "Email o contraseña incorrectos"}), 401
        return jsonify({"error": "Error al iniciar sesión"}), 500


@auth_bp.route("/signout", methods=["POST"])
def sign_out():
    """
    Cierra la sesión del usuario actual
    Usa el método logout() de la clase Usuario (según UML)
    """
    try:
        # Obtener el token del header si existe
        auth_header = request.headers.get('Authorization')

        # Obtener usuario del token (si existe) para llamar a su método logout()
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

            # Intentar obtener el usuario actual desde el token
            try:
                current_user = supabase.auth.get_user(token)
                if current_user and current_user.user:
                    email = current_user.user.email

                    # Obtener datos del usuario desde BD
                    usuario_db = UserService.get_user_by_email(email)
                    if usuario_db:
                        # Crear instancia OOP
                        usuario = UsuarioBase.from_dict(usuario_db)

                        # Llamar método logout() de la clase (según UML)
                        logout_exitoso = usuario.logout()

                        if logout_exitoso:
                            print(f"✅ Logout exitoso para: {email}, Tipo: {usuario.__class__.__name__}")
            except:
                pass  # Si falla, continuar con el logout de Supabase

            # Cerrar sesión en Supabase
            supabase.auth.sign_out()

        return jsonify({
            "success": True,
            "message": "Sesión cerrada correctamente"
        }), 200

    except Exception as e:
        print(f"Error en /auth/signout: {e}")
        return jsonify({
            "success": True,  # Aún así retornar success para limpiar el frontend
            "message": "Sesión cerrada localmente"
        }), 200
