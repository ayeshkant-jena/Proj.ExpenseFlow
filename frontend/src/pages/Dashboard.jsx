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
        <Box className="p-6 bg-gray-100 min-h-screen">
            <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
                My Expenses
            </Typography>

            {error ? (
                <Alert severity="error">{error}</Alert>
            ) : expenses.length === 0 ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "80vh",
                    }}
                >
                    <Typography
                        variant="h6"
                        align="center"
                        sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >
                        No expenses found.
                    </Typography>
                </Box>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {expenses.map((expense) => (
                        <Card key={expense._id}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {expense.category}
                                </Typography>
                                <Typography>Amount: ₹{expense.amount}</Typography>
                                <Typography>
                                    Date: {new Date(expense.date).toLocaleDateString()}
                                </Typography>
                                <Typography sx={{ mt: 1 }}>
                                    <strong>Status:</strong>{" "}
                                    <span
                                        style={{
                                            color:
                                                expense.status === "approved"
                                                    ? "green"
                                                    : expense.status === "rejected"
                                                        ? "red"
                                                        : "#666",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {expense.status}
                                    </span>
                                </Typography>
                                {expense.status === "rejected" && expense.rejectionReason && (
                                    <Typography color="error" sx={{ mt: 1 }}>
                                        <strong>Rejection Reason:</strong> {expense.rejectionReason}
                                    </Typography>
                                )}
                                {expense.notes && (
                                    <Typography color="textSecondary" sx={{ mt: 1 }}>
                                        Note: {expense.notes}
                                    </Typography>
                                )}
                                {expense.receiptUrl && (
                                    <CardMedia
                                        component="img"
                                        image={expense.receiptUrl}
                                        alt="Expense receipt"
                                        sx={{ height: 140, objectFit: "contain", mt: 1, borderRadius: 1 }}
                                    />
                                )}
                            </CardContent>
                            {expense.status === "rejected" && (
                                <Box sx={{ p: 2, pt: 0 }}>
                                    <Button fullWidth variant="contained" onClick={() => handleEditClick(expense)}>
                                        Edit & Resubmit
                                    </Button>
                                </Box>
                            )}
                        </Card>
                    ))}
                </div>
            )}

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
                            Submit
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Dashboard;
