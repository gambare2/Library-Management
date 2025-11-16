"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

import useAuth from "@/app/hooks/useAuth";

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roleDrawer, setRoleDrawer] = useState<"student" | "admin" | null>(
    null
  );
  const [mobileMenu, setMobileMenu] = useState(false);
  const user = useAuth();

  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleDrawer = (open: boolean, role?: "student" | "admin") => {
    setDrawerOpen(open);
    setRoleDrawer(role ?? null);
  };

  /** 🔹 TOP NAVIGATION LINKS */
  const topNavLinks = [
    { label: "Home", href: "/", icon: <DashboardIcon /> },
    { label: "About", href: "/about", icon: <LibraryBooksIcon /> },
    { label: "Pricing", href: "/pricing", icon: <EventSeatIcon /> },
    { label: "Contact", href: "/contact", icon: <PersonIcon /> },
  ];

  /** 🔹 STUDENT DRAWER LINKS */
  const studentLinks = [
    { label: "Book a Seat", href: "/student/book-seat", icon: <EventSeatIcon /> },
    { label: "My Bookings", href: "/student/bookings", icon: <BookOnlineIcon /> },
    { label: "Attendance", href: "/student/attendance", icon: <ScheduleIcon /> },
  ];
  const auth = [
    { label: "Sign In", href: "/pages/login", icon: <LoginIcon /> },
    { label: "Sign Up", href: "/pages/register", icon: <AppRegistrationIcon /> }
  ]
  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* 🔵 NAVBAR */}
      <AppBar position="static" sx={{ background: "#1a237e" }}>
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" onClick={() => setMobileMenu(true)}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" component={Link} href="/" sx={{ flexGrow: 1 }}>
            Study Center Management
          </Typography>

          {/* Desktop Navigation Buttons */}
          {!isMobile &&
            topNavLinks.map((item) => (
              <Button key={item.label} color="inherit" href={item.href}>
                {item.label}
              </Button>
            ))}
          {/* Student Drawer Button */}
          {!isMobile && (
            <Button
              color="inherit"
              onClick={() => toggleDrawer(true, "student")}
              startIcon={<DashboardIcon />}
              sx={{ ml: 2 }}
            >
              Student
            </Button>
          )}


          {/* Admin Drawer */}
          {/* {!isMobile && (
            <Button
              color="inherit"
              onClick={() => toggleDrawer(true, "admin")}
              startIcon={<AdminPanelSettingsIcon />}
              sx={{ ml: 2 }}
            >
              Admin
            </Button>
          )} */}
          {/* 🔵 SHOW SIGN IN / SIGN UP ONLY IF USER IS NOT LOGGED IN */}
          {!isMobile && !user && (
            <>
              {auth.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  href={item.href}
                  startIcon={item.icon}
                  color="primary"
                  variant="contained"
                  sx={{ ml: 2, textTransform: "none", borderRadius: 4 }}
                >
                  {item.label}
                </Button>
              ))}
            </>
          )}

          {/* 🔵 SHOW PROFILE + LOGOUT WHEN USER IS LOGGED IN */}
          {!isMobile && user && (
            <>
              <Typography sx={{ ml: 3, mr: 2 }}>
                Welcome, {user?.name || user?.email}
              </Typography>
              <Link href=""><AccountCircleIcon/></Link>
              <Button
                color="error"
                variant="outlined"
                sx={{ ml: 1 }}
                onClick={() => {
                  localStorage.removeItem("user");
                  window.location.reload();
                }}
              >
                Logout
              </Button>
            </>
          )}

        </Toolbar>
      </AppBar>

      {/* 🔵 MOBILE MENU DRAWER */}
      <Drawer anchor="left" open={mobileMenu} onClose={() => setMobileMenu(false)}>
        <Box sx={{ width: 260 }}>

          <Typography variant="h6" sx={{ p: 2, fontWeight: 700 }}>
            Menu
          </Typography>

          <Divider />
          {/* Nav Links  */}
          {topNavLinks.map((item) => (
            <ListItemButton key={item.label} component={Link} href={item.href}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}

          <Divider />

          <ListItemButton onClick={() => { setMobileMenu(false); toggleDrawer(true, "student"); }}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Student Dashboard" />
          </ListItemButton>

          {/* <ListItemButton onClick={() => { setMobileMenu(false); toggleDrawer(true, "admin"); }}>
            <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
            <ListItemText primary="Admin Panel" />
          </ListItemButton> */}
        </Box>

      </Drawer>

      {/* 🔵 STUDENT DRAWER */}
      <Drawer
        anchor="left"
        open={drawerOpen && roleDrawer === "student"}
        onClose={() => toggleDrawer(false)}
      >
        <Box sx={{ width: 260 }}>
          <Typography variant="h6" sx={{ p: 2, fontWeight: 700 }}>
            Student Dashboard
          </Typography>
          <Divider />

          {studentLinks.map((item) => (
            <ListItemButton key={item.label} component={Link} href={item.href}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </Box>
      </Drawer>

      {/* 🔵 ADMIN DRAWER
      <Drawer
        anchor="left"
        open={drawerOpen && roleDrawer === "admin"}
        onClose={() => toggleDrawer(false)}
      >
        <Box sx={{ width: 260 }}>
          <Typography variant="h6" sx={{ p: 2, fontWeight: 700 }}>
            Admin Panel
          </Typography>
          <Divider />

          {adminLinks.map((item) => (
            <ListItemButton key={item.label} component={Link} href={item.href}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </Box>
      </Drawer> */}

      {/* 🔵 HOME PAGE BODY */}
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h3" fontWeight={700} color="#1a237e">
          Welcome to the Study Center
        </Typography>

        <Typography variant="h6" sx={{ mt: 2, color: "#424242" }}>
          Book seats, track attendance, manage subscriptions — all in one place.
        </Typography>
      </Box>
    </Box>
  );
}
