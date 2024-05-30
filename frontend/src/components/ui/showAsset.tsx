import './showAsset.css';

interface ShowAssetProps {
  name: string;
  img: string;
}

export default function ShowAsset({ name, img }: ShowAssetProps) {
  return (
    <div className="flex-col bg-zinc-800 overflow-hidden rounded-xl h-[460px] w-96 justify-center items-center">
      <div className="relative h-full w-full top-[70px] shining-area blur-sm">
        <div className="sa-position sa-1"></div>
        <div className="sa-position sa-2"></div>
        <div className="sa-position sa-3"></div>
        <div className="sa-position sa-4"></div>
        <div className="sa-position sa-5"></div>
        <div className="sa-position sa-6"></div>
        <div className="sa-position sa-7"></div>
        <div className="sa-position sa-8"></div>
      </div>
      <div className="flex">
        <img src={img} className='relative bottom-[410px] left-[120px] w-[140px]'/>
        <div className='bg-white rounded-md relative bottom-[90px] right-[67px] h-[70px] w-[230px] flex-col font-bold text-3xl text-center justify-center items-center'>
          <p className='text-sm p-1'>Say hello to your new villager:</p>
          {name}
        </div>
      </div>
    </div>
  );
}
