import { IconReload, IconTrash } from '@tabler/icons-react';
import { Button } from './button';
import { Progress } from './progress';
import { Minus, Plus } from 'lucide-react';

interface HabitProps {
  name: string;
  goal: number;
  current: number;
  indicatorColor: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onTrash: () => void;
}

export default function Habit({ name, goal, current, indicatorColor, onIncrement, onDecrement, onReset, onTrash }: HabitProps) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className='w-64 relative'>
        <Progress value={(current / goal) * 100} indicatorColor={indicatorColor} className="rounded-md h-8" />
        <p className='relative translate-y-[-26px] translate-x-3 h-0 text-sm'><b>{current}</b>/<b>{goal}</b></p>
        <p className='relative translate-y-[-26px] translate-x-12 h-0 text-sm'>{name}</p>
      </div>
      <div className='flex pl-1 mr-0.5 w-32 justify-around items-center'>
        <Button
          variant="outline"
          size="icon"
          className="h-3.5 w-3.5 bg-white border-2 border-gray-400 rounded-full"
          onClick={onDecrement}
          disabled={current === 0}
        >
          <Minus className="h-2 w-2 text-gray-400" />
          <span className="sr-only">Decrease</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-3.5 w-3.5 bg-white border-2 border-gray-400 rounded-full"
          onClick={onIncrement}
          disabled={current === goal}
        >
          <Plus className="h-2 w-2 text-gray-400" />
          <span className="sr-only">Increase</span>
        </Button>
        <Button
          className='h-4 w-4 px-0 py-0 bg-white hover:bg-white' 
          onClick={onReset}
        >
          <IconReload size={20} className='text-gray-400' />
        </Button>
        <Button
          className='h-4 w-4 px-0 py-0 bg-white hover:bg-white' 
          onClick={onTrash}
        >
          <IconTrash size={20} className='text-gray-400' />
        </Button>
      </div>
    </div>
  );
}
