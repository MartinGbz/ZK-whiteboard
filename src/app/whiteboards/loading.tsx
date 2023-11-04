import LoadingModal from "@/components/loading-modal/loading-modal";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    // <p
    //   style={{
    //     fontSize: "100px",
    //     color: "black",
    //     backgroundColor: "red",
    //     width: "100%",
    //     height: "100%",
    //   }}>
    //   {" "}
    //   HELLOOOOO{" "}
    // </p>
    <LoadingModal text="Loading whiteboards..." />
  );
}
