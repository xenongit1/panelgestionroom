import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_STATUSES = ["active", "pro", "anual"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessKey, email, password } = await req.json();

    if (!accessKey || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify access key exists and has valid plan
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, plan_status, email")
      .eq("access_key", accessKey)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Clave de acceso no válida." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile.plan_status || !VALID_STATUSES.includes(profile.plan_status)) {
      return new Response(
        JSON.stringify({ error: "Esta clave no tiene un plan activo asociado." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if profile already has an auth user linked (email set means owner exists)
    if (profile.email && profile.email !== email) {
      // Profile already claimed by another email — check if same email is re-registering
      return new Response(
        JSON.stringify({ error: "Esta clave ya tiene un administrador asignado. Usa Login." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create auth user with auto-confirm
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { access_key: accessKey },
    });

    if (createError) {
      // If user already exists, return friendly message
      if (createError.message?.includes("already been registered")) {
        return new Response(
          JSON.stringify({ error: "Este email ya está registrado. Usa Login." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the existing profile row to link to the new auth user
    // The handle_new_user trigger will create a NEW profile row, so we need to:
    // 1. Delete the trigger-created row
    // 2. Update the original profile with the new user id
    const newUserId = newUser.user.id;

    // Delete the auto-created profile from the trigger (if it was created)
    await supabase.from("profiles").delete().eq("id", newUserId);

    // Update the original profile to use the new auth user's ID and email
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ id: newUserId, email })
      .eq("access_key", accessKey);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Error al vincular la cuenta: " + updateError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
