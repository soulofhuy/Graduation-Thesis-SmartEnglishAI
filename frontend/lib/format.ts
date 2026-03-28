export const dateFormat = (dateString: string) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const normalizeDateForApi = (value?: string) => {
  if (!value) {
    return '';
  }
  if (value.includes('T')) {
    return value.split('T')[0];
  }
  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return value;
};
