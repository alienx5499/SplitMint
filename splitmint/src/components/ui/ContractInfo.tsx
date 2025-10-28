"use client";
import React from 'react';
import { useContracts } from '@/hooks/useContracts';
import { ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const ContractInfo: React.FC = () => {
  // Only show in development mode for security
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  const { contracts, isOnCorrectNetwork, isReady, address } = useContracts();

  const contractLinks = [
    {
      name: "FlightInsurance",
      address: contracts.FLIGHT_INSURANCE,
      description: "Main insurance contract"
    },
    {
      name: "PolicyRegistry", 
      address: contracts.POLICY_REGISTRY,
      description: "Policy management"
    },
    {
      name: "PremiumVault",
      address: contracts.PREMIUM_VAULT,
      description: "Premium collection"
    },
    {
      name: "PayoutVault",
      address: contracts.PAYOUT_VAULT,
      description: "Payout distribution"
    },
    {
      name: "FlightOracleAdapter",
      address: contracts.FLIGHT_ORACLE_ADAPTER,
      description: "Flight data oracle"
    }
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl font-semibold text-white">Contract Status</h3>
        {isReady ? (
          <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
          <XCircle className="w-6 h-6 text-red-500" />
        )}
      </div>

      {/* Network Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-300">Network:</span>
          {isOnCorrectNetwork ? (
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Arbitrum Sepolia</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>Wrong Network</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-300">Wallet:</span>
          {address ? (
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="font-mono text-xs">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400">
              <XCircle className="w-4 h-4" />
              <span>Not Connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Contract Addresses */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Deployed Contracts</h4>
        {contractLinks.map((contract) => (
          <div key={contract.name} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-white">{contract.name}</h5>
              <a
                href={`${contracts.BLOCK_EXPLORER}/address/${contract.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sm text-gray-400 mb-2">{contract.description}</p>
            <p className="font-mono text-xs text-gray-300 break-all">
              {contract.address}
            </p>
          </div>
        ))}
      </div>

      {/* Status Message */}
      <div className="mt-6 p-4 rounded-lg bg-gray-800">
        {isReady ? (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Ready to use SplitMint!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">
              {!address ? "Connect your wallet" : "Switch to Arbitrum Sepolia"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
