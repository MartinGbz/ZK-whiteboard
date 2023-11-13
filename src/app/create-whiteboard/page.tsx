import WhiteboardCreationEdition from "@/components/whiteboard-creation-edition/whiteboard-creation-edition";
import { fetchGroups } from "@/lib/groups";

const page = async () => {
  const groups = await fetchGroups();
  return <WhiteboardCreationEdition groups={groups} />;
};

export default page;
