import GitHubCalendar from "react-github-calendar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { Input } from "./input";
import { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { IconDotsVertical } from "@tabler/icons-react";

export default function GithubWidget({
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

  const [userName, setUserName] = useState(() => {
    const savedUsername = localStorage.getItem("GitHubUsername");
    return savedUsername ? JSON.parse(savedUsername) : "";
  });

  useEffect(() => {
    localStorage.setItem("GitHubUsername", JSON.stringify(userName));
  }, [userName]);

  return (
    <section>
      <div
        style={style}
        ref={setNodeRef}
        className={`absolute bg-white rounded-2xl h-44 w-[445px] flex items-center justify-center content-center`}
      >
        <div className="overflow-hidden w-11/12 p-4">
          <HoverCard>
            <HoverCardTrigger className="flex items-center justify-center">
              <GitHubCalendar
                username={userName}
                colorScheme="light"
                blockSize={9}
                fontSize={13.5}
                errorMessage="Hover over widget to set GitHub Username."
              />
            </HoverCardTrigger>
            <HoverCardContent className="w-64 rounded-2xl">
              <div>
                <p className="text-sm">Enter your GitHub Username</p>
                <Input
                  type="text"
                  value={userName}
                  onChange={(ev) => setUserName(ev.target.value)}
                  placeholder="Username"
                  className="bg-white text-black h-7 mt-2"
                />
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div className="flex-col items-center justify-center">
          <button
            {...listeners}
            {...attributes}
            className="flex justify-center items-center text-2xl w-full opacity-60"
          >
            <IconDotsVertical />
          </button>
        </div>
      </div>
    </section>
  );
}
