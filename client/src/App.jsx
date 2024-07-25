import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Lobby from "./pages/Lobby";
import Room from "./pages/Room";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Lobby />,
  },
  {
    path: "/room/:roomId",
    element: <Room />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};
export default App;
