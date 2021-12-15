const service = require("./reservations.service");
const asyncError = require("../errors/asyncErrorBoundary");

// Use middleware to check if reservations exist by id
const reservationExists = async (req, res, next) => {
  const { reservation_id } = req.params;
  const data = await service.read(reservation_id);

  if (!data)
    return next({
      status: 404,
      message: `Reservation ID: ${reservation_id} Not Found`,
    });
  else {
    res.locals.reservation = data;
    next();
  }
};

//  Validation for new reservation
const newReservationIsValid = async (req, res, next) => {
  const {
    data: {
      first_name,
      last_name,
      mobile_number,
      people,
      reservation_date,
      reservation_time,
      status,
    } = {},
  } = req.body;

  if (!req.body.data) {
    return next({ status: 400, message: "Data is missing" });
  }

  if (!first_name) {
    return next({ status: 400, message: "first_name is missing" });
  }

  if (!last_name) {
    return next({ status: 400, message: "last_name is missing" });
  }

  if (!mobile_number) {
    return next({ status: 400, message: "mobile_number" });
  }

  if (!people || typeof people !== "number") {
    return next({
      status: 400,
      message: "people is missing or is not a number",
    });
  }

  if (!reservation_date) {
    return next({
      status: 400,
      message: "reservation_time is missing",
    });
  }

  if (!reservation_time) {
    return next({
      status: 400,
      message: "Be sure to include reservation_time",
    });
  }

  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/)) {
    return next({ status: 400, message: "reservation_date is invalid!" });
  }

  if (!reservation_time.match(/\d{2}:\d{2}/)) {
    return next({ status: 400, message: "reservation_time is invalid!" });
  }

  if (status === "seated") {
    return next({ status: 400, message: "reservation status is seated" });
  }

  if (status === "finished") {
    return next({ status: 400, message: "reservation status is finished" });
  }

  res.locals.reservation = {
    first_name,
    last_name,
    mobile_number,
    people,
    reservation_date,
    reservation_time,
  };
  next();
};

// Validation for business operation hours
const dateValidator = async (req, res, next) => {
  const date = new Date(res.locals.reservation.reservation_date);
  const reservationTime = new Date(
    `${res.locals.reservation.reservation_date} ${res.locals.reservation.reservation_time}`
  ).getTime();
  const currentTime = new Date().getTime();
  if (date.getUTCDay() === 2)
    return next({
      status: 400,
      message:
        "The reservation date is a Tuesday and the restaurant is closed on Tuesdays.",
    });

  if (reservationTime < currentTime)
    return next({
      status: 400,
      message:
        "The reservation date/time is in the past. Only future reservations are allowed.",
    });

  next();
};

// Checks if time is valid
const timelineValidator = async (req, res, next) => {
  const time = res.locals.reservation.reservation_time;
  let hour = time[0] + time[1];
  let minutes = time[3] + time[4];
  hour = Number(hour);
  minutes = Number(minutes);

  const currentTime = req.body.data.current_time;
  const date = new Date(res.locals.reservation.reservation_date);
  const currentDate = new Date();

  if (
    currentTime > time &&
    date.toUTCString().slice(0, 16) === currentDate.toUTCString().slice(0, 16)
  )
    return next({ status: 400, message: "Time has already passed!" });

  if (hour < 10 || (hour <= 10 && minutes < 30))
    return next({ status: 400, message: "We're not open yet" });

  if (hour > 21 || (hour >= 21 && minutes > 30))
    return next({
      status: 400,
      message: "Too close to closing time or closed!",
    });

  next();
};

// Validates reservations status
const validateStatusUpdate = async (req, res, next) => {
  const currentStatus = res.locals.reservation.status;
  const { status } = req.body.data;

  if (currentStatus === "finished")
    return next({
      status: 400,
      message: "a finished reservation cannot be updated",
    });

  if (status === "cancelled") return next();

  if (status !== "booked" && status !== "seated" && status !== "finished")
    return next({ status: 400, message: "Can not update unknown status" });

  next();
};

// Validation for reservation update
const validateUpdate = async (req, res, next) => {
  if (!req.body.data) return next({ status: 400, message: "Data Missing!" });

  const {
    first_name,
    last_name,
    mobile_number,
    people,
    reservation_date,
    reservation_time,
  } = req.body.data;

  if (!reservation_date)
    return next({
      status: 400,
      message: "Be sure to include reservation_date",
    });

  if (!reservation_time)
    return next({
      status: 400,
      message: "Be sure to include reservation_time",
    });

  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/))
    return next({ status: 400, message: "reservation_date is invalid!" });

  if (!reservation_time.match(/\d{2}:\d{2}/))
    return next({ status: 400, message: "reservation_time is invalid!" });

  res.locals.reservation = {
    first_name,
    last_name,
    mobile_number,
    people,
    reservation_date,
    reservation_time,
  };

  next();
};

// GET req to retrieve list of existing reservations
const list = async (req, res) => {
  const { date, mobile_number } = req.query;

  if (date) {
    const data = await service.list(date);

    res.json({
      data: data,
    });
    return;
  }

  if (mobile_number) {
    const data = await service.listByMobileNumber(mobile_number);

    res.json({
      data: data,
    });

    return;
  } else {
    res.json({
      data: [],
    });
  }
};

// GET req to retrieve a reservation
const read = async (req, res) => {
  res.status(200).json({
    data: res.locals.reservation,
  });
};

// POST req to create new reservations
const create = async (req, res) => {
  const data = await service.create(res.locals.reservation);

  res.status(201).json({
    data: data[0],
  });
};

// PUT req to update reservation status
const updateStatus = async (req, res) => {
  const { reservation_id } = req.params;
  const status = req.body.data.status;
  const data = await service.updateStatus(reservation_id, status);

  res.status(200).json({
    data: { status: data[0] },
  });
};

// PUT req to update reservation properties
const update = async (req, res) => {
  const { reservation_id } = req.params;
  const data = await service.update(reservation_id, res.locals.reservation);
  res.status(200).json({
    data: data[0],
  });
};

module.exports = {
  list: [asyncError(list)],
  read: [asyncError(reservationExists), asyncError(read)],
  create: [
    asyncError(newReservationIsValid),
    asyncError(dateValidator),
    asyncError(timelineValidator),
    asyncError(create),
  ],
  updateStatus: [
    asyncError(reservationExists),
    asyncError(validateStatusUpdate),
    asyncError(updateStatus),
  ],
  update: [
    asyncError(newReservationIsValid),
    asyncError(reservationExists),
    asyncError(validateUpdate),
    asyncError(dateValidator),
    asyncError(timelineValidator),
    asyncError(update),
  ],
};
