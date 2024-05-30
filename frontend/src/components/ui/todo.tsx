import { Separator } from "./separator";
import { useEffect, useState } from "react";
import TaskForm from "./taskForm";
import Task from "./task";
import { useDraggable } from "@dnd-kit/core";
import { IconDots } from "@tabler/icons-react";
import { Alert } from "./alert";

interface TaskType {
  name: string;
  done: boolean;
}

export default function TodoWidget({
  draggableId,
  x,
  y,
}: {
  draggableId: string;
  x: number;
  y: number;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: draggableId,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        left: `${x}px`,
        top: `${y}px`,
      }
    : {
        left: `${x}px`,
        top: `${y}px`,
      };

  const [tasks, setTasks] = useState<TaskType[]>([]);

  useEffect(() => {
    if (tasks.length === 0) {
      return;
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const jsonItems = localStorage.getItem("tasks");
    let tasks: TaskType[] = [];
    if (jsonItems != null) {
      tasks = JSON.parse(jsonItems);
    }
    setTasks(tasks);
  }, []);

  function addTask(name: string) {
    Alert('Success', "To-Do Widget", 'Task successfully added!');
    setTasks((prev) => {
      return [...prev, { name: name, done: false }];
    });
  }

  function updateTaskDone(taskIndex: number, newDone: boolean) {
    setTasks((prev) => {
      const newTasks = [...prev];
      newTasks[taskIndex].done = newDone;
      return newTasks;
    });
  }

  function removeTask(taskIndex: number) {
    Alert('Success', "To-Do Widget", 'Task successfully deleted!');
    setTasks((prev) => {
      return prev.filter((_, index) => index !== taskIndex);
    });
  }

  return (
    <div className="relative left-1/2 top-1/2 w-[49vw]">
      <div
        style={style}
        ref={setNodeRef}
        className="absolute bg-white rounded-xl h-70 w-60 flex-col justify-center content-center"
      >
        <div className="flex-col items-center justify-center">
          <button
            {...listeners}
            {...attributes}
            className="flex justify-center items-center text-2xl w-full opacity-60"
          >
            <IconDots />
          </button>
        </div>
        <div className="p-6 ">
          {"To-Dos"}
          <Separator className="my-4" />
          <div className="pb-2">
            <TaskForm onAdd={addTask} />
          </div>
          <div className="overflow-scroll max-h-40">
            {tasks.map((task, index) => (
              <Task
                key={index}
                {...task}
                onTrash={() => removeTask(index)}
                onToggle={(done) => updateTaskDone(index, done)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
