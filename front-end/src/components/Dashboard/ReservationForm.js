import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../ErrorAlert";
import {
  postReservation,
  readReservation,
  putReservation,
} from "../../utils/api";

// Form for reservations
const ReservationForm = ({ reservation_id }) => {
  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };
  const [form, setForm] = useState({ ...initialFormState });
  const [reservationsError, setReservationsError] = useState([]);

  const history = useHistory();

  // Use hook to load data to edit reservation
  useEffect(() => {
    const abortController = new AbortController();

    if (reservation_id) {
      async function loadReservation() {
        try {
          const reservation = await readReservation(
            reservation_id,
            abortController.status
          );
          const yyyymmdd = reservation.reservation_date.split("T")[0];

          setForm({ ...reservation, reservation_date: yyyymmdd });
        } catch (error) {
          setReservationsError([error.message]);
        }
      }
      loadReservation();
    }
    return () => abortController.abort();
  }, [reservation_id]);

  const handleChange = ({ target }) => {
    setForm({
      ...form,
      [target.name]: target.value,
    });
  };

  // Submit handler to create new reservations
  const handleSubmit = (event) => {
    event.preventDefault();
    const abortController = new AbortController();

    // Validation for date of reservation
    const date = new Date(`${form.reservation_date} PDT`);
    const reservation = date.getTime();
    const now = Date.now();

    if (date.getUTCDay() === 2 && reservation < now) {
      setReservationsError([
        "The restaurant is closed on Tuesday.",
        "Reservation must be in the future.",
      ]);
    } else if (date.getUTCDay() === 2) {
      setReservationsError(["The restaurant is closed on Tuesday."]);
    } else if (reservation < now) {
      setReservationsError(["Reservation must be in the future."]);
    } else {
      setReservationsError([]);
    }

    // Validation for time of reservation
    const open = 930;
    const close = 2230;
    const reservationTime = parseInt(
      form.reservation_time.substring(0, 2) + form.reservation_time.substring(3)
    );

    if (reservationTime > open && reservationTime < close) {
      setReservationsError([]);
    } else {
      setReservationsError([
        "Reservations are only allowed between 10:30am and 9:30pm.",
      ]);
    }

    // Create new reservation
    if (!reservation_id) {
      async function postData() {
        try {
          const formData = { ...form, people: parseInt(form.people) };

          await postReservation(formData, abortController.signal);
          history.push(`/dashboard?date=${formData.reservation_date}`);
        } catch (error) {
          setReservationsError([...reservationsError, error.message]);
        }
      }

      if (reservationsError.length === 0) {
        postData();
      }
    }

    // Edit existing reservation
    if (reservation_id) {
      async function putData() {
        try {
          setReservationsError([]);
          await putReservation(form, abortController.signal);
          history.push(`/dashboard?date=${form.reservation_date}`);
        } catch (error) {
          setReservationsError([...reservationsError, error.message]);
        }
      }

      if (reservationsError.length === 0) {
        putData();
      }
    }
  };
  return (
    <>
      <ErrorAlert error={reservationsError} />
      <form className="w-50" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first_name">First name</label>
          <input
            className="form-control"
            type="text"
            name="first_name"
            id="first_name"
            placeholder="First Name"
            onChange={handleChange}
            required="required"
            value={form.first_name}
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last name</label>
          <input
            className="form-control"
            type="text"
            name="last_name"
            id="last_name"
            placeholder="Last Name"
            onChange={handleChange}
            required="required"
            value={form.last_name}
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile_number">Mobile number</label>
          <input
            className="form-control"
            type="text"
            name="mobile_number"
            id="mobile_number"
            placeholder="555-555-5555"
            onChange={handleChange}
            required="required"
            value={form.mobile_number}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reservation_date">Date of reservation</label>
          <input
            className="form-control"
            type="date"
            name="reservation_date"
            id="reservation_date"
            onChange={handleChange}
            required="required"
            value={form.reservation_date}
          />
        </div>
        <div className="form-group">
          <label htmlFor="reservation_time">Time of reservation</label>
          <input
            className="form-control"
            type="time"
            name="reservation_time"
            id="reservation_time"
            onChange={handleChange}
            required="required"
            value={form.reservation_time}
          />
        </div>
        <div className="form-group">
          <label htmlFor="people">Party size</label>
          <input
            className="form-control"
            type="number"
            name="people"
            id="people"
            onChange={handleChange}
            required="required"
            value={form.people}
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

export default ReservationForm;
