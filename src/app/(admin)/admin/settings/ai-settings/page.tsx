'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Star,
  TestTube,
  Save,
  Loader2,
  ExternalLink,
  Info,
  Trash2,
} from 'lucide-react';
import { AI_PROVIDERS, getProvider } from '@/lib/ai/config';
import {
  loadAIConfig,
  saveAIConfig,
  updateProviderConfig,
  setDefaultProvider as setDefaultProviderUtil,
  removeProviderConfig,
  hasLegacyConfig,
  getLegacyConfigInfo,
  clearAllConfig,
} from '@/lib/ai/storage';
import { testConnection } from '@/lib/ai/client';
import type { AIConfig, ClientProviderConfig } from '@/lib/ai/types';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface ProviderState {
  apiKey: string;
  model: string;
  showApiKey: boolean;
  isTesting: boolean;
  isSaving: boolean;
  testResult: { success: boolean; message: string; latency?: number } | null;
  isDirty: boolean;
}

export default function AISettingsPage() {
  const { showError, showSuccess, AlertDialog } = useAlertDialog();
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [providerStates, setProviderStates] = useState<Record<string, ProviderState>>({});
  const [showMigrationNotice, setShowMigrationNotice] = useState(false);
  const [legacyInfo, setLegacyInfo] = useState<ReturnType<typeof getLegacyConfigInfo>>(null);

  // Initialize state on mount
  useEffect(() => {
    const loadedConfig = loadAIConfig();
    setConfig(loadedConfig);

    // Check for legacy config
    if (hasLegacyConfig()) {
      setShowMigrationNotice(true);
      setLegacyInfo(getLegacyConfigInfo());
    }

    // Initialize provider states
    const initialStates: Record<string, ProviderState> = {};
    AI_PROVIDERS.forEach((provider) => {
      const providerConfig = loadedConfig.providers[provider.id];
      initialStates[provider.id] = {
        apiKey: providerConfig?.apiKey || '',
        model: providerConfig?.model || provider.models[0],
        showApiKey: false,
        isTesting: false,
        isSaving: false,
        testResult: null,
        isDirty: false,
      };
    });
    setProviderStates(initialStates);
  }, []);

  if (!config) {
    return <div>Loading...</div>;
  }

  // Update provider state
  const updateState = (providerId: string, updates: Partial<ProviderState>) => {
    setProviderStates((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId], ...updates },
    }));
  };

  // Handle save provider
  const handleSaveProvider = async (providerId: string) => {
    const state = providerStates[providerId];
    if (!state.apiKey.trim()) {
      showError('Please enter an API key');
      return;
    }

    updateState(providerId, { isSaving: true });

    try {
      const newConfig: ClientProviderConfig = {
        apiKey: state.apiKey,
        model: state.model,
      };

      const updatedConfig = updateProviderConfig(config, providerId, newConfig);
      saveAIConfig(updatedConfig);
      setConfig(updatedConfig);

      updateState(providerId, { isSaving: false, isDirty: false });

      // Set as default if it's the first provider configured
      if (!updatedConfig.defaultProvider) {
        handleSetDefault(providerId);
      }
    } catch (error) {
      console.error('Failed to save provider:', error);
      updateState(providerId, { isSaving: false });
      showError('Failed to save configuration');
    }
  };

  // Handle test connection
  const handleTestConnection = async (providerId: string) => {
    const state = providerStates[providerId];
    if (!state.apiKey.trim()) {
      showError('Please enter an API key first');
      return;
    }

    updateState(providerId, { isTesting: true, testResult: null });

    try {
      const result = await testConnection(providerId, state.model, state.apiKey);
      updateState(providerId, {
        isTesting: false,
        testResult: result,
      });
    } catch (error) {
      updateState(providerId, {
        isTesting: false,
        testResult: {
          success: false,
          message: error instanceof Error ? error.message : 'Test failed',
        },
      });
    }
  };

  // Handle set default provider
  const handleSetDefault = (providerId: string) => {
    try {
      const updatedConfig = setDefaultProviderUtil(config, providerId);
      saveAIConfig(updatedConfig);
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Failed to set default provider:', error);
      showError('Failed to set default provider. Make sure it is configured first.');
    }
  };

  // Handle remove provider
  const handleRemoveProvider = (providerId: string) => {
    if (!confirm(`Remove configuration for ${getProvider(providerId)?.name}?`)) {
      return;
    }

    const updatedConfig = removeProviderConfig(config, providerId);
    saveAIConfig(updatedConfig);
    setConfig(updatedConfig);

    // Reset state
    const provider = getProvider(providerId);
    if (provider) {
      updateState(providerId, {
        apiKey: '',
        model: provider.models[0],
        showApiKey: false,
        isTesting: false,
        isSaving: false,
        testResult: null,
        isDirty: false,
      });
    }
  };

  // Handle clear all settings
  const handleClearAll = () => {
    if (!confirm('Clear ALL AI settings? This will remove all API keys from this browser.')) {
      return;
    }

    clearAllConfig();
    const emptyConfig = loadAIConfig();
    setConfig(emptyConfig);

    // Reset all states
    const resetStates: Record<string, ProviderState> = {};
    AI_PROVIDERS.forEach((provider) => {
      resetStates[provider.id] = {
        apiKey: '',
        model: provider.models[0],
        showApiKey: false,
        isTesting: false,
        isSaving: false,
        testResult: null,
        isDirty: false,
      };
    });
    setProviderStates(resetStates);
  };

  const configuredCount = Object.keys(config.providers).filter(
    (id) => config.providers[id]?.apiKey
  ).length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure multiple AI providers with local API key storage. Set one as default for PRD generation.
        </p>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900">Secure Local Storage</h3>
          <p className="text-xs text-blue-700 mt-1">
            Your API keys are stored locally in your browser and never sent to our servers. Only
            you can access them, and they&apos;re used directly to call AI providers from your browser.
          </p>
        </div>
      </div>

      {/* Migration Notice */}
      {showMigrationNotice && legacyInfo && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-900">Configuration Migrated</h3>
            <p className="text-xs text-green-700 mt-1">
              Your previous {legacyInfo.provider} configuration has been automatically migrated to
              the new multi-provider system. You can now configure additional providers.
            </p>
          </div>
          <button
            onClick={() => setShowMigrationNotice(false)}
            className="text-green-600 hover:text-green-800"
          >
            <span className="sr-only">Dismiss</span>×
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500">Configured Providers</p>
            <p className="text-2xl font-bold text-gray-900">{configuredCount}</p>
          </div>
          <div className="h-10 w-px bg-gray-300" />
          <div>
            <p className="text-xs text-gray-500">Default Provider</p>
            <p className="text-sm font-medium text-gray-900">
              {config.defaultProvider ? (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-purple-600" />
                  {getProvider(config.defaultProvider)?.name}
                </span>
              ) : (
                <span className="text-gray-400">None set</span>
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearAll}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AI_PROVIDERS.map((provider) => {
          const state = providerStates[provider.id];
          if (!state) return null;

          const isConfigured = !!config.providers[provider.id]?.apiKey;
          const isDefault = config.defaultProvider === provider.id;
          const borderClass = isDefault
            ? 'border-purple-500 border-2'
            : isConfigured
            ? 'border-green-300 border'
            : 'border-gray-200 border';

          return (
            <Card key={provider.id} className={`${borderClass} hover:shadow-md transition-shadow`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">{provider.name}</h3>
                      {isDefault && (
                        <Badge className="bg-purple-600">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {isConfigured && !isDefault && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Configured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{provider.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* API Key Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${provider.id}-key`} className="text-xs">
                      API Key
                    </Label>
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Get Key <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id={`${provider.id}-key`}
                      type={state.showApiKey ? 'text' : 'password'}
                      value={state.apiKey}
                      onChange={(e) => {
                        updateState(provider.id, {
                          apiKey: e.target.value,
                          isDirty: true,
                          testResult: null,
                        });
                      }}
                      placeholder="Enter API key..."
                      className="pr-10 font-mono text-xs h-9"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateState(provider.id, { showApiKey: !state.showApiKey })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      aria-label={state.showApiKey ? 'Hide API key' : 'Show API key'}
                    >
                      {state.showApiKey ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Model Selector */}
                <div className="space-y-2">
                  <Label htmlFor={`${provider.id}-model`} className="text-xs">
                    Model
                  </Label>
                  <Select
                    value={state.model}
                    onValueChange={(value) => {
                      updateState(provider.id, {
                        model: value,
                        isDirty: true,
                        testResult: null,
                      });
                    }}
                  >
                    <SelectTrigger id={`${provider.id}-model`} className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {provider.models.map((m) => (
                        <SelectItem key={m} value={m} className="text-xs">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Test Result */}
                {state.testResult && (
                  <div
                    className={`flex items-start gap-2 p-2 rounded-md text-xs ${
                      state.testResult.success
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {state.testResult.success ? (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{state.testResult.message}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestConnection(provider.id)}
                    disabled={!state.apiKey.trim() || state.isTesting || state.isSaving}
                    className="h-8 text-xs"
                  >
                    {state.isTesting ? (
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    ) : (
                      <TestTube className="h-3 w-3 mr-1.5" />
                    )}
                    Test
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleSaveProvider(provider.id)}
                    disabled={!state.apiKey.trim() || !state.isDirty || state.isSaving}
                    className="bg-purple-600 hover:bg-purple-700 h-8 text-xs"
                  >
                    {state.isSaving ? (
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3 mr-1.5" />
                    )}
                    Save
                  </Button>

                  {isConfigured && !isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(provider.id)}
                      className="h-8 text-xs"
                    >
                      <Star className="h-3 w-3 mr-1.5" />
                      Set Default
                    </Button>
                  )}

                  {isConfigured && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveProvider(provider.id)}
                      className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1.5" />
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Configuration Warning */}
      {configuredCount === 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-orange-900">No Providers Configured</h3>
              <p className="text-xs text-orange-700 mt-1">
                PRD generation will not work until you configure at least one AI provider and API key.
                Get started by configuring a provider above.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
