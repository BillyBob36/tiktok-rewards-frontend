import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Auth
export const getTikTokAuthUrl = () => api.get('/auth/tiktok/url');
export const tiktokCallback = (code: string) => api.post('/auth/tiktok/callback', { code });
export const getSession = (sessionId: string) => api.get(`/auth/session/${sessionId}`);
export const logout = (sessionId: string) => api.delete(`/auth/session/${sessionId}`);
export const getUserVideos = (sessionId: string, cursor?: string) => 
  api.get(`/auth/videos/${sessionId}`, { params: cursor ? { cursor } : {} });

// Campaigns (public)
export const getActiveCampaign = () => api.get('/campaigns/active');
export const getAllActiveCampaigns = () => api.get('/campaigns/active/all');

// Submissions (user)
export const submitVideo = (data: { sessionId: string; videoUrl: string; walletAddress: string; campaignId?: number }) =>
  api.post('/submissions', data);

// Admin endpoints
const adminHeaders = (password: string) => ({ headers: { 'x-admin-password': password } });

export const adminGetCampaigns = (password: string) => 
  api.get('/campaigns', adminHeaders(password));

export const adminCreateCampaign = (password: string, data: any) => 
  api.post('/campaigns', data, adminHeaders(password));

export const adminUpdateCampaign = (password: string, id: number, data: any) => 
  api.put(`/campaigns/${id}`, data, adminHeaders(password));

export const adminDeleteCampaign = (password: string, id: number) => 
  api.delete(`/campaigns/${id}`, adminHeaders(password));

export const adminGetSubmissions = (password: string, params?: { campaign_id?: number; status?: string }) =>
  api.get('/submissions', { ...adminHeaders(password), params });

export const adminGetStats = (password: string) =>
  api.get('/submissions/stats', adminHeaders(password));

export const adminUpdateSubmissionStatus = (password: string, id: number, status: string) =>
  api.patch(`/submissions/${id}`, { status }, adminHeaders(password));

export const adminBatchUpdateStatus = (password: string, ids: number[], status: string) =>
  api.post('/submissions/batch-status', { ids, status }, adminHeaders(password));

export const adminGetBalance = (password: string) =>
  api.get('/admin/payout/balance', adminHeaders(password));

export const adminSimulatePayout = (password: string, submissionIds: number[]) =>
  api.post('/admin/payout/simulate', { submissionIds }, adminHeaders(password));

export const adminExecutePayout = (password: string, submissionIds: number[]) =>
  api.post('/admin/payout', { submissionIds }, adminHeaders(password));

export default api;
