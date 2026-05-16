import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings, AppSettings } from '../services/api';

interface SettingsContextType {
  settings: AppSettings | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(() => {
    const cached = localStorage.getItem('app_settings_cache');
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState(!settings);

  const fetchSettings = async () => {
    // Only set loading if we don't have cached data
    if (!settings) {
      setIsLoading(true);
    }
    
    try {
      const data = await getSettings();
      setSettings(data);
      localStorage.setItem('app_settings_cache', JSON.stringify(data));
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
