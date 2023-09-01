import { MobileModal } from "@/app/components/mobile-modal/mobile-modal";
import WhiteboardEdition from "@/app/components/whiteboard-edition/whiteboard-edition";

// import "../../page.css";

interface pageProps {
  params: { id: number };
}

const page = ({ params }: pageProps) => {
  return (
    <div>
      <MobileModal />
      <WhiteboardEdition />
    </div>
  );
};

export default page;
