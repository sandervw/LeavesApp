import { MoonButton, SunButton } from "./common/Buttons";

export const ThemeToggle = ({ theme, setTheme }) => {
    return (
        <div className='theme-toggle'>
            {theme==='light'
            ? <MoonButton onClick={() => setTheme('dark')} />
            : <SunButton onClick={() => setTheme('light')} />}
        </div>
    );
};