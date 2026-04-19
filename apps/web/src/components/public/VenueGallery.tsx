import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface VenueGalleryProps {
  images: string[];
  venueName: string;
}

export function VenueGallery({
  images,
  venueName,
}: VenueGalleryProps): React.JSX.Element {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <p className="text-sm text-tertiary-400">{t('venue_detail.no_images')}</p>
    );
  }

  function openAt(i: number): void {
    setIndex(i);
    setOpen(true);
  }

  const slides = images.map((src) => ({ src }));
  const remaining = images.length - 3;

  return (
    <>
      {images.length === 1 && (
        <div className="relative h-72 md:h-96">
          <img
            src={images[0]}
            alt={venueName}
            onClick={() => openAt(0)}
            className="h-full w-full cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-90"
          />
        </div>
      )}

      {images.length === 2 && (
        <div className="grid h-72 grid-cols-2 gap-2 md:h-96">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={venueName}
              onClick={() => openAt(i)}
              className="h-full w-full cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-90"
            />
          ))}
        </div>
      )}

      {images.length >= 3 && (
        <div className="grid h-72 grid-cols-3 grid-rows-2 gap-2 md:h-96">
          <img
            src={images[0]}
            alt={venueName}
            onClick={() => openAt(0)}
            className="col-span-2 row-span-2 h-full w-full cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-90"
          />
          <img
            src={images[1]}
            alt={venueName}
            onClick={() => openAt(1)}
            className="h-full w-full cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-90"
          />
          <div className="relative h-full w-full">
            <img
              src={images[2]}
              alt={venueName}
              onClick={() => openAt(2)}
              className="h-full w-full cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-90"
            />
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => openAt(2)}
                className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 text-sm font-medium text-white"
              >
                +{remaining}{' '}
                {t('venue_detail.photos_count', { count: images.length })}
              </button>
            )}
          </div>
        </div>
      )}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
      />
    </>
  );
}
