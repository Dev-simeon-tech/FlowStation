import { useState, useRef, useEffect } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

function SunIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='12' cy='12' r='4' />
      <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
    </svg>
  );
}

export default function Layout() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current) {
        if (!profileRef.current.contains(e.target as Node)) {
          setProfileOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Resolve dynamic theme toggle icon
  let themeIcon = <SunIcon />;
  if (theme === "light") {
    themeIcon = <MoonIcon />;
  }

  let initials = "";

  if (user?.org.name) {
    initials = user.org.name[0].toUpperCase();
  }

  // Resolve dropdown rendering
  let dropdownEl = null;
  if (profileOpen) {
    let orgName = "";
    if (user) {
      if (user.org) {
        orgName = user.org.name;
      }
    }

    dropdownEl = (
      <div className='appDropdown'>
        <div className='appDropdownHeader'>{orgName}</div>
        <button
          className='appDropdownItem'
          onClick={() => {
            setProfileOpen(false);
            navigate("/profile");
          }}
        >
          edit organization profile
        </button>
        <div className='appDropdownSep' />
        <button className='appDropdownItem' onClick={logout}>
          sign out
        </button>
      </div>
    );
  }

  return (
    <div className='appLayout'>
      <header className='appTopBar'>
        <div className='appTopLeft'>
          <div className='appTopLogo'>
            <Link to='/'>
              <img src='/favicon.png' alt='' width={24} height={24} />
            </Link>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className='appThemeToggleBtn'
            onClick={toggleTheme}
            aria-label='Toggle Theme'
          >
            {themeIcon}
          </button>
          <div className='appProfileWrap' ref={profileRef}>
            <button
              className='appProfileBtn'
              onClick={() => setProfileOpen((o) => !o)}
              aria-label='Profile'
            >
              <div className='appAvatar'>{initials}</div>
            </button>
            {dropdownEl}
          </div>
        </div>
      </header>
      <div className='appBody'>
        <Sidebar />
        <div className='appContentWrap'>
          <main className='appMain'>
            <Outlet />
            <footer className='appFooter'>Flowstation &copy;2026</footer>
          </main>
        </div>
      </div>
    </div>
  );
}
