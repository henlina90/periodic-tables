import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import NewReservation from "../components/Dashboard/NewReservation";
import NewTable from "../components/Dashboard/NewTable";
import Search from "../components/Dashboard/Search";
import Dashboard from "../components/Dashboard";
import EditReservation from "../components/Dashboard/EditReservation";
import SeatReservation from "../components/Dashboard/SeatReservation";
import NotFound from "../components/NotFound";
import { today } from "../utils/date-time";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */

function Routes() {
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={today()} />
      </Route>
      <Route path="/reservations/new">
        <NewReservation />
      </Route>
      <Route path="/reservations/:reservation_id/edit">
        <EditReservation />
      </Route>
      <Route path="/reservations/:reservation_id/seat">
        <SeatReservation />
      </Route>
      <Route path="/tables/new">
        <NewTable />
      </Route>
      <Route path="/search">
        <Search />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
