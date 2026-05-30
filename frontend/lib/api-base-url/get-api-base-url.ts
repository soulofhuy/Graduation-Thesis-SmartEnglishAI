export const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return 'http://localhost:8000/api';
  }
  return baseUrl.replace(/\/+$/, '');
};

export const getTextToSqlApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_ANALYSIS_BASE_URL;
  if (!baseUrl) {
    return 'http://localhost:5000/api';
  }
  return baseUrl.replace(/\/+$/, '');
};
