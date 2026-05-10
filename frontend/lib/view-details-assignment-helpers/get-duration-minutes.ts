type DurationRange = {
  startedAt?: string | null;
  submittedAt?: string | null;
};

type Language = 'vi' | 'en';

export const getDurationMinutes = ({
  startedAt,
  submittedAt,
  language = 'vi'
}: DurationRange & {
  language?: Language;
}) => {
  if (!startedAt || !submittedAt) {
    return '-';
  }

  const startedAtMs = new Date(startedAt).getTime();
  const submittedAtMs = new Date(submittedAt).getTime();

  if (Number.isNaN(startedAtMs) || Number.isNaN(submittedAtMs)) {
    return '-';
  }

  const durationMinutes = Math.max(
    0,
    Math.round((submittedAtMs - startedAtMs) / 60000)
  );

  const minuteLabel =
    language === 'vi' ? 'phút' : durationMinutes === 1 ? 'minute' : 'minutes';

  return `${durationMinutes} ${minuteLabel}`;
};
