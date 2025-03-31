"use client"
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Page = () => {
  const [pendingCards, setPendingCards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchPendingCards = async () => {
      if (!userId) return;
      try {
        // Fetch from card_view
        const cardViewRef = collection(db, "users", userId, "card_view");
        const cardViewSnapshot = await getDocs(cardViewRef);
        const cardViewCards = cardViewSnapshot.docs.map((doc) => ({
          id: doc.id,
          userId,
          cardImage: doc.data().cardImageBase64,
          source: "card_view",
        }));

        // Fetch from card_web
        const cardWebRef = collection(db, "users", userId, "card_web");
        const cardWebSnapshot = await getDocs(cardWebRef);
        const cardWebCards = cardWebSnapshot.docs.map((doc) => ({
          id: doc.id,
          userId,
          cardImage: doc.data().canvasData,
          source: "card_web",
        }));

        // Combine both collections
        const allCards = [...cardViewCards, ...cardWebCards];

        setPendingCards(allCards);
      } catch (error) {
        console.error("Error fetching pending cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCards();
  }, [userId]);

  const handleViewCard = (cardImage: string) => {
    const imageWindow = window.open();
    if (imageWindow) {
      imageWindow.document.write(`
        <html>
          <head>
            <title>Card Preview</title>
          </head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <img src="${cardImage}" alt="Edited Card" style="max-width: 100%; height: auto;" />
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold">⏳ Pending Card Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {pendingCards.length > 0 ? (
            pendingCards.map((card, index) => (
              <div key={index} className="flex flex-col items-center p-4 border rounded-lg">
                <img
                  src={card.cardImage}
                  alt={`Card from ${card.source}`}
                  className="w-40 h-40 object-cover"
                />
                <p className="mt-2 font-semibold">Source: {card.source}</p>
                <button
                  onClick={() => handleViewCard(card.cardImage)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-2"
                >
                  View Edited Card
                </button>
              </div>
            ))
          ) : (
            <p>No pending cards found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
