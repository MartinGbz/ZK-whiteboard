import { MobileModal } from "@/app/components/mobile-modal/mobile-modal";
import Whiteboard from "@/app/components/whiteboard/whiteboard";

import "../../page.css";

interface pageProps {
  params: { id: number };
}

const page = ({ params }: pageProps) => {
  return (
    <div>
      <MobileModal />
      <Whiteboard whiteboardId={params.id} />
    </div>
  );
};

export default page;
