"use client";
import React, { useState, useEffect } from 'react';
import { autoPayManager, type AutoPayConfig } from '@/lib/autoPayConfig';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

interface AutoPaySetupProps {
  className?: string;
}

export const AutoPaySetup: React.FC<AutoPaySetupProps> = ({ className }) => {
  const [config, setConfig] = useState<AutoPayConfig>(autoPayManager.getConfig());
  const [status, setStatus] = useState(autoPayManager.getStatus());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Update status every 5 seconds
    const interval = setInterval(() => {
      setStatus(autoPayManager.getStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleConfigChange = (key: keyof AutoPayConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedConfigChange = (parentKey: keyof AutoPayConfig, childKey: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }));
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      autoPayManager.configureAutoPay(config);
      toast.success('Auto-pay configuration saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAutoPay = () => {
    const newEnabled = !config.enabled;
    autoPayManager.setEnabled(newEnabled);
    
    if (newEnabled) {
      autoPayManager.startMonitoring();
      toast.success('Auto-pay enabled and monitoring started');
    } else {
      autoPayManager.stopMonitoring();
      toast.info('Auto-pay disabled and monitoring stopped');
    }
    
    setConfig(prev => ({ ...prev, enabled: newEnabled }));
  };

  const handleClearRetries = () => {
    autoPayManager.clearRetries();
    toast.success('Retry counts cleared');
  };

  const getStatusColor = () => {
    if (!config.enabled) return 'secondary';
    if (status.isProcessing) return 'default';
    return 'default';
  };

  const getStatusText = () => {
    if (!config.enabled) return 'Disabled';
    if (status.isProcessing) return 'Processing';
    return 'Monitoring';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Auto-Pay Setup</CardTitle>
              <CardDescription>
                Configure automatic payout processing for delayed flights
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor()}>
                {getStatusText()}
              </Badge>
              <Switch
                checked={config.enabled}
                onCheckedChange={handleToggleAutoPay}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium">Basic Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delay-threshold">Delay Threshold (minutes)</Label>
                <Input
                  id="delay-threshold"
                  type="number"
                  value={config.delayThresholdMinutes}
                  onChange={(e) => handleConfigChange('delayThresholdMinutes', parseInt(e.target.value))}
                  placeholder="120"
                />
                <p className="text-sm text-gray-500">
                  Minimum delay required to trigger auto-payout
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payout-amount">Default Payout Amount ($)</Label>
                <Input
                  id="payout-amount"
                  type="number"
                  value={config.payoutAmount}
                  onChange={(e) => handleConfigChange('payoutAmount', parseInt(e.target.value))}
                  placeholder="500"
                />
                <p className="text-sm text-gray-500">
                  Default payout amount per passenger
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-payouts">Max Payouts Per Flight</Label>
                <Input
                  id="max-payouts"
                  type="number"
                  value={config.maxPayoutsPerFlight}
                  onChange={(e) => handleConfigChange('maxPayoutsPerFlight', parseInt(e.target.value))}
                  placeholder="10"
                />
                <p className="text-sm text-gray-500">
                  Maximum number of payouts per flight
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="require-confirmation">Require Confirmation</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.requireConfirmation}
                    onCheckedChange={(checked) => handleConfigChange('requireConfirmation', checked)}
                  />
                  <span className="text-sm text-gray-500">
                    Require manual confirmation before processing
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Notification Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send email notifications for payouts</p>
                </div>
                <Switch
                  checked={config.notificationSettings.email}
                  onCheckedChange={(checked) => handleNestedConfigChange('notificationSettings', 'email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Send SMS notifications for payouts</p>
                </div>
                <Switch
                  checked={config.notificationSettings.sms}
                  onCheckedChange={(checked) => handleNestedConfigChange('notificationSettings', 'sms', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Send push notifications for payouts</p>
                </div>
                <Switch
                  checked={config.notificationSettings.push}
                  onCheckedChange={(checked) => handleNestedConfigChange('notificationSettings', 'push', checked)}
                />
              </div>
            </div>
          </div>

          {/* Retry Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Retry Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-retries">Max Retries</Label>
                <Input
                  id="max-retries"
                  type="number"
                  value={config.retrySettings.maxRetries}
                  onChange={(e) => handleNestedConfigChange('retrySettings', 'maxRetries', parseInt(e.target.value))}
                  placeholder="3"
                />
                <p className="text-sm text-gray-500">
                  Maximum number of retry attempts
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retry-delay">Retry Delay (ms)</Label>
                <Input
                  id="retry-delay"
                  type="number"
                  value={config.retrySettings.retryDelayMs}
                  onChange={(e) => handleNestedConfigChange('retrySettings', 'retryDelayMs', parseInt(e.target.value))}
                  placeholder="5000"
                />
                <p className="text-sm text-gray-500">
                  Delay between retry attempts
                </p>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Status Information</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Status</div>
                <div className="font-medium">{getStatusText()}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Queue Length</div>
                <div className="font-medium">{status.queueLength}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Retry Count</div>
                <div className="font-medium">{status.retryCount}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Processing</div>
                <div className="font-medium">{status.isProcessing ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button 
              onClick={handleSaveConfig} 
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
            
            <Button 
              onClick={handleClearRetries} 
              variant="outline"
            >
              Clear Retries
            </Button>
          </div>

          {/* Queue Information */}
          {status.queueLength > 0 && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Processing Queue ({status.queueLength} flights)</div>
                  <div className="text-sm">
                    Flights currently being processed: {autoPayManager.getQueue().join(', ')}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
