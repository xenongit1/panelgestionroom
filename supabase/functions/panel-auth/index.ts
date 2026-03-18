import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "register") {
      const { profileId, username, password, accessKey } = body;

      if (!profileId || !username || !password || !accessKey) {
        return jsonResponse({ error: "missing_fields" }, 400);
      }

      if (password.length < 6) {
        return jsonResponse({ error: "password_too_short" });
      }

      // Verify access_key belongs to profileId and has valid plan
      const { data: verifiedProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", profileId)
        .eq("access_key", accessKey)
        .in("plan_status", ["pro", "anual", "active"])
        .maybeSingle();

      if (!verifiedProfile) {
        return jsonResponse({ error: "unauthorized" }, 401);
      }

      // Check if an owner already exists for this profile
      const { data: existing } = await supabase
        .from("panel_users")
        .select("id")
        .eq("profile_id", profileId)
        .eq("role", "owner")
        .maybeSingle();

      if (existing) {
        return jsonResponse({ error: "already_claimed" });
      }

      // Check username uniqueness (handled by DB constraint too)
      const { data: usernameCheck } = await supabase
        .from("panel_users")
        .select("id")
        .eq("username", username.trim().toLowerCase())
        .maybeSingle();

      if (usernameCheck) {
        return jsonResponse({ error: "username_taken" });
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      const { data: newUser, error: insertError } = await supabase
        .from("panel_users")
        .insert({
          profile_id: profileId,
          username: username.trim().toLowerCase(),
          password_hash: passwordHash,
          role: "owner",
        })
        .select("id, profile_id, username, role")
        .single();

      if (insertError) {
        return jsonResponse({ error: insertError.message }, 500);
      }

      return jsonResponse({
        success: true,
        session: {
          panel_user_id: newUser.id,
          profile_id: newUser.profile_id,
          username: newUser.username,
          role: newUser.role,
        },
      });
    }

    if (action === "login") {
      const { username, password } = body;

      if (!username || !password) {
        return jsonResponse({ error: "missing_fields" }, 400);
      }

      const { data: user, error } = await supabase
        .from("panel_users")
        .select("id, profile_id, username, password_hash, role")
        .eq("username", username.trim().toLowerCase())
        .maybeSingle();

      if (error || !user) {
        return jsonResponse({ error: "invalid_credentials" });
      }

      const valid = bcrypt.compareSync(password, user.password_hash);
      if (!valid) {
        return jsonResponse({ error: "invalid_credentials" });
      }

      // Also fetch access_key from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("access_key")
        .eq("id", user.profile_id)
        .maybeSingle();

      return jsonResponse({
        success: true,
        session: {
          panel_user_id: user.id,
          profile_id: user.profile_id,
          username: user.username,
          role: user.role,
          access_key: profile?.access_key || null,
        },
      });
    }

    return jsonResponse({ error: "invalid_action" }, 400);
  } catch (err) {
    console.error("panel-auth error:", err);
    return jsonResponse({ error: "Ha ocurrido un error en el servidor" }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
