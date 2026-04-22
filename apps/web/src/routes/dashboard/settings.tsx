import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SettingsTabContent } from '@/components/settings/SettingsTabContent';
import { requireRole } from '@/lib/route-guards';

export const Route = createFileRoute('/dashboard/settings')({
  beforeLoad: () => requireRole(['SUPER_ADMIN']),
  component: SettingsPage,
});

function SettingsPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-secondary-600">
        {t('settings.title')}
      </h1>

      <Tabs defaultValue="cities" className="mt-6">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="cities" className="flex-1 md:flex-none data-[state=active]:bg-primary-400 data-[state=active]:text-white data-[state=active]:shadow-sm">
            {t('settings.tab_cities')}
          </TabsTrigger>
          <TabsTrigger value="venue_types" className="flex-1 md:flex-none data-[state=active]:bg-primary-400 data-[state=active]:text-white data-[state=active]:shadow-sm">
            {t('settings.tab_venue_types')}
          </TabsTrigger>
          <TabsTrigger value="table_types" className="flex-1 md:flex-none data-[state=active]:bg-primary-400 data-[state=active]:text-white data-[state=active]:shadow-sm">
            {t('settings.tab_table_types')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cities" className="mt-6">
          <SettingsTabContent
            type="CITY"
            addLabel={t('settings.add_city')}
          />
        </TabsContent>

        <TabsContent value="venue_types" className="mt-6">
          <SettingsTabContent
            type="VENUE_TYPE"
            addLabel={t('settings.add_venue_type')}
          />
        </TabsContent>

        <TabsContent value="table_types" className="mt-6">
          <SettingsTabContent
            type="TABLE_TYPE"
            addLabel={t('settings.add_table_type')}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
