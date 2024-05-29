import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

interface HabitFormProps {
  onAdd: (taskName: string, goal: number) => void;
}

export default function HabitForm({ onAdd }: HabitFormProps) {
  const [habitName, setHabitName] = useState('');
  const [goal, setGoal] = useState(1);

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (habitName.trim()) {
      onAdd(habitName, goal);
      setHabitName('');
      setGoal(1);
    }
  }

  return (
    <div className="flex items-around justify-around">
      <div className="flex-col pr-2 justify-center justify-items-center items-center">
        <form onSubmit={handleSubmit} className="flex items-around">
          <Input
            type="text"
            value={habitName}
            onChange={ev => setHabitName(ev.target.value)}
            placeholder="Name"
            className="bg-white fg-black h-7"
          />
          <Input
            type="number"
            min={1}
            value={goal}
            onChange={ev => setGoal(ev.target.valueAsNumber)}
            placeholder="Goal"
            className="bg-white fg-black h-7 ml-2 w-20"
          />
          <Button
            type="submit"
            className="h-7 w-18 p-3 ml-2 bg-blue-400 hover:bg-blue-300"
          >
            + Create
          </Button>
        </form>
      </div>
    </div>
  );
}
