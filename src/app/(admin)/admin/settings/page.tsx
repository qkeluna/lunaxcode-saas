'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  CheckCircle,
  Globe,
  MessageCircle,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Star,
  TestTube,
  Save,
  Loader2,
  ExternalLink,
  Info,
  Trash2,
  Plus,
  Edit,
  X,
  DollarSign,
  CreditCard,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAlertDialog } from '@/hooks/use-alert-dialog';
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

// Types
interface ProviderState {
  apiKey: string;
  model: string;
  showApiKey: boolean;
  isTesting: boolean;
  isSaving: boolean;
  testResult: { success: boolean; message: string; latency?: number } | null;
  isDirty: boolean;
}

interface PaymentAccount {
  id: number;
  accountType: string;
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  instructions: string | null;
  qrCodeUrl: string | null;
  isActive: boolean;
  order: number;
}

// Valid tab values
const VALID_TABS = ['profile', 'ai-settings', 'payment-accounts', 'system', 'notifications', 'security', 'landing'] as const;
type TabValue = typeof VALID_TABS[number];

export default function AdminSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showError, showSuccess, showConfirm, AlertDialog } = useAlertDialog();

  // Get initial tab from URL or default to 'profile'
  const tabParam = searchParams.get('tab');
  const initialTab: TabValue = VALID_TABS.includes(tabParam as TabValue) ? (tabParam as TabValue) : 'profile';
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Lunaxcode',
    siteDescription: 'AI-Powered Project Management for Web Agencies',
    supportEmail: 'support@lunaxcode.com',
    defaultCurrency: 'PHP',
    defaultTimezone: 'Asia/Manila',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNewProject: true,
    emailPaymentReceived: true,
    emailTaskCompleted: true,
    emailClientMessage: true,
    pushNotifications: false,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    requirePasswordChange: false,
  });

  // Landing page settings
  const [landingSettings, setLandingSettings] = useState({
    whatsappEnabled: true,
    whatsappNumber: '639190852974',
  });
  const [landingLoading, setLandingLoading] = useState(true);

  // AI Settings state
  const [aiConfig, setAIConfig] = useState<AIConfig | null>(null);
  const [providerStates, setProviderStates] = useState<Record<string, ProviderState>>({});
  const [showMigrationNotice, setShowMigrationNotice] = useState(false);
  const [legacyInfo, setLegacyInfo] = useState<ReturnType<typeof getLegacyConfigInfo>>(null);

  // Payment Accounts state
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [paymentFormData, setPaymentFormData] = useState({
    accountType: 'gcash',
    accountName: '',
    accountNumber: '',
    bankName: '',
    instructions: '',
    qrCodeUrl: '',
    isActive: true,
  });

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    const tab = value as TabValue;
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/admin/settings?${params.toString()}`, { scroll: false });
  };

  // Fetch landing page settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/site-settings');
        if (response.ok) {
          const data = await response.json() as { settings: { whatsapp_enabled: string; whatsapp_number: string } };
          setLandingSettings({
            whatsappEnabled: data.settings.whatsapp_enabled === 'true',
            whatsappNumber: data.settings.whatsapp_number || '639190852974',
          });
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setLandingLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Initialize AI settings on mount
  useEffect(() => {
    const loadedConfig = loadAIConfig();
    setAIConfig(loadedConfig);

    if (hasLegacyConfig()) {
      setShowMigrationNotice(true);
      setLegacyInfo(getLegacyConfigInfo());
    }

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

  // Fetch payment accounts on mount
  useEffect(() => {
    fetchPaymentAccounts();
  }, []);

  const fetchPaymentAccounts = async () => {
    try {
      setAccountsLoading(true);
      const response = await fetch('/api/admin/payment-accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setAccountsLoading(false);
    }
  };

  // Generic save handlers
  const handleSaveProfile = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleSaveSystem = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleSaveNotifications = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleSaveSecurity = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleSaveLandingSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            whatsapp_enabled: String(landingSettings.whatsappEnabled),
            whatsapp_number: landingSettings.whatsappNumber,
          },
        }),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving landing settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI Settings handlers
  const updateProviderState = (providerId: string, updates: Partial<ProviderState>) => {
    setProviderStates((prev) => ({
      ...prev,
      [providerId]: { ...prev[providerId], ...updates },
    }));
  };

  const handleSaveProvider = async (providerId: string) => {
    if (!aiConfig) return;
    const state = providerStates[providerId];
    if (!state.apiKey.trim()) {
      showError('Please enter an API key');
      return;
    }

    updateProviderState(providerId, { isSaving: true });

    try {
      const newConfig: ClientProviderConfig = {
        apiKey: state.apiKey,
        model: state.model,
      };

      const updatedConfig = updateProviderConfig(aiConfig, providerId, newConfig);
      saveAIConfig(updatedConfig);
      setAIConfig(updatedConfig);

      updateProviderState(providerId, { isSaving: false, isDirty: false });

      if (!updatedConfig.defaultProvider) {
        handleSetDefault(providerId);
      }
    } catch (error) {
      console.error('Failed to save provider:', error);
      updateProviderState(providerId, { isSaving: false });
      showError('Failed to save configuration');
    }
  };

  const handleTestConnection = async (providerId: string) => {
    const state = providerStates[providerId];
    if (!state.apiKey.trim()) {
      showError('Please enter an API key first');
      return;
    }

    updateProviderState(providerId, { isTesting: true, testResult: null });

    try {
      const result = await testConnection(providerId, state.model, state.apiKey);
      updateProviderState(providerId, {
        isTesting: false,
        testResult: result,
      });
    } catch (error) {
      updateProviderState(providerId, {
        isTesting: false,
        testResult: {
          success: false,
          message: error instanceof Error ? error.message : 'Test failed',
        },
      });
    }
  };

  const handleSetDefault = (providerId: string) => {
    if (!aiConfig) return;
    try {
      const updatedConfig = setDefaultProviderUtil(aiConfig, providerId);
      saveAIConfig(updatedConfig);
      setAIConfig(updatedConfig);
    } catch (error) {
      console.error('Failed to set default provider:', error);
      showError('Failed to set default provider. Make sure it is configured first.');
    }
  };

  const handleRemoveProvider = (providerId: string) => {
    if (!aiConfig) return;
    const providerName = getProvider(providerId)?.name || 'this provider';
    showConfirm(
      `Are you sure you want to remove the configuration for ${providerName}?`,
      () => {
        const updatedConfig = removeProviderConfig(aiConfig, providerId);
        saveAIConfig(updatedConfig);
        setAIConfig(updatedConfig);

        const provider = getProvider(providerId);
        if (provider) {
          updateProviderState(providerId, {
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

  const handleClearAllAI = () => {
    showConfirm(
      'Are you sure you want to clear ALL AI settings? This will remove all API keys from this browser.',
      () => {
        clearAllConfig();
        const emptyConfig = loadAIConfig();
        setAIConfig(emptyConfig);

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

  // Payment Accounts handlers
  const handleSavePaymentAccount = async () => {
    try {
      const url = editingAccount
        ? `/api/admin/payment-accounts/${editingAccount.id}`
        : '/api/admin/payment-accounts';

      const method = editingAccount ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentFormData),
      });

      if (!response.ok) throw new Error('Failed to save account');

      showSuccess(editingAccount ? 'Account updated!' : 'Account created!');
      setShowPaymentDialog(false);
      resetPaymentForm();
      fetchPaymentAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      showError('Failed to save account');
    }
  };

  const handleDeletePaymentAccount = (id: number) => {
    showConfirm(
      'Are you sure you want to delete this payment account? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/admin/payment-accounts/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete account');

          showSuccess('Account deleted!');
          fetchPaymentAccounts();
        } catch (error) {
          console.error('Error deleting account:', error);
          showError('Failed to delete account');
        }
      },
      'Delete Payment Account'
    );
  };

  const handleEditPaymentAccount = (account: PaymentAccount) => {
    setEditingAccount(account);
    setPaymentFormData({
      accountType: account.accountType,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName || '',
      instructions: account.instructions || '',
      qrCodeUrl: account.qrCodeUrl || '',
      isActive: account.isActive,
    });
    setShowPaymentDialog(true);
  };

  const resetPaymentForm = () => {
    setEditingAccount(null);
    setPaymentFormData({
      accountType: 'gcash',
      accountName: '',
      accountNumber: '',
      bankName: '',
      instructions: '',
      qrCodeUrl: '',
      isActive: true,
    });
  };

  const configuredCount = aiConfig
    ? Object.keys(aiConfig.providers).filter((id) => aiConfig.providers[id]?.apiKey).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, system preferences, and configurations
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Settings saved successfully
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 w-full lg:w-auto">
          <TabsTrigger value="profile" className="flex-1 lg:flex-none">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="ai-settings" className="flex-1 lg:flex-none">
            <Cpu className="h-4 w-4 mr-2" />
            AI
          </TabsTrigger>
          <TabsTrigger value="payment-accounts" className="flex-1 lg:flex-none">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="system" className="flex-1 lg:flex-none">
            <Database className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 lg:flex-none">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 lg:flex-none">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="landing" className="flex-1 lg:flex-none">
            <Globe className="h-4 w-4 mr-2" />
            Landing
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="+63 912 345 6789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai-settings" className="space-y-6">
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
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Stats */}
          {aiConfig && (
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
                    {aiConfig.defaultProvider ? (
                      <span className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        {getProvider(aiConfig.defaultProvider)?.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None set</span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAllAI}
                className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}

          {/* Provider Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_PROVIDERS.map((provider) => {
              const state = providerStates[provider.id];
              if (!state || !aiConfig) return null;

              const isConfigured = !!aiConfig.providers[provider.id]?.apiKey;
              const isDefault = aiConfig.defaultProvider === provider.id;

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
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Configured
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{provider.description}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
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
                            updateProviderState(provider.id, {
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
                            updateProviderState(provider.id, { showApiKey: !state.showApiKey })
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

                    <div className="space-y-2">
                      <Label htmlFor={`${provider.id}-model`} className="text-xs font-medium">
                        Model
                      </Label>
                      <Select
                        value={state.model}
                        onValueChange={(value) => {
                          updateProviderState(provider.id, {
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

                    {state.testResult && (
                      <div
                        className={`flex items-start gap-2 p-3 rounded-lg text-xs ${
                          state.testResult.success
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900'
                            : 'bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900'
                        }`}
                      >
                        {state.testResult.success ? (
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{state.testResult.message}</span>
                      </div>
                    )}

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
        </TabsContent>

        {/* Payment Accounts */}
        <TabsContent value="payment-accounts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Payment Accounts</h2>
              <p className="text-sm text-muted-foreground">
                Manage your bank accounts and e-wallet details for receiving payments
              </p>
            </div>
            <Button
              onClick={() => {
                resetPaymentForm();
                setShowPaymentDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>

          {accountsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No payment accounts</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first payment account to start receiving payments
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    resetPaymentForm();
                    setShowPaymentDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {accounts.map((account) => (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="capitalize">
                          {account.accountType.replace('_', ' ')}
                        </CardTitle>
                        <CardDescription>{account.accountName}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={account.isActive ? 'default' : 'secondary'}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditPaymentAccount(account)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeletePaymentAccount(account.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Account Number:</span>{' '}
                        <span className="font-mono font-medium">{account.accountNumber}</span>
                      </div>
                      {account.bankName && (
                        <div>
                          <span className="text-muted-foreground">Bank:</span>{' '}
                          <span className="font-medium">{account.bankName}</span>
                        </div>
                      )}
                      {account.instructions && (
                        <div>
                          <span className="text-muted-foreground">Instructions:</span>
                          <p className="text-foreground mt-1">{account.instructions}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Payment Account Dialog */}
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? 'Edit Payment Account' : 'Add Payment Account'}
                </DialogTitle>
                <DialogDescription>
                  Configure the bank account or e-wallet details for receiving payments
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Account Type</Label>
                  <Select
                    value={paymentFormData.accountType}
                    onValueChange={(value) => setPaymentFormData({ ...paymentFormData, accountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gcash">GCash</SelectItem>
                      <SelectItem value="seabank">SeaBank</SelectItem>
                      <SelectItem value="paymaya">PayMaya</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Account Name</Label>
                  <Input
                    value={paymentFormData.accountName}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, accountName: e.target.value })}
                    placeholder="e.g., Lunaxcode"
                  />
                </div>

                <div>
                  <Label>
                    {paymentFormData.accountType === 'bank_transfer' ? 'Account Number' : 'Mobile Number'}
                  </Label>
                  <Input
                    value={paymentFormData.accountNumber}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, accountNumber: e.target.value })}
                    placeholder={paymentFormData.accountType === 'bank_transfer' ? '1234-5678-9012' : '09XX XXX XXXX'}
                  />
                </div>

                {paymentFormData.accountType === 'bank_transfer' && (
                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      value={paymentFormData.bankName}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, bankName: e.target.value })}
                      placeholder="e.g., BDO, BPI, Metrobank"
                    />
                  </div>
                )}

                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    value={paymentFormData.instructions}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, instructions: e.target.value })}
                    placeholder="Special instructions for clients when using this payment method..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>QR Code URL (Optional)</Label>
                  <Input
                    value={paymentFormData.qrCodeUrl}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, qrCodeUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={paymentFormData.isActive}
                    onCheckedChange={(checked) => setPaymentFormData({ ...paymentFormData, isActive: checked })}
                  />
                  <Label>Active (shown to clients)</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentDialog(false);
                    resetPaymentForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePaymentAccount}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingAccount ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure system-wide settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={systemSettings.siteName}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, siteName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={systemSettings.supportEmail}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, supportEmail: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={systemSettings.siteDescription}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, siteDescription: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Input
                    id="defaultCurrency"
                    value={systemSettings.defaultCurrency}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, defaultCurrency: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultTimezone">Default Timezone</Label>
                  <Input
                    id="defaultTimezone"
                    value={systemSettings.defaultTimezone}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, defaultTimezone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSystem} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
              <CardDescription>
                View database statistics and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Database Type</span>
                  <span className="text-sm text-foreground">Cloudflare D1 (SQLite)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">ORM</span>
                  <span className="text-sm text-foreground">Drizzle ORM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Region</span>
                  <span className="text-sm text-foreground">APAC (Asia-Pacific)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-muted-foreground">Last Backup</span>
                  <span className="text-sm text-foreground">Automated by Cloudflare</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose which email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium text-sm">New Project Created</p>
                  <p className="text-sm text-muted-foreground">Get notified when a new project is created</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNewProject}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNewProject: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium text-sm">Payment Received</p>
                  <p className="text-sm text-muted-foreground">Get notified when a payment is received</p>
                </div>
                <Switch
                  checked={notificationSettings.emailPaymentReceived}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailPaymentReceived: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium text-sm">Task Completed</p>
                  <p className="text-sm text-muted-foreground">Get notified when a task is marked as completed</p>
                </div>
                <Switch
                  checked={notificationSettings.emailTaskCompleted}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailTaskCompleted: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium text-sm">Client Message</p>
                  <p className="text-sm text-muted-foreground">Get notified when a client sends a message</p>
                </div>
                <Switch
                  checked={notificationSettings.emailClientMessage}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailClientMessage: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Enable browser push notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })
                  }
                />
              </div>

              <div className="py-3 border-b">
                <Label htmlFor="sessionTimeout" className="text-sm font-medium">
                  Session Timeout (minutes)
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Automatically log out after period of inactivity
                </p>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })
                  }
                  className="max-w-xs"
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-sm">Require Password Change</p>
                  <p className="text-sm text-muted-foreground">Force password change every 90 days</p>
                </div>
                <Switch
                  checked={securitySettings.requirePasswordChange}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, requirePasswordChange: checked })
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveSecurity} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentication Method</CardTitle>
              <CardDescription>
                Currently using Google OAuth for authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-muted/50 dark:bg-muted/30 rounded-xl border border-border/50">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-sm">Google OAuth</p>
                  <p className="text-sm text-muted-foreground">Secure authentication via Google</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Landing Page Settings */}
        <TabsContent value="landing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
                WhatsApp Widget
              </CardTitle>
              <CardDescription>
                Configure the floating WhatsApp button on the landing page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {landingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium text-sm">Show WhatsApp Button</p>
                      <p className="text-sm text-muted-foreground">
                        Display the floating WhatsApp chat button on the landing page
                      </p>
                    </div>
                    <Switch
                      checked={landingSettings.whatsappEnabled}
                      onCheckedChange={(checked) =>
                        setLandingSettings({ ...landingSettings, whatsappEnabled: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2 py-3">
                    <Label htmlFor="whatsappNumber">WhatsApp Phone Number</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Phone number with country code (without + or spaces)
                    </p>
                    <Input
                      id="whatsappNumber"
                      value={landingSettings.whatsappNumber}
                      onChange={(e) =>
                        setLandingSettings({ ...landingSettings, whatsappNumber: e.target.value })
                      }
                      placeholder="639XXXXXXXXX"
                      className="max-w-xs"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveLandingSettings} disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
