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
import { Card } from '@/components/ui/card';
import { Sparkles, Key, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  description: string;
  models: string[];
  docsUrl: string;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo, GPT-3.5',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    docsUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet, Opus, Haiku',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    docsUrl: 'https://console.anthropic.com/settings/keys'
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Gemini 2.5 Pro/Flash (Latest)',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    docsUrl: 'https://aistudio.google.com/app/apikey'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek Chat, Coder',
    models: ['deepseek-chat', 'deepseek-coder'],
    docsUrl: 'https://platform.deepseek.com/api-keys'
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    docsUrl: 'https://console.groq.com/keys'
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Multiple open-source models',
    models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
    docsUrl: 'https://api.together.xyz/settings/api-keys'
  },
];

export default function AISettingsPage() {
  const [provider, setProvider] = useState<string>('google');
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedProvider = localStorage.getItem('ai_provider');
    const savedApiKey = localStorage.getItem('ai_api_key');
    const savedModel = localStorage.getItem('ai_model');

    if (savedProvider) setProvider(savedProvider);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedModel) setModel(savedModel);
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    // Save to localStorage
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_model', model || getSelectedProvider()?.models[0] || '');

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    if (!confirm('Clear all AI settings? This will remove your API key from this browser.')) {
      return;
    }

    localStorage.removeItem('ai_provider');
    localStorage.removeItem('ai_api_key');
    localStorage.removeItem('ai_model');

    setProvider('google');
    setApiKey('');
    setModel('');
  };

  const getSelectedProvider = () => {
    return AI_PROVIDERS.find(p => p.id === provider);
  };

  const selectedProvider = getSelectedProvider();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your AI provider and API key for PRD generation
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900">Secure Local Storage</h3>
              <p className="text-xs text-blue-700 mt-1">
                Your API key is stored locally in your browser and never sent to our servers. 
                Only you can access it, and it&apos;s used directly to call the AI provider from your browser.
              </p>
            </div>
          </div>

          {/* AI Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-gray-500">{p.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          {selectedProvider && (
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select 
                value={model || selectedProvider.models[0]} 
                onValueChange={setModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider.models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey">API Key</Label>
              {selectedProvider && (
                <a
                  href={selectedProvider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Get {selectedProvider.name} API Key →
                </a>
              )}
            </div>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Your API key is stored securely in your browser&apos;s local storage
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              <Key className="h-4 w-4 mr-2" />
              Save API Key
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear Settings
            </Button>
            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Saved successfully!
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Secure & Private</h3>
              <p className="text-xs text-gray-600 mt-1">
                API keys are stored only in your browser. They never touch our servers.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Choose Your AI</h3>
              <p className="text-xs text-gray-600 mt-1">
                Use any AI provider you prefer. Switch anytime.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Configuration */}
      {apiKey && (
        <Card className="p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Configuration</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Provider:</span>
              <span className="ml-2 font-medium">{selectedProvider?.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Model:</span>
              <span className="ml-2 font-medium">{model || selectedProvider?.models[0]}</span>
            </div>
            <div>
              <span className="text-gray-600">API Key:</span>
              <span className="ml-2 font-mono text-xs">
                {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 4)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 text-green-600 font-medium">✓ Configured</span>
            </div>
          </div>
        </Card>
      )}

      {/* Warning */}
      {!apiKey && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-orange-900">No API Key Configured</h3>
              <p className="text-xs text-orange-700 mt-1">
                PRD generation will not work until you configure an AI provider and API key.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

