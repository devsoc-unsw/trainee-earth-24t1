import { AnimatedGradientBorder } from './animatedGradientBorder';
import { SimulationState } from '@backend/types/simulationTypes';
import { HoverCard, HoverCardContent, HoverCardTrigger, InventoryHoverCardContent } from "./hover-card";

const inventoryItems = [
  { id: 1, name: 'Iron', amount: 42, description: "Earth's silent strength, forged anew.", imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T22:50:47.100Z/edges-cropped.png' },
  { id: 2, name: 'Beer', amount: 8, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T22:57:44.145Z/edges-cropped.png' },
  { id: 3, name: 'Woodlog', amount: 121, description: 'Very useful logs', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T22:43:08.341Z/edges-cropped.png' },
  { id: 4, name: 'Bread', amount: 38, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T22:58:12.497Z/edges-cropped.png' },
  { id: 5, name: 'Wool', amount: 24, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T22:58:42.884Z/edges-cropped.png' },
  { id: 6, name: 'Sugarcane', amount: 12, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T22:59:13.541Z/edges-cropped.png' },
  { id: 7, name: 'Coal', amount: 203, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T22:59:48.651Z/edges-cropped.png' },
  { id: 8, name: 'Beef', amount: 83, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T23:00:14.168Z/edges-cropped.png' },
  { id: 9, name: 'Bacon', amount: 70, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T23:00:42.141Z/edges-cropped.png' },
  { id: 10, name: 'Glass', amount: 103, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T23:02:07.321Z/edges-cropped.png' },
  { id: 11, name: 'Thread', amount: 79, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T23:02:34.606Z/edges-cropped.png' },
  { id: 12, name: 'Cocoa', amount: 275, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T23:03:37.182Z/edges-cropped.png' },
  { id: 13, name: 'Soybeanmilk', amount: 3, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T23:15:23.347Z/edges-cropped.png' },
  { id: 14, name: 'Chicken', amount: 108, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T23:13:56.629Z/edges-cropped.png' },
  { id: 15, name: 'Wheat', amount: 238, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T23:18:21.110Z/edges-cropped.png' },
  { id: 16, name: 'Fish', amount: 28, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T23:18:52.780Z/edges-cropped.png' },
  { id: 17, name: 'Steel', amount: 89, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T23:21:00.530Z/edges-cropped.png' },
];

export default function Inventory({ simState }: { simState: SimulationState }) {
  const numberOfRows = 3;
  const numberOfColumns = 7;

  return (
    <div className="flex flex-col justify-around space-y-4">
      {Array.from({ length: numberOfRows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex justify-around">
          {Array.from({ length: numberOfColumns }).map((_, colIndex) => {
            const itemIndex = rowIndex * numberOfColumns + colIndex;
            const item = inventoryItems[itemIndex];
            return (
            <HoverCard>
              <HoverCardTrigger className="flex items-center justify-center">
                <AnimatedGradientBorder key={itemIndex}>
                  <div
                    className="bg-zinc-900 rounded-md w-20 h-20 flex items-center justify-center text-white text-center p-2"
                  >
                    {item && (
                      <div>
                        <div className='font-bold h-16 w-16'>
                          <img src={`${item.imgSrc}`} className='h-16 w-16' />
                          {item.amount}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedGradientBorder>
              </HoverCardTrigger>
              <InventoryHoverCardContent className="w-64 rounded-xl mt-[32px] ml-[157px]">
                <div>
                  {item && (
                    <div className='flex font-medium text-white'>
                      Item name: {item.name}
                    </div>
                  )}
                  {item && (
                    <div className='flex font-medium text-white'>
                      Item amount: {item.amount}
                    </div>
                  )}
                  {item && (
                    <div className='flex font-medium text-white'>
                      Description: {item.description}
                    </div>
                  )}
                </div>
              </InventoryHoverCardContent>
            </ HoverCard>  
            );
          })}
        </div>
      ))}
    </div>
  );
}
