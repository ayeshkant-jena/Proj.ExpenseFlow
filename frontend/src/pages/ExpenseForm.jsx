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
        <Box className="flex justify-center items-center h-screen bg-gray-100">
            <Paper elevation={3} className="p-8 w-full max-w-md">
                <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
                    Add Expense
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Box display="flex" flexDirection="column" gap={2}>
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

                        <Button variant="outlined" component="label" fullWidth>
                            {receipt ? `Receipt: ${receipt.name}` : "Upload Receipt Image"}
                            <input
                                hidden
                                accept="image/*"
                                type="file"
                                onChange={handleReceiptChange}
                            />
                        </Button>

                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Submit
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default ExpenseForm;
