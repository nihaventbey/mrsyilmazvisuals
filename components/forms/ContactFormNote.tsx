type ContactFormNoteProps = {
  note: string;
  instagramUrl?: string;
  whatsappUrl?: string | null;
};

/** Turns Instagram / WhatsApp words in CMS formNote into links when URLs exist. */
export function ContactFormNote({
  note,
  instagramUrl,
  whatsappUrl,
}: ContactFormNoteProps) {
  const parts = note.split(/(Instagram|WhatsApp)/gi);

  return (
    <p className="mt-2 text-sm text-mocha">
      {parts.map((part, index) => {
        const lower = part.toLowerCase();
        if (lower === "instagram" && instagramUrl) {
          return (
            <a
              key={`${part}-${index}`}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-espresso underline-offset-4 hover:underline"
            >
              {part}
            </a>
          );
        }
        if (lower === "whatsapp" && whatsappUrl) {
          return (
            <a
              key={`${part}-${index}`}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-espresso underline-offset-4 hover:underline"
            >
              {part}
            </a>
          );
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </p>
  );
}
