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
    const { key } = await req.json();

    if (!key) {
      return new Response(
        JSON.stringify({ valid: false, reason: "invalid" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, company_name, company_email, company_phone, country, city, access_key, plan_status, plan_type, subscription_end")
      .eq("access_key", key.trim())
      .maybeSingle();

    if (error) {
      console.error("Supabase query error:", { message: error.message, details: error.details, hint: error.hint, code: error.code });
      return new Response(
        JSON.stringify({ valid: false, reason: "query_error" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profile) {
      return new Response(
        JSON.stringify({ valid: false, reason: "invalid" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check plan_status against allowed values
    if (!profile.plan_status || !VALID_STATUSES.includes(profile.plan_status)) {
      return new Response(
        JSON.stringify({ valid: false, reason: "expired" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription end date
    if (profile.subscription_end && new Date(profile.subscription_end) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, reason: "expired" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if an owner already exists in panel_users
    const { data: ownerCheck } = await supabase
      .from("panel_users")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("role", "owner")
      .maybeSingle();

    return new Response(
      JSON.stringify({ valid: true, profile, has_owner: !!ownerCheck }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, reason: "invalid", error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
