import { IconTrash } from '@tabler/icons-react'
import { Checkbox } from "./checkbox";
import { Button } from './button';

interface TaskProps {
  name: string;
  done: boolean;
  onToggle: (done: boolean) => void;
  onTrash: () => void;
  // onTrash: ()
}

export default function Task({ name, done, onToggle, onTrash}: TaskProps) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center space-x-2 pb-2 pt-2">
        <Checkbox checked={done} onClick={() => onToggle(!done)} />
        <label
          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 overflow-hidden max-w-32 text-ellipsis ${
            done ? "line-through opacity-50" : ""
          }`}
        >
          {name}
        </label>
      </div>
      <div className='flex h-6 w-6 mr-0.5 justify-center items-center'>
        <Button
          className='h-6 w-6 px-1 py-1 bg-white hover:bg-white' 
          onClick={onTrash}
        >
          <IconTrash size={20} color='black' />
        </Button>
      </div>
    </div>
  );
}
