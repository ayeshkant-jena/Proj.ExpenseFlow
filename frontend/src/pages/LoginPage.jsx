import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    Link
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-hot-toast";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, user, loading: authLoading } = useAuth();


    useEffect(() => {
        if (!authLoading && user) {
            navigate("/dashboard");
        }
    }, [authLoading, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await loginUser({ email, password });
            login({ token: res.data.token });
            toast.success("Login successful");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-8">
            <Box className="w-full max-w-6xl rounded-[32px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
                <Box className="grid grid-cols-1 lg:grid-cols-2">
                    <Box className="relative flex items-center justify-center bg-slate-900 px-8 py-12 text-white lg:px-14 lg:py-16">
                        <Box className="max-w-lg">
                            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.04em', mb: 3 }}>
                                Track spending with clarity
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mb: 5, lineHeight: 1.8 }}>
                                Expense Tracker helps you stay on top of your budget, categorize payments, and uncover insights in a sleek dashboard designed for fast decisions.
                            </Typography>

                            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '999px', bgcolor: 'info.main', mt: '0.35rem', mr: 3 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                                        Instant expense summaries and monthly overviews
                                    </Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '999px', bgcolor: 'info.main', mt: '0.35rem', mr: 3 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                                        Secure authentication with simple password controls
                                    </Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '999px', bgcolor: 'info.main', mt: '0.35rem', mr: 3 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                                        Clean dashboard and insights to help you budget smarter
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mt: 8, p: 4, borderRadius: 3, bgcolor: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(148,163,184,0.16)' }}>
                                <Typography variant="subtitle2" sx={{ color: 'info.main', mb: 1, fontWeight: 700 }}>
                                    Why ExpenseFlow?
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                                    Build healthier spending habits, monitor refunds, and keep every transaction organized in one place.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Paper elevation={6} className="p-8 md:p-10 bg-white/95" sx={{ backdropFilter: 'blur(12px)' }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, mb: 1.5 }}>
                            Welcome back
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                            Login to your account and manage expenses, view insights, and stay in control.
                        </Typography>

                        <form onSubmit={handleSubmit} autoComplete="off">
                            <input type="text" name="fakeusernameremembered" autoComplete="username" style={{ display: 'none' }} />
                            <input type="password" name="fakepasswordremembered" autoComplete="new-password" style={{ display: 'none' }} />
                            <Box mb={3}>
                                <TextField
                                    name="email"
                                    label="Email"
                                    type="email"
                                    autoComplete="off"
                                    fullWidth
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Box>

                            <Box mb={3}>
                                <TextField
                                    name="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    fullWidth
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword((prev) => !prev)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                type="submit"
                                disabled={loading}
                                sx={{ py: 1.6, fontWeight: 700, textTransform: 'capitalize' }}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>

                            <Box mt={3} textAlign="center">
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Don't have an account?{' '}
                                    <Link
                                        component={RouterLink}
                                        to="/register"
                                        underline="hover"
                                        sx={{ color: 'primary.main', fontWeight: 600 }}
                                    >
                                        Register
                                    </Link>
                                </Typography>
                            </Box>
                        </form>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginPage;
