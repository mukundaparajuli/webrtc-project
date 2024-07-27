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
      myStream && console.log(myStream);
      const ans = await Peer.getAnswer(offer);
      socket.emit("call:accepted", {
        to: from,
        ans,
      });
    },
    [socket, myStream]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      Peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      Peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegotiationIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await Peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegotiationFinal = useCallback(async ({ ans }) => {
    await Peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegotiationIncoming);
    socket.on("peer:nego:final", handleNegotiationFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("user:joined", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegotiationIncoming);
      socket.off("peer:nego:final", handleNegotiationFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegotiationIncoming,
    handleNegotiationFinal,
  ]);

  useEffect(() => {
    Peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("got tracks");
      console.log(remoteStream[0]);
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await Peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    Peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      Peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

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
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      <div style={{ display: "flex", gap: "10px" }}>
        {" "}
        <div>
          {myStream && (
            <>
              <h1>My Stream</h1>
              <ReactPlayer
                playing
                muted
                height="300px"
                width="300px"
                url={myStream}
              />
            </>
          )}
        </div>
        <div>
          {" "}
          {remoteStream && (
            <>
              <h1>Remote Stream</h1>
              <ReactPlayer
                playing
                muted
                height="300px"
                width="300px"
                url={remoteStream}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Room;
