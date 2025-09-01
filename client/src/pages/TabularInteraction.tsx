import { useParams } from "react-router";

const TabularInteraction = () => {
  const { tableName } = useParams();
  if (!tableName) return null;
  return <div>
    <h3 className="text-xl mb-4">Now Showing: "{tableName}"</h3>
    
  </div>;
};

export default TabularInteraction;
