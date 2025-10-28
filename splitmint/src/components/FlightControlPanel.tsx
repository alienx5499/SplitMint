"use client";
import React, { useState, useEffect } from 'react';
import { mockFlightAPI } from '@/lib/mockFlightAPI';
import { contractService } from '@/lib/contractService';
import { testFlightControlFlow } from '@/lib/testFlightControl';
import { AutoPaySetup } from './AutoPaySetup';
import { demoAutoPaySetup, quickSetupAutoPay } from '@/lib/demoAutoPay';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FlightControlPanelProps {
  className?: string;
}

export const FlightControlPanel: React.FC<FlightControlPanelProps> = ({ className }) => {
  const [flights, setFlights] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string>('');
  const [delayMinutes, setDelayMinutes] = useState<number>(0);
  const [offlineConfig, setOfflineConfig] = useState({
    privateKey: '',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    address: ''
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [eligibleFlights, setEligibleFlights] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'payouts' | 'offline' | 'autopay'>('control');

  useEffect(() => {
    loadFlights();
    loadEligibleFlights();
    checkOfflineMode();
  }, []);

  const loadFlights = () => {
    const allFlights = mockFlightAPI.getAllFlights();
    setFlights(allFlights);
  };

  const loadEligibleFlights = () => {
    const eligible = mockFlightAPI.getFlightsEligibleForPayout();
    setEligibleFlights(eligible);
  };

  const checkOfflineMode = () => {
    const config = contractService.getOfflineSenderInfo();
    setIsOfflineMode(config.enabled);
    if (config.enabled) {
      setOfflineConfig(prev => ({
        ...prev,
        address: config.address,
        rpcUrl: config.rpcUrl
      }));
    }
  };

  const handleDelayFlight = async () => {
    if (!selectedFlight) {
      toast.error('Please select a flight');
      return;
    }

    setIsProcessing(true);
    try {
      const success = await mockFlightAPI.delayFlight(selectedFlight, delayMinutes);
      if (success) {
        toast.success(`Flight ${selectedFlight} delayed by ${delayMinutes} minutes`);
        loadFlights();
        loadEligibleFlights();
      } else {
        toast.error('Failed to delay flight');
      }
    } catch (error) {
      console.error('Error delaying flight:', error);
      toast.error('Failed to delay flight');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelFlight = () => {
    if (!selectedFlight) {
      toast.error('Please select a flight');
      return;
    }

    const success = mockFlightAPI.cancelFlight(selectedFlight);
    if (success) {
      toast.success(`Flight ${selectedFlight} cancelled`);
      loadFlights();
      loadEligibleFlights();
    } else {
      toast.error('Failed to cancel flight');
    }
  };

  const handleTriggerPayouts = async (flightNumber: string) => {
    setIsProcessing(true);
    try {
      const result = await mockFlightAPI.triggerPayoutsForFlight(flightNumber);
      if (result.success) {
        toast.success(result.message);
        loadFlights();
        loadEligibleFlights();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error triggering payouts:', error);
      toast.error('Failed to trigger payouts');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessAllPayouts = async () => {
    setIsProcessing(true);
    try {
      const result = await mockFlightAPI.processAutomaticPayouts();
      if (result.processed > 0) {
        toast.success(`Processed ${result.processed} payouts totaling $${result.totalAmount}`);
        loadFlights();
        loadEligibleFlights();
      } else {
        toast.info('No eligible payouts found');
      }
    } catch (error) {
      console.error('Error processing payouts:', error);
      toast.error('Failed to process payouts');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetOfflineSender = () => {
    if (!offlineConfig.privateKey) {
      toast.error('Please enter a private key');
      return;
    }

    try {
      contractService.setOfflineSender(offlineConfig.privateKey, offlineConfig.rpcUrl);
      checkOfflineMode();
      toast.success('Offline sender configured successfully');
    } catch (error) {
      console.error('Error setting offline sender:', error);
      toast.error('Failed to configure offline sender');
    }
  };

  const handleClearOfflineSender = () => {
    contractService.clearOfflineSender();
    setOfflineConfig(prev => ({ ...prev, privateKey: '', address: '' }));
    setIsOfflineMode(false);
    toast.success('Offline sender cleared');
  };

  const handleRunTest = async () => {
    setIsProcessing(true);
    try {
      await testFlightControlFlow();
      toast.success('Test completed! Check console for details.');
      loadFlights();
      loadEligibleFlights();
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Test failed. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemoAutoPay = () => {
    try {
      demoAutoPaySetup();
      toast.success('Auto-Pay demo setup completed! Check console for details.');
      loadFlights();
      loadEligibleFlights();
    } catch (error) {
      console.error('Auto-Pay demo failed:', error);
      toast.error('Auto-Pay demo failed. Check console for details.');
    }
  };

  const handleQuickSetup = () => {
    try {
      quickSetupAutoPay();
      toast.success('Quick Auto-Pay setup completed!');
    } catch (error) {
      console.error('Quick setup failed:', error);
      toast.error('Quick setup failed. Check console for details.');
    }
  };

  const formatFlightStatus = (flight: any) => {
    const status = flight.currentStatus;
    if (status.isCancelled) return 'Cancelled';
    if (status.isDelayed) return `Delayed ${status.delayMinutes} min`;
    return 'On Time';
  };

  const getStatusColor = (flight: any) => {
    const status = flight.currentStatus;
    if (status.isCancelled) return 'destructive';
    if (status.isDelayed && status.delayMinutes >= 120) return 'destructive';
    if (status.isDelayed) return 'secondary';
    return 'default';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Flight Control Panel</CardTitle>
              <CardDescription>
                Control flight delays and process insurance payouts
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleRunTest} 
                disabled={isProcessing}
                variant="outline"
                size="sm"
              >
                {isProcessing ? 'Running Test...' : 'Run Test'}
              </Button>
              <Button 
                onClick={handleDemoAutoPay} 
                disabled={isProcessing}
                variant="outline"
                size="sm"
              >
                Demo Auto-Pay
              </Button>
              <Button 
                onClick={handleQuickSetup} 
                disabled={isProcessing}
                variant="outline"
                size="sm"
              >
                Quick Setup
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('control')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'control'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Flight Control
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'payouts'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Payouts
              </button>
              <button
                onClick={() => setActiveTab('autopay')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'autopay'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Auto-Pay Setup
              </button>
              <button
                onClick={() => setActiveTab('offline')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'offline'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Offline Sender
              </button>
            </div>

            {activeTab === 'control' && (
              <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flight-select">Select Flight</Label>
                  <select
                    id="flight-select"
                    value={selectedFlight}
                    onChange={(e) => setSelectedFlight(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Choose a flight...</option>
                    {flights.map((flight) => (
                      <option key={flight.flightNumber} value={flight.flightNumber}>
                        {flight.flightNumber} - {flight.route.departure} → {flight.route.arrival}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay-minutes">Delay (minutes)</Label>
                  <Input
                    id="delay-minutes"
                    type="number"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(Number(e.target.value))}
                    placeholder="Enter delay in minutes"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleDelayFlight} 
                  disabled={!selectedFlight || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Delay Flight'}
                </Button>
                <Button 
                  onClick={handleCancelFlight} 
                  disabled={!selectedFlight}
                  variant="destructive"
                  className="flex-1"
                >
                  Cancel Flight
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <h4 className="font-medium">All Flights</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {flights.map((flight) => (
                      <div key={flight.flightNumber} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <div className="font-medium">{flight.flightNumber}</div>
                          <div className="text-sm text-gray-500">
                            {flight.route.departure} → {flight.route.arrival}
                          </div>
                          <div className="text-sm">
                            Passengers: {flight.currentStatus.passengers.length}
                          </div>
                        </div>
                        <Badge variant={getStatusColor(flight)}>
                          {formatFlightStatus(flight)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Eligible Payouts</h4>
                <Button 
                  onClick={handleProcessAllPayouts} 
                  disabled={isProcessing || eligibleFlights.length === 0}
                >
                  {isProcessing ? 'Processing...' : 'Process All Payouts'}
                </Button>
              </div>

              {eligibleFlights.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No flights currently eligible for payouts (need 2+ hour delay or cancellation)
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {eligibleFlights.map((flight) => (
                    <div key={flight.flightNumber} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{flight.flightNumber}</div>
                        <div className="text-sm text-gray-500">
                          {flight.isCancelled ? 'Cancelled' : `Delayed ${flight.delayMinutes} min`}
                        </div>
                        <div className="text-sm">
                          {flight.passengerCount} insured passengers
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleTriggerPayouts(flight.flightNumber)}
                        disabled={isProcessing}
                        size="sm"
                      >
                        Process Payouts
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}

            {activeTab === 'autopay' && (
              <AutoPaySetup />
            )}

            {activeTab === 'offline' && (
              <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Configure an offline sender (private key) for automated policy resolution.
                  This allows processing payouts without MetaMask interaction.
                </AlertDescription>
              </Alert>

              {isOfflineMode ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Offline sender is configured: {offlineConfig.address}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label>RPC URL</Label>
                    <Input
                      value={offlineConfig.rpcUrl}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <Button onClick={handleClearOfflineSender} variant="destructive">
                    Clear Offline Sender
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="private-key">Private Key</Label>
                    <Input
                      id="private-key"
                      type="password"
                      value={offlineConfig.privateKey}
                      onChange={(e) => setOfflineConfig(prev => ({ ...prev, privateKey: e.target.value }))}
                      placeholder="Enter private key (0x...)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rpc-url">RPC URL (optional)</Label>
                    <Input
                      id="rpc-url"
                      value={offlineConfig.rpcUrl}
                      onChange={(e) => setOfflineConfig(prev => ({ ...prev, rpcUrl: e.target.value }))}
                      placeholder="Enter RPC URL"
                    />
                  </div>

                  <Button onClick={handleSetOfflineSender}>
                    Set Offline Sender
                  </Button>
                </div>
              )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
