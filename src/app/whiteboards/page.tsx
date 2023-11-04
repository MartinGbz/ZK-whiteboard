import { getWhiteboardsFormatted } from "@/lib/whiteboards";
import { Whiteboards } from "@/components/whiteboards/whiteboards";

export default async function Home() {
  const whiteboards = await getWhiteboardsFormatted();
  return <Whiteboards whiteboards={whiteboards ?? []} />;
}
