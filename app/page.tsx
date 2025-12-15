'use client';

import { useState, useEffect } from 'react';
import { Music, Wallet, Gift, CheckCircle, XCircle, Loader2, ExternalLink, LogOut } from 'lucide-react';
import { getTikTokAuthUrl, tiktokCallback, getSession, getActiveCampaign, submitVideo, logout } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface Campaign {
  id: number;
  name: string;
  min_views: number;
  min_likes: number;
  min_comments: number;
  min_shares: number;
  reward_amount: string;
  max_winners: number;
}

interface User {
  openId: string;
  username: string;
  avatar?: string;
}

interface SubmissionResult {
  eligible: boolean;
  message: string;
  submission: any;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load session and campaign on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    if (savedSessionId) {
      loadSession(savedSessionId);
    }
    loadCampaign();

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleOAuthCallback(code);
    }
  }, []);

  const loadSession = async (sid: string) => {
    try {
      const response = await getSession(sid);
      setUser(response.data.user);
      setSessionId(sid);
    } catch (err) {
      localStorage.removeItem('sessionId');
    }
  };

  const loadCampaign = async () => {
    try {
      const response = await getActiveCampaign();
      setCampaign(response.data);
    } catch (err) {
      console.error('Failed to load campaign');
    }
  };

  const handleOAuthCallback = async (code: string) => {
    setAuthLoading(true);
    try {
      const response = await tiktokCallback(code);
      const { sessionId: sid, user: userData } = response.data;
      localStorage.setItem('sessionId', sid);
      setSessionId(sid);
      setUser(userData);
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleTikTokLogin = async () => {
    setAuthLoading(true);
    try {
      const response = await getTikTokAuthUrl();
      window.location.href = response.data.url;
    } catch (err) {
      setError('Failed to initiate login');
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (sessionId) {
      try {
        await logout(sessionId);
      } catch (err) {}
    }
    localStorage.removeItem('sessionId');
    setSessionId(null);
    setUser(null);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !videoUrl || !walletAddress) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await submitVideo({
        sessionId,
        videoUrl,
        walletAddress
      });
      setResult(response.data);
      if (response.data.eligible) {
        setVideoUrl('');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-10 h-10 text-tiktok-red" />
            <span className="text-3xl font-bold">×</span>
            <Wallet className="w-10 h-10 text-starknet-purple" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">TikTok Rewards</span>
          </h1>
          <p className="text-white/70 text-lg">
            Soumets ta vidéo TikTok et gagne des STRK
          </p>
        </header>

        {/* Campaign Info */}
        {campaign && (
          <div className="card mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-tiktok-cyan" />
              <h2 className="text-xl font-semibold">{campaign.name}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-bold text-tiktok-cyan">{formatNumber(campaign.min_views)}</div>
                <div className="text-sm text-white/60">Vues min.</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-bold text-tiktok-red">{formatNumber(campaign.min_likes)}</div>
                <div className="text-sm text-white/60">Likes min.</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-bold text-starknet-purple">{campaign.reward_amount}</div>
                <div className="text-sm text-white/60">STRK à gagner</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-2xl font-bold text-white">{campaign.max_winners}</div>
                <div className="text-sm text-white/60">Gagnants max</div>
              </div>
            </div>
          </div>
        )}

        {/* Login / Submission */}
        <div className="card">
          {!user ? (
            // Login Section
            <div className="text-center py-8">
              <Music className="w-16 h-16 mx-auto mb-4 text-tiktok-red" />
              <h2 className="text-2xl font-bold mb-2">Connecte-toi avec TikTok</h2>
              <p className="text-white/60 mb-6">
                Pour participer, connecte ton compte TikTok
              </p>
              <button
                onClick={handleTikTokLogin}
                disabled={authLoading}
                className="btn-primary inline-flex items-center gap-2"
              >
                {authLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Music className="w-5 h-5" />
                )}
                Se connecter avec TikTok
              </button>
            </div>
          ) : (
            // Submission Form
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-tiktok-red to-tiktok-cyan flex items-center justify-center text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{user.username}</div>
                    <div className="text-sm text-white/60">Connecté via TikTok</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lien de ta vidéo TikTok
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@username/video/..."
                    className="input"
                    required
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Colle le lien complet de ta vidéo TikTok
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ton adresse wallet Starknet
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="input"
                    pattern="^0x[a-fA-F0-9]{1,64}$"
                    required
                  />
                  <p className="text-xs text-white/50 mt-1">
                    L'adresse où tu recevras tes STRK (Argent, Braavos...)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !videoUrl || !walletAddress}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Gift className="w-5 h-5" />
                  )}
                  Soumettre ma vidéo
                </button>
              </form>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-200">{error}</div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
              result.eligible 
                ? 'bg-green-500/20 border border-green-500/50' 
                : 'bg-yellow-500/20 border border-yellow-500/50'
            }`}>
              {result.eligible ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              )}
              <div className={result.eligible ? 'text-green-200' : 'text-yellow-200'}>
                {result.message}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-white/40 text-sm">
          <a href="/admin" className="hover:text-white/60 transition-colors">
            Admin
          </a>
          <span className="mx-2">•</span>
          <span>Powered by Starknet</span>
        </footer>
      </div>
    </main>
  );
}
