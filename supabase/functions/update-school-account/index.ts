import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://ppdlimbang.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const response = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response(405, { message: "Kaedah tidak disokong." });

  const authorization = request.headers.get("Authorization");
  if (!authorization) return response(401, { message: "Sila log masuk semula." });

  const projectUrl = Deno.env.get("SUPABASE_URL")!;
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(projectUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return response(401, { message: "Sila log masuk semula." });

  const adminClient = createClient(projectUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: administrator } = await adminClient
    .from("esipk_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (administrator?.role !== "admin" || user.email?.toLowerCase() !== "ppdlimbang@moe.gov.my") return response(403, { message: "Akses pentadbir diperlukan." });


  let payload;
  try { payload = await request.json(); }
  catch (_) { return response(400, { message: "Data kemas kini tidak sah." }); }
  if (!payload || typeof payload !== "object") return response(400, { message: "Data tidak sah." });
  const schoolId = String(payload.schoolId || "");
  const schoolName = String(payload.schoolName || "").trim();
  const schoolCode = String(payload.schoolCode || "").trim().toUpperCase();
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  if (!/^[0-9a-f-]{36}$/i.test(schoolId) || !schoolName || !/^[A-Z0-9-]{3,20}$/.test(schoolCode) ||
      !/^\S+@\S+\.\S+$/.test(email) || (password && password.length < 8)) {
    return response(400, { message: "Isi nama, kod dan e-mel sah. Kata laluan baharu minimum 8 aksara." });
  }
  const { data: school, error: schoolError } = await adminClient.from("esipk_schools")
    .select("id,display_name,school_code,account_email,account_editing").eq("id", schoolId).single();
  if (schoolError || !school) return response(404, { message: "Sekolah tidak ditemui. Pastikan migrasi akaun terkini telah dijalankan." });
  const { data: profiles, error: profileError } = await adminClient.from("esipk_profiles")
    .select("id").eq("school_id", schoolId).eq("role", "school");
  if (profileError || profiles?.length !== 1) {
    return response(409, { message: "Sekolah mesti mempunyai tepat satu akaun log masuk sebelum boleh dikemas kini." });
  }
  const { data: target, error: targetError } = await adminClient.auth.admin.getUserById(profiles[0].id);
  if (targetError || !target.user || target.user.id === user.id ||
      target.user.email?.toLowerCase() === "ppdlimbang@moe.gov.my") {
    return response(409, { message: "Akaun sekolah tidak sah." });
  }
  // Claim this school so concurrent edits cannot overwrite an in-flight Auth update.
  const { data: claimed, error: claimError } = await adminClient.from("esipk_schools")
    .update({ account_editing: true }).eq("id", schoolId).eq("account_editing", false).select("id").maybeSingle();
  if (claimError || !claimed) return response(409, { message: "Akaun sedang dikemas kini. Sila cuba sebentar lagi." });
  const values = { display_name: schoolCode + " " + schoolName, school_code: schoolCode, account_email: email };
  const { error: updateError } = await adminClient.from("esipk_schools").update(values).eq("id", schoolId);
  if (updateError) {
    await adminClient.from("esipk_schools").update({ account_editing: false }).eq("id", schoolId);
    return response(409, { message: "Kod, nama atau e-mel sekolah telah digunakan. Tiada perubahan akaun dibuat." });
  }
  const attributes: { email?: string; password?: string; email_confirm?: boolean } = {};
  if (target.user.email?.toLowerCase() !== email) { attributes.email = email; attributes.email_confirm = true; }
  if (password) attributes.password = password;
  if (Object.keys(attributes).length) {
    const { error: authError } = await adminClient.auth.admin.updateUserById(target.user.id, attributes);
    if (authError) {
      const { error: rollbackError } = await adminClient.from("esipk_schools").update({
        display_name: school.display_name, school_code: school.school_code,
        account_email: school.account_email, account_editing: false,
      }).eq("id", schoolId);
      return response(500, { message: rollbackError
        ? "Kemas kini tidak lengkap. Pentadbir perlu menyemak rekod sekolah dan akaun Auth sebelum mencuba lagi."
        : "Akaun gagal dikemas kini. Semak e-mel belum digunakan dan kata laluan memenuhi syarat." });
    }
  }
  const { error: unlockError } = await adminClient.from("esipk_schools").update({ account_editing: false }).eq("id", schoolId);
  if (unlockError) return response(500, { message: "Perubahan disimpan tetapi kunci kemas kini belum dilepaskan. Hubungi pentadbir." });
  return response(200, { school: { id: schoolId, ...values } });
});
