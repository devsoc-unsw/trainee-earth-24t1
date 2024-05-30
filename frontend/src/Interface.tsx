import "@frontend/src/Interface.css";
import Navbar from "@frontend/src/Navbar";
import TimerWidget from "@frontend/src/components/ui/timer";
import TodoWidget from "@frontend/src/components/ui/todo";
import GithubWidget from "@frontend/src/components/ui/github";
import CalendarWidget from "@frontend/src/components/ui/calendarWidget";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import WorldMap from "@frontend/src/WorldMap";
import HabitCounter from "./components/ui/habitCounter";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@frontend/@/components/ui/dialog";
import { SimulationState } from "@backend/types/simulationTypes";

/**
 * Default widget positions calculated relative to middle
 * of window ie (window.innerWidth / 2, window.innerHeight / 2)
 */
const defaultWidgetsData: widgetDataType = [
  {
    id: "timer",
    type: "timer",
    position: {
      x: -window.innerWidth / 2 + 180,
      y: +window.innerHeight / 2 - 380 + window.innerHeight / 2,
    },
  },
  {
    id: "github",
    type: "github",
    position: {
      x: -180,
      y: +window.innerHeight / 2 - 270 + window.innerHeight / 2,
    },
  },
  {
    id: "todo-list",
    type: "todo-list",
    position: {
      x: +window.innerWidth / 2 - 350,
      y: -window.innerHeight / 2 + 200 + window.innerHeight / 2,
    },
  },
  {
    id: "calendar",
    type: "calendar",
    position: {
      x: +window.innerWidth / 2 - 380,
      y: +window.innerHeight / 2 - 420 + window.innerHeight / 2,
    },
  },
  {
    id: "habitCounter",
    type: "habitCounter",
    position: {
      x: -window.innerWidth / 2 + 180,
      y: -window.innerHeight / 2 + 200 + window.innerHeight / 2,
    },
  },
];

type widgetDataType = {
  id: string;
  type: widgetType;
  position: { x: number; y: number };
}[];

type widgetType =
  | "timer"
  | "calendar"
  | "todo-list"
  | "github"
  | "habitCounter";

export default function Interface({
  simulationState,
}: {
  simulationState: SimulationState;
}) {
  const [widgets, setWidgets] = useState<widgetDataType>(() => {
    const savedWidgetsData = localStorage.getItem("widgetsData");
    return savedWidgetsData ? JSON.parse(savedWidgetsData) : defaultWidgetsData;
  });

  useEffect(() => {
    console.log(`simulationState`, simulationState);
  }, [simulationState]);

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

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleOpenProfile = (isOpen: boolean) => {
    setIsProfileOpen(isOpen);
  };

  return (
    <>
      <Dialog onOpenChange={handleOpenProfile}>
        <header className="header">
          <Navbar>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white">
                Open Inventory
              </Button>
            </DialogTrigger>
          </Navbar>
        </header>
        <DialogContent className="sm:max-w-[1000px] h-[500px] bg-white rounded-md fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"></div>
            <div className="grid grid-cols-4 items-center gap-4"></div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
            case "habitCounter":
              return (
                <HabitCounter
                  key={widget.id}
                  x={widget.position.x}
                  y={widget.position.y}
                  draggableId={widget.id}
                />
              );
          }
        })}
      </DndContext>
    </>
  );
}
