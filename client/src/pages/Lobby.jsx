import { useCallback, useState } from "react";
import { useSocket } from "../contexts/SocketProvider";

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  console.log(socket);
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
      console.log("Email: ", email);
      console.log("Room: ", room);
    },
    [email, room, socket]
  );
  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email </label>
        <input
          type="text"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <br />
        <label htmlFor="room">Room </label>
        <input
          type="text"
          name="room"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <br />
        <button type="submit">Join</button>
      </form>
    </div>
  );
};

export default Lobby;
