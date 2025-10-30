import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DataTable } from "@/components/ui/data-table";
import { formatBackendColumnDefToFrontend } from "@/lib/utils";
import dataModels from "@/services/dataModels";
import { IconAlertCircle } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

const TabularInteraction = () => {
  const { tableName } = useParams();
  const {
    data: tableConfig,
    error: tableConfigError,
    isError: tableConfigHasError,
  } = useQuery({
    queryKey: ["tableConfig", tableName],
    queryFn: () => dataModels.getTableConfig(tableName),
    enabled: !!tableName,
    staleTime: Infinity,
    select: formatBackendColumnDefToFrontend,
  });
  const { data: dbTables } = useQuery({
    queryKey: ["dbTables"],
    queryFn: dataModels.getDBTables,
    staleTime: Infinity,
  });
  const tableLabel = useMemo(() => {
    const table = (dbTables?.data || []).find((t) => t.value === tableName);
    return table?.label || tableName;
  }, [dbTables, tableName]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data: tableData } = useQuery({
    queryKey: ["tableData", tableName, pagination.pageIndex],
    queryFn: () => dataModels.getTableData(tableName, pagination.pageIndex),
    enabled: !!tableName,
    placeholderData: keepPreviousData,
  });
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [tableName]);

  if (!tableName)
    return (
      <h3 className="text-xl mb-4">
        Error fetching details for: "{tableLabel}"
      </h3>
    );
  return (
    <div>
      <h3 className="text-xl mb-4">Now Showing: "{tableLabel}"</h3>
      {tableConfigHasError && (
        <Alert variant="destructive">
          <IconAlertCircle />
          <AlertTitle>Failed to fetch table configuration</AlertTitle>
          <AlertDescription>{tableConfigError.message}</AlertDescription>
        </Alert>
      )}
      {tableConfig?.data && tableData?.data && (
        <DataTable
          columns={tableConfig.data}
          data={tableData.data?.content}
          pagination={pagination}
          setPagination={setPagination}
          rowCount={tableData.data?.totalElements}
        />
      )}
    </div>
  );
};

export default TabularInteraction;
