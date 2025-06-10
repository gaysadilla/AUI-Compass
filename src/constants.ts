export const MESSAGE_TYPES = {
  READY: 'ready',
  INIT: 'init',
  SEARCH: 'search',
  SEARCH_COMPLETE: 'search-complete',
  ERROR: 'error',
  CANCEL: 'cancel',
  MIGRATE: 'migrate'  // New message type for migration
} as const; 