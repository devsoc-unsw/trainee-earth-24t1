import "./App.css";
import Navbar from "./Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";

export default function App() {
  return (
    <div>
      <header className="header">
        <Navbar />
      </header>
      <div className="content mx-auto w-full max-w-screen-xl">
        <Button variant="outline">Button</Button>
        <br />
        <br />
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>{" "}
      </div>
    </div>
  );
}
