import Whiteboard from "@/components/whiteboard/whiteboard";

import "../../page.css";

interface pageProps {
  params: { id: number };
}

const page = ({ params }: pageProps) => {
  return (
    <div>
      <Whiteboard whiteboardId={params.id} />
    </div>
  );
};

export default page;
