import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Shield, TrendingUp, Star, Coins, Award, Users, CheckCircle, ArrowRight, Globe, Lock } from 'lucide-react';
import WalletConnection from '../components/WalletConnection';
import TokenList from '../components/TokenList';
import AirdropStatus from '../components/AirdropStatus';
import { ethplorerService } from '../services/ethplorer';
import { airdropService } from '../services/airdrop';
import { Token, AirdropStatus as AirdropStatusType } from '../types';

const HomePage: React.FC = () => {
  const [currentAddress, setCurrentAddress] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ethBalance, setEthBalance] = useState(0);
  const [ethPrice, setEthPrice] = useState<number | undefined>();
  const [airdropStatus, setAirdropStatus] = useState<AirdropStatusType>({
    isEligible: false,
    eligibleTokens: [],
    totalAirdropAmount: 0,
    claimed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async (address: string) => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ethplorerService.getAddressInfo(address);
      
      setEthBalance(data.ETH.balance);
      setEthPrice(data.ETH.price?.rate);
      
      if (data.tokens && data.tokens.length > 0) {
        setTokens(data.tokens);
        const status = await airdropService.checkEligibility(data.tokens);
        status.claimed = await airdropService.hasClaimedAirdrop(address);
        setAirdropStatus(status);
      } else {
        setTokens([]);
        setAirdropStatus({
          isEligible: false,
          eligibleTokens: [],
          totalAirdropAmount: 0,
          claimed: false,
        });
      }
    } catch (err) {
      setError('Failed to fetch token data. Please check the address and try again.');
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAddress) {
      fetchTokens(currentAddress);
    } else {
      // Clear data when wallet is disconnected
      setTokens([]);
      setEthBalance(0);
      setEthPrice(undefined);
      setAirdropStatus({
        isEligible: false,
        eligibleTokens: [],
        totalAirdropAmount: 0,
        claimed: false,
      });
      setError(null);
    }
  }, [currentAddress]);

  const handleAddressChange = (address: string) => {
    setCurrentAddress(address);
  };

  const handleAirdropClaim = () => {
    setAirdropStatus(prev => ({ ...prev, claimed: true }));
  };

  const backgroundPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div 
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: `url("${backgroundPattern}")` }}
      ></div>
      
      {/* Navigation */}
      <nav className="relative bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles className="text-white font-bold text-sm w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AirdropHub</h1>
                <p className="text-xs text-gray-400">Secure Airdrop Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-6 text-sm">
                <span className="text-gray-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  Secure
                </span>
                <span className="text-gray-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Decentralized
                </span>
                <span className="text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  Non-Custodial
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Trusted by 10,000+ Users</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Discover Your
              </span>
              <br />
              <span className="text-white">Airdrop Rewards</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Connect your wallet to instantly discover eligible airdrops based on your token holdings. 
              Our advanced analysis engine scans your portfolio and matches it with active airdrop campaigns.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No registration required</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Instant eligibility check</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>100% secure & free</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">10,000+</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">50+</div>
              <div className="text-gray-400 text-sm">Supported Tokens</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">$2M+</div>
              <div className="text-gray-400 text-sm">Rewards Distributed</div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">99.9%</div>
              <div className="text-gray-400 text-sm">Uptime</div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Lightning Fast Analysis</h3>
              <p className="text-gray-400 leading-relaxed">
                Our advanced algorithms analyze your wallet in seconds using real-time blockchain data 
                from Ethplorer API to instantly determine your airdrop eligibility.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Bank-Grade Security</h3>
              <p className="text-gray-400 leading-relaxed">
                We only read your wallet data - no permissions needed for transfers or signatures. 
                Your funds remain completely secure and under your control at all times.
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 group">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Growing Opportunities</h3>
              <p className="text-gray-400 leading-relaxed">
                Our team continuously updates the whitelist with new airdrop campaigns, 
                ensuring you never miss out on potential rewards from emerging projects.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <WalletConnection
              onAddressChange={handleAddressChange}
              currentAddress={currentAddress}
            />
            
            {currentAddress && (
              <AirdropStatus
                status={airdropStatus}
                address={currentAddress}
                onClaim={handleAirdropClaim}
              />
            )}
          </div>

          {/* Right Column */}
          <div>
            {currentAddress ? (
              <TokenList
                tokens={tokens}
                ethBalance={ethBalance}
                ethPrice={ethPrice}
                eligibleTokens={airdropStatus.eligibleTokens}
                loading={loading}
              />
            ) : (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Coins className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Connect Your Wallet</h3>
                <p className="text-gray-400 mb-6">
                  Connect your wallet to view your token portfolio and discover eligible airdrops.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <ArrowRight className="w-4 h-4" />
                  <span>Your token analysis will appear here</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative bg-white/5 backdrop-blur-xl border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <span className="text-white font-semibold">AirdropHub</span>
            </div>
            <p className="text-gray-400 text-sm">
              Secure, fast, and reliable airdrop discovery platform. Built with ❤️ for the crypto community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;