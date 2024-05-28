import logo from "@frontend/img/logo.gif";
import "@frontend/src/Navbar.css";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@frontend/@/components/ui/dialog"
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

const Navbar = () => {
  return (
    <nav className="navbar py-1 px-4 w-full max-w-screen-2xl">
      <a className="logo">
        <img className="logo-gif" src={logo} alt="Logo" />
        Groveify
      </a>
      {/* Add navigation links here */}
      <div className="flex justify-end space-x-8">
        <Button onClick={() => localStorage.clear()}>
          Reset Local Storage
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="bg-white">Edit Profile</Button>
          </DialogTrigger>
          <div className="w-full h-full">
            <DialogContent className="sm:max-w-[425px] bg-white relative rounded-md">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Input
                    id="name"
                    defaultValue="Pedro Duarte"
                    className="col-span-3 bg-white"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Input
                    id="username"
                    defaultValue="@peduarte"
                    className="col-span-3 bg-white"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </div>
        </Dialog>

        <div className="user-icon">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Button variant="secondary" asChild>
              <SignInButton />
            </Button>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
