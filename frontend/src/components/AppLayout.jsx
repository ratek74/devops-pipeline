const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <div className="main-content animate-fade-in">
        {children}
      </div>
    </div>
  );
};

export { AppLayout };
export default AppLayout;
