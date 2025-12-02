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
  const { showError, showSuccess, showConfirm, AlertDialog } = useAlertDialog();
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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="mt-3">Loading AI settings...</span>
      </div>
    );
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
    const providerName = getProvider(providerId)?.name || 'this provider';
    showConfirm(
      `Are you sure you want to remove the configuration for ${providerName}?`,
      () => {
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
      },
      `Remove ${providerName}`
    );
  };

  // Handle clear all settings
  const handleClearAll = () => {
    showConfirm(
      'Are you sure you want to clear ALL AI settings? This will remove all API keys from this browser.',
      () => {
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
      },
      'Clear All Settings'
    );
  };

  const configuredCount = Object.keys(config.providers).filter(
    (id) => config.providers[id]?.apiKey
  ).length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Settings</h1>
        <p className="text-muted-foreground">
          Configure multiple AI providers with local API key storage. Set one as default for PRD generation.
        </p>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-xl">
        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Secure Local Storage</h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Your API keys are stored locally in your browser and never sent to our servers. Only
            you can access them, and they&apos;re used directly to call AI providers from your browser.
          </p>
        </div>
      </div>

      {/* Migration Notice */}
      {showMigrationNotice && legacyInfo && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl">
          <Info className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Configuration Migrated</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              Your previous {legacyInfo.provider} configuration has been automatically migrated to
              the new multi-provider system. You can now configure additional providers.
            </p>
          </div>
          <button
            onClick={() => setShowMigrationNotice(false)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
          >
            <span className="sr-only">Dismiss</span>×
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-card border border-border/50">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Configured Providers</p>
            <p className="text-2xl font-bold text-foreground">{configuredCount}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Default Provider</p>
            <p className="text-sm font-medium text-foreground">
              {config.defaultProvider ? (
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  {getProvider(config.defaultProvider)?.name}
                </span>
              ) : (
                <span className="text-muted-foreground">None set</span>
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearAll} className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900">
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

          return (
            <Card
              key={provider.id}
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 ${
                isDefault
                  ? 'border-2 border-violet-500 dark:border-violet-400'
                  : isConfigured
                  ? 'border border-emerald-300 dark:border-emerald-700'
                  : 'border border-border/50 hover:border-border'
              }`}
            >
              {/* Status gradient overlay */}
              <div className={`absolute inset-0 opacity-30 transition-opacity duration-300 group-hover:opacity-50 ${
                isDefault
                  ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-500/10'
                  : isConfigured
                  ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/5 dark:to-green-500/5'
                  : 'bg-gradient-to-br from-slate-500/5 to-gray-500/5'
              }`} />

              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base text-foreground">{provider.name}</h3>
                      {isDefault && (
                        <Badge className="bg-violet-600 dark:bg-violet-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {isConfigured && !isDefault && (
                        <Badge variant="outline" className="border-emerald-500 dark:border-emerald-400 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Configured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{provider.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {/* API Key Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${provider.id}-key`} className="text-xs font-medium">
                      API Key
                    </Label>
                    <a
                      href={provider.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 transition-colors"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={state.showApiKey ? 'Hide API key' : 'Show API key'}
                    >
                      {state.showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Model Selector */}
                <div className="space-y-2">
                  <Label htmlFor={`${provider.id}-model`} className="text-xs font-medium">
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
                    className={`flex items-start gap-2 p-3 rounded-lg text-xs ${
                      state.testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900'
                        : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900'
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
                    className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 h-8 text-xs text-white"
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
                      className="h-8 text-xs text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
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
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">No Providers Configured</h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              PRD generation will not work until you configure at least one AI provider and API key.
              Get started by configuring a provider above.
            </p>
          </div>
        </div>
      )}

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
