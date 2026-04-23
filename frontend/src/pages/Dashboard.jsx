import { useEffect, useState } from "react";
import { getMyExpenses, updateExpense } from "../api/expense";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Typography,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const categories = ["Travel", "Food", "Supplies", "Entertainment", "Other"];

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [expenseLoading, setExpenseLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [editForm, setEditForm] = useState({
        category: "",
        amount: "",
        date: "",
        notes: "",
    });
    const [receipt, setReceipt] = useState(null);

    const { user, loading } = useAuth();

    const fetchExpenses = async () => {
        setExpenseLoading(true);
        try {
            const res = await getMyExpenses();
            setExpenses(res.data);
            setError(null);
        } catch (err) {
            setError("Failed to load expenses");
            toast.error("Failed to load expenses");
        } finally {
            setExpenseLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchExpenses();
    }, [user]);

    const handleEditClick = (expense) => {
        setSelectedExpense(expense);
        setEditForm({
            category: expense.category || "",
            amount: expense.amount || "",
            date: expense.date ? new Date(expense.date).toISOString().split("T")[0] : "",
            notes: expense.notes || "",
        });
        setReceipt(null);
        setEditDialogOpen(true);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleReceiptChange = (e) => {
        const file = e.target.files?.[0] || null;
        setReceipt(file);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!editForm.category || !editForm.amount || !editForm.date) {
            toast.error("Please fill in category, amount, and date.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("category", editForm.category);
            formData.append("amount", editForm.amount);
            formData.append("date", editForm.date);
            formData.append("notes", editForm.notes);
            if (receipt) {
                formData.append("receipt", receipt);
            }

            await updateExpense(selectedExpense._id, formData);
            toast.success("Expense updated and resubmitted");
            setEditDialogOpen(false);
            setSelectedExpense(null);
            setReceipt(null);
            fetchExpenses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    const handleCloseEdit = () => {
        setEditDialogOpen(false);
        setSelectedExpense(null);
        setReceipt(null);
    };

    if (loading || expenseLoading) {
        return (
            <Box className="flex justify-center items-center min-h-screen">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-8">
            <Box className="max-w-7xl mx-auto">
                <Box className="text-center mb-8">
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.04em', mb: 2 }}>
                        My Expenses Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                        Track and manage all your submitted expenses in one place
                    </Typography>
                </Box>

                {error ? (
                    <Box className="flex justify-center">
                        <Alert severity="error" sx={{ maxWidth: 600, bgcolor: 'rgba(255,255,255,0.95)', color: 'text.primary' }}>{error}</Alert>
                    </Box>
                ) : expenses.length === 0 ? (
                    <Box className="flex justify-center items-center min-h-[60vh]">
                        <Box className="text-center">
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
                                No expenses found
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Start by submitting your first expense to see it here.
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {expenses.map((expense) => (
                            <Card key={expense._id} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                            {expense.category}
                                        </Typography>
                                        <Box sx={{
                                            px: 2, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700,
                                            bgcolor: expense.status === "approved" ? 'success.main' : expense.status === "rejected" ? 'error.main' : 'warning.main',
                                            color: 'white'
                                        }}>
                                            {expense.status}
                                        </Box>
                                    </Box>

                                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                                        ₹{expense.amount}
                                    </Typography>

                                    <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                                        {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </Typography>

                                    {expense.status === "rejected" && expense.rejectionReason && (
                                        <Typography sx={{ color: 'error.main', fontSize: '0.875rem', mb: 2, fontWeight: 600 }}>
                                            Reason: {expense.rejectionReason}
                                        </Typography>
                                    )}

                                    {expense.notes && (
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 2 }}>
                                            {expense.notes}
                                        </Typography>
                                    )}

                                    {expense.receiptUrl && (
                                        <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
                                            <img
                                                src={expense.receiptUrl}
                                                alt="Expense receipt"
                                                style={{ width: '100%', height: 120, objectFit: 'cover' }}
                                            />
                                        </Box>
                                    )}
                                </CardContent>

                                {expense.status === "rejected" && (
                                    <Box sx={{ p: 3, pt: 0 }}>
                                        <Button fullWidth variant="contained" onClick={() => handleEditClick(expense)} sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                                            Edit & Resubmit
                                        </Button>
                                    </Box>
                                )}
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
                <DialogTitle>Edit & Resubmit Expense</DialogTitle>
                <form onSubmit={handleEditSubmit}>
                    <DialogContent>
                        <Stack spacing={2}>
                            <TextField
                                select
                                label="Category"
                                name="category"
                                value={editForm.category}
                                onChange={handleEditChange}
                                fullWidth
                                required
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Amount (INR)"
                                type="number"
                                name="amount"
                                value={editForm.amount}
                                onChange={handleEditChange}
                                fullWidth
                                required
                                inputProps={{ min: 1 }}
                            />
                            <TextField
                                label="Date"
                                type="date"
                                name="date"
                                value={editForm.date}
                                onChange={handleEditChange}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Notes"
                                name="notes"
                                fullWidth
                                multiline
                                rows={3}
                                value={editForm.notes}
                                onChange={handleEditChange}
                            />
                            <Button variant="outlined" component="label" fullWidth>
                                {receipt ? `Receipt: ${receipt.name}` : "Upload Receipt Image"}
                                <input
                                    hidden
                                    accept="image/*"
                                    type="file"
                                    onChange={handleReceiptChange}
                                />
                            </Button>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEdit}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            Update
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Dashboard;
