import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../ErrorAlert";
import { finishTable } from "../../utils/api";

// Displays tables info with call-to-action btn (finish)
const TableDetails = ({ table, table_name, capacity }) => {
  const [finishError, setFinishError] = useState([]);

  const history = useHistory();

  // Handles finish btn on table details
  const finishHandler = (e) => {
    e.preventDefault();
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      const abortController = new AbortController();

      async function finish() {
        try {
          await finishTable(table.table_id, abortController.signal);
          history.go(0);
        } catch (error) {
          setFinishError([...finishError, error.message]);
        }
      }
      if (finishError.length === 0) {
        finish();
      }
    }
  };

  const status = table.occupied ? "Occupied" : "Free";

  return (
    <div className="card my-3 mr-3 w-25">
      <ErrorAlert error={finishError} />
      <h5 className="card-header">Table {table_name}</h5>
      <div className="card-body">
        <p>Capacity: {capacity}</p>
        <p data-table-id-status={table.table_id}>Status: {status}</p>
        {status === "Free" ? null : (
          <button
            data-table-id-finish={table.table_id}
            className="btn btn-dark"
            type="button"
            onClick={finishHandler}
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};

export default TableDetails;
