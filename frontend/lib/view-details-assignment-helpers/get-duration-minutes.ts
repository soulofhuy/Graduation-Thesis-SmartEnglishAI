type DurationRange = {
  startedAt?: string | null;
  submittedAt?: string | null;
};

export const getDurationMinutes = ({
  startedAt,
  submittedAt
}: DurationRange) => {
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
  return `${durationMinutes} phút`;
};
