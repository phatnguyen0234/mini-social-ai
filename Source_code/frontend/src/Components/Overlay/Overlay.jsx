import "./overlay.css";

const Overlay = ({ children }) => {
  return (
    <section className="popups-overlay">
      <div className="popups-container">{children}</div>
    </section>
  );
};

export default Overlay;
