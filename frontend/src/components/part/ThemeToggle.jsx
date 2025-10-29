import { MoonButton, SunButton } from "./common/Buttons";

export const ThemeToggle = ({ theme, setTheme }) => {
    return (
        <>
            {theme==='light'
            ? <MoonButton onClick={() => setTheme('dark')} />
            : <SunButton onClick={() => setTheme('light')} />}
        </>
    );
};