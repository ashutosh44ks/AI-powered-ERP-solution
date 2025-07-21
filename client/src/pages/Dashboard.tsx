import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import AddCard from "../components/AddCard";
import useCards from "../utils/useCards";
import Card from "../components/Card";
import { ThemeProvider } from "@thesysai/genui-sdk";
import { lightTheme } from "../utils/constants";

const Dashboard = () => {
  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem("currentUserEmail");
  const logout = () => {
    localStorage.removeItem("currentUserEmail");
    navigate("/");
  };
  useEffect(() => {
    if (!currentUserEmail) {
      navigate("/");
    }
  }, [currentUserEmail, navigate]);

  // actual work with cards
  const { cards, addCard, resetCards } = useCards(currentUserEmail);

  return (
    <div>
      <header className="p-4 bg-gray-200 flex justify-between items-center">
        <h1 className="text-lg font-medium">Dashboard | {currentUserEmail}</h1>
        <div className="flex gap-2">
          <button
            onClick={resetCards}
            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
          >
            Reset
          </button>
          <button
            onClick={logout}
            className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>
      <ThemeProvider mode="light" theme={lightTheme}>
        <main className="p-4 flex flex-wrap gap-4">
          <AddCard
            handleAddCardClick={(prompt) =>
              addCard({ id: Date.now().toString(), prompt })
            }
          />
          {cards.map((card) => (
            <Card key={card.id} id={card.id} prompt={card.prompt} />
          ))}
        </main>
      </ThemeProvider>
    </div>
  );
};

export default Dashboard;
