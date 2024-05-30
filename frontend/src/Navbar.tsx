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
import { ReactNode } from "react";

interface NavbarProps {
  children: ReactNode;
}

const Navbar = ({ children }: NavbarProps) => {
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

        {children}

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
