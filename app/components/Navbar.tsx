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
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";

import { FcReading } from "react-icons/fc";
import { IoLibraryOutline } from "react-icons/io5";
import { TbBrandBooking } from "react-icons/tb";
import { FaMapMarkedAlt } from "react-icons/fa";

import useAuth from "@/app/hooks/useAuth";

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roleDrawer, setRoleDrawer] = useState<"student" | "admin" | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const user = useAuth(); // { name, email, role } or null
  const isMobile = useMediaQuery("(max-width:768px)");

  const toggleDrawer = (open: boolean, role?: "student" | "admin") => {
    setDrawerOpen(open);
    setRoleDrawer(role ?? null);
  };

  // Top navigation links
  const topNavLinks = [
    { label: "Home", href: "/", icon: <DashboardIcon /> },
    { label: "About", href: "/about", icon: <LibraryBooksIcon /> },
    { label: "Pricing", href: "/pricing", icon: <EventSeatIcon /> },
    { label: "Contact", href: "/contact", icon: <PersonIcon /> },
  ];

  // Student dashboard links
  const studentLinks = [
    { label: "Attendance", href: "/pages/dashboard-student/attendance", icon: <ScheduleIcon /> },
    { label: "Book a Seat", href: "/pages/dashboard-student/seats", icon: <EventSeatIcon /> },
    { label: "My Bookings", href: "/pages/dashboard-student/booking", icon: <BookOnlineIcon /> },
  ];

  // Admin dashboard links
  const adminLinks = [
    { label: "Dashboard", href: "/dashboard-admin", icon: <DashboardIcon /> },
    { label: "Room", href: "/dashboard-admin/room", icon: <FcReading /> },
    { label: "Seats", href: "/dashboard-admin/seats", icon: <IoLibraryOutline /> },
    { label: "Booking", href: "/dashboard-admin/bookings", icon: <TbBrandBooking /> },
    { label: "Floormap", href: "/dashboard-admin/floormap", icon: <FaMapMarkedAlt /> },
  ];

  const authButtons = [
    { label: "Sign In", href: "/pages/login", icon: <LoginIcon /> },
    { label: "Sign Up", href: "/pages/register", icon: <AppRegistrationIcon /> },
  ];

  return (
    <>
      {/* NAVBAR */}
      <AppBar position="static" sx={{ background: "#1a237e" }}>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton color="inherit" onClick={() => setMobileMenu(true)}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{ flexGrow: 1, textDecoration: "none", color: "white" }}
          >
            Study Center Management
          </Typography>

          {/* Desktop Top Links */}
          {!isMobile &&
            topNavLinks.map((item) => (
              <Button key={item.label} color="inherit" href={item.href}>
                {item.label}
              </Button>
            ))}

          {/* Dashboard button */}
          {!isMobile && user && (
            <Button
              color="inherit"
              onClick={() => toggleDrawer(true, user.role)}
              startIcon={<DashboardIcon />}
              sx={{ ml: 2 }}
            >
              {user.role === "admin" ? "Admin" : "Student"}
            </Button>
          )}

          {/* Auth buttons if not logged in */}
          {!isMobile && !user &&
            authButtons.map((item) => (
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

          {/* Profile + Logout when logged in */}
          {!isMobile && user && (
            <>
              <Typography sx={{ ml: 3, mr: 2 }}>
                Welcome, {user?.name || user?.email}
              </Typography>
              <Link href="">
                <AccountCircleIcon style={{ color: "white" }} />
              </Link>
              <Button
                color="error"
                variant="outlined"
                sx={{ ml: 1 }}
                onClick={() => {
                  document.cookie = "study_auth=; Max-Age=0; path=/;";
                  document.cookie = "study_user=; Max-Age=0; path=/;";
                  localStorage.removeItem("user");
                  window.location.href = "/";
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* MOBILE MENU DRAWER */}
      <Drawer anchor="left" open={mobileMenu} onClose={() => setMobileMenu(false)}>
        <Box sx={{ width: 260 }}>
          <Typography variant="h6" sx={{ p: 2, fontWeight: 700, background: "#1a237e", color: "white" }}>
            {user ? (user.role === "admin" ? "Admin Dashboard" : "Student Dashboard") : "Menu"}
          </Typography>

          {user && (
            <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 2 }}>
              <AccountCircleIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{user?.name || user?.email}</Typography>
                <Typography sx={{ fontSize: 12, opacity: 0.7 }}>Logged In</Typography>
              </Box>
            </Box>
          )}

          {!user && (
            <Box sx={{ px: 2, py: 1 }}>
              {authButtons.map((item) => (
                <Button
                  key={item.label}
                  component={Link}
                  href={item.href}
                  fullWidth
                  startIcon={item.icon}
                  color="primary"
                  variant="contained"
                  sx={{ my: 1, borderRadius: 4, textTransform: "none" }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {user && (
            <Button
              fullWidth
              color="error"
              variant="outlined"
              sx={{ mt: 1, borderRadius: 3 }}
              onClick={() => {
                document.cookie = "study_auth=; Max-Age=0; path=/;";
                document.cookie = "study_user=; Max-Age=0; path=/;";
                localStorage.removeItem("user");
                window.location.href = "/";
              }}
            >
              Logout
            </Button>
          )}

          <Divider sx={{ my: 2 }} />

          {topNavLinks.map((item) => (
            <ListItemButton key={item.label} component={Link} href={item.href}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </Box>
      </Drawer>

      {/* DASHBOARD DRAWER */}
      <Drawer
        anchor="left"
        open={drawerOpen && roleDrawer !== null}
        onClose={() => toggleDrawer(false)}
      >
        <Box sx={{ width: 260 }}>
          <Typography variant="h6" sx={{ p: 2, fontWeight: 700 }}>
            {user?.role === "admin" ? "Admin Dashboard" : "Student Dashboard"}
          </Typography>
          <Divider />

          {user?.role === "student" &&
            studentLinks.map((item) => (
              <ListItemButton
                key={item.label}
                onClick={() => {
                  toggleDrawer(false);
                  window.location.href = item.href;
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}

          {user?.role === "admin" &&
            adminLinks.map((item) => (
              <ListItemButton
                key={item.label}
                onClick={() => {
                  toggleDrawer(false);
                  window.location.href = item.href;
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
        </Box>
      </Drawer>
    </>
  );
}
