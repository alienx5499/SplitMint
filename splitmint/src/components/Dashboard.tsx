"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plane, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  FileText,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import { useWallet } from '@/contexts/WalletContext';
import { useInsurance } from '@/hooks/useInsurance';
import { contractService } from '@/lib/contractService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import AdminDashboard from './AdminDashboard';
import { FlightControlPanel } from './FlightControlPanel';
import { mockFlightAPI, formatFlightStatus, getFlightStatusColor } from '@/lib/mockFlightAPI';

// Helper function to convert timestamp to date string
const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

// Helper function to convert timestamp to time string
const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper function to get status string from number
const getStatusString = (status: number) => {
  switch (status) {
    case 0: return 'active';
    case 1: return 'claimed';
    case 2: return 'cancelled';
    case 3: return 'expired';
    default: return 'unknown';
  }
};

const Dashboard = () => {
  const { isReady, address, contracts } = useContracts();
  const { walletType } = useWallet();
  const { purchasePolicy, isLoading, policies, usdcBalance, contractInfo, formatUSDC, fetchUserData, processClaim } = useInsurance();
  const [activeTab, setActiveTab] = useState<'overview' | 'purchase' | 'policies' | 'claims' | 'admin'>('overview');
  
  // Purchase form state
  const [purchaseForm, setPurchaseForm] = useState({
    pnr: '',
    lastName: '',
    coverage: '500'
  });

  // Expanded policies state
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());

  // Toggle policy expansion
  const togglePolicyExpansion = (policyId: string) => {
    const newExpanded = new Set(expandedPolicies);
    if (newExpanded.has(policyId)) {
      newExpanded.delete(policyId);
    } else {
      newExpanded.add(policyId);
    }
    setExpandedPolicies(newExpanded);
  };

  const handlePurchase = async () => {
    // Validate form
    if (!purchaseForm.pnr || !purchaseForm.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate PNR format (6 alphanumeric characters)
    if (purchaseForm.pnr.length !== 6 || !/^[A-Z0-9]{6}$/i.test(purchaseForm.pnr)) {
      toast.error('PNR must be 6 alphanumeric characters');
      return;
    }

    const success = await purchasePolicy(purchaseForm);
    
    if (success) {
      // Reset form
      setPurchaseForm({
        pnr: '',
        lastName: '',
        coverage: '500'
      });
      setActiveTab('policies');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'claimed':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'claimed':
        return 'text-blue-600 bg-blue-50';
      case 'expired':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Connection Required</h2>
            <p className="text-gray-600 mb-6">
              Please connect your {walletType === 'zerodev' ? 'ZeroDev' : 'MetaMask'} wallet and ensure you're on Arbitrum Sepolia to access the dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Dashboard</h1>
          <p className="text-gray-600">
            Manage your flight insurance policies and claims
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'purchase', label: 'Buy Insurance', icon: Shield },
                { id: 'policies', label: 'My Policies', icon: FileText },
                { id: 'claims', label: 'Claims', icon: DollarSign },
                { id: 'admin', label: 'Flight Control', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Policies</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {policies.filter(p => p.status === 0).length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Claims</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {policies.filter(p => p.payoutTriggered).length}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${policies
                        .filter(p => p.payoutTriggered)
                        .reduce((sum, p) => sum + parseFloat(formatUSDC(p.payoutAmount)), 0)
                        .toFixed(0)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">USDC Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${formatUSDC(usdcBalance)}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

            </div>
          )}

          {/* Payout Status Notification */}
          {activeTab === 'overview' && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎉 Automatic Payouts Active</h3>
                  <p className="text-gray-700 mb-3">
                    Your insurance policies are fully automated! When your flight is delayed 2+ hours or cancelled, 
                    payouts are processed automatically and deposited directly to your wallet.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">No manual claims required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Instant USDC deposits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Real-time notifications</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchase' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Flight Insurance</h2>
              <p className="text-gray-600 mb-6">
                Simply enter your flight PNR and last name. We'll automatically fetch your flight details and provide instant coverage.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pnr">Flight PNR *</Label>
                    <Input
                      id="pnr"
                      placeholder="e.g., ABC123"
                      value={purchaseForm.pnr}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, pnr: e.target.value.toUpperCase() }))}
                      className="mt-1 font-mono"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      6-character booking reference from your airline ticket
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Passenger Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="e.g., Smith"
                      value={purchaseForm.lastName}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Last name as shown on your booking
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="coverage">Coverage Amount (USDC)</Label>
                    <select
                      id="coverage"
                      value={purchaseForm.coverage}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, coverage: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="250">$250 USDC</option>
                      <option value="500">$500 USDC</option>
                      <option value="1000">$1,000 USDC</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Policy Details</h3>
                    {purchaseForm.pnr && purchaseForm.lastName && (
                      <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                        ✈️ Flight details will be automatically fetched using PNR: <span className="font-mono font-medium">{purchaseForm.pnr}</span>
                      </div>
                    )}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Coverage Amount:</span>
                        <span className="font-medium">${purchaseForm.coverage} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Premium (10%):</span>
                        <span className="font-medium">${(parseInt(purchaseForm.coverage) * 0.1).toFixed(0)} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee (5%):</span>
                        <span className="font-medium">${(parseInt(purchaseForm.coverage) * 0.05).toFixed(0)} USDC</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium text-gray-900">
                        <span>Total Cost:</span>
                        <span>${(parseInt(purchaseForm.coverage) * 0.15).toFixed(0)} USDC</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePurchase}
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Purchase Insurance'}
                  </Button>
                  
                  <div className="text-xs text-gray-500">
                    * Required fields. We'll fetch your flight details using the PNR and verify with your last name. Premium is automatically calculated as 10% of coverage amount.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Insurance Policies</h2>
                <Button
                  onClick={fetchUserData}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-4">
                {policies.map((policy) => {
                  const isExpanded = expandedPolicies.has(policy.id);
                  const flightStatus = mockFlightAPI.getFlightStatus(policy.flightNumber);
                  
                  return (
                  <motion.div
                    key={policy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      {/* Main Policy Card - Always Visible */}
                      <div 
                        className="p-6 cursor-pointer"
                        onClick={() => togglePolicyExpansion(policy.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Plane className="w-6 h-6 text-blue-500" />
                        <div>
                          <h3 className="font-bold text-lg">{policy.flightNumber}</h3>
                          <p className="text-gray-600">Policy #{policy.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(getStatusString(policy.status))}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getStatusString(policy.status))}`}>
                          {getStatusString(policy.status).charAt(0).toUpperCase() + getStatusString(policy.status).slice(1)}
                        </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400 ml-2" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
                            )}
                      </div>
                    </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{policy.departureAirport} → {policy.arrivalAirport}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{formatDate(policy.departureTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{formatTime(policy.departureTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">${formatUSDC(policy.payoutAmount)} coverage</span>
                      </div>
                    </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-gray-200 bg-gray-50 p-6"
                        >
                          <h4 className="font-semibold text-gray-900 mb-4">📋 Policy Details</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Flight Information */}
                            <div className="space-y-3">
                              <h5 className="font-medium text-gray-800 flex items-center gap-2">
                                <Plane className="w-4 h-4" />
                                Flight Information
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Flight Number:</span>
                                  <span className="ml-2 font-medium">{policy.flightNumber}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Route:</span>
                                  <span className="ml-2 font-medium">{policy.departureAirport} → {policy.arrivalAirport}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Departure:</span>
                                  <span className="ml-2 font-medium">
                                    {formatDate(policy.departureTime)} at {formatTime(policy.departureTime)}
                                  </span>
                                </div>
                                {flightStatus && (
                                  <div>
                                    <span className="text-gray-600">Current Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getFlightStatusColor(flightStatus)}`}>
                                      {formatFlightStatus(flightStatus)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Policy Coverage */}
                            <div className="space-y-3">
                              <h5 className="font-medium text-gray-800 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Coverage Details
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Premium Paid:</span>
                                  <span className="ml-2 font-medium text-green-600">${formatUSDC(policy.premiumAmount)} USDC</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Coverage Amount:</span>
                                  <span className="ml-2 font-medium text-blue-600">${formatUSDC(policy.payoutAmount)} USDC</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Delay Threshold:</span>
                                  <span className="ml-2 font-medium">120 minutes</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Cancellation:</span>
                                  <span className="ml-2 font-medium text-green-600">✅ Covered</span>
                                </div>
                              </div>
                            </div>

                            {/* Policy Status */}
                            <div className="space-y-3">
                              <h5 className="font-medium text-gray-800 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Policy Status
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Purchased:</span>
                                  <span className="ml-2 font-medium">{formatDate(policy.createdAt)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Policyholder:</span>
                                  <span className="ml-2 font-mono text-xs">{policy.policyholder.slice(0, 6)}...{policy.policyholder.slice(-4)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Status:</span>
                                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getStatusString(policy.status))}`}>
                                    {getStatusString(policy.status)}
                                  </span>
                                </div>
                                {flightStatus && mockFlightAPI.checkPayoutEligibility(policy.flightNumber, 120) && (
                                  <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded">
                                    <span className="text-orange-800 text-xs font-medium">⚡ Eligible for Claim</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Payout Notification */}
                    {policy.payoutTriggered && (
                        <div className="border-t border-gray-200 bg-blue-50 p-4">
                        <div className="flex items-center gap-2 text-blue-800">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">Claim Processed</span>
                        </div>
                        <p className="text-blue-700 text-sm mt-1">
                          Payout of ${formatUSDC(policy.payoutAmount)} USDC processed automatically.
                          {policy.resolvedAt && ` Resolved on ${formatDate(policy.resolvedAt)}.`}
                        </p>
                      </div>
                    )}
                  </motion.div>
                  );
                })}
                
                {policies.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Yet</h3>
                    <p className="text-gray-500 mb-4">You haven't purchased any insurance policies yet.</p>
                    <Button onClick={() => setActiveTab('purchase')} className="bg-blue-600 hover:bg-blue-700">
                      Buy Your First Policy
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'claims' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Claims History</h2>
                <Button
                  onClick={fetchUserData}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Eligible Claims Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Eligible for Claims</h3>
                  <div className="space-y-4">
                    {policies.filter(policy => {
                      const flightStatus = mockFlightAPI.getFlightStatus(policy.flightNumber);
                      return flightStatus && mockFlightAPI.checkPayoutEligibility(policy.flightNumber, 120) && policy.status === 0;
                    }).map((policy) => {
                      const flightStatus = mockFlightAPI.getFlightStatus(policy.flightNumber);
                      return (
                        <motion.div
                          key={`eligible-${policy.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-orange-200 bg-orange-50 rounded-lg p-6"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="w-6 h-6 text-orange-600" />
                              <div>
                                <h3 className="font-bold text-lg text-orange-900">{policy.flightNumber}</h3>
                                <p className="text-orange-700">Policy #{policy.id} - Eligible for Payout</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-orange-900">${formatUSDC(policy.payoutAmount)}</p>
                                <p className="text-sm text-orange-700">Potential payout</p>
                              </div>
                              <Button
                                onClick={() => processClaim(policy.id, policy.flightNumber)}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                                disabled={isLoading}
                              >
                                Process Claim
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-medium text-orange-800">Flight Status</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFlightStatusColor(flightStatus!)}`}>
                                  {formatFlightStatus(flightStatus!)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-orange-800">Delay/Issue</p>
                              <p className="text-sm text-orange-700">
                                {flightStatus?.isCancelled ? 'Flight Cancelled' : `${flightStatus?.delayMinutes} minutes delayed`}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-orange-800">Premium Paid</p>
                              <p className="text-sm text-orange-700">${formatUSDC(policy.premiumAmount)} USDC</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-orange-800">Coverage</p>
                              <p className="text-sm text-orange-700">${formatUSDC(policy.payoutAmount)} USDC</p>
                            </div>
                          </div>

                          <div className="bg-orange-100 border border-orange-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-orange-800">
                              <CheckCircle className="w-4 h-4" />
                              <span className="font-medium">✅ Claim Approved</span>
                            </div>
                            <p className="text-orange-700 text-sm mt-1">
                              This flight {flightStatus?.isCancelled ? 'was cancelled' : `was delayed by ${flightStatus?.delayMinutes} minutes`}, 
                              which qualifies for automatic payout under your policy terms.
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Processed Claims Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Processed Claims</h3>
              <div className="space-y-4">
                {policies.filter(p => p.payoutTriggered).map((policy) => (
                  <motion.div
                        key={`processed-${policy.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-green-200 bg-green-50 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-bold text-lg text-green-900">{policy.flightNumber}</h3>
                              <p className="text-green-700">Claim ID: #{policy.id} - Processed</p>
                        </div>
                      </div>
                          
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-900">${formatUSDC(policy.payoutAmount)}</p>
                        <p className="text-sm text-green-700">USDC paid out</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-green-800">Flight Details</p>
                        <p className="text-sm text-green-700">{policy.departureAirport} → {policy.arrivalAirport}</p>
                        <p className="text-sm text-green-700">{formatDate(policy.departureTime)} at {formatTime(policy.departureTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Policy Information</p>
                        <p className="text-sm text-green-700">Premium: ${formatUSDC(policy.premiumAmount)} USDC</p>
                        <p className="text-sm text-green-700">Coverage: ${formatUSDC(policy.payoutAmount)} USDC</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Payout Details</p>
                        <p className="text-sm text-green-700">Amount: ${formatUSDC(policy.payoutAmount)} USDC</p>
                        <p className="text-sm text-green-700">Processed: {policy.resolvedAt ? formatDate(policy.resolvedAt) : 'Automatically'}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                  </div>
                </div>
                
                {/* Empty State */}
                {policies.length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Yet</h3>
                    <p className="text-gray-600 mb-4">Your claims will appear here when flights are delayed or cancelled.</p>
                    <Button onClick={() => setActiveTab('purchase')} className="bg-blue-600 hover:bg-blue-700">
                      Purchase a Policy
                    </Button>
                  </div>
                )}

                {/* No Eligible Claims Message */}
                {policies.length > 0 && 
                 policies.filter(policy => {
                   const flightStatus = mockFlightAPI.getFlightStatus(policy.flightNumber);
                   return flightStatus && mockFlightAPI.checkPayoutEligibility(policy.flightNumber, 120) && policy.status === 0;
                 }).length === 0 && 
                 policies.filter(p => p.payoutTriggered).length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims Available</h3>
                    <p className="text-gray-600 mb-4">
                      Your flights are currently on-time. Claims will appear here if flights are delayed 2+ hours or cancelled.
                    </p>
                    <Button onClick={() => setActiveTab('admin')} variant="outline">
                      Simulate Delays (Demo)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-6">
              <AdminDashboard />
              <FlightControlPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
