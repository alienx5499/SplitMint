"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plane, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Settings,
  Shield,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockFlightAPI, FlightStatus, MockFlight, formatFlightStatus, getFlightStatusColor } from '@/lib/mockFlightAPI';
import { contractService } from '@/lib/contractService';
import { useInsurance } from '@/hooks/useInsurance';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [flights, setFlights] = useState<MockFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<string>('');
  const [customDelay, setCustomDelay] = useState<string>('');
  const [isContractPaused, setIsContractPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pnrInput, setPnrInput] = useState<string>('');
  const [lastNameInput, setLastNameInput] = useState<string>('');
  const { policies, fetchUserData, contractInfo } = useInsurance();

  // Refresh flights list
  const refreshFlights = () => {
    setFlights(mockFlightAPI.getAllFlights());
  };

  // Sync contract paused state
  useEffect(() => {
    if (contractInfo) {
      setIsContractPaused(contractInfo.isPaused);
    }
  }, [contractInfo]);

  useEffect(() => {
    refreshFlights();
    // Refresh every 10 seconds
    const interval = setInterval(refreshFlights, 10000);
    return () => clearInterval(interval);
  }, []);

  // Delay flight by specific minutes
  const handleDelayFlight = (flightNumber: string, minutes: number) => {
    const success = mockFlightAPI.delayFlight(flightNumber, minutes);
    if (success) {
      refreshFlights();
      
      // Check if this affects any policies and potentially trigger payouts
      setTimeout(() => {
        checkAndResolvePolicies(flightNumber);
        
        // Process automatic payouts after delay
        const payoutResult = mockFlightAPI.processAutomaticPayouts();
        if (payoutResult.processed > 0) {
          toast.success(`🎉 Automatic Payouts Processed!`, {
            description: `${payoutResult.processed} passengers received payouts totaling $${payoutResult.totalAmount} USDC`,
            duration: 8000
          });
          
          // Update policy statuses for paid passengers
          payoutResult.payoutDetails.forEach(payout => {
            contractService.updatePolicyStatus('policy-id', 2, payout.amount.toString(), Date.now()); // Status 2 = Paid
          });
          
          refreshFlights(); // Refresh to show updated flight list
        }
      }, 1000);
    }
  };

  // Cancel flight
  const handleCancelFlight = (flightNumber: string) => {
    const success = mockFlightAPI.cancelFlight(flightNumber);
    if (success) {
      refreshFlights();
      
      // Check if this affects any policies and trigger payouts
      setTimeout(() => {
        checkAndResolvePolicies(flightNumber);
        
        // Process automatic payouts after cancellation
        const payoutResult = mockFlightAPI.processAutomaticPayouts();
        if (payoutResult.processed > 0) {
          toast.success(`🎉 Automatic Payouts Processed!`, {
            description: `${payoutResult.processed} passengers received payouts totaling $${payoutResult.totalAmount} USDC`,
            duration: 8000
          });
          refreshFlights(); // Refresh to show updated flight list
        }
      }, 1000);
    }
  };

  // Custom delay
  const handleCustomDelay = () => {
    if (!selectedFlight || !customDelay) {
      toast.error('Please select a flight and enter delay minutes');
      return;
    }

    const minutes = parseInt(customDelay);
    if (isNaN(minutes) || minutes < 0) {
      toast.error('Please enter a valid number of minutes');
      return;
    }

    handleDelayFlight(selectedFlight, minutes);
    setCustomDelay('');
  };

  // Generate random status for all flights
  const handleRandomizeAll = () => {
    flights.forEach(flight => {
      setTimeout(() => {
        mockFlightAPI.generateRandomStatus(flight.flightNumber);
      }, Math.random() * 2000); // Stagger the updates
    });
    
    setTimeout(() => {
      refreshFlights();
      // Check all policies after randomization
      flights.forEach(flight => {
        setTimeout(() => {
          checkAndResolvePolicies(flight.flightNumber);
        }, 3000 + Math.random() * 2000);
      });
    }, 3000);
  };

  // Check if any policies need to be resolved
  const checkAndResolvePolicies = async (flightNumber: string) => {
    console.log(`Checking policies for flight ${flightNumber}`);
    
    // Find policies that match this flight
    const matchingPolicies = policies.filter(policy => 
      policy.flightNumber === flightNumber && policy.status === 0 // Active status
    );

    if (matchingPolicies.length === 0) {
      console.log(`No active policies found for flight ${flightNumber}`);
      return;
    }

    const flightStatus = mockFlightAPI.getFlightStatus(flightNumber);
    if (!flightStatus) {
      console.log(`No flight status found for ${flightNumber}`);
      return;
    }

    // Check if flight qualifies for payout (2+ hour delay or cancellation)
    const qualifiesForPayout = mockFlightAPI.checkPayoutEligibility(flightNumber, 120);
    
    if (qualifiesForPayout) {
      toast.success(
        `🎉 Payout Triggered! Flight ${flightNumber} ${flightStatus.isCancelled ? 'cancelled' : `delayed ${flightStatus.delayMinutes} minutes`}`,
        {
          description: `${matchingPolicies.length} policy(ies) qualify for automatic payout`,
          duration: 8000
        }
      );

      // In a real app, you would call the smart contract here
      console.log(`Would resolve ${matchingPolicies.length} policies for flight ${flightNumber}`);
      
      // Refresh policies to show updated status
      setTimeout(() => {
        fetchUserData();
      }, 2000);
    } else {
      console.log(`Flight ${flightNumber} does not qualify for payout yet (${flightStatus.delayMinutes} min delay, need 120+ min)`);
    }
  };

  // Reset flight to on-time
  const handleResetFlight = (flightNumber: string) => {
    handleDelayFlight(flightNumber, 0);
  };

  // Pause contract
  const handlePauseContract = async () => {
    setIsLoading(true);
    try {
      toast.loading('Pausing contract...', { id: 'pause' });
      await contractService.pauseContract();
      toast.success('✅ Contract paused successfully', { id: 'pause' });
      // Refresh contract info
      setTimeout(() => {
        fetchUserData();
      }, 2000);
    } catch (error: any) {
      console.error('Failed to pause contract:', error);
      toast.error(`Failed to pause contract: ${error.message}`, { id: 'pause' });
    } finally {
      setIsLoading(false);
    }
  };

  // Unpause contract
  const handleUnpauseContract = async () => {
    setIsLoading(true);
    try {
      toast.loading('Unpausing contract...', { id: 'unpause' });
      await contractService.unpauseContract();
      toast.success('✅ Contract unpaused successfully', { id: 'unpause' });
      // Refresh contract info
      setTimeout(() => {
        fetchUserData();
      }, 2000);
    } catch (error: any) {
      console.error('Failed to unpause contract:', error);
      toast.error(`Failed to unpause contract: ${error.message}`, { id: 'unpause' });
    } finally {
      setIsLoading(false);
    }
  };

  // Process payout for a policy flight
  const handleProcessPayout = async (flightNumber: string, policyId: string) => {
    setIsLoading(true);
    try {
      toast.loading('Processing payout...', { id: 'payout' });
      
      // Simulate payout processing (in real app, this would call smart contract)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove flight from tracking after payout
      mockFlightAPI.removeFlight(flightNumber);
      refreshFlights();
      
      // Refresh policies to show updated status
      fetchUserData();
      
      toast.success('🎉 Payout processed successfully!', {
        id: 'payout',
        description: `Flight ${flightNumber} payout completed and policy resolved`
      });
      
    } catch (error: any) {
      console.error('Failed to process payout:', error);
      toast.error(`Failed to process payout: ${error.message}`, { id: 'payout' });
    } finally {
      setIsLoading(false);
    }
  };

  // Add passenger to selected flight
  const handleAddPassenger = () => {
    if (!selectedFlight || !pnrInput || !lastNameInput) {
      toast.error('Please select a flight and enter both PNR and last name');
      return;
    }

    const success = mockFlightAPI.addPassengerToFlight(
      selectedFlight,
      pnrInput.trim().toUpperCase(),
      lastNameInput.trim(),
      undefined, // No policy ID yet
      false // No insurance yet
    );

    if (success) {
      refreshFlights();
      setPnrInput('');
      setLastNameInput('');
      toast.success(`Added passenger ${pnrInput} (${lastNameInput}) to flight ${selectedFlight}`);
    } else {
      toast.error('Failed to add passenger. PNR might already exist on this flight.');
    }
  };

  // Remove passenger from flight
  const handleRemovePassenger = (flightNumber: string, pnr: string) => {
    const success = mockFlightAPI.removePassengerFromFlight(flightNumber, pnr);
    if (success) {
      refreshFlights();
      toast.success(`Removed passenger ${pnr} from flight ${flightNumber}`);
    } else {
      toast.error('Failed to remove passenger');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDelay = (status: FlightStatus) => {
    if (status.isCancelled) return 'CANCELLED';
    if (status.delayMinutes === 0) return 'ON TIME';
    return `+${status.delayMinutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">✈️ Flight Operations Dashboard</h1>
              <p className="text-gray-600">Demo control panel - Simulate flight delays and cancellations</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Operations Date</p>
              <p className="text-2xl font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p className="text-sm text-gray-500">{new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZoneName: 'short'
              })}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Demo Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Custom Delay */}
            <div className="space-y-3">
              <Label htmlFor="flight-select">Select Flight</Label>
              <select
                id="flight-select"
                value={selectedFlight}
                onChange={(e) => setSelectedFlight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a flight...</option>
                {flights.map(flight => (
                  <option key={flight.flightNumber} value={flight.flightNumber}>
                    {flight.flightNumber} ({flight.route.departure} → {flight.route.arrival})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="delay-input">Delay (minutes)</Label>
              <div className="flex gap-2">
                <Input
                  id="delay-input"
                  type="number"
                  placeholder="0"
                  value={customDelay}
                  onChange={(e) => setCustomDelay(e.target.value)}
                  min="0"
                  max="600"
                />
                <Button onClick={handleCustomDelay} className="whitespace-nowrap">
                  Apply
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button 
                  onClick={handleRandomizeAll}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Randomize All
                </Button>
                <Button 
                  onClick={refreshFlights}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Passenger Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Flight Selection */}
            <div className="space-y-3">
              <Label htmlFor="passenger-flight-select">Select Flight</Label>
              <select
                id="passenger-flight-select"
                value={selectedFlight}
                onChange={(e) => setSelectedFlight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a flight...</option>
                {flights.map(flight => (
                  <option key={flight.flightNumber} value={flight.flightNumber}>
                    {flight.flightNumber} ({flight.route.departure} → {flight.route.arrival})
                  </option>
                ))}
              </select>
            </div>

            {/* PNR Input */}
            <div className="space-y-3">
              <Label htmlFor="pnr-input">PNR Code</Label>
              <Input
                id="pnr-input"
                type="text"
                placeholder="ABC123"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                maxLength={6}
                className="uppercase"
              />
            </div>

            {/* Last Name Input */}
            <div className="space-y-3">
              <Label htmlFor="lastname-input">Last Name</Label>
              <Input
                id="lastname-input"
                type="text"
                placeholder="Smith"
                value={lastNameInput}
                onChange={(e) => setLastNameInput(e.target.value)}
              />
            </div>

            {/* Add Passenger Button */}
            <div className="space-y-3">
              <Label>&nbsp;</Label>
              <Button 
                onClick={handleAddPassenger}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!selectedFlight || !pnrInput || !lastNameInput}
              >
                Add Passenger
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>💡 Tip:</strong> Add 1-3 passengers per flight. When they purchase insurance, 
              the smart contract will automatically generate policies and you can simulate delays for payouts.
            </p>
          </div>
        </div>

        {/* Contract Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Contract Controls
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract Status */}
            <div className="space-y-3">
              <Label>Contract Status</Label>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  isContractPaused 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {isContractPaused ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isContractPaused ? 'PAUSED' : 'ACTIVE'}
                </div>
                {isContractPaused && (
                  <span className="text-sm text-red-600">⚠️ No new policies can be purchased</span>
                )}
              </div>
            </div>

            {/* Contract Actions */}
            <div className="space-y-3">
              <Label>Emergency Controls</Label>
              <div className="flex gap-2">
                {isContractPaused ? (
                  <Button 
                    onClick={handleUnpauseContract}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {isLoading ? 'Unpausing...' : 'Unpause Contract'}
                  </Button>
                ) : (
                  <Button 
                    onClick={handlePauseContract}
                    disabled={isLoading}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    {isLoading ? 'Pausing...' : 'Pause Contract'}
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {isContractPaused 
                  ? 'Unpause to allow new policy purchases' 
                  : 'Pause to prevent new policy purchases (admin only)'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Flights List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Plane className="w-6 h-6" />
            Flight Status Monitor
          </h2>

          <div className="space-y-4">
            {flights.map((flight) => {
              const hasPassengers = flight.currentStatus.passengers.length > 0;
              const hasInsuredPassengers = flight.currentStatus.passengers.some(p => p.hasInsurance);
              const hasPaidPassengers = flight.currentStatus.passengers.some(p => p.payoutProcessed);
              const isFinalized = flight.currentStatus.status === 'CANCELLED' && hasPaidPassengers;
              const qualifiesForPayout = mockFlightAPI.checkPayoutEligibility(flight.flightNumber, 120);
              
              return (
                <motion.div
                  key={flight.flightNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                    isFinalized 
                      ? 'border-gray-400 bg-gray-100 opacity-75' 
                      : hasPassengers 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Plane className={`w-6 h-6 ${
                        isFinalized 
                          ? 'text-gray-500' 
                          : hasPassengers 
                            ? 'text-blue-600' 
                            : 'text-blue-500'
                      }`} />
                      <div>
                        <h3 className={`font-bold text-lg ${isFinalized ? 'text-gray-600' : ''}`}>
                          {flight.flightNumber}
                          {isFinalized && ' (FINALIZED)'}
                        </h3>
                        <p className={`${isFinalized ? 'text-gray-500' : 'text-gray-600'}`}>
                          {flight.route.departure} → {flight.route.arrival}
                        </p>
                        {hasPassengers && (
                          <div className={`mt-1 text-sm ${isFinalized ? 'text-gray-600' : 'text-blue-700'}`}>
                            <span className="font-medium">Passengers:</span> {flight.currentStatus.passengers.length}
                            {hasInsuredPassengers && (
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                                isFinalized 
                                  ? 'bg-gray-200 text-gray-700' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {flight.currentStatus.passengers.filter(p => p.hasInsurance).length} INSURED
                              </span>
                            )}
                            {hasPaidPassengers && (
                              <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                                {flight.currentStatus.passengers.filter(p => p.payoutProcessed).length} PAID
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isFinalized 
                          ? 'text-gray-600 bg-gray-200' 
                          : getFlightStatusColor(flight.currentStatus)
                      }`}>
                        {isFinalized ? 'FINALIZED' : formatDelay(flight.currentStatus)}
                      </span>
                      {hasInsuredPassengers && !isFinalized && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          INSURED
                        </span>
                      )}
                      {isFinalized && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                          PAID OUT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Passengers List */}
                  {hasPassengers && (
                    <div className={`mb-4 p-3 border rounded-lg ${
                      isFinalized 
                        ? 'bg-gray-50 border-gray-300' 
                        : 'bg-white border-blue-200'
                    }`}>
                      <h4 className={`font-medium mb-2 flex items-center gap-2 ${
                        isFinalized ? 'text-gray-600' : 'text-gray-800'
                      }`}>
                        <Users className="w-4 h-4" />
                        Passengers ({flight.currentStatus.passengers.length})
                      </h4>
                      <div className="space-y-2">
                        {flight.currentStatus.passengers.map((passenger, index) => (
                          <div key={index} className={`flex items-center justify-between p-2 rounded ${
                            isFinalized ? 'bg-gray-100' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-medium">{passenger.pnr}</span>
                              <span className={`text-sm ${isFinalized ? 'text-gray-600' : 'text-gray-700'}`}>
                                {passenger.lastName}
                              </span>
                              {passenger.hasInsurance && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  passenger.payoutProcessed
                                    ? 'bg-green-200 text-green-800'
                                    : isFinalized
                                      ? 'bg-gray-200 text-gray-700'
                                      : 'bg-green-100 text-green-800'
                                }`}>
                                  {passenger.payoutProcessed ? 'PAID' : 'INSURED'}
                                </span>
                              )}
                              {passenger.payoutProcessed && passenger.payoutAmount && (
                                <span className="text-sm font-medium text-green-700">
                                  ${passenger.payoutAmount} USDC
                                </span>
                              )}
                            </div>
                            {!isFinalized && (
                              <Button
                                onClick={() => handleRemovePassenger(flight.flightNumber, passenger.pnr)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Scheduled Departure</p>
                    <p className="text-lg">{formatTime(flight.schedule.departureTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Actual Departure</p>
                    <p className="text-lg">{formatTime(flight.currentStatus.actualDeparture)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-lg">{formatFlightStatus(flight.currentStatus)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delay</p>
                    <p className="text-lg">{flight.currentStatus.delayMinutes} minutes</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isFinalized && (
                  <div className="flex flex-wrap gap-2">
                    {hasInsuredPassengers ? (
                    // Insured Flight Actions
                    <>
                      {qualifiesForPayout ? (
                        <Button
                          onClick={() => handleProcessPayout(flight.flightNumber, 'policy-id')}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Process Payout
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleDelayFlight(flight.flightNumber, 30)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Clock className="w-4 h-4" />
                            +30m
                          </Button>
                          <Button
                            onClick={() => handleDelayFlight(flight.flightNumber, 90)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Clock className="w-4 h-4" />
                            +90m
                          </Button>
                          <Button
                            onClick={() => handleDelayFlight(flight.flightNumber, 150)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            +2.5h (Triggers Payout)
                          </Button>
                          <Button
                            onClick={() => handleCancelFlight(flight.flightNumber)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel (Triggers Payout)
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleResetFlight(flight.flightNumber)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </Button>
                    </>
                  ) : (
                    // Regular Flight Actions
                    <>
                      <Button
                        onClick={() => handleDelayFlight(flight.flightNumber, 30)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Clock className="w-4 h-4" />
                        +30m
                      </Button>
                      <Button
                        onClick={() => handleDelayFlight(flight.flightNumber, 90)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Clock className="w-4 h-4" />
                        +90m
                      </Button>
                      <Button
                        onClick={() => handleDelayFlight(flight.flightNumber, 150)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        +2.5h (Triggers Payout)
                      </Button>
                      <Button
                        onClick={() => handleCancelFlight(flight.flightNumber)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel (Triggers Payout)
                      </Button>
                      <Button
                        onClick={() => handleResetFlight(flight.flightNumber)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </Button>
                    </>
                  )}
                </div>
                )}

                {/* Payout Warning */}
                {!isFinalized && (flight.currentStatus.isCancelled || flight.currentStatus.delayMinutes >= 120) && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">⚡ Payout Triggered!</span>
                    </div>
                    <p className="text-orange-700 text-sm mt-1">
                      This flight qualifies for insurance payouts (2+ hour delay or cancellation)
                    </p>
                  </div>
                )}

                {/* Finalized Status */}
                {isFinalized && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">✅ Payouts Processed</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      All insured passengers have received their payouts. This flight is now finalized.
                    </p>
                  </div>
                )}
                </motion.div>
              );
            })}

            {flights.length === 0 && (
              <div className="text-center py-12">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Flights Found</h3>
                <p className="text-gray-500">Flights will appear here when policies are purchased</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
