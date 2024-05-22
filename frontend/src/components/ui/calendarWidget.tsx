import { useDraggable } from "@dnd-kit/core";
import { Calendar } from "./calendar";
import { IconDots } from "@tabler/icons-react";

export default function CalendarWidget({draggableId, x, y}: {draggableId: string, x: number, y: number}) {
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

  return(
      <div style={ style } ref={setNodeRef} className={`absolute bg-white rounded-2xl h-70 w-68 flex-col items-center justify-center content-center`}>
      <div className='flex-col items-center justify-center'>
        <button {...listeners} {...attributes} className='flex justify-center items-center text-2xl w-full opacity-60'>
          <IconDots />
        </button>
      </div>
      <Calendar />
    </div>
  );
}
