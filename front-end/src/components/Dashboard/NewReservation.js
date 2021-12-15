import React from "react";
import ReservationForm from "../Dashboard/ReservationForm";

// Displays form to create new reservations
const NewReservation = () => {
  return (
    <section>
      <div>
        <h3 className="text-left font-weight-bold text-dark py-3">
          Create New Reservation
        </h3>
      </div>
      <ReservationForm />
    </section>
  );
};

export default NewReservation;
