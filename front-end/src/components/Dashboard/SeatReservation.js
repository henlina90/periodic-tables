import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../ErrorAlert";
import { readReservation, listTables, seatTable } from "../../utils/api";
import ReservationDetails from "../Dashboard/ReservationDetails";

// Displays form to assign reservation to table
const SeatReservation = () => {
  const initialFormState = {
    table_id: "",
  };

  const [form, setForm] = useState({ ...initialFormState });
  const [reservation, setReservation] = useState({});
  const [tables, setTables] = useState([]);
  const [seatError, setSeatError] = useState([]);

  const history = useHistory();
  const { reservation_id } = useParams();

  // Use hook to retrieve data
  useEffect(() => {
    const abortController = new AbortController();

    async function loadData() {
      try {
        const reservationResponse = await readReservation(
          reservation_id,
          abortController.signal
        );
        const tablesResponse = await listTables(abortController.signal);
        const freeTables = tablesResponse.filter((table) => {
          return !table.reservation_id;
        });

        setReservation(reservationResponse);
        setTables(freeTables);
      } catch (error) {
        setSeatError([error.message]);
      }
    }
    loadData();
    return () => abortController.abort();
  }, [reservation_id]);

  // Handles change on form to seat reservations
  const handleChange = ({ target }) => {
    const selectedTable = tables.find(
      (table) => table.table_id === parseInt(target.value)
    );

    if (selectedTable && selectedTable.capacity < reservation.people) {
      setSeatError(["Reservation party size will not fit at selected table."]);
    } else if (!selectedTable) {
      setSeatError(["Please select a table."]);
    } else {
      setSeatError([]);
    }

    setForm({
      ...form,
      [target.name]: target.value,
    });
  };

  // Handles submission on form to seat reservation
  const handleSubmit = (event) => {
    event.preventDefault();
    const abortController = new AbortController();

    async function seatReservation() {
      try {
        await seatTable(form, reservation_id, abortController.signal);
        history.push("/dashboard");
      } catch (error) {
        setSeatError([...seatError, error.message]);
      }
    }

    if (seatError.length === 0) {
      seatReservation();
    }
  };

  return (
    <div className="py-3">
      <ErrorAlert error={seatError} />
      <ReservationDetails
        reservation_id={reservation.reservation_id}
        first_name={reservation.first_name}
        last_name={reservation.last_name}
        mobile_number={reservation.mobile_number}
        reservation_time={reservation.reservation_time}
        people={reservation.people}
        status={reservation.status}
      />
      <h3>Seat</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="table_id">
            Table Number
            <select
              className="form-control"
              id="table_id"
              name="table_id"
              onChange={handleChange}
              value={form.table_id}
            >
              <option value="">Select a Table</option>
              {tables.map((table) => (
                <option key={table.table_id} value={table.table_id}>
                  {table.table_name} - {table.capacity}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="btn btn-dark" type="submit">
          Submit
        </button>
        <button
          className="btn btn-dark ml-2"
          type="button"
          onClick={() => history.goBack()}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default SeatReservation;
