import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExpense } from "../api/expense";
import {
    Box,
    TextField,
    Button,
    Typography,
    MenuItem,
    Paper,
} from "@mui/material";
import { toast } from "react-hot-toast";

const categories = ["Travel", "Food", "Supplies", "Entertainment", "Other"];

const ExpenseForm = () => {
    const [form, setForm] = useState({
        category: "",
        amount: "",
        date: "",
        notes: "",
    });
    const [receipt, setReceipt] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleReceiptChange = (e) => {
        const file = e.target.files?.[0] || null;
        setReceipt(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const amountValue = parseFloat(form.amount);
        if (isNaN(amountValue) || amountValue <= 0) {
            toast.error("Amount must be greater than zero");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("category", form.category);
            formData.append("amount", form.amount);
            formData.append("date", form.date);
            formData.append("notes", form.notes);
            if (receipt) {
                formData.append("receipt", receipt);
            }

            await createExpense(formData);
            toast.success("Expense submitted");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Submission failed");
        }
    };

    return (
        <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-8">
            <Box className="w-full max-w-6xl rounded-[32px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
                <Box className="grid grid-cols-1 lg:grid-cols-2">
                    <Box className="relative flex items-center justify-center bg-slate-900 px-8 py-12 text-white lg:px-14 lg:py-16">
                        <Box className="max-w-lg">
                            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.04em', mb: 3 }}>
                                Submit your expense
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)', mb: 5, lineHeight: 1.8 }}>
                                Record your business expenses quickly and easily. Upload receipts, categorize spending, and track everything in one place.
                            </Typography>

                            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '999px', bgcolor: 'info.main', mt: '0.35rem', mr: 3 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                                        Choose from predefined categories for easy organization
                                    </Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '999px', bgcolor: 'info.main', mt: '0.35rem', mr: 3 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                                        Attach digital receipts for complete documentation
                                    </Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '999px', bgcolor: 'info.main', mt: '0.35rem', mr: 3 }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                                        Get instant approval status and notifications
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mt: 8, p: 4, borderRadius: 3, bgcolor: 'rgba(15, 23, 42, 0.72)', border: '1px solid rgba(148,163,184,0.16)' }}>
                                <Typography variant="subtitle2" sx={{ color: 'info.main', mb: 1, fontWeight: 700 }}>
                                    Expense tracking made simple
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                                    Keep your finances organized with our streamlined expense submission process.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Paper elevation={6} className="p-8 md:p-10 bg-white/95" sx={{ backdropFilter: 'blur(12px)' }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, mb: 1.5 }}>
                            Add new expense
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                            Fill in the details below to submit your expense for approval.
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <Box display="flex" flexDirection="column" gap={3}>
                                <TextField
                                    select
                                    label="Category"
                                    name="category"
                                    fullWidth
                                    value={form.category}
                                    onChange={handleChange}
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
                                    fullWidth
                                    value={form.amount}
                                    onChange={handleChange}
                                    required
                                    slotProps={{ htmlInput: { min: 1 } }}
                                />

                                <TextField
                                    label="Date"
                                    type="date"
                                    name="date"
                                    fullWidth
                                    slotProps={{
                                        inputLabel: { shrink: true }
                                    }}
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                />

                                <TextField
                                    label="Notes"
                                    name="notes"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={form.notes}
                                    onChange={handleChange}
                                />

                                <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5 }}>
                                    {receipt ? `Receipt: ${receipt.name}` : "Upload Receipt Image"}
                                    <input
                                        hidden
                                        accept="image/*"
                                        type="file"
                                        onChange={handleReceiptChange}
                                    />
                                </Button>

                                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.6, fontWeight: 700, textTransform: 'capitalize' }}>
                                    Submit Expense
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default ExpenseForm;
