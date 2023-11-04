import { getWhiteboards } from "@/lib/get-whiteboards";
import { Whiteboards } from "@/components/whiteboards/whiteboards";

export default async function Home() {
  const whiteboards = await getWhiteboards();
  return <Whiteboards whiteboards={whiteboards ?? []} />;
}
