import { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    IconButton,
    InputAdornment,
    MenuItem,
    Link,
    Paper
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { registerUser } from "../api/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const emailRegex = /^\S+@\S+\.\S+$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        try {
            await registerUser(formData);
            toast.success("Registration successful. Please login.");
            navigate("/");
        } catch (err) {
            toast.error(err.response.data.message || "Registration failed");
        }
    };

    return (
        <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-8">
            <Box className="w-full max-w-6xl rounded-[32px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
                <Box className="grid grid-cols-1 lg:grid-cols-2">
                    <Box className="relative flex items-center justify-center bg-slate-900 px-8 py-12 text-white lg:px-14 lg:py-16">
                        <Box className="max-w-lg">
                            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.04em', mb: 3 }}>
                                Join ExpenseFlow today
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mb: 5, lineHeight: 1.8 }}>
                                Create your account to start tracking expenses, manage budgets, and gain insights into your spending habits with our intuitive dashboard.
                            </Typography>

                            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '999px', bgcolor: 'info.main', mt: '0.35rem', mr: 3 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                                        Easy expense submission with receipt uploads
                                    </Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '999px', bgcolor: 'info.main', mt: '0.35rem', mr: 3 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                                        Real-time approval status and notifications
                                    </Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '999px', bgcolor: 'info.main', mt: '0.35rem', mr: 3 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                                        Comprehensive audit logs for transparency
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mt: 8, p: 4, borderRadius: 3, bgcolor: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(148,163,184,0.16)' }}>
                                <Typography variant="subtitle2" sx={{ color: 'info.main', mb: 1, fontWeight: 700 }}>
                                    Get started in minutes
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                                    Sign up now and take control of your expenses with powerful tools designed for modern businesses.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Paper elevation={6} className="p-8 md:p-10 bg-white/95" sx={{ backdropFilter: 'blur(12px)' }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, mb: 1.5 }}>
                            Create your account
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                            Fill in your details to register and start managing expenses.
                        </Typography>

                        <form onSubmit={handleSubmit} autoComplete="off">
                            <Box mb={3}>
                                <TextField
                                    name="name"
                                    label="Name"
                                    autoComplete="name"
                                    fullWidth
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Box>

                            <Box mb={3}>
                                <TextField
                                    name="email"
                                    label="Email"
                                    type="email"
                                    autoComplete="email"
                                    fullWidth
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Box>

                            <Box mb={3}>
                                <TextField
                                    name="password"
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    fullWidth
                                    value={formData.password}
                                    onChange={handleChange}
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

                            <Box mb={3}>
                                <TextField
                                    select
                                    name="role"
                                    label="Role"
                                    fullWidth
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                >
                                    <MenuItem value="" disabled>
                                        Select a role
                                    </MenuItem>
                                    <MenuItem value="employee">Employee</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </TextField>
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                type="submit"
                                sx={{ py: 1.6, fontWeight: 700, textTransform: 'capitalize' }}
                            >
                                Register
                            </Button>

                            <Box mt={3} textAlign="center">
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Already have an account?{' '}
                                    <Link
                                        component={RouterLink}
                                        to="/"
                                        underline="hover"
                                        sx={{ color: 'primary.main', fontWeight: 600 }}
                                    >
                                        Login
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

export default RegisterPage;
