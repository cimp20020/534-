import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, Loader, Shield, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { installationService } from '../services/installation';

const InstallPage: React.FC = () => {
  const [installationStep, setInstallationStep] = useState<'checking' | 'migration-needed' | 'installing' | 'completed'>('checking');
  const [isInstalled, setIsInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  useEffect(() => {
    checkInstallationStatus();
  }, []);

  const checkInstallationStatus = async () => {
    try {
      setError(null);
      const status = await installationService.checkInstallationStatus();
      setIsInstalled(status.isInstalled);
      
      if (status.isInstalled) {
        setInstallationStep('completed');
      } else {
        setInstallationStep('installing');
        await performInstallation();
      }
    } catch (err) {
      console.error('Installation check error:', err);
      setInstallationStep('migration-needed');
    }
  };

  const performInstallation = async () => {
    try {
      setError(null);
      const success = await installationService.performInstallation();
      
      if (success) {
        await installationService.completeInstallation();
        setInstallationStep('completed');
      } else {
        setInstallationStep('migration-needed');
      }
    } catch (err) {
      setInstallationStep('migration-needed');
      console.error('Installation error:', err);
    }
  };

  const renderStepContent = () => {
    switch (installationStep) {
      case 'checking':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Checking Installation</h2>
            <p className="text-gray-400">Please wait while we check the system status...</p>
          </div>
        );

      case 'migration-needed':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/25">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Database Setup Required</h2>
            <p className="text-gray-400 mb-6">
              You need to run migrations in Supabase to create the database tables.
            </p>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-blue-400 mb-3">Setup Instructions:</h3>
              <ol className="text-sm text-blue-300 space-y-2 list-decimal list-inside">
                <li>Open your Supabase Dashboard</li>
                <li>Go to "SQL Editor"</li>
                <li>Create a new query and paste the following SQL code:</li>
              </ol>
            </div>

            <div className="bg-gray-900/50 border border-gray-600 rounded-xl p-4 mb-6">
              <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
{`-- Create whitelist_tokens table
CREATE TABLE IF NOT EXISTS whitelist_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text UNIQUE NOT NULL,
  name text NOT NULL,
  symbol text NOT NULL,
  airdrop_amount integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create airdrop_claims table
CREATE TABLE IF NOT EXISTS airdrop_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  tokens_claimed jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount integer NOT NULL DEFAULT 0,
  transaction_hash text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create installation_status table
CREATE TABLE IF NOT EXISTS installation_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_installed boolean DEFAULT false,
  installed_at timestamptz DEFAULT now(),
  version text DEFAULT '1.0.0'
);

-- Enable Row Level Security
ALTER TABLE whitelist_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read active whitelist tokens" ON whitelist_tokens FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage whitelist tokens" ON whitelist_tokens FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can read claims" ON airdrop_claims FOR SELECT USING (true);
CREATE POLICY "Public can create claims" ON airdrop_claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update claims" ON airdrop_claims FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Public can read settings" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage settings" ON admin_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can read installation status" ON installation_status FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update installation status" ON installation_status FOR ALL TO authenticated USING (true);

-- Insert default data
INSERT INTO whitelist_tokens (address, name, symbol, airdrop_amount, is_active) VALUES
  ('0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', 'Shiba Inu', 'SHIB', 1000000, true),
  ('0x514910771af9ca656af840dff83e8264ecf986ca', 'Chainlink', 'LINK', 50, true),
  ('0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', 'Uniswap', 'UNI', 100, true),
  ('0x6b175474e89094c44da98b954eedeac495271d0f', 'Dai Stablecoin', 'DAI', 500, true),
  ('0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', 'Polygon', 'MATIC', 200, true),
  ('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', 'Wrapped Bitcoin', 'WBTC', 1, true);

INSERT INTO admin_settings (key, value) VALUES
  ('ethplorer_api_key', 'freekey'),
  ('platform_name', 'AirdropHub'),
  ('max_claims_per_address', '1'),
  ('airdrop_enabled', 'true');

INSERT INTO installation_status (is_installed, version) VALUES (true, '1.0.0');`}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={checkInstallationStatus}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
              >
                <Database className="w-5 h-5" />
                Check Again
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-700/50 text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-600/50 transition-colors border border-gray-600 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Open Supabase
              </a>
            </div>
          </div>
        );

      case 'installing':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Checking Database</h2>
            <p className="text-gray-400 mb-6">Checking for tables and data...</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300">Checking database tables</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300">Checking security policies</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-300">Checking default data</span>
              </div>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">🎉 Installation Complete!</h2>
            <p className="text-gray-400 mb-8">
              AirdropHub has been successfully installed and configured. You can now start using the platform.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <h3 className="font-semibold text-white mb-2">✅ Database Setup</h3>
                <p className="text-sm text-gray-400">All tables and security policies created</p>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <h3 className="font-semibold text-white mb-2">✅ Admin Account</h3>
                <p className="text-sm text-gray-400">Default admin credentials: admin/admin</p>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <h3 className="font-semibold text-white mb-2">✅ Default Tokens</h3>
                <p className="text-sm text-gray-400">Whitelist populated with popular tokens</p>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <h3 className="font-semibold text-white mb-2">✅ API Configuration</h3>
                <p className="text-sm text-gray-400">Ethplorer API ready to use</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
              >
                <Sparkles className="w-5 h-5" />
                Go to Homepage
              </a>
              <a
                href="/admin"
                className="flex-1 bg-gray-700/50 text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-600/50 transition-colors border border-gray-600 flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Admin Panel
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 text-sm font-medium mb-1">Default Admin Credentials</p>
                  <p className="text-blue-300 text-xs">
                    Username: <code className="bg-blue-500/20 px-1 rounded">admin</code><br />
                    Password: <code className="bg-blue-500/20 px-1 rounded">admin</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>
      
      <div className="relative w-full max-w-4xl">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default InstallPage;