import { useState, useEffect } from "react";
import type { Widget } from "../lib/constants";

const useWidgets = (currentUserEmail: string | null) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const addWidget = (newWidget: Widget) => {
    const newWidgets = [...widgets, newWidget];
    if (!currentUserEmail) {
      console.error("No user email found. Cannot save widgets.");
      return;
    }
    localStorage.setItem(currentUserEmail, JSON.stringify({ widgets: newWidgets }));
    setWidgets(newWidgets);
  };

  useEffect(() => {
    if (!currentUserEmail) {
      console.error("No user email found. Cannot load widgets.");
      return;
    }
    const storedWidgets = localStorage.getItem(currentUserEmail);
    if (storedWidgets) {
      const parsedWidgets = JSON.parse(storedWidgets);
      // Add logic of getting TheSys data here if needed
      setWidgets(parsedWidgets.widgets || []);
    }
  }, [currentUserEmail]);

  const resetWidgets = () => {
    setWidgets([]);
    if (currentUserEmail) {
      localStorage.setItem(currentUserEmail, JSON.stringify({ widgets: [] }));
    }
  };

  return {
    widgets,
    addWidget,
    resetWidgets,
  };
};

export default useWidgets;
