import "./page.css";

import { MobileModal } from "@/app/components/mobile-modal/mobile-modal";
import Whiteboard from "@/app/components/whiteboard/whiteboard";
import WhiteboardsIndex from "./components/whiteboards-index/whiteboards-index";

export default function Home() {
  return (
    <div>
      <MobileModal />
      {/* <Whiteboard /> */}
      <WhiteboardsIndex />
    </div>
  );
}
