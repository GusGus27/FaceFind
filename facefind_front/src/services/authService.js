const API_BASE_URL = "http://localhost:5000";

export const signUp = async ({ email, password, nombre, dni, num_telefono }) => {
  try {
    console.log("📦 Enviando datos de registro:", { nombre, email, dni, num_telefono, password });
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nombre, dni, num_telefono }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error al crear usuario");

    return data;
  } catch (error) {
    console.error("❌ Signup error:", error);
    throw error;
  }
};


/**
 * Sign in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object, session: Object, profile: Object}>} User session and profile
 */

export const signIn = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");

    return data;
  } catch (error) {
    console.error("❌ Signin error:", error);
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error al cerrar sesión");

    return data;
  } catch (error) {
    console.error("❌ Signout error:", error);
    throw error;
  }
};

/**


export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (!user) {
      return { user: null, profile: null };
    }

    const profile = await getUserProfile(user.id);

    return { user, profile };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return { user: null, profile: null };
  }
};


export const getUserProfile = async (userId) => {
  return executeQuery(
    supabase.from('Usuario').select('*').eq('id', userId).single(),
    'Failed to fetch user profile'
  );
};

 
 /*

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('Usuario')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Also update auth metadata if nombre is updated
    if (updates.nombre) {
      await supabase.auth.updateUser({
        data: { nombre: updates.nombre },
      });
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to update profile');
  }
};


export const checkUserRole = async (userId, requiredRole) => {
  try {
    const profile = await getUserProfile(userId);
    return profile.role === requiredRole || profile.role === USER_ROLES.ADMIN;
  } catch (error) {
    console.error('Failed to check user role:', error);
    return false;
  }
};

/**

export const changePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to change password');
  }
};

/**

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to send reset password email');
  }
};


export const updateUserStatus = async (userId, status) => {
  return updateProfile(userId, { status });
};


export const getAllUsers = async (filters = {}) => {
  try {
    let query = supabase.from('Usuario').select('*').order('created_at', { ascending: false });

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch users');
  }
};


export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

**/