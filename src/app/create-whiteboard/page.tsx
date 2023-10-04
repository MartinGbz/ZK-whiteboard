import { MobileModal } from "../../components/mobile-modal/mobile-modal";
import WhiteboardCreationEdition from "../../components/whiteboard-creation-edition/whiteboard-creation-edition";
import "../page.css";

const page = () => {
  return (
    <div>
      <MobileModal />
      <WhiteboardCreationEdition />
    </div>
  );
};

export default page;
