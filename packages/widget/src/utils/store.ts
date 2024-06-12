export const createStore = <T>(key: string) => {
  const setStorageItems = (items: Partial<T>) => {
    const prev = getStorage();

    localStorage.setItem(key, JSON.stringify({ ...prev, ...items }));
  };

  const getStorage = (): T => {
    if (typeof localStorage === 'undefined') {
      return {} as T;
    }

    try {
      return JSON.parse(localStorage.getItem(key) || '{}') as T;
    } catch (_) {
      return {} as T;
    }
  };

  return {
    setStorageItems,
    getStorage
  };
};
