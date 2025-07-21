import { useState, useEffect } from "react";
import type { Card } from "./constants";

const useCards = (currentUserEmail: string | null) => {
  const [cards, setCards] = useState<Card[]>([]);

  const addCard = (newCard: Card) => {
    const newCards = [...cards, newCard];
    if (!currentUserEmail) {
      console.error("No user email found. Cannot save cards.");
      return;
    }
    localStorage.setItem(currentUserEmail, JSON.stringify({ cards: newCards }));
    setCards(newCards);
  };

  useEffect(() => {
    if (!currentUserEmail) {
      console.error("No user email found. Cannot load cards.");
      return;
    }
    const storedCards = localStorage.getItem(currentUserEmail);
    if (storedCards) {
      const parsedCards = JSON.parse(storedCards);
      // Add logic of getting TheSys data here if needed
      setCards(parsedCards.cards || []);
    }
  }, [currentUserEmail]);

  const resetCards = () => {
    setCards([]);
    if (currentUserEmail) {
      localStorage.setItem(currentUserEmail, JSON.stringify({ cards: [] }));
    }
  };

  return {
    cards,
    addCard,
    resetCards,
  };
};

export default useCards;
