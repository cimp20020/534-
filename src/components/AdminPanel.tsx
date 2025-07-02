import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Settings, Users, Database, AlertCircle, CheckCircle, X } from 'lucide-react';
import { airdropService } from '../services/airdrop';
import { ethplorerService } from '../services/ethplorer';
import { databaseService } from '../services/database';

interface Token {
  id: string;
  address: string;
  name: string;
  symbol: string;
  airdrop_amount: number;
  is_active: boolean;
}

interface Claim {
  id: string;
  wallet_address: string;
  tokens_claimed: any[];
  total_amount: number;
  status: string;
  created_at: string;
}

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
      type === 'success' 
        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
        : 'bg-red-500/10 border-red-500/20 text-red-400'
    } backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <span className="text-sm">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'claims' | 'settings'>('tokens');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Token form state
  const [newToken, setNewToken] = useState({
    address: '',
    name: '',
    symbol: '',
    airdrop_amount: 0
  });

  // Settings state
  const [apiKey, setApiKey] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [maxClaims, setMaxClaims] = useState('');
  const [airdropEnabled, setAirdropEnabled] = useState(true);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tokensData, claimsData] = await Promise.all([
        airdropService.getWhitelistTokens(),
        databaseService.getClaims()
      ]);
      
      setTokens(tokensData);
      setClaims(claimsData);
      
      // Load settings
      const settings = await databaseService.getSettings();
      setApiKey(settings.ethplorer_api_key || '');
      setPlatformName(settings.platform_name || '');
      setMaxClaims(settings.max_claims_per_address || '');
      setAirdropEnabled(settings.airdrop_enabled === 'true');
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await airdropService.addToWhitelist(
        newToken.address,
        newToken.name,
        newToken.symbol,
        newToken.airdrop_amount
      );
      
      setNewToken({ address: '', name: '', symbol: '', airdrop_amount: 0 });
      await loadData();
      showNotification('success', 'Token successfully added to whitelist');
    } catch (error) {
      console.error('Error adding token:', error);
      showNotification('error', 'Failed to add token to whitelist');
    }
  };

  const handleRemoveToken = async (tokenId: string) => {
    try {
      await airdropService.removeFromWhitelist(tokenId);
      await loadData();
      showNotification('success', 'Token successfully removed from whitelist');
    } catch (error) {
      console.error('Error removing token:', error);
      showNotification('error', 'Failed to remove token from whitelist');
    }
  };

  const handleToggleToken = async (tokenId: string, isActive: boolean) => {
    try {
      await databaseService.updateToken(tokenId, { is_active: !isActive });
      await loadData();
      showNotification('success', `Token ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling token:', error);
      showNotification('error', 'Failed to update token status');
    }
  };

  const handleSaveApiKey = async () => {
    try {
      await ethplorerService.setApiKey(apiKey);
      showNotification('success', 'API key saved successfully');
    } catch (error) {
      console.error('Error saving API key:', error);
      showNotification('error', 'Failed to save API key');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await Promise.all([
        databaseService.setSetting('platform_name', platformName),
        databaseService.setSetting('max_claims_per_address', maxClaims),
        databaseService.setSetting('airdrop_enabled', airdropEnabled.toString())
      ]);
      showNotification('success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('error', 'Failed to save settings');
    }
  };

  const renderTokensTab = () => (
    <div className="space-y-6">
      {/* Add Token Form */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">Add New Token</h3>
        <form onSubmit={handleAddToken} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Token Address"
            value={newToken.address}
            onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
            className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Token Name"
            value={newToken.name}
            onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
            className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Symbol"
            value={newToken.symbol}
            onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
            className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            required
          />
          <input
            type="number"
            placeholder="Airdrop Amount"
            value={newToken.airdrop_amount}
            onChange={(e) => setNewToken({ ...newToken, airdrop_amount: parseInt(e.target.value) || 0 })}
            className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Token
          </button>
        </form>
      </div>

      {/* Tokens List */}
      <div className="bg-gray-700/30 rounded-xl border border-gray-600/30 overflow-hidden">
        <div className="p-6 border-b border-gray-600/30">
          <h3 className="text-lg font-semibold text-white">Whitelist Tokens</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">Token</th>
                <th className="text-left p-4 text-gray-300 font-medium">Address</th>
                <th className="text-left p-4 text-gray-300 font-medium">Airdrop Amount</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id} className="border-t border-gray-600/30">
                  <td className="p-4">
                    <div>
                      <div className="text-white font-medium">{token.name}</div>
                      <div className="text-gray-400 text-sm">{token.symbol}</div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300 font-mono text-sm">
                    {token.address.slice(0, 10)}...{token.address.slice(-8)}
                  </td>
                  <td className="p-4 text-gray-300">{token.airdrop_amount.toLocaleString()}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleToken(token.id, token.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        token.is_active
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {token.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleRemoveToken(token.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderClaimsTab = () => (
    <div className="bg-gray-700/30 rounded-xl border border-gray-600/30 overflow-hidden">
      <div className="p-6 border-b border-gray-600/30">
        <h3 className="text-lg font-semibold text-white">Airdrop Claims</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left p-4 text-gray-300 font-medium">Wallet Address</th>
              <th className="text-left p-4 text-gray-300 font-medium">Tokens Claimed</th>
              <th className="text-left p-4 text-gray-300 font-medium">Total Amount</th>
              <th className="text-left p-4 text-gray-300 font-medium">Status</th>
              <th className="text-left p-4 text-gray-300 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-t border-gray-600/30">
                <td className="p-4 text-gray-300 font-mono text-sm">
                  {claim.wallet_address.slice(0, 10)}...{claim.wallet_address.slice(-8)}
                </td>
                <td className="p-4 text-gray-300">{claim.tokens_claimed.length}</td>
                <td className="p-4 text-gray-300">{claim.total_amount.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    claim.status === 'completed'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : claim.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {claim.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-sm">
                  {new Date(claim.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* API Settings */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">API Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Ethplorer API Key
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                placeholder="Enter your Ethplorer API key"
              />
              <button
                onClick={handleSaveApiKey}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Enter platform name"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Max Claims Per Address
            </label>
            <input
              type="number"
              value={maxClaims}
              onChange={(e) => setMaxClaims(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Enter max claims per address"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="airdropEnabled"
              checked={airdropEnabled}
              onChange={(e) => setAirdropEnabled(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="airdropEnabled" className="text-gray-300 text-sm font-medium">
              Enable Airdrop Claims
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 mt-1">Manage your airdrop platform</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'tokens'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Database className="w-4 h-4" />
              Tokens
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'claims'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Claims
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'tokens' && renderTokensTab()}
            {activeTab === 'claims' && renderClaimsTab()}
            {activeTab === 'settings' && renderSettingsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;