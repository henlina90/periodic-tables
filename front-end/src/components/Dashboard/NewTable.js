import React from "react";
import TableForm from "../Dashboard/TableForm";

// Displays form to create new tables
const NewTable = () => {
  return (
    <section>
      <div>
        <h3 className="text-left font-weight-bold text-dark py-3">
          Create New Table
        </h3>
      </div>
      <TableForm />
    </section>
  );
};

export default NewTable;
