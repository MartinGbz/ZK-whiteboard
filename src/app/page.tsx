import { MobileModal } from "./components/mobile-modal/mobile-modal";
import Whiteboard from "./components/whiteboard/whiteboard";
import "./page.css";

export default function Home() {
  return (
    <div>
      <MobileModal />
      <Whiteboard />
    </div>
  );
}
