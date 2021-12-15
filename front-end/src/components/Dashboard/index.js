import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listReservations, listTables } from "../../utils/api";
import { previous, next, today } from "../../utils/date-time";
import useQuery from "../../utils/useQuery";
import ErrorAlert from "../ErrorAlert";
import ReservationsList from "../Dashboard/ReservationsList";
import TablesList from "../Dashboard/TablesList";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 *
 * The /dashboard page displays a list of all reservations & tables
 */

const Dashboard = ({ date }) => {
  const dateQuery = useQuery().get("date");
  if (dateQuery) {
    date = dateQuery;
  }

  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [dashboardError, setDashboardError] = useState([]);

  // Use hook to retrieve reservations data
  useEffect(() => {
    const abortController = new AbortController();

    async function loadDashboard() {
      try {
        setDashboardError([]);
        const reservationDate = await listReservations(
          { date },
          abortController.signal
        );
        setReservations(reservationDate);
      } catch (error) {
        setReservations([]);
        setDashboardError([error.message]);
      }
    }
    loadDashboard();
    return () => abortController.abort();
  }, [date]);

  // Use hook to retrieve tables data
  useEffect(() => {
    const abortController = new AbortController();

    async function loadTables() {
      try {
        setDashboardError([]);
        const tableList = await listTables(abortController.signal);
        setTables(tableList);
      } catch (error) {
        setTables([]);
        setDashboardError([error.message]);
      }
    }
    loadTables();
    return () => abortController.abort();
  }, []);

  return (
    <div>
      <h3 className="text-left font-weight-bold text-dark py-3">Dashboard</h3>
      <ErrorAlert error={dashboardError} />
      <div className="d-flex align-items-center py-3">
        <h3 className="mb-0 text-body mr-3">Reservations for {date}</h3>
        <div className="dates">
          <div className="d-flex flex-row bd-highlight">
            <div className="p-1 bd-highlight">
              <Link to={`/dashboard?date=${previous(date)}`}>
                <button type="button" className="btn btn-dark">
                  Prev
                </button>
              </Link>
            </div>

            <div className="p-1 bd-highlight">
              <Link to={`/dashboard?date=${today()}`}>
                <button type="button" className="btn btn-dark">
                  Today
                </button>
              </Link>
            </div>
            <div className="p-1 bd-highlight">
              <Link to={`/dashboard?date=${next(date)}`}>
                <button type="button" className="btn btn-dark">
                  Next
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ReservationsList reservations={reservations} />
      <div>
        <h3>Reservation Tables</h3>
        <TablesList tables={tables} />
      </div>
    </div>
  );
};

export default Dashboard;
