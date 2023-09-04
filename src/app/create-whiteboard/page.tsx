// import { MobileModal } from "@/app/components/mobile-modal/mobile-modal";
// import WhiteboardCreation from "../components/whiteboard-creation/whiteboard-creation";
import { MobileModal } from "../components/mobile-modal/mobile-modal";
import WhiteboardCreation from "../components/whiteboard-creation/whiteboard-creation";
import "../page.css";

const page = () => {
  return (
    <div>
      <MobileModal />
      <WhiteboardCreation />
    </div>
  );
};

export default page;
