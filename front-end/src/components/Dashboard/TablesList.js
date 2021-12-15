import React from "react";
import TableDetails from "../Dashboard/TablesDetails";

// Displays list of tables and details
const TablesList = ({ tables }) => {
  const list = tables.map((table) => {
    return (
      <TableDetails
        key={table.table_id}
        table={table}
        table_id={table.table_id}
        table_name={table.table_name}
        capacity={table.capacity}
      />
    );
  });

  return <div className="d-flex flex-wrap">{list}</div>;
};

export default TablesList;
