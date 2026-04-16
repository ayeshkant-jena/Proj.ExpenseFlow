import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      className="text-center"
      sx={{
        backgroundColor: "#1976D2",
        padding: "1rem",
        position: "relative",
        bottom: 0,
        width: "100%",
        mt: 4,
      }}
    >
      <Typography variant="body2" color="white">
        © {new Date().getFullYear()} ExpenseFlow · Built by Ayeshkant Jena
      </Typography>
    </Box>
  );
};

export default Footer;
