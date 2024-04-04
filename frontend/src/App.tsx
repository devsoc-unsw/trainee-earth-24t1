import React from 'react';
import './App.css';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Navbar from './Navbar';
import { Button } from "./components/ui/button"
 
export default function App() {
  return (
    <body>
      <header className='header'>
        <Navbar />
        <div className='user-icon'>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <div className='content'>
        <Button variant="outline">Button</Button>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </body>
  )
}
