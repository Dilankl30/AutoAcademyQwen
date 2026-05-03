import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );
};

const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
};

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-a96c109b/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ROUTES ====================

// Sign up new user — sends real confirmation email
app.post("/make-server-a96c109b/auth/signup", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const origin = c.req.header('origin') || 'https://localhost:5173';
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: origin,
      }
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Detect if user already exists (Supabase returns empty identities for existing users)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return c.json({ error: 'Este correo ya está registrado. Por favor inicia sesión.' }, 400);
    }

    return c.json({ success: true, message: 'Revisa tu correo para confirmar tu cuenta.' });
  } catch (error) {
    console.error('Signup exception:', error);
    return c.json({ error: 'Error al crear el usuario' }, 500);
  }
});

// Sign in user
app.post("/make-server-a96c109b/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Signin error:', error);
      // Friendly Spanish messages
      if (error.message.includes('Email not confirmed')) {
        return c.json({ error: 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.' }, 400);
      }
      if (error.message.includes('Invalid login credentials')) {
        return c.json({ error: 'Correo o contraseña incorrectos.' }, 400);
      }
      return c.json({ error: error.message }, 400);
    }

    // Get profile
    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return c.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile: profile || { id: data.user.id, email: data.user.email, is_admin: false }
    });
  } catch (error) {
    console.error('Signin exception:', error);
    return c.json({ error: 'Error al iniciar sesión' }, 500);
  }
});

// Get current session
app.get("/make-server-a96c109b/auth/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ session: null, profile: null });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ session: null, profile: null });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get subscription
    const { data: subscriptionData } = await supabaseAdmin
      .from('subscriptions')
      .select('*, packages(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    const subscription = subscriptionData?.[0] || null;

    return c.json({
      session: { user },
      profile: profile || { id: user.id, email: user.email, is_admin: false },
      subscription
    });
  } catch (error) {
    console.error('Session check exception:', error);
    return c.json({ session: null, profile: null });
  }
});

// Refresh token
app.post("/make-server-a96c109b/auth/refresh", async (c) => {
  try {
    const { refresh_token } = await c.req.json();
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error || !data.session) {
      return c.json({ error: 'Session expired' }, 401);
    }

    return c.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    });
  } catch (error) {
    return c.json({ error: 'Error refreshing session' }, 500);
  }
});

// Sign out
app.post("/make-server-a96c109b/auth/signout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (accessToken) {
      const supabase = getSupabaseClient();
      await supabase.auth.admin?.signOut(accessToken).catch(() => {});
    }
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Error signing out' }, 500);
  }
});

// ==================== SUBSCRIPTIONS ROUTES ====================

// Get user's active subscription
app.get("/make-server-a96c109b/subscriptions/me", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ subscription: null });

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) return c.json({ subscription: null });

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*, packages(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return c.json({ subscription: subscription || null });
  } catch (error) {
    return c.json({ subscription: null });
  }
});

// Create or update subscription
app.post("/make-server-a96c109b/subscriptions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return c.json({ error: 'Unauthorized' }, 401);

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !user) return c.json({ error: 'Unauthorized' }, 401);

    const { package_id } = await c.req.json();

    // Cancel existing subscriptions
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Create new subscription
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert([{ user_id: user.id, package_id, status: 'active' }])
      .select('*, packages(*)')
      .single();

    if (error) {
      console.error('Subscription error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, subscription: data });
  } catch (error) {
    return c.json({ error: 'Error creating subscription' }, 500);
  }
});

// ==================== COURSES ROUTES ====================

app.get("/make-server-a96c109b/courses", async (c) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ courses: data || [] });
  } catch (error) {
    return c.json({ error: 'Error fetching courses' }, 500);
  }
});

app.post("/make-server-a96c109b/courses", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken!);
    if (authError || !user) return c.json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const courseData = await c.req.json();
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert([{ ...courseData, is_active: true }])
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ course: data });
  } catch (error) {
    return c.json({ error: 'Error creating course' }, 500);
  }
});

app.put("/make-server-a96c109b/courses/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken!);
    if (authError || !user) return c.json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const id = c.req.param('id');
    const courseData = await c.req.json();

    const { data, error } = await supabaseAdmin
      .from('courses')
      .update({ ...courseData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ course: data });
  } catch (error) {
    return c.json({ error: 'Error updating course' }, 500);
  }
});

app.delete("/make-server-a96c109b/courses/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken!);
    if (authError || !user) return c.json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const id = c.req.param('id');
    const { error } = await supabaseAdmin
      .from('courses')
      .update({ is_active: false })
      .eq('id', id);

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Error deleting course' }, 500);
  }
});

// ==================== PACKAGES ROUTES ====================

app.get("/make-server-a96c109b/packages", async (c) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('packages')
      .select('*')
      .order('price', { ascending: true });

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ packages: data || [] });
  } catch (error) {
    return c.json({ error: 'Error fetching packages' }, 500);
  }
});

// ==================== CONTACT ROUTES ====================

app.post("/make-server-a96c109b/contact", async (c) => {
  try {
    const { name, email, message } = await c.req.json();
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert([{ name, email, message }])
      .select()
      .single();

    if (error) {
      console.error('Contact error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, message: data });
  } catch (error) {
    return c.json({ error: 'Error submitting message' }, 500);
  }
});

app.get("/make-server-a96c109b/contact", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken!);
    if (authError || !user) return c.json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ messages: data || [] });
  } catch (error) {
    return c.json({ error: 'Error fetching messages' }, 500);
  }
});

// ==================== ADMIN ROUTES ====================

app.get("/make-server-a96c109b/admin/users", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken!);
    if (authError || !user) return c.json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    // Get profiles with subscription info
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        subscriptions(*, packages(*))
      `)
      .order('created_at', { ascending: false });

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ users: profiles || [] });
  } catch (error) {
    return c.json({ error: 'Error fetching users' }, 500);
  }
});

Deno.serve(app.fetch);