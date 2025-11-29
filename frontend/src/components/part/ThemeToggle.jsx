import { useEffect, useState } from "react";
import SVG from "./common/SVG.jsx";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "dark";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SVG
      name={theme === "dark" ? "sun" : "moon"}
      className="flex-child-center"
      onClick={toggleTheme}
    />
  );
};

export default ThemeToggle;