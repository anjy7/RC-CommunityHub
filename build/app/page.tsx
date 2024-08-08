// import Navbar from "./events/Navbar"
import {NavigationMenuDemo} from "navbar-cms";
import navItems from "../../data/navigation"

export default function Home() {

  return (
    <>
    <NavigationMenuDemo data={navItems} />
    </>
  );
}
