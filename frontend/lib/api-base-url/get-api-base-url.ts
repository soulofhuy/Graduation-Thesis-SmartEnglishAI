export const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return 'http://localhost:8000/api';
  }
  return baseUrl.replace(/\/+$/, '');
};
