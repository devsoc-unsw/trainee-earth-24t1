import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

interface TaskFormProps {
  onAdd: (taskName: string) => void;
}

export default function TaskForm({onAdd}: TaskFormProps) {
  const [taskName, setTaskName] = useState('');
  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (taskName.trim()) {
      onAdd(taskName);
      setTaskName('');
    }
  }
  return(
    <div className="flex items-center">
      <div className="flex-col justify-center justify-items-center items-center">
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={taskName}
            onChange={ev => setTaskName(ev.target.value)}
            placeholder="Add a To-Do"
            className="bg-white fg-black h-7"
          />
        </form>
      </div>
      <div className="pl-2">
        <Button
          className="h-7 w-7 p-3 bg-blue-400 hover:bg-blue-300"
          onClick={handleSubmit}
        >+</Button>
      </div>
    </div>
  );
}
