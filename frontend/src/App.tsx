import "./App.css";
import Navbar from "./Navbar";
import Timer from "./components/ui/timer";
import { Calendar } from "./components/ui/calendar";

export default function App() {
  return (
    <div>
      <header className="header">
        <Navbar />
      </header>
      <div className="content flex-col mx-auto w-full max-w-screen-xl justify-center items-center">
        {'widgets'}
        <div className="flex justify-around w-100">
          <Calendar />
          <Timer />
        </div>
      </div>
    </div>
  );
}
