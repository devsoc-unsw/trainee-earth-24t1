import "./App.css";
import Navbar from "./Navbar";
import TimerWidget from "./components/ui/timer";
import TodoWidget from "./components/ui/todo";
import GithubWidget from "./components/ui/github";
import CalendarWidget from "./components/ui/calendarWidget";
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useEffect, useState } from "react";
import HabitCounter from "./components/ui/habitCounter";

const defaultWidgetsData: widgetDataType = [
  {
    "id":"timer",
    "type":"timer",
    "position": {
      "x":370,
      "y":355
    }
  },
  {
    "id":"github",
    "type":"github",
    "position": {
      "x":330,
      "y":-221
    }
  },
  {
    "id":"todo-list",
    "type":"todo-list",
    "position": {
      "x":47,
      "y":-25
    }
  },
  {
    "id":"calendar",
    "type":"calendar",
    "position": {
      "x":-23,
      "y":-588
    }
  },
  {
    "id":"habitCounter",
    "type":"habitCounter",
    "position": {
      "x":-23,
      "y":-310
    }
  }
];

type widgetDataType = {id: string, type: widgetType, position: {x: number, y: number}}[];


type widgetType = "timer" | "calendar" | "todo-list" | "github" | "habitCounter"

export default function App() {
  const [widgets, setWidgets] = useState<widgetDataType>(() => {
    const savedWidgetsData = localStorage.getItem('widgetsData');
    return savedWidgetsData ? JSON.parse(savedWidgetsData) : defaultWidgetsData;
  });

  useEffect(() => {
    localStorage.setItem('widgetsData', JSON.stringify(widgets));
  }, [widgets]);

  function handleDragEnd(ev: DragEndEvent): void {
    const widget = widgets.find((x) => x.id === ev.active.id);
    if (!widget) {
      return;
    }
    widget.position.x += ev.delta.x;
    widget.position.y += ev.delta.y;
    const _widgets = widgets.map((x) => {
      if (x.id === widget.id) return widget;
      return x;
    });
    setWidgets(_widgets);
  }

  return (
    <div>
      <header className="header">
        <Navbar />
      </header>
      <div className="content flex-col mx-auto w-full max-w-screen-xl justify-center items-center">
        <button onClick={() => localStorage.clear()}>reset local storage</button>
        <DndContext onDragEnd={handleDragEnd}>
          {widgets.map((widget) => {
            switch(widget.type) {
              case "timer":
                return(
                  <TimerWidget
                    key={widget.id}
                    x={widget.position.x}
                    y={widget.position.y}
                    draggableId={widget.id}
                  />
                );
              case "todo-list":
                return(
                  <TodoWidget
                    key={widget.id}
                    x={widget.position.x}
                    y={widget.position.y}
                    draggableId={widget.id}
                  />
                );
              case "github":
                return(
                  <GithubWidget
                    key={widget.id}
                    x={widget.position.x}
                    y={widget.position.y}
                    draggableId={widget.id}
                  />
                )
              case "calendar":
                return(
                  <CalendarWidget
                    key={widget.id}
                    x={widget.position.x}
                    y={widget.position.y}
                    draggableId={widget.id}
                  />
                )
              case "habitCounter":
                return(
                  <HabitCounter
                    key={widget.id}
                    x={widget.position.x}
                    y={widget.position.y}
                    draggableId={widget.id}
                  />
                )
            };
          })}
        </DndContext>
      </div>
    </div>
  );
}
