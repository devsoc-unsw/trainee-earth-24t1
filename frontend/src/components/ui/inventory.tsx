import { AnimatedGradientBorder } from './animatedGradientBorder'; // Adjust the import path as necessary

// Sample inventory items
const inventoryItems = [
  { id: 1, name: 'Iron', amount: 4, description: "Earth's silent strength, forged anew.", imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T22:50:47.100Z/edges-cropped.png' },
  { id: 2, name: 'Beer', amount: 3, description: 'Yummy yummy', imgSrc: 'https://flatearth.b-cdn.net/production-2024-05-28T22:57:44.145Z/edges-cropped.png' },
];

export default function Inventory() {
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
              <AnimatedGradientBorder key={itemIndex}>
                <div
                  className="bg-zinc-900 rounded-md w-20 h-20 flex items-center justify-center text-white text-center p-2"
                >
                  {item && (
                    <div>
                      <div className='h-16 w-16'>
                        <img src={`${item.imgSrc}`} className='h-16 w-16' />
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedGradientBorder>
            );
          })}
        </div>
      ))}
    </div>
  );
}
