import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_STATUSES = ["active", "pro", "anual"];

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
    const { key } = await req.json();

    // Differentiated: missing vs invalid
    if (!key || typeof key !== "string" || !key.trim()) {
      return jsonResponse({ valid: false, reason: "missing_key" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, company_name, company_email, company_phone, country, city, access_key, plan_status, plan_type, subscription_end, key_used")
      .eq("access_key", key.trim())
      .maybeSingle();

    if (error) {
      console.error("Supabase query error:", { message: error.message, details: error.details, hint: error.hint, code: error.code });
      return jsonResponse({ valid: false, reason: "query_error" });
    }

    if (!profile) {
      return jsonResponse({ valid: false, reason: "invalid" });
    }

    // Check plan_status
    if (!profile.plan_status || !VALID_STATUSES.includes(profile.plan_status)) {
      return jsonResponse({ valid: false, reason: "expired" });
    }

    // Check subscription end date
    if (profile.subscription_end && new Date(profile.subscription_end) < new Date()) {
      return jsonResponse({ valid: false, reason: "expired" });
    }

    // Check if key was already used (activation completed)
    if (profile.key_used) {
      // Check if owner exists
      const { data: ownerCheck } = await supabase
        .from("panel_users")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("role", "owner")
        .maybeSingle();

      return jsonResponse({
        valid: true,
        has_owner: !!ownerCheck,
        key_used: true,
        profile: { id: profile.id, company_name: profile.company_name },
      });
    }

    // Key not yet used — check if owner exists anyway (edge case)
    const { data: ownerCheck } = await supabase
      .from("panel_users")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("role", "owner")
      .maybeSingle();

    return jsonResponse({
      valid: true,
      profile,
      has_owner: !!ownerCheck,
      key_used: false,
    });
  } catch (err) {
    console.error("validate-access-key error:", err);
    return jsonResponse({ valid: false, reason: "server_error" }, 500);
  }
});
