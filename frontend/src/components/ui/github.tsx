import GitHubCalendar from 'react-github-calendar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from './input';
import { useEffect, useState } from 'react';

export default function Github() {
  const [userName, setUserName] = useState(() => {
    const savedUsername = localStorage.getItem('GitHubUsername');
    return savedUsername ? JSON.parse(savedUsername) : '';
  });

  useEffect(() => {
    localStorage.setItem('GitHubUsername', JSON.stringify(userName));
  }, [userName]);

  return (
    <section>
      <div className="bg-white rounded-2xl h-44 w-[445px] flex justify-center items-center">
        <div className='overflow-hidden w-11/12 p-4'>
          <HoverCard>
            <HoverCardTrigger className='flex items-center justify-center'>
              <GitHubCalendar
                username={userName}
                colorScheme='light'
                blockSize={9}
                fontSize={13.5}
                errorMessage='Hover over widget to set GitHub Username.'
              />
            </HoverCardTrigger>
            <HoverCardContent className='w-64 rounded-2xl mb-5'>
              <div>
                <p className='text-sm'>Enter your GitHub Username</p>
                <Input
                  type="text"
                  value={userName}
                  onChange={ev => setUserName(ev.target.value)}
                  placeholder="Username"
                  className="bg-white text-black h-7 mt-2"
                />
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </section>
  );
}
