import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    useTheme,
    Grid,
    TextField,
    MenuItem,
    Button,
} from "@mui/material";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    LineChart, Line, CartesianGrid, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { getAllExpenses } from "../api/expense";
import { toast } from "react-hot-toast";

const Insights = () => {
    const theme = useTheme();
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [cumulativeData, setCumulativeData] = useState([]);
    const [dayOfWeekData, setDayOfWeekData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "approved",
        category: "",
        startDate: "",
        endDate: "",
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await getAllExpenses();
                setExpenses(res.data || []);
                setCategories([
                    ...new Set((res.data || []).map((expense) => expense.category).filter(Boolean)),
                ]);
            } catch (error) {
                toast.error("Failed to load expense data");
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, []);

    useEffect(() => {
        const applyFilters = () => {
            const start = filters.startDate ? new Date(filters.startDate).getTime() : null;
            const end = filters.endDate ? new Date(filters.endDate).getTime() : null;

            return expenses.filter((expense) => {
                const expenseTime = new Date(expense.date).getTime();
                const matchStatus = filters.status ? expense.status === filters.status : true;
                const matchCategory = filters.category ? expense.category === filters.category : true;
                const matchStart = start ? expenseTime >= start : true;
                const matchEnd = end ? expenseTime <= end : true;
                return matchStatus && matchCategory && matchStart && matchEnd;
            });
        };

        const filtered = applyFilters();
        setFilteredExpenses(filtered);

        if (!filtered.length) {
            setCategoryData([]);
            setMonthlyData([]);
            setPieData([]);
            setCumulativeData([]);
            setDayOfWeekData([]);
            return;
        }

        const categoryMap = {};
        const monthMap = {};
        const dayMap = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

        filtered.forEach((expense) => {
            categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;

            const month = new Date(expense.date).toLocaleString("default", {
                month: "short",
                year: "numeric",
            });
            monthMap[month] = (monthMap[month] || 0) + expense.amount;

            const day = new Date(expense.date).toLocaleString("default", {
                weekday: "short",
            });
            dayMap[day] += expense.amount;
        });

        const categoriesArray = Object.entries(categoryMap).map(([category, total]) => ({ category, total }));
        const pieArray = Object.entries(categoryMap).map(([category, total], index) => ({
            name: category,
            value: total,
            fill: [
                "#0088FE",
                "#00C49F",
                "#FFBB28",
                "#FF8042",
                "#8884D8",
                "#82CA9D",
            ][index % 6],
        }));
        const monthArray = Object.entries(monthMap).map(([month, total]) => ({ month, total }));

        let runningTotal = 0;
        const cumulativeArray = Object.entries(monthMap).map(([month, total]) => {
            runningTotal += total;
            return { month, total: runningTotal };
        });

        const dayArray = Object.entries(dayMap).map(([day, total]) => ({ day, total }));

        setCategoryData(categoriesArray);
        setMonthlyData(monthArray);
        setPieData(pieArray);
        setCumulativeData(cumulativeArray);
        setDayOfWeekData(dayArray);
    }, [expenses, filters]);

    const resetFilters = () => {
        setFilters({ status: "approved", category: "", startDate: "", endDate: "" });
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f6f7fb", minHeight: "100vh" }}>
            <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 3 }}
            >
                Expense Insights
            </Typography>

            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Filter insights by status, category, and date range
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            label="Status"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            size="small"
                            fullWidth
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            label="Category"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            size="small"
                            fullWidth
                        >
                            <MenuItem value="">All</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Start date"
                            type="date"
                            size="small"
                            fullWidth
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="End date"
                            type="date"
                            size="small"
                            fullWidth
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12} sx={{ textAlign: { xs: "left", md: "right" } }}>
                        <Button variant="outlined" size="small" onClick={resetFilters}>
                            Reset filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {!filteredExpenses.length ? (
                <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary">
                        No expenses match the selected filters.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {/* Monthly Expense Trend */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, minHeight: 480 }}>
                            <Typography variant="h6" gutterBottom>
                                Monthly Expense Trend
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="month" tick={{ fill: theme.palette.text.primary }} />
                                    <YAxis tick={{ fill: theme.palette.text.primary }} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke={theme.palette.error.main}
                                        strokeWidth={4}
                                        dot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Total Expenses by Category */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, minHeight: 480 }}>
                            <Typography variant="h6" gutterBottom>
                                Total Expenses by Category
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={categoryData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="category" tick={{ fill: theme.palette.text.primary }} />
                                    <YAxis tick={{ fill: theme.palette.text.primary }} />
                                    <Tooltip />
                                    <Bar dataKey="total" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Expense Distribution */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, minHeight: 480 }}>
                            <Typography variant="h6" gutterBottom>
                                Expense Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Weekly Spending Pattern */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, minHeight: 480 }}>
                            <Typography variant="h6" gutterBottom>
                                Weekly Spending Pattern
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={dayOfWeekData} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="day" tick={{ fill: theme.palette.text.primary }} />
                                    <YAxis tick={{ fill: theme.palette.text.primary }} />
                                    <Tooltip />
                                    <Bar dataKey="total" fill={theme.palette.warning.main} radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Cumulative Monthly Expenses */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, minHeight: 480 }}>
                            <Typography variant="h6" gutterBottom>
                                Cumulative Monthly Expenses
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={cumulativeData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="month" tick={{ fill: theme.palette.text.primary }} />
                                    <YAxis tick={{ fill: theme.palette.text.primary }} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke={theme.palette.secondary.main}
                                        fill={theme.palette.secondary.main}
                                        fillOpacity={0.35}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default Insights;
