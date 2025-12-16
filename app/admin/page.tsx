'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Eye, Heart, MessageCircle, Share2, 
  Wallet, CheckCircle, XCircle, Loader2, ExternalLink, 
  RefreshCw, DollarSign, AlertTriangle, LogIn, ArrowLeft, Settings
} from 'lucide-react';
import Image from 'next/image';
import {
  adminGetCampaigns, adminCreateCampaign, adminUpdateCampaign,
  adminGetSubmissions, adminGetStats, adminBatchUpdateStatus,
  adminGetBalance, adminSimulatePayout, adminExecutePayout
} from '@/lib/api';
import { formatNumber, shortenAddress, formatDate } from '@/lib/utils';

interface Campaign {
  id: number;
  name: string;
  min_views: number;
  min_likes: number;
  min_comments: number;
  min_shares: number;
  reward_amount: string;
  max_winners: number;
  is_active: number;
}

interface Submission {
  id: number;
  video_id: string;
  video_url: string;
  tiktok_username: string;
  wallet_address: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  status: string;
  tx_hash: string | null;
  created_at: string;
  campaign_name: string;
  reward_amount: string;
}

interface Stats {
  total: number;
  pending: number;
  eligible: number;
  winners: number;
  paid: number;
  rejected: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    min_views: 1000,
    min_likes: 50,
    min_comments: 0,
    min_shares: 0,
    reward_amount: '10',
    max_winners: 50
  });

  const [activeTab, setActiveTab] = useState<'submissions' | 'campaigns'>('submissions');

  // Try to authenticate
  const handleLogin = async () => {
    setAuthError('');
    try {
      await adminGetStats(password);
      setIsAuthenticated(true);
      localStorage.setItem('adminPassword', password);
      loadData();
    } catch (err) {
      setAuthError('Mot de passe incorrect');
    }
  };

  // Check saved password on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem('adminPassword');
    if (savedPassword) {
      setPassword(savedPassword);
      adminGetStats(savedPassword)
        .then(() => {
          setIsAuthenticated(true);
          loadDataWithPassword(savedPassword);
        })
        .catch(() => {
          localStorage.removeItem('adminPassword');
        });
    }
  }, []);

  const loadData = () => loadDataWithPassword(password);

  const loadDataWithPassword = async (pwd: string) => {
    setLoading(true);
    try {
      const [campaignsRes, submissionsRes, statsRes] = await Promise.all([
        adminGetCampaigns(pwd),
        adminGetSubmissions(pwd, statusFilter ? { status: statusFilter } : undefined),
        adminGetStats(pwd)
      ]);
      setCampaigns(campaignsRes.data);
      setSubmissions(submissionsRes.data);
      setStats(statsRes.data);

      try {
        const balanceRes = await adminGetBalance(pwd);
        setBalance(balanceRes.data.balance);
      } catch (err) {
        setBalance(null);
      }
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [statusFilter]);

  const handleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(submissions.map(s => s.id));
    }
  };

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await adminBatchUpdateStatus(password, selectedIds, status);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      console.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = async () => {
    const eligibleIds = selectedIds.filter(id => {
      const sub = submissions.find(s => s.id === id);
      return sub && ['eligible', 'winner'].includes(sub.status);
    });

    if (eligibleIds.length === 0) {
      alert('Sélectionnez des soumissions éligibles pour le paiement');
      return;
    }

    if (!confirm(`Confirmer le paiement pour ${eligibleIds.length} gagnant(s) ?`)) {
      return;
    }

    setPayoutLoading(true);
    try {
      const result = await adminExecutePayout(password, eligibleIds);
      alert(result.data.message);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.error || err.message));
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleSaveCampaign = async () => {
    setLoading(true);
    try {
      if (editingCampaign) {
        await adminUpdateCampaign(password, editingCampaign.id, campaignForm);
      } else {
        await adminCreateCampaign(password, campaignForm);
      }
      setShowCampaignForm(false);
      setEditingCampaign(null);
      setCampaignForm({
        name: '',
        min_views: 1000,
        min_likes: 50,
        min_comments: 0,
        min_shares: 0,
        reward_amount: '10',
        max_winners: 50
      });
      loadData();
    } catch (err) {
      console.error('Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  const openEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      min_views: campaign.min_views,
      min_likes: campaign.min_likes,
      min_comments: campaign.min_comments,
      min_shares: campaign.min_shares,
      reward_amount: campaign.reward_amount,
      max_winners: campaign.max_winners
    });
    setShowCampaignForm(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-300',
      eligible: 'bg-blue-500/20 text-blue-300',
      winner: 'bg-purple-500/20 text-purple-300',
      paid: 'bg-green-500/20 text-green-300',
      rejected: 'bg-red-500/20 text-red-300'
    };
    return styles[status] || 'bg-gray-500/20 text-gray-300';
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Image src="/logo-starktok.png" alt="StarkTok" width={48} height={48} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400">TikTok Rewards Campaign</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Mot de passe admin"
              className="input-admin w-full"
            />
            {authError && (
              <p className="text-red-400 text-sm">{authError}</p>
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-starknet-purple hover:bg-starknet-purple/80 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Se connecter
            </button>
          </div>
          
          <a href="/" className="flex items-center justify-center gap-2 mt-6 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo-starktok.png" alt="StarkTok" width={32} height={32} />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-sm text-gray-400">TikTok Rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {balance !== null && (
              <div className="bg-gray-700 rounded-lg px-4 py-2 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-starknet-purple" />
                <span className="font-mono">{balance} STRK</span>
              </div>
            )}
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-gray-400">En attente</div>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-400">{stats.eligible}</div>
              <div className="text-sm text-gray-400">Éligibles</div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-purple-400">{stats.winners}</div>
              <div className="text-sm text-gray-400">Gagnants</div>
            </div>
            <div className="bg-green-500/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-400">{stats.paid}</div>
              <div className="text-sm text-gray-400">Payés</div>
            </div>
            <div className="bg-red-500/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-red-400">{stats.rejected}</div>
              <div className="text-sm text-gray-400">Rejetés</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`py-3 px-4 font-medium transition-colors ${
              activeTab === 'submissions' 
                ? 'text-starknet-purple border-b-2 border-starknet-purple' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Soumissions
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-3 px-4 font-medium transition-colors ${
              activeTab === 'campaigns' 
                ? 'text-starknet-purple border-b-2 border-starknet-purple' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Campagnes
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'submissions' && (
          <div>
            {/* Actions bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-admin"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="eligible">Éligibles</option>
                <option value="winner">Gagnants</option>
                <option value="paid">Payés</option>
                <option value="rejected">Rejetés</option>
              </select>

              {selectedIds.length > 0 && (
                <>
                  <span className="text-gray-400">{selectedIds.length} sélectionné(s)</span>
                  <button
                    onClick={() => handleBatchStatus('winner')}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Marquer gagnants
                  </button>
                  <button
                    onClick={() => handleBatchStatus('rejected')}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={handlePayout}
                    disabled={payoutLoading}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    {payoutLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )}
                    Payer les sélectionnés
                  </button>
                </>
              )}
            </div>

            {/* Table */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === submissions.length && submissions.length > 0}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-gray-300">User TikTok</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-300">Vidéo</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-300">Stats</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-300">Wallet</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-300">Statut</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-700/50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(sub.id)}
                            onChange={() => handleSelect(sub.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{sub.tiktok_username}</div>
                        </td>
                        <td className="p-4">
                          <a
                            href={sub.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-tiktok-cyan hover:underline"
                          >
                            Voir <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-gray-400" />
                              {formatNumber(sub.view_count)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-red-400" />
                              {formatNumber(sub.like_count)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3 text-blue-400" />
                              {formatNumber(sub.comment_count)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="text-xs bg-gray-700 px-2 py-1 rounded">
                            {shortenAddress(sub.wallet_address, 6)}
                          </code>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(sub.status)}`}>
                            {sub.status}
                          </span>
                          {sub.tx_hash && (
                            <a
                              href={`https://sepolia.starkscan.co/tx/${sub.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-green-400 hover:underline text-xs"
                            >
                              TX
                            </a>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-400">
                          {formatDate(sub.created_at)}
                        </td>
                      </tr>
                    ))}
                    {submissions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          Aucune soumission
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div>
            <button
              onClick={() => {
                setEditingCampaign(null);
                setCampaignForm({
                  name: '',
                  min_views: 1000,
                  min_likes: 50,
                  min_comments: 0,
                  min_shares: 0,
                  reward_amount: '10',
                  max_winners: 50
                });
                setShowCampaignForm(true);
              }}
              className="bg-starknet-purple hover:bg-starknet-purple/80 px-4 py-2 rounded-lg mb-6 transition-colors"
            >
              + Nouvelle campagne
            </button>

            {/* Campaign Form Modal */}
            {showCampaignForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">
                    {editingCampaign ? 'Modifier la campagne' : 'Nouvelle campagne'}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nom</label>
                      <input
                        type="text"
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                        className="input-admin w-full"
                        placeholder="Campaign TikTok #1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Vues min.</label>
                        <input
                          type="number"
                          value={campaignForm.min_views}
                          onChange={(e) => setCampaignForm({ ...campaignForm, min_views: parseInt(e.target.value) })}
                          className="input-admin w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Likes min.</label>
                        <input
                          type="number"
                          value={campaignForm.min_likes}
                          onChange={(e) => setCampaignForm({ ...campaignForm, min_likes: parseInt(e.target.value) })}
                          className="input-admin w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Récompense (STRK)</label>
                        <input
                          type="text"
                          value={campaignForm.reward_amount}
                          onChange={(e) => setCampaignForm({ ...campaignForm, reward_amount: e.target.value })}
                          className="input-admin w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Max gagnants</label>
                        <input
                          type="number"
                          value={campaignForm.max_winners}
                          onChange={(e) => setCampaignForm({ ...campaignForm, max_winners: parseInt(e.target.value) })}
                          className="input-admin w-full"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowCampaignForm(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveCampaign}
                        disabled={loading || !campaignForm.name}
                        className="flex-1 bg-starknet-purple hover:bg-starknet-purple/80 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enregistrer'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Campaigns List */}
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={`bg-gray-800 rounded-xl p-6 ${campaign.is_active ? 'border-2 border-starknet-purple' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        {campaign.name}
                        {campaign.is_active === 1 && (
                          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </h3>
                    </div>
                    <button
                      onClick={() => openEditCampaign(campaign)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Vues min.</div>
                      <div className="font-bold">{formatNumber(campaign.min_views)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Likes min.</div>
                      <div className="font-bold">{formatNumber(campaign.min_likes)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Récompense</div>
                      <div className="font-bold">{campaign.reward_amount} STRK</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Max gagnants</div>
                      <div className="font-bold">{campaign.max_winners}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
