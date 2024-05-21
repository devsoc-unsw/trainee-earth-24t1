import "./App.css";
import Navbar from "./Navbar";
import Timer from "./components/ui/timer";
import { Calendar } from "./components/ui/calendar";
import Todo from "./components/ui/todo";

export default function App() {
  return (
    <div>
      <header className="header">
        <Navbar />
      </header>
      <div className="content flex-col mx-auto w-full max-w-screen-xl justify-center items-center">
        {'widgets'}
        <div className="flex-col justify-around w-100">
          <Calendar />
          <Timer />
          <div className="pt-5">
            <Todo />
          </div>
        </div>
      </div>
    </div>
  );
}
