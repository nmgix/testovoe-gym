import { useState } from "react";

export const useRateCards = () => {
  const [selectedCardId, selectCardId] = useState<string | null>(null);
  const selectCard = (id: string) =>
    selectCardId(prevId => {
      return id === prevId ? null : id;
    });

  return { selectedCardId, selectCard };
};
