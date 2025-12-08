import { ApiResponse } from '../types';

export const createResponse = <T>(
  data: T,
  message: string = 'Success',
  status: number = 200
): Response => {
  const responseBody: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const createErrorResponse = (
  error: string,
  status: number = 500
): Response => {
  const responseBody: ApiResponse<null> = {
    success: false,
    error,
  };
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export const calculateReadingTime = (content: string): number => {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const createSlug = (title: string | undefined | null): string => {
  if (!title) return `post-${Date.now()}`;
  return String(title)
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/gi, '') // Keep Persian chars
    .replace(/\s+/g, '-');
};

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};