import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/ui/data-table";
import dataModels from "@/services/dataModels";
import { IconAlertCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

const TabularInteraction = () => {
  const { tableName } = useParams();
  const { data: tableData } = useQuery({
    queryKey: ["tableData", tableName],
    queryFn: () => dataModels.getTableData(tableName),
    enabled: !!tableName,
  });
  const { data: tableConfig, error: tableConfigError, isError: tableConfigHasError } = useQuery({
    queryKey: ["tableConfig", tableName],
    queryFn: () => dataModels.getTableConfig(tableName),
    enabled: !!tableName,
    staleTime: Infinity,
  });
  if (!tableName)
    return (
      <h3 className="text-xl mb-4">
        Error fetching details for: "{tableName}"
      </h3>
    );
  return (
    <div>
      <h3 className="text-xl mb-4">Now Showing: "{tableName}"</h3>
      {tableConfigHasError && (
        <Alert variant="destructive">
          <IconAlertCircle />
          <AlertTitle>Failed to fetch table configuration</AlertTitle>
          <AlertDescription>{tableConfigError.message}</AlertDescription>
        </Alert>
      )}
      {tableConfig?.data && tableData?.data && (
        <DataTable columns={tableConfig.data} data={tableData.data} />
      )}
    </div>
  );
};

export default TabularInteraction;
