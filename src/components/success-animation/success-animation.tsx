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
          // borderRadius: "10px",
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
            // opacity: text ? 1 : 0,
            // borderColor: text ? "rgba(0,0,0,1)" : "rgba(0,0,0,0.1)",
          }}>
          <div
            style={{
              textAlign: "center",
              // transitionDelay: `${duration}s`,
              transition: `color 0.5s ease-in-out ${duration}s`,
              transform: "rotateZ(+45deg) translate(-15px, 110px)",
              color: text ? "rgba(0,0,0,1)" : "rgba(0,0,0,0",
              // opacity: text ? 1 : 0,
              // opacity: 1,
              // opacity: 0,
            }}>
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;

{
  /* <div
style={{
  backdropFilter: "blur(10px)",
  // backgroundColor: "rgba(0, 0, 0, 0.3)",
  width: "100%",
  height: "100%",
  position: "absolute",
}}>
<div
  style={{
    backgroundColor: "red",
    position: "fixed",
    top: "50%",
    left: "50%",
    // transform: "translate(-50%, -50%)",
    // borderRadius: "10px",
    height: "75px",
    width: "125px",
    borderLeft: "5px solid " + greenColor,
    borderBottom: "5px solid " + greenColor,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",

    // transition: "transform 0.5s ease-in-out opacity 0.5s ease-in-out",
    transition: "transform 0.5s ease-in-out, opacity 0.5s ease-in-out",
    transform: "rotateZ(-45deg) scale(1.5) translate(+0%, -50%)",
    opacity: 1,
    // opacity: 0,
    // transform: "rotateZ(0) scale(0.25) translate(-50%, -50%)",
  }}></div>
<p
  style={{
    position: "fixed",
    top: "70%",
    left: "50%",
  }}>
  hey
</p>
</div> */
}
