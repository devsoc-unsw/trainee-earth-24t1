import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Minus, Plus } from "lucide-react"
import { Button } from './button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { IconDots } from '@tabler/icons-react';

export default function TimerWidget({draggableId, x, y}: {draggableId: string, x: number, y: number}) {
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

  const [focusMinutes, setFocusMinutes] = useState(45);
  function changeFocusMinutes(adjustment: number) {
    setFocusMinutes(focusMinutes + adjustment);
    setMode('focus');
    setSecondsLeft((focusMinutes + adjustment) * 60);
  }

  const [breakMinutes, setBreakMinutes] = useState(15);
  function changeBreakMinutes(adjustment: number) {
    setBreakMinutes(breakMinutes + adjustment);
    setMode('focus');
    setSecondsLeft((focusMinutes) * 60);
  }

  const [isPaused, setIsPaused] = useState(true);
  // Modes: focus, break, null
  const [mode, setMode] = useState('break');
  const [secondsLeft, setSecondsLeft] = useState(0);

  function switchMode() {
    const nextMode = mode === 'focus' ? 'break' : 'focus'
    setMode(nextMode);

    setSecondsLeft(nextMode === 'focus' ? focusMinutes * 60 : breakMinutes * 60);
  }

  useEffect(() => {
    function tick() {
      if (!isPaused) {
        setSecondsLeft(prevSeconds => {
          if (prevSeconds === 0) {
            switchMode();
            return mode === 'focus' ? focusMinutes * 60 : breakMinutes * 60;
          }
          return prevSeconds - 1;
        });
      }
    }

    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [isPaused, focusMinutes, breakMinutes, mode]);

  function formatSeconds(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = remainingMinutes < 10 ? '0' + remainingMinutes : remainingMinutes;
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  function formatMinutes(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
  }

  const totalSeconds = mode === 'focus'
    ? focusMinutes * 60
    : breakMinutes * 60;
  const percentage = 100 - secondsLeft / totalSeconds * 100;

  return (
    <section >
      <div style={ style } ref={setNodeRef} className={`relative bg-white rounded-2xl h-70 w-60 flex-col items-center justify-center content-center`}>
        <div className='flex-col items-center justify-center'>
          <button {...listeners} {...attributes} className='flex justify-center items-center text-2xl w-full opacity-60'>
            <IconDots />
          </button>
        </div>
        <div className="m-4 ">
          {
            // 'percentage:' + percentage
            // + '\nsecondsLeft:' + secondsLeft
            // + '\ntotalSeconds:' + totalSeconds
            // + '\nmode:' + mode
          }
          <div className="p-2">
            <CircularProgressbar value={percentage} text={formatSeconds(secondsLeft)} styles={buildStyles({
              textColor: 'black',
              pathColor: mode === 'focus' ? '#34D399' : '#3B82F6',
              pathTransitionDuration: 0.1,
              textSize: '18px'
            })} />
          </div>
          <div className="pt-2 flex justify-around">
            <div>
              {
                isPaused
                ? <Button variant="secondary" className='bg-green-400 w-20' onClick={() => { setIsPaused(false) }}>Start</Button>
                : <Button variant="secondary" className='bg-red-400 w-20' onClick={() => { setIsPaused(true) }}>Pause</Button>
              }
            </div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">Set Time</Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>Focus Goal</DrawerTitle>
                    <DrawerDescription>Set your focus goal and lock in.</DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 pb-0 pt-0">
                    <div className="pb-2 flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={() => changeFocusMinutes(-15)}
                        disabled={!isPaused || focusMinutes === 15}
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Decrease</span>
                      </Button>
                      <div className="flex-1 text-center">
                        <div className="text-4xl font-bold tracking-tighter">
                          {formatMinutes(focusMinutes)}
                        </div>
                        <div className="text-[0.70rem] uppercase text-muted-foreground">
                          Focus Time
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={() => changeFocusMinutes(15)}
                        disabled={!isPaused}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Increase</span>
                      </Button>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={() => changeBreakMinutes(-5)}
                        disabled={!isPaused || breakMinutes === 5}
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Decrease</span>
                      </Button>
                      <div className="flex-1 text-center">
                        <div className="text-3xl font-bold tracking-tighter">
                          {formatMinutes(breakMinutes)}
                        </div>
                        <div className="text-[0.70rem] uppercase text-muted-foreground">
                          Break Time
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={() => changeBreakMinutes(5)}
                        disabled={!isPaused}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Increase</span>
                      </Button>
                    </div>
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </section>
  )
}
