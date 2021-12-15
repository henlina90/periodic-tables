const service = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const asyncError = require("../errors/asyncErrorBoundary");

// Use middleware to check if tables exist by id
const tableExists = async (req, res, next) => {
  const { table_id } = req.params;
  const data = await service.read(table_id);

  if (!data)
    return next({ status: 404, message: `Table ID: ${table_id} Not Found` });
  else {
    res.locals.table = data;
    next();
  }
};

// Validation for new tables
const validateNewTable = async (req, res, next) => {
  if (!req.body.data) return next({ status: 400, message: "Data is missing" });

  const { table_name, capacity, reservation_id } = req.body.data;

  if (!table_name || table_name === "" || table_name.length === 1)
    return next({
      status: 400,
      message:
        "table_name is missing or is empty or is not more than 1 character",
    });

  if (!capacity || capacity === 0 || typeof capacity !== "number")
    return next({
      status: 400,
      message:
        "capacity must be greater than or equal to 1 and must be a number",
    });

  res.locals.newTable = { table_name, capacity };

  if (reservation_id) {
    res.locals.newTable.reservation_id = reservation_id;
    res.locals.newTable.occupied = true;
  }

  next();
};

// Validation for table seating by reservation id
const validateUpdate = async (req, res, next) => {
  if (!req.body.data) return next({ status: 400, message: "Data is missing" });

  const { reservation_id } = req.body.data;
  if (!reservation_id)
    return next({
      status: 400,
      message: "reservation_id and/or table_id are missing",
    });

  const reservation = await reservationService.read(reservation_id);
  if (!reservation)
    return next({ status: 404, message: `${reservation_id} does not exist` });

  if (reservation.status === "seated")
    return next({ status: 400, message: "Reservation is already seated" });

  res.locals.reservation = reservation;
  next();
};

// Validation for table capacity
const validateCapacity = async (req, res, next) => {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  const reservation = res.locals.reservation;

  if (table.capacity < reservation.people)
    return next({
      status: 400,
      message: `${table.table_name} does not have the capacity to seat ${reservation.people} people.`,
    });

  if (table.occupied)
    return next({
      status: 400,
      message: `${table.table_name} is currently occupied.`,
    });

  next();
};

// GET req to retrieve list of existing tables
const list = async (req, res) => {
  const data = await service.list();

  res.json({
    data: data,
  });
};

// GET req to retrieve a table
async function read(req, res) {
  res.json({
    data: res.locals.table,
  });
}

// POST req to create new tables
async function create(req, res) {
  const data = await service.create(res.locals.newTable);

  res.status(201).json({
    data: data[0],
  });
}

// PUT req to update existing table
async function update(req, res) {
  const data = await service.update(
    req.params.table_id,
    res.locals.reservation.reservation_id
  );
  await reservationService.updateStatus(
    res.locals.reservation.reservation_id,
    "seated"
  );

  res.status(200).json({
    data: data,
  });
}

// DELETE req to destroy specified table
async function destroy(req, res, next) {
  const table = await service.read(req.params.table_id);

  if (!table.occupied)
    return next({ status: 400, message: `${table.table_name} not occupied.` });

  const data = await service.destroy(table.table_id);
  await reservationService.updateStatus(table.reservation_id, "finished");

  res.status(200).json({
    data: data,
  });
}

module.exports = {
  list: [asyncError(list)],
  read: [asyncError(tableExists), asyncError(read)],
  create: [asyncError(validateNewTable), asyncError(create)],
  update: [
    asyncError(validateUpdate),
    asyncError(validateCapacity),
    asyncError(update),
  ],
  delete: [asyncError(tableExists), asyncError(destroy)],
};
