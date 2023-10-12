import { greenColor } from "@/configs/configs";

interface SuccessProps {
  text: string;
  duration?: number;
}

const SuccessAnimation: React.FC<SuccessProps> = ({ text, duration }) => {
  duration = duration ? duration : 0.5;
  return (
    <div
      style={{
        backdropFilter: text ? "blur(10px)" : "blur(0px)",
        transition: `backdrop-filter ${duration}s ease-in-out`,
        width: "100%",
        height: "100%",
        position: "absolute",
        pointerEvents: "none",
      }}>
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
        <div
          style={{
            height: "75px",
            width: "125px",
            borderLeft: text
              ? "10px solid rgba(94, 202, 126, 1)"
              : "10px solid rgba(94, 202, 126, 0)",
            borderBottom: text
              ? "10px solid rgba(94, 202, 126, 1)"
              : "10px solid rgba(94, 202, 126, 0)",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",

            transition: `transform ${duration}s ease-in-out, border-color ${duration}s ease-in-out`,
            transform: text
              ? "rotateZ(-45deg) scale(1.5) translate(25%, -25%)"
              : "rotateZ(0) scale(0.25)",
          }}>
          <div
            style={{
              textAlign: "center",
              transition: `color 0.5s ease-in-out ${duration}s`,
              transform: "rotateZ(+45deg) translate(-15px, 110px)",
              color: text ? "rgba(0,0,0,1)" : "rgba(0,0,0,0",
            }}>
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;
