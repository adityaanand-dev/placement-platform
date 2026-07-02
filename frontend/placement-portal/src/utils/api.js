// ─── LaunchPad API utility ────────────────────────────────────────────────────
// Replace BASE_URL with your API Gateway invoke URL after deployment.
const BASE_URL = process.env.REACT_APP_API_URL || "https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod";

// ─── Generic fetch wrapper returning raw data to match Axios expectations ──────
async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP error! status: ${res.status}`);
  }
  
  // Wrap response in an Axios-like payload shape ({ data }) so app components don't crash
  return { data };
}

// ─── Default Axios-like Instance Object ───────────────────────────────────────
// This keeps your existing code like `api.get(...)` working seamlessly!
const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
};

export default api;

// ─── Named Auth Helpers ────────────────────────────────────────────────────────
export const login    = (email, password)     => request("POST",  "/auth/login",    { email, password });
export const register = (payload)             => request("POST",  "/auth/register", payload);
export const logout   = ()                    => request("POST",  "/auth/logout");

// ─── Student profile ───────────────────────────────────────────────────────────
export const getProfile    = (studentId)      => request("GET",   `/students/${studentId}`);
export const updateProfile = (studentId, data)=> request("PUT",   `/students/${studentId}`, data);

// ─── Resume ────────────────────────────────────────────────────────────────────
/**
 * Upload a PDF File object to S3 via a pre-signed URL.
 * Lambda endpoint: GET /resume/upload-url?studentId=xxx returns { uploadUrl, key }
 */
export async function uploadResume(studentId, file) {
  // 1. Get pre-signed S3 URL from Lambda using internal request logic
  const response = await request("GET", `/resume/upload-url?studentId=${studentId}`);
  const uploadData = response.data;

  // 2. PUT binary data directly to S3
  const s3Res = await fetch(uploadData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: file,
  });
  
  if (!s3Res.ok) throw new Error("S3 upload failed");
  return { data: { key: uploadData.key } };
}

// ─── Jobs ──────────────────────────────────────────────────────────────────────
export const getJobs = (filters = {}) => {
  const qs = new URLSearchParams(filters).toString();
  return request("GET", `/jobs${qs ? "?" + qs : ""}`);
};
export const getJobById   = (jobId)        => request("GET",  `/jobs/${jobId}`);
export const saveJob      = (studentId, jobId) => request("POST", `/students/${studentId}/saved-jobs`, { jobId });
export const unsaveJob    = (studentId, jobId) => request("DELETE", `/students/${studentId}/saved-jobs/${jobId}`);

// ─── Applications ─────────────────────────────────────────────────────────────
export const applyToJob       = (studentId, jobId) => request("POST",  `/applications`, { studentId, jobId });
export const getApplications  = (studentId)        => request("GET",   `/applications?studentId=${studentId}`);
export const getApplicationById = (appId)          => request("GET",   `/applications/${appId}`);

// ─── Meetings / Interviews ────────────────────────────────────────────────────
export const getMeetings  = (studentId) => request("GET", `/meetings?studentId=${studentId}`);
export const getMeetingById = (meetId)  => request("GET", `/meetings/${meetId}`);