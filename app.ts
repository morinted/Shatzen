import { stat } from "fs";
import { Socket } from "socket.io";
import { addEstimate, claculateAverage, clearEstimates, estimates, removeUserEstimate } from "./estimates";
import { changeStatus, Status, appStatus } from "./status";
import { addUser, removeUser, users } from "./users";

const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Shatzen");
});

const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket: Socket) => {
  io.emit("estimates", estimates);
  io.emit("users", users);
  io.emit("status", appStatus);
  io.emit("reveal", claculateAverage());

  socket.on("add user", (name) => {
    addUser({ name: name, id: socket.id });
    io.emit("status", appStatus);
    io.emit("users", users);
    io.emit("estimates", estimates);
  });

  socket.on("remove", () => {
    removeUser(socket.id);
    removeUserEstimate(socket.id);
    io.emit("status", appStatus);
    io.emit("users", users);
    io.emit("estimates", estimates);
  });

  socket.on("add estimate", (estimate) => {
    addEstimate({ id: socket.id, estimate: estimate });
    io.emit("estimates", estimates);
  });

  socket.on("reveal", () => {
    changeStatus("revealing");
    console.log(appStatus);
    io.emit("reveal", claculateAverage());
    io.emit("status", appStatus);
  });

  socket.on("estimate", () => {
    changeStatus("estimating");
    clearEstimates();
    io.emit("estimates", estimates);
    io.emit("status", appStatus);
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnect", reason);
    removeUser(socket.id);
    removeUserEstimate(socket.id);
    io.emit("estimates", estimates);
    io.emit("users", users);
    io.emit("status", appStatus);
  });
});

server.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log("Server running on Port ", PORT);
});
