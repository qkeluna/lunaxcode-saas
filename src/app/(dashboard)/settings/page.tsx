'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, Bell, Lock, Save, Loader2, MessageSquare } from 'lucide-react';
import { useAlertDialog } from '@/hooks/use-alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Valid tab values
const VALID_TABS = ['profile', 'notifications', 'security'] as const;
type TabValue = typeof VALID_TABS[number];

interface NotificationPreferences {
  emailNotifications: boolean;
  projectUpdates: boolean;
  paymentReminders: boolean;
  taskUpdates: boolean;
  messageNotifications: boolean;
  marketingEmails: boolean;
}

const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  projectUpdates: true,
  paymentReminders: true,
  taskUpdates: true,
  messageNotifications: true,
  marketingEmails: false,
};

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showError, showSuccess, AlertDialog } = useAlertDialog();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get initial tab from URL or default to 'profile'
  const tabParam = searchParams.get('tab');
  const initialTab: TabValue = VALID_TABS.includes(tabParam as TabValue) ? (tabParam as TabValue) : 'profile';
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    const tab = value as TabValue;
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/settings?${params.toString()}`, { scroll: false });
  };

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    company: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationPreferences>(defaultPreferences);

  // Fetch notification preferences on mount
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch('/api/notification-preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.preferences) {
            setNotifications({
              emailNotifications: data.preferences.emailNotifications ?? true,
              projectUpdates: data.preferences.projectUpdates ?? true,
              paymentReminders: data.preferences.paymentReminders ?? true,
              taskUpdates: data.preferences.taskUpdates ?? true,
              messageNotifications: data.preferences.messageNotifications ?? true,
              marketingEmails: data.preferences.marketingEmails ?? false,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchPreferences();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Update profile data when session changes
  useEffect(() => {
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }));
    }
  }, [session]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // TODO: Implement profile update API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      showSuccess('Notification preferences updated!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showError('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  // Handle individual notification toggle
  const handleNotificationToggle = (key: keyof NotificationPreferences, value: boolean) => {
    // If turning off master toggle, keep other settings but they won't receive emails
    setNotifications(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    placeholder="+63 XXX XXX XXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company / Business Name</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) =>
                      setProfileData({ ...profileData, company: e.target.value })
                    }
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading preferences...</span>
                </div>
              ) : (
                <>
                  {/* Master Toggle */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-base font-semibold">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Master toggle for all email notifications
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationToggle('emailNotifications', checked)}
                    />
                  </div>

                  {!notifications.emailNotifications && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Email notifications are disabled. Enable the master toggle above to receive emails.
                      </p>
                    </div>
                  )}

                  <div className={notifications.emailNotifications ? '' : 'opacity-50 pointer-events-none'}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="project-updates">Project Updates</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified when project status changes
                        </p>
                      </div>
                      <Switch
                        id="project-updates"
                        checked={notifications.projectUpdates}
                        onCheckedChange={(checked) => handleNotificationToggle('projectUpdates', checked)}
                        disabled={!notifications.emailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="payment-reminders">Payment Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Payment confirmations and reminders
                        </p>
                      </div>
                      <Switch
                        id="payment-reminders"
                        checked={notifications.paymentReminders}
                        onCheckedChange={(checked) => handleNotificationToggle('paymentReminders', checked)}
                        disabled={!notifications.emailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="task-updates">Task Updates</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Notifications for task status changes
                        </p>
                      </div>
                      <Switch
                        id="task-updates"
                        checked={notifications.taskUpdates}
                        onCheckedChange={(checked) => handleNotificationToggle('taskUpdates', checked)}
                        disabled={!notifications.emailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="message-notifications">
                          <span className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Message Notifications
                          </span>
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified when you receive new messages
                        </p>
                      </div>
                      <Switch
                        id="message-notifications"
                        checked={notifications.messageNotifications}
                        onCheckedChange={(checked) => handleNotificationToggle('messageNotifications', checked)}
                        disabled={!notifications.emailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-emails">Marketing Emails</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive news, tips, and promotional content
                        </p>
                      </div>
                      <Switch
                        id="marketing-emails"
                        checked={notifications.marketingEmails}
                        onCheckedChange={(checked) => handleNotificationToggle('marketingEmails', checked)}
                        disabled={!notifications.emailNotifications}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveNotifications} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Google Account Security
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You&apos;re signed in with Google. Your account security is managed through
                  your Google account settings.
                </p>
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                >
                  Manage Google Account Security →
                </a>
              </div>

              <div className="pt-2">
                <h4 className="font-medium mb-2">Active Sessions</h4>
                <div className="border rounded-lg p-4 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {session?.user?.email}
                      </p>
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
