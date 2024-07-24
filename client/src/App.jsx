import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Lobby from "./pages/Lobby";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Lobby />,
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};
export default App;
