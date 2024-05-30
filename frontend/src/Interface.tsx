import "@frontend/src/Interface.css";
import logo from "@frontend/img/logo.gif";
import Navbar from "@frontend/src/Navbar";
import TimerWidget from "@frontend/src/components/ui/timer";
import TodoWidget from "@frontend/src/components/ui/todo";
import GithubWidget from "@frontend/src/components/ui/github";
import CalendarWidget from "@frontend/src/components/ui/calendarWidget";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import HabitCounter from "./components/ui/habitCounter";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@frontend/@/components/ui/dialog";
import Inventory from "./components/ui/inventory";
import { Alert } from "./components/ui/alert";
import { Toaster } from "sonner";
import { Separator } from "./components/ui/separator";
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconDots, IconMouse } from "@tabler/icons-react";

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

export default function Interface() {
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

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const hasSeenDialog = localStorage.getItem("hasSeenDialog");
    if (!hasSeenDialog) {
      setDialogOpen(true);
      localStorage.setItem("hasSeenDialog", "true");
    }
  }, []);

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] h-[450px] bg-white rounded-2xl fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader className="">
            <DialogTitle className="text-5xl flex justify-center items-center">
              <img className="logo-gif h-[90px] mr-2" src={logo} alt="Logo" />
              <div className="text-5xl font-bold">
                Welcome to Groveify!
                <p className="text-lg">Lovingly brought to you by: Dylan, Catelyn, Sarah, Gordon and Lachlan ♡</p>
              </div>
            </DialogTitle>
            <DialogDescription className="flex text-2xl h-full p-4 items-center justify-around">
              <div className="font-medium pr-6 h-full w-full">
                <div className="font-bold text-3xl">
                  Controls:
                </div>
                <div className="flex justify-evenly items-center text-2xl font-medium">
                  Use
                  <div>
                    <div className="flex justify-center">
                      <IconArrowUp />
                    </div>
                    <div className="flex justify-center">
                      <IconArrowLeft />
                      <IconArrowDown />
                      <IconArrowRight />
                    </div>
                  </div>
                  or
                  <div>
                    <IconMouse size={35} />
                  </div>
                </div>
                to move move the map.
                <div className="font-medium flex justify-evenly items-center pt-6">
                  Click and move your
                    <div>
                      <IconMouse size={35} />
                    </div>
                </div>
                <div className="font-medium flex-col justify-center items-center">
                  <p className="font-medium flex justify-center">to move placeables on</p>
                  <p className="font-medium flex justify-center">the interactive island.</p>
                </div>
              </div>

              <Separator orientation="vertical" className="w-[2px]"/>
              <div className="font-medium pl-6 h-full w-full">
                <div className="font-bold text-3xl">
                  Widgets:
                </div>
                <div className="flex justify-evenly items-center text-2xl font-medium">
                  Use
                  <div>
                    <IconMouse size={35} />
                  </div>
                  to drag the
                  <IconDots />
                </div>
                <div className="flex justify-center items-center font-medium text-2xl">
                  on the widgets to move 
                </div>
                <div className="flex justify-center items-center font-medium text-2xl">
                  them around.
                </div>
                <div className="font-medium flex justify-evenly items-center pt-6">
                  You can also sign in with
                </div>
                <div className="font-medium flex-col justify-center items-center">
                  <p className="font-medium flex justify-center">the button at the top</p>
                  <p className="font-medium flex justify-center">right of the screen.</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog>
        <header className="header">
          <Navbar>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-white">
                Open Inventory
              </Button>
            </DialogTrigger>
          </Navbar>
        </header>
        <DialogContent className="sm:max-w-[1000px] h-[450px] border-zinc-900 bg-[url('https://img.freepik.com/free-vector/gradient-black-background-with-wavy-lines_23-2149151738.jpg?t=st=1717068845~exp=1717072445~hmac=30a1204deb840c5d47051110f36b534cd6c67d21cf97fa5dca8b06eeb13d5bb3&w=996')] rounded-2xl fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader className="">
            <DialogTitle className="text-4xl text-white">Inventory</DialogTitle>
            <DialogDescription className="text-xl text-white">
              Check out your resources and inventory items.
            </DialogDescription>
            <div className="grid gap-4 py-4 h-[330px]">
              <Inventory />
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Toaster richColors visibleToasts={4} closeButton />
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
