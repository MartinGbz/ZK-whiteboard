import "./page.css";

import { MobileModal } from "@/app/components/mobile-modal/mobile-modal";
import WhiteboardsIndex from "./components/whiteboards-index/whiteboards-index";

export default function Home() {
  return (
    <div>
      <MobileModal />
      <WhiteboardsIndex />
    </div>
  );
}
