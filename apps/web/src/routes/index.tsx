import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-tertiary-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-secondary-600">
          {t('home.hero_title')}
        </h1>
        <p className="mt-4 text-tertiary-600">
          {t('home.hero_subtitle')}
        </p>
      </div>
    </section>
  );
}
