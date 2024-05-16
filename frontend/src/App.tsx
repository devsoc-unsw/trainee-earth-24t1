import { Calendar } from "lucide-react";
import "./App.css";
import Navbar from "./Navbar";
import Timer from "./components/ui/timer";

export default function App() {
  return (
    <div>
      <header className="header">
        <Navbar />
      </header>
      <div className="content mx-auto w-full max-w-screen-xl justify-center ">
        <Timer />
      </div>
    </div>
  );
}
