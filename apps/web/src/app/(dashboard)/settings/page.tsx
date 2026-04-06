'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MyAccountTab } from '@/features/settings/my-account-tab';
import { NotificationsTab } from '@/features/settings/notifications-tab';
import { ApiKeysTab } from '@/features/settings/api-keys-tab';
import { BillingTab } from '@/features/settings/billing-tab';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Tabs defaultValue="account" className="mt-4">
        <TabsList variant="line">
          <TabsTrigger value="account">My account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api-keys">API keys</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <MyAccountTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="api-keys">
          <ApiKeysTab />
        </TabsContent>
        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
