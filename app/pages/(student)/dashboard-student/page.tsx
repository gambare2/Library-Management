import { Box, Typography } from "@mui/material";

export default function HomePage() {
  return (
    <Box>

      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h3" fontWeight={700} color="#1a237e">
          Welcome to the Study Center
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, color: "#424242" }}>
          Book seats, track attendance, manage subscriptions — all in one place.
        </Typography>
      </Box>
    </Box>
  );
}
