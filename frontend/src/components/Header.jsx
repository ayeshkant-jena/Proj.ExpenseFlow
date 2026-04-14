import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useNavigate, NavLink } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ListAltIcon from "@mui/icons-material/ListAlt";
import InsightsIcon from "@mui/icons-material/Insights";
import { useAuth } from "../context/AuthContext";

const Header = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <AppBar position="static" sx={{ mb: 4 }}>
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                }}
            >
                <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => navigate("/dashboard")}
                >
                    ExpenseFlow
                </Typography>

                {token ? (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: isMobile ? 1 : 2,
                            flexWrap: "wrap",
                        }}
                    >
                        {/* Navigation */}
                        {isMobile ? (
                            <>
                                <Tooltip title="Dashboard">
                                    <IconButton
                                        component={NavLink}
                                        to="/dashboard"
                                        end
                                        style={({ isActive }) => ({
                                            backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                                            borderRadius: isActive ? 8 : undefined,
                                        })}
                                    >
                                        <DashboardIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Add Expense">
                                    <IconButton
                                        component={NavLink}
                                        to="/add-expense"
                                        end
                                        style={({ isActive }) => ({
                                            backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                                            borderRadius: isActive ? 8 : undefined,
                                        })}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                                {user?.role === "admin" && (
                                    <>
                                        <Tooltip title="Admin Panel">
                                            <IconButton
                                                component={NavLink}
                                                to="/admin"
                                                end
                                                style={({ isActive }) => ({
                                                    backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                                                    borderRadius: isActive ? 8 : undefined,
                                                })}
                                            >
                                                <AdminPanelSettingsIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Audit Logs">
                                            <IconButton
                                                component={NavLink}
                                                to="/audit-logs"
                                                end
                                                style={({ isActive }) => ({
                                                    backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                                                    borderRadius: isActive ? 8 : undefined,
                                                })}
                                            >
                                                <ListAltIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Insights">
                                            <IconButton
                                                component={NavLink}
                                                to="/insights"
                                                end
                                                style={({ isActive }) => ({
                                                    backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                                                    borderRadius: isActive ? 8 : undefined,
                                                })}
                                            >
                                                <InsightsIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <Button
                                    component={NavLink}
                                    to="/dashboard"
                                    end
                                    style={({ isActive }) => ({
                                        color: "inherit",
                                        backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                                        borderRadius: 8,
                                        fontWeight: isActive ? 700 : 500,
                                    })}
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    component={NavLink}
                                    to="/add-expense"
                                    end
                                    style={({ isActive }) => ({
                                        color: "inherit",
                                        backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                                        borderRadius: 8,
                                        fontWeight: isActive ? 700 : 500,
                                    })}
                                >
                                    Add Expense
                                </Button>
                                {user?.role === "admin" && (
                                    <>
                                        <Button
                                            component={NavLink}
                                            to="/admin"
                                            end
                                            style={({ isActive }) => ({
                                                color: "inherit",
                                                backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                                                borderRadius: 8,
                                                fontWeight: isActive ? 700 : 500,
                                            })}
                                        >
                                            Admin Panel
                                        </Button>
                                        <Button
                                            component={NavLink}
                                            to="/audit-logs"
                                            end
                                            style={({ isActive }) => ({
                                                color: "inherit",
                                                backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                                                borderRadius: 8,
                                                fontWeight: isActive ? 700 : 500,
                                            })}
                                        >
                                            Audit Logs
                                        </Button>
                                        <Button
                                            component={NavLink}
                                            to="/insights"
                                            end
                                            style={({ isActive }) => ({
                                                color: "inherit",
                                                backgroundColor: isActive ? "rgba(255,255,255,0.15)" : undefined,
                                                borderRadius: 8,
                                                fontWeight: isActive ? 700 : 500,
                                            })}
                                        >
                                            Insights
                                        </Button>
                                    </>
                                )}
                            </>
                        )}

                        {/* User Info */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PersonIcon sx={{ fontSize: isMobile ? 18 : 22 }} />
                            <Typography
                                sx={{
                                    fontSize: isMobile ? "0.8rem" : "1rem",
                                    fontWeight: 500,
                                }}
                            >
                                {user?.name}
                            </Typography>

                            <Tooltip title="Logout">
                                <IconButton onClick={handleLogout} color="inherit">
                                    <LogoutIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Button component={NavLink} to="/" color="inherit" startIcon={<LoginIcon />}>
                            Login
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
