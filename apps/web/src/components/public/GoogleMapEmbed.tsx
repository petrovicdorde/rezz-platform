interface GoogleMapEmbedProps {
  address: string;
  venueName: string;
}

export function GoogleMapEmbed({
  address,
  venueName,
}: GoogleMapEmbedProps): React.JSX.Element {
  const query = encodeURIComponent(`${venueName}, ${address}`);
  const src = `https://maps.google.com/maps?q=${query}&output=embed&z=15`;

  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border border-tertiary-200 md:h-80">
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={venueName}
      />
    </div>
  );
}
