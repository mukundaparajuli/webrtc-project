import { useCallback, useEffect } from "react";
import { useSocket } from "../contexts/SocketProvider";

const Room = () => {
  const socket = useSocket();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined the room`);
  }, []);
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    return () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);
  return <h1>Room</h1>;
};

export default Room;
