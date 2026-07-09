import { useState, useRef, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Layout.module.css";

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
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) {
      return stored;
    } else {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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

  function toggleTheme() {
    setTheme((t) => {
      if (t === "light") {
        return "dark";
      } else {
        return "light";
      }
    });
  }

  // Resolve dynamic theme toggle icon
  let themeIcon = <SunIcon />;
  if (theme === "light") {
    themeIcon = <MoonIcon />;
  }

  // Resolve dynamic avatar style and initials
  let avatarStyle = undefined;
  let initials = "";

  if (user) {
    if (user.org) {
      if (user.org.logo) {
        avatarStyle = {
          backgroundImage: `url(${user.org.logo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      } else {
        if (user.org.name) {
          initials = user.org.name[0].toUpperCase();
        }
      }
    }
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
      <div className={styles.dropdown}>
        <div className={styles.dropdownHeader}>{orgName}</div>
        <button
          className={styles.dropdownItem}
          onClick={() => {
            setProfileOpen(false);
            navigate("/settings?tab=profile");
          }}
        >
          edit organization profile
        </button>
        <div className={styles.dropdownSep} />
        <button className={styles.dropdownItem} onClick={logout}>
          sign out
        </button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.topLogo}>
            <img src='/favicon.png' alt='' width={24} height={24} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className={styles.themeToggleBtn}
            onClick={toggleTheme}
            aria-label='Toggle Theme'
          >
            {themeIcon}
          </button>
          <div className={styles.profileWrap} ref={profileRef}>
            <button
              className={styles.profileBtn}
              onClick={() => setProfileOpen((o) => !o)}
              aria-label='Profile'
            >
              <div className={styles.avatar} style={avatarStyle}>
                {initials}
              </div>
            </button>
            {dropdownEl}
          </div>
        </div>
      </header>
      <div className={styles.body}>
        <Sidebar />
        <div className={styles.contentWrap}>
          <main className={styles.main}>
            <Outlet />
            <footer className={styles.footer}>Flowstation &copy;2026</footer>
          </main>
        </div>
      </div>
    </div>
  );
}
