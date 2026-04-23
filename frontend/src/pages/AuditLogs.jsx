import { useEffect, useState } from "react";
import { fetchAuditLogs } from "../api/audit";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Divider,
} from "@mui/material";
import { toast } from "react-hot-toast";

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetchAuditLogs();
                setLogs(res.data.logs || []);
            } catch (err) {
                toast.error("Failed to load audit logs");
                setLogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <Box className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-8">
            <Box className="max-w-5xl mx-auto">
                <Box className="text-center mb-8">
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', letterSpacing: '-0.04em', mb: 2 }}>
                        Audit Logs
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                        Complete history of all system activities and changes
                    </Typography>
                </Box>

                {loading ? (
                    <Box className="flex justify-center items-center min-h-[60vh]">
                        <CircularProgress sx={{ color: 'white' }} />
                    </Box>
                ) : logs.length === 0 ? (
                    <Box className="flex justify-center items-center min-h-[60vh]">
                        <Box className="text-center">
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
                                No logs available
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Activity logs will appear here once actions are performed.
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box className="space-y-4">
                        {logs.map((log) => (
                            <Card key={log._id} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                            {log.action}
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                            {new Date(log.createdAt).toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ mb: 3 }} />

                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                                                {log.userRole === "admin" ? "Admin" : "User"} Details
                                            </Typography>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                                Name: {log.user?.name || "N/A"}
                                            </Typography>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                                Email: {log.user?.email || "N/A"}
                                            </Typography>
                                        </Box>

                                        {log.target && (
                                            <Box>
                                                <Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                                                    Target Details
                                                </Typography>
                                                <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                                    Name: {log.target?.name || "N/A"}
                                                </Typography>
                                                <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                                    Email: {log.target?.email || "N/A"}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    {log.details && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                                                Details
                                            </Typography>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                                                {log.details}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default AuditLogs;
