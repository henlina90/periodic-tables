import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../ErrorAlert";
import { postTable } from "../../utils/api";

// Create new table form with action btns (submit, cancel)
const TableForm = () => {
  const initialFormState = {
    table_name: "",
    capacity: "",
  };

  const [form, setForm] = useState({ ...initialFormState });
  const [reservationsError, setReservationsError] = useState([]);

  const history = useHistory();

  // Handles change on new table form
  const handleChange = ({ target }) => {
    let name = target.name;
    let value = target.value;

    if (name === "table_name") {
      if (value.length < 2) {
        setReservationsError([
          "Table Name must be at least 2 characters long.",
        ]);
      } else {
        setReservationsError([]);
      }
    }

    if (name === "capacity") {
      if (isNaN(value)) {
        setReservationsError(["Capacity must be a number."]);
      } else if (value < 1) {
        setReservationsError(["Capacity must be at least 1."]);
      } else {
        setReservationsError([]);
      }
    }

    setForm({
      ...form,
      [target.name]: target.value,
    });
  };

  const abortController = new AbortController();

  // Handles submission for new table form
  const handleSubmit = (e) => {
    e.preventDefault();

    async function postData() {
      try {
        const formData = { ...form, capacity: parseInt(form.capacity) };
        await postTable(formData, abortController.signal);
        history.push(`/dashboard`);
      } catch (error) {
        setReservationsError([...reservationsError, error.message]);
      }
    }

    if (reservationsError.length === 0) {
      postData();
    }
  };

  return (
    <>
      <ErrorAlert error={reservationsError} />
      <form className="w-50" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="table_name">Table name</label>
          <input
            className="form-control"
            type="text"
            name="table_name"
            id="table_name"
            onChange={handleChange}
            required="required"
            value={form.table_name}
          />
        </div>
        <div className="form-group">
          <label htmlFor="capacity">Capacity</label>
          <input
            className="form-control"
            type="number"
            name="capacity"
            id="capacity"
            onChange={handleChange}
            required="required"
            value={form.capacity}
          />
        </div>
        <button className="btn btn-dark" type="submit">
          Submit
        </button>
        <button
          className="btn btn-dark mx-2"
          type="button"
          onClick={() => history.goBack()}
        >
          Cancel
        </button>
      </form>
    </>
  );
};

export default TableForm;
