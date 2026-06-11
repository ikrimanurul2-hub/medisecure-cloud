const crypto = require("crypto");
const path = require("path");

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_BUCKET;

  if (!supabaseUrl || !serviceRoleKey || !bucket) {
    throw new Error("Supabase configuration is incomplete.");
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    bucket,
  };
};

const encodeStoragePath = (storagePath) => {
  return storagePath.split("/").map(encodeURIComponent).join("/");
};

const uploadFileToSupabase = async (file, userId) => {
  const { supabaseUrl, serviceRoleKey, bucket } = getSupabaseConfig();

  const extension = path.extname(file.originalname).toLowerCase();
  const storedFileName = `${crypto.randomUUID()}${extension}`;
  const storagePath = `users/${userId}/${storedFileName}`;
  const encodedPath = encodeStoragePath(storagePath);

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${encodedPath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": file.mimetype,
      "x-upsert": "false",
    },
    body: file.buffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase upload error: ${response.status} ${errorText}`);
  }

  return {
    storedFileName,
    storagePath,
  };
};

const createSignedUrl = async (storagePath) => {
  try {
    const { supabaseUrl, serviceRoleKey, bucket } = getSupabaseConfig();

    const encodedPath = encodeStoragePath(storagePath);
    const signUrl = `${supabaseUrl}/storage/v1/object/sign/${bucket}/${encodedPath}`;

    const response = await fetch(signUrl, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expiresIn: 60 * 10,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.signedURL) {
      return null;
    }

    if (data.signedURL.startsWith("http")) {
      return data.signedURL;
    }

    return `${supabaseUrl}/storage/v1${data.signedURL}`;
  } catch (error) {
    return null;
  }
};

module.exports = {
  uploadFileToSupabase,
  createSignedUrl,
};