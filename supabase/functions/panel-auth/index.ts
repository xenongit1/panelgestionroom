import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const USERNAME_REGEX = /^[a-z0-9_]+$/;
const MAX_USERNAME_LENGTH = 50;
const MAX_PASSWORD_LENGTH = 128;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function sanitizeUsername(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || trimmed.length > MAX_USERNAME_LENGTH) return null;
  if (!USERNAME_REGEX.test(trimmed)) return null;
  return trimmed;
}

function validatePassword(raw: string): boolean {
  return typeof raw === "string" && raw.length >= 6 && raw.length <= MAX_PASSWORD_LENGTH;
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

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

    // ── REGISTER ──
    if (action === "register") {
      const { profileId, password, accessKey, company_name, company_email, company_phone, country, city } = body;
      const username = sanitizeUsername(body.username || "");

      if (!profileId || !username || !password || !accessKey) {
        return jsonResponse({ error: "missing_fields" }, 400);
      }

      if (!validatePassword(password)) {
        return jsonResponse({ error: "password_too_short" });
      }

      // Verify access_key belongs to profileId and has valid plan
      const { data: verifiedProfile } = await supabase
        .from("profiles")
        .select("id, key_used")
        .eq("id", profileId)
        .eq("access_key", accessKey)
        .in("plan_status", ["pro", "anual", "active"])
        .maybeSingle();

      if (!verifiedProfile) {
        return jsonResponse({ error: "unauthorized" }, 401);
      }

      if (verifiedProfile.key_used) {
        return jsonResponse({ error: "already_used" });
      }

      // Check if an owner already exists
      const { data: existing } = await supabase
        .from("panel_users")
        .select("id")
        .eq("profile_id", profileId)
        .eq("role", "owner")
        .maybeSingle();

      if (existing) {
        return jsonResponse({ error: "already_claimed" });
      }

      // Check username uniqueness
      const { data: usernameCheck } = await supabase
        .from("panel_users")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (usernameCheck) {
        return jsonResponse({ error: "username_taken" });
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      // Step 1: Insert panel_user
      const { data: newUser, error: insertError } = await supabase
        .from("panel_users")
        .insert({
          profile_id: profileId,
          username,
          password_hash: passwordHash,
          role: "owner",
        })
        .select("id, profile_id, username, role")
        .single();

      if (insertError) {
        console.error("panel-auth insert error:", insertError);
        return jsonResponse({ error: "Error de autenticación" }, 500);
      }

      // Step 2: Update profile with business data + key_used = true
      const profileUpdate: Record<string, any> = { key_used: true };
      if (company_name) profileUpdate.company_name = String(company_name).trim().slice(0, 100);
      if (company_email) profileUpdate.company_email = String(company_email).trim().slice(0, 200);
      if (company_phone) profileUpdate.company_phone = String(company_phone).trim().slice(0, 30);
      if (country) profileUpdate.country = String(country).trim().slice(0, 60);
      if (city) profileUpdate.city = String(city).trim().slice(0, 60);

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", profileId);

      if (profileError) {
        console.error("panel-auth profile update error:", profileError);
        // Rollback: delete the panel_user we just created
        await supabase.from("panel_users").delete().eq("id", newUser.id);
        return jsonResponse({ error: "Error de autenticación" }, 500);
      }

      // Fetch full profile for session
      const { data: fullProfile } = await supabase
        .from("profiles")
        .select("id, email, company_name, company_email, company_phone, country, city, plan_status, plan_type, subscription_end, owner_name")
        .eq("id", profileId)
        .single();

      return jsonResponse({
        success: true,
        session: {
          panel_user_id: newUser.id,
          profile_id: newUser.profile_id,
          username: newUser.username,
          role: newUser.role,
        },
        profile: fullProfile,
      });
    }

    // ── LOGIN ──
    if (action === "login") {
      const username = sanitizeUsername(body.username || "");
      const password = body.password;

      if (!username || !password || typeof password !== "string") {
        return jsonResponse({ error: "missing_fields" }, 400);
      }

      if (password.length > MAX_PASSWORD_LENGTH) {
        return jsonResponse({ error: "invalid_credentials" });
      }

      // Rate Limiting
      const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
      const { count } = await supabase
        .from("validation_attempts")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", username)
        .gte("attempted_at", windowStart);

      if ((count ?? 0) >= MAX_ATTEMPTS) {
        return jsonResponse({ error: "Demasiados intentos. Espera 10 minutos." }, 429);
      }

      const { data: user, error } = await supabase
        .from("panel_users")
        .select("id, profile_id, username, password_hash, role")
        .eq("username", username)
        .maybeSingle();

      if (error || !user) {
        await supabase.from("validation_attempts").insert({ ip_address: username });
        return jsonResponse({ error: "invalid_credentials" });
      }

      const valid = bcrypt.compareSync(password, user.password_hash);
      if (!valid) {
        await supabase.from("validation_attempts").insert({ ip_address: username });
        return jsonResponse({ error: "invalid_credentials" });
      }

      // Clean up old attempts
      await supabase
        .from("validation_attempts")
        .delete()
        .eq("ip_address", username)
        .lt("attempted_at", new Date(Date.now() - 3600000).toISOString());

      // Fetch profile data for the session
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, company_name, company_email, company_phone, country, city, plan_status, plan_type, subscription_end, owner_name")
        .eq("id", user.profile_id)
        .single();

      return jsonResponse({
        success: true,
        session: {
          panel_user_id: user.id,
          profile_id: user.profile_id,
          username: user.username,
          role: user.role,
        },
        profile,
      });
    }

    // ── VALIDATE SESSION ──
    if (action === "validate_session") {
      const { profile_id, panel_user_id } = body;

      if (!profile_id || !panel_user_id) {
        return jsonResponse({ error: "missing_fields" }, 400);
      }

      const { data: panelUser } = await supabase
        .from("panel_users")
        .select("id, profile_id, username, role")
        .eq("id", panel_user_id)
        .eq("profile_id", profile_id)
        .maybeSingle();

      if (!panelUser) {
        return jsonResponse({ error: "invalid_session" }, 401);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, company_name, company_email, company_phone, country, city, plan_status, plan_type, subscription_end, owner_name")
        .eq("id", profile_id)
        .in("plan_status", ["pro", "anual", "active"])
        .single();

      if (!profile) {
        return jsonResponse({ error: "expired_plan" }, 403);
      }

      return jsonResponse({ valid: true, profile });
    }

    // ── CHANGE PASSWORD ──
    if (action === "change_password") {
      const username = sanitizeUsername(body.username || "");
      const { profileId, currentPassword, newPassword } = body;

      if (!username || !profileId || !currentPassword || !newPassword) {
        return jsonResponse({ error: "missing_fields" }, 400);
      }

      if (!validatePassword(currentPassword) || !validatePassword(newPassword)) {
        return jsonResponse({ error: "invalid_credentials" });
      }

      // Verify profile exists with valid plan
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", profileId)
        .in("plan_status", ["pro", "anual", "active"])
        .maybeSingle();

      if (!profile) {
        return jsonResponse({ error: "unauthorized" }, 401);
      }

      const { data: user } = await supabase
        .from("panel_users")
        .select("id, password_hash")
        .eq("username", username)
        .eq("profile_id", profileId)
        .maybeSingle();

      if (!user) {
        return jsonResponse({ error: "invalid_credentials" });
      }

      const valid = bcrypt.compareSync(currentPassword, user.password_hash);
      if (!valid) {
        return jsonResponse({ error: "invalid_credentials" });
      }

      const newHash = bcrypt.hashSync(newPassword, 10);
      const { error: updateError } = await supabase
        .from("panel_users")
        .update({ password_hash: newHash })
        .eq("id", user.id);

      if (updateError) {
        console.error("panel-auth change_password error:", updateError);
        return jsonResponse({ error: "Error de autenticación" }, 500);
      }

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "invalid_action" }, 400);
  } catch (err) {
    console.error("panel-auth error:", err);
    return jsonResponse({ error: "Ha ocurrido un error en el servidor" }, 500);
  }
});
