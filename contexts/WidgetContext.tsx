
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WidgetContextType {
  widgets: string[];
  addWidget: (widget: string) => void;
  removeWidget: (widget: string) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function useWidgets() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
}

interface WidgetProviderProps {
  children: ReactNode;
}

export function WidgetProvider({ children }: WidgetProviderProps) {
  const [widgets, setWidgets] = useState<string[]>([]);

  const addWidget = (widget: string) => {
    setWidgets((prev) => [...prev, widget]);
  };

  const removeWidget = (widget: string) => {
    setWidgets((prev) => prev.filter((w) => w !== widget));
  };

  return (
    <WidgetContext.Provider value={{ widgets, addWidget, removeWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}
