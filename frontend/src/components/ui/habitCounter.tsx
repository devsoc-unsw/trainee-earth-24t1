import { useDraggable } from "@dnd-kit/core";
import { Separator } from "@radix-ui/react-separator";
import { IconDots } from "@tabler/icons-react";
import HabitForm from "./habitForm";
import Habit from "./habit";
import { useEffect, useState } from "react";

interface HabitType {
  id: string;
  goalName: string;
  maxGoal: number;
  currentGoal: number;
  indicatorColor: string;
}

const indicatorColors = [
  "bg-blue-300",
  "bg-purple-300",
  "bg-orange-300",
  "bg-green-300",
  "bg-pink-300",
  "bg-red-300",
  "bg-indigo-300",
];

export default function HabitCounter({
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

  const [habits, setHabits] = useState<HabitType[]>(() => {
    const savedHabits = localStorage.getItem("Habits");
    return savedHabits ? JSON.parse(savedHabits) : [];
  });

  useEffect(() => {
    localStorage.setItem("Habits", JSON.stringify(habits));
  }, [habits]);

  const [colorNum, setColorNum] = useState(() => {
    const savedColorNum = localStorage.getItem("ColorNum");
    return savedColorNum ? JSON.parse(savedColorNum) : 0;
  });

  useEffect(() => {
    localStorage.setItem("ColorNum", JSON.stringify(colorNum));
  }, [colorNum]);

  const handleAddHabit = (habitName: string, goal: number) => {
    const newHabit: HabitType = {
      id: String(Date.now()),
      goalName: habitName,
      maxGoal: goal,
      currentGoal: 0,
      indicatorColor: indicatorColors[colorNum],
    };
    setColorNum((colorNum + 1) % 7);
    setHabits([...habits, newHabit]);
  };

  const handleIncrement = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id
          ? { ...habit, currentGoal: habit.currentGoal + 1 }
          : habit
      )
    );
  };

  const handleDecrement = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id && habit.currentGoal > 0
          ? { ...habit, currentGoal: habit.currentGoal - 1 }
          : habit
      )
    );
  };

  const handleReset = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, currentGoal: 0 } : habit
      )
    );
  };

  const handleRemove = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  return (
    <div className="relative left-1/2 top-1/2 w-[49vw]">
      <div
        style={style}
        ref={setNodeRef}
        className="absolute bg-white rounded-2xl h-70 w-[340px] flex-col items-center justify-center content-center"
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
        <div className="p-6">
          {"Habit Counter"}
          <Separator className="my-4 h-[1px] bg-border" />
          <div className="pb-2">
            <HabitForm onAdd={(name, goal) => handleAddHabit(name, goal)} />
          </div>
          <div className="overflow-scroll max-h-60">
            {habits.map((habit) => (
              <Habit
                key={habit.id}
                name={habit.goalName}
                goal={habit.maxGoal}
                current={habit.currentGoal}
                indicatorColor={habit.indicatorColor}
                onIncrement={() => handleIncrement(habit.id)}
                onDecrement={() => handleDecrement(habit.id)}
                onReset={() => handleReset(habit.id)}
                onTrash={() => handleRemove(habit.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
