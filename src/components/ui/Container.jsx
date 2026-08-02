export function Container({ className = "", wide = false, children }) {
  return (
    <div
      data-component="container"
      className={`mx-auto px-6 nav:px-10 ${wide ? "max-w-[1500px]" : "max-w-[1180px]"} ${className}`}
    >
      {children}
    </div>
  );
}
