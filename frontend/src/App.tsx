import "@frontend/src/App.css";
import Navbar from "@frontend/src/Navbar";
import TimerWidget from "@frontend/src/components/ui/timer";
import TodoWidget from "@frontend/src/components/ui/todo";
import GithubWidget from "@frontend/src/components/ui/github";
import CalendarWidget from "@frontend/src/components/ui/calendarWidget";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import WorldMap from "@frontend/src/components/map/WorldMap";

const defaultWidgetsData: widgetDataType = [
  {
    id: "timer",
    type: "timer",
    position: {
      x: 581,
      y: 169,
    },
  },
  {
    id: "github",
    type: "github",
    position: {
      x: 84,
      y: 231,
    },
  },
  {
    id: "todo-list",
    type: "todo-list",
    position: {
      x: 156,
      y: 474,
    },
  },
  {
    id: "calendar",
    type: "calendar",
    position: {
      x: 483,
      y: 516,
    },
  },
];

type widgetDataType = {
  id: string;
  type: widgetType;
  position: { x: number; y: number };
}[];

type widgetType = "timer" | "calendar" | "todo-list" | "github";

export default function App() {
  const [widgets, setWidgets] = useState<widgetDataType>(() => {
    const savedWidgetsData = localStorage.getItem("widgetsData");
    return savedWidgetsData ? JSON.parse(savedWidgetsData) : defaultWidgetsData;
  });

  useEffect(() => {
    localStorage.setItem("widgetsData", JSON.stringify(widgets));
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
        <DndContext onDragEnd={handleDragEnd}>
          {widgets.map((widget) => {
            switch (widget.type) {
              case "timer":
                return (
                  <TimerWidget
                    key={widget.id}
                    x={widget.position.x}
                    y={widget.position.y}
                    draggableId={widget.id}
                  />
                );
              case "todo-list":
                return (
                  <TodoWidget
                    key={widget.id}
                    x={widget.position.x}
                    y={widget.position.y}
                    draggableId={widget.id}
                  />
                );
              case "github":
                return (
                  <GithubWidget
                    key={widget.id}
                    x={widget.position.x}
                    y={widget.position.y}
                    draggableId={widget.id}
                  />
                );
              case "calendar":
                return (
                  <CalendarWidget
                    key={widget.id}
                    x={widget.position.x}
                    y={widget.position.y}
                    draggableId={widget.id}
                  />
                );
            }
          })}
        </DndContext>
        <button onClick={() => localStorage.clear()}>
          reset local storage
        </button>
        <div className="flex-col justify-around w-100">
          <div className="pt-5"></div>
          <div className="pt-5"></div>
        </div>
        <div
          style={{
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: -1,
          }}
        >
          <WorldMap />
        </div>
      </div>
    </div>
  );
}
