import { createBrowserRouter } from "react-router-dom";
import Weather from "../page/Weather";

export const router = createBrowserRouter([
  { path: "/", element: <Weather /> },
]);
