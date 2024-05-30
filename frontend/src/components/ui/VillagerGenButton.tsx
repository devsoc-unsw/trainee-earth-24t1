import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@frontend/@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
 } from "@frontend/@/components/ui/select";
import { Button } from "./button";

export default function VillagerGenButton() {
  const [eyeColor, setEyeColour] = useState("");
  const [hairColor, setHairColour] = useState("");
  const [outfit, setOutfit] = useState("");

  const createVillager = () => {
    // check if all options are picked
    if (eyeColor === "" || hairColor === "" || outfit === "") {
      // be angry
      return null;
    } 
    console.log(eyeColor, hairColor, outfit)
    console.log('making villager...')

    
  }

  return (
    <>
      <Dialog>
          <DialogTrigger>
            <Button variant="outline" className="bg-white">Create Villager</Button>
          </DialogTrigger>
        <DialogContent className="sm:max-w-[1000px] h-[500px] bg-white rounded-md fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col px-20 py-10">
          <DialogHeader>
            <DialogTitle className="pt-8 text-xl">Create a New Villager</DialogTitle>
            <DialogDescription className="pt-3 space-y-4">
              <Select onValueChange={e => setEyeColour(e)}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Eye Colour" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    Eye Colour
                    <SelectItem className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" value="brown">
                      Brown
                    </SelectItem>
                    <SelectItem className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" value="blue">
                      Blue
                    </SelectItem>
                    <SelectItem className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" value="black">
                      Black
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select onValueChange={e => setHairColour(e)}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Hair Colour" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    Hair Colour
                    <SelectItem className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" value="brown">
                      Brown
                    </SelectItem>
                    <SelectItem className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" value="blue">
                      Blonde
                    </SelectItem>
                    <SelectItem className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" value="black">
                      Black
                    </SelectItem>
                    <SelectItem className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" value="brunette">
                      Brunette
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select onValueChange={e => setOutfit(e)}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Outfit" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    Outfit
                    <SelectItem className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" value="shiny metal armour">
                      Shiny Metal Armour
                    </SelectItem>
                    <SelectItem className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" value="egyption robe">
                      Egyptian Robe
                    </SelectItem>
                    <SelectItem className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" value="villager rags">
                      Villager Rags
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit" onClick={createVillager}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}