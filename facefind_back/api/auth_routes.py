from flask import Blueprint, request, jsonify
from services.supabase_client import supabase

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    Registra un nuevo usuario usando Supabase Auth
    La contraseña es hasheada automáticamente por Supabase
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        nombre = data.get('nombre')
        dni = data.get('dni')

        # 🔹 Validaciones básicas
        if not email or not password:
            return jsonify({"error": "Email y contraseña son requeridos"}), 400
        
        if not nombre or len(nombre.strip()) < 2:
            return jsonify({"error": "El nombre debe tener al menos 2 caracteres"}), 400
        
        if dni and len(dni.strip()) != 8:
            return jsonify({"error": "El DNI debe tener exactamente 8 dígitos"}), 400
        
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

        # 🔹 Insertar en tabla Usuario (SIN guardar password - ya está en auth.users hasheada)
        # NOTA: No incluimos 'id' porque la tabla lo genera automáticamente
        # NOTA: Incluimos "password" con valor dummy porque la columna es NOT NULL (legacy)
        insert_data = {
            # "id" se genera automáticamente (autoincremental)
            "nombre": nombre,
            "email": user_email,
            "password": "NO_SE_USA",  # Dummy - la real está en auth.users hasheada
            "role": "user",  # Rol por defecto
            "status": "active"
        }
        
        # Agregar DNI solo si fue proporcionado
        if dni:
            insert_data["dni"] = dni.strip()
        
        insert_result = supabase.table("Usuario").insert(insert_data).execute()

        # Obtener el ID generado
        inserted_user = insert_result.data[0] if insert_result.data else None
        db_user_id = inserted_user["id"] if inserted_user else None

        print(f"✅ Usuario registrado: {user_email} con Auth ID: {user_id}, DB ID: {db_user_id}")

        return jsonify({
            "message": "Usuario registrado con éxito",
            "data": {
                "id": user_id,  # UUID de Auth
                "db_id": db_user_id,  # ID numérico de la tabla Usuario
                "email": user_email,
                "nombre": nombre
            }
        }), 201

    except Exception as e:
        print(f"❌ Error en /auth/signup: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/signin", methods=["POST"])
def sign_in():
    """
    Inicia sesión usando Supabase Auth
    La verificación de contraseña es manejada por Supabase (compara con hash)
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
        usuario_query = supabase.table("Usuario").select("*").eq("email", user_email).execute()
        
        usuario_db = None
        if usuario_query.data and len(usuario_query.data) > 0:
            usuario_db = usuario_query.data[0]
        else:
            # Si no existe en la tabla Usuario, crearlo
            nombre = res.user.user_metadata.get("nombre", "Usuario") if res.user.user_metadata else "Usuario"
            insert_result = supabase.table("Usuario").insert({
                "nombre": nombre,
                "email": user_email,
                "password": "NO_SE_USA",  # Dummy - la real está en auth.users
                "role": "user",
                "status": "active"
            }).execute()
            
            usuario_db = insert_result.data[0] if insert_result.data else {
                "id": None,
                "nombre": nombre,
                "email": user_email,
                "role": "user"
            }
            print(f"✅ Usuario creado en tabla Usuario: {user_email}")

        # 🔹 Construir respuesta con datos serializables
        user_data = {
            "id": str(usuario_db.get("id")),  # ID numérico de la tabla Usuario
            "auth_id": auth_id,  # UUID de Supabase Auth
            "email": user_email,
            "nombre": str(usuario_db.get("nombre", "Usuario")),
            "role": str(usuario_db.get("role", "user")),
            "app_metadata": {
                "role": str(usuario_db.get("role", "user"))
            }
        }

        session_data = {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "expires_in": res.session.expires_in,
            "expires_at": res.session.expires_at if hasattr(res.session, 'expires_at') else None
        }

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
    """
    try:
        # Obtener el token del header si existe
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
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
