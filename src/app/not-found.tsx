import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        color: "gray",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "max-content",
        fontSize: "20px",
      }}>
      <div
        style={{
          fontSize: "50px",
        }}>
        {":("}
      </div>
      <div>Not Found</div>
      <div>Could not find requested resource</div>
      <Link
        style={{
          border: "2px solid gray",
          padding: "10px 20px",
          borderRadius: "5px",
          marginTop: "20px",
          color: "gray",
          textDecoration: "none",
        }}
        href="/">
        Return Home
      </Link>
    </div>
  );
}
