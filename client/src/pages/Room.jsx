import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketProvider";
import ReactPlayer from "react-player";
import Peer from "../services/peer";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined the room`);
    setRemoteSocketId(id);
  }, []);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      console.log("Incoming call: ", from, offer);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      const ans = await Peer.getAnswer(offer);
      socket.emit("call:accepted", {
        to: from,
        ans,
      });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      Peer.setLocalDescription(ans);
      console.log("call accepted");
      for (const track of myStream.getTracks()) {
        Peer.peer.addTrack(track, myStream);
      }
    },
    [myStream]
  );

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("user:joined", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  useEffect(() => {
    Peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream);
    });
  });
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await Peer.getOffer();
    console.log(offer);
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);
  return (
    <div>
      <h1>Room</h1>
      <h4>{remoteSocketId ? "Connected" : "No one is in the room"}</h4>
      {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            url={myStream}
            height="300px"
            width="300px"
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream Stream</h1>
          <ReactPlayer
            playing
            muted
            url={remoteStream}
            height="300px"
            width="300px"
          />
        </>
      )}
    </div>
  );
};

export default Room;
