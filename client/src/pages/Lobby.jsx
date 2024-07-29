import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketProvider";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

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

  const handleJoin = useCallback(
    (data) => {
      const { email, room } = data;
      console.log(email, room);
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoin);
    return () => {
      socket.off("room:join");
    };
  }, [socket, handleJoin]);
  return (
    <div className="flex fixed justify-center items-center min-h-screen min-w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800 text-white bg-blue-500">
      <div className="bg-black bg-opacity-10 p-4 m-4 py-4 flex flex-col w-1/3 ">
        <h1 className="font-semibold text-5xl my-4">Lobby</h1>
        <form onSubmit={onSubmit}>
          <label
            htmlFor="email"
            className="font-semibold text-md italic sr-only"
          >
            Email{" "}
          </label>
          <input
            type="text"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-sm text-gray-500 p-1 px-2 w-full "
            placeholder="Email"
          />
          <br />
          <br />
          <label
            htmlFor="room"
            className="font-semibold text-md italic sr-only"
          >
            Room{" "}
          </label>
          <input
            type="text"
            name="room"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="rounded-sm text-gray-500 p-1 px-2 w-full mb-4 "
            placeholder="Room"
          />
          <br />
          <br />
          <button
            type="submit"
            className="w-full bg-white text-blue-500 font-semibold p-1 rounded-sm"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
