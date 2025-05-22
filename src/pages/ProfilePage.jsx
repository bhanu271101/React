import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  useTheme
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [addressData, setAddressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    matchingPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const User = import.meta.env.VITE_USER;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [userRes, addressRes] = await Promise.all([
          axios.get(`${User}/user/getUser`, { headers, withCredentials: true }),
          axios.get(`${User}/getDefaultAddress`, { headers, withCredentials: true })
        ]);

        setUserData(userRes.data);
        setAddressData(addressRes.data);
        setPasswordForm(prev => ({ ...prev, email: userRes.data.email }));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [token, User]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError("");
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.matchingPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.matchingPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const response = await axios.post(
        `${User}/user/changePassword`,
        passwordForm
      );

      setPasswordSuccess(response.data || "Password changed successfully");
      setPasswordForm({
        ...passwordForm,
        oldPassword: "",
        newPassword: "",
        matchingPassword: ""
      });
      
      // Close dialog after 2 seconds and redirect to login
      setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/login");
      }, 2000);
    } catch (error) {
      setPasswordError(error.response?.data || "Password change failed. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" bgcolor={theme.palette.grey[100]}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.grey[100],
        py: 6,
        px: { xs: 2, sm: 4, md: 6 },
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ maxWidth: 600, width: "100%" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom align="center" color={theme.palette.primary.main}>
          My Profile
        </Typography>

        {/* User Info */}
        <Paper elevation={4} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" color={theme.palette.text.primary}>
            Email
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {userData?.email || "N/A"}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" gutterBottom fontWeight="bold" color={theme.palette.text.primary}>
            Password
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {"*".repeat(8)}
          </Typography>

          <Button 
            variant="outlined" 
            onClick={() => setOpenPasswordDialog(true)}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: 2,
              px: 3,
              py: 1,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            Change Password
          </Button>
        </Paper>

        {/* Default Address */}
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" color={theme.palette.text.primary}>
            Default Shipping Address
          </Typography>
          {addressData ? (
            <Box sx={{ mt: 1, lineHeight: 1.6 }}>
              <Typography variant="body1" fontWeight="bold">{addressData.userName}</Typography>
              <Typography variant="body1">
                {addressData.houseNumber}, {addressData.streetName}
              </Typography>
              <Typography variant="body1">
                {addressData.city}, {addressData.district}
              </Typography>
              <Typography variant="body1">
                {addressData.state} - {addressData.pincode}
              </Typography>
              <Typography variant="body1">
                Phone: {addressData.phoneNumber}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No default address found.
            </Typography>
          )}
        </Paper>

        {/* Password Change Dialog */}
        <Dialog 
          open={openPasswordDialog} 
          onClose={() => setOpenPasswordDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ fontWeight: "bold", color: theme.palette.primary.main }}>
            Change Password
          </DialogTitle>
          <DialogContent dividers>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {passwordSuccess}
              </Alert>
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Current Password"
              name="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              disabled={isChangingPassword}
              autoComplete="current-password"
            />

            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              disabled={isChangingPassword}
              autoComplete="new-password"
              helperText="At least 8 characters"
            />

            <TextField
              fullWidth
              margin="normal"
              label="Confirm New Password"
              name="matchingPassword"
              type="password"
              value={passwordForm.matchingPassword}
              onChange={handlePasswordChange}
              disabled={isChangingPassword}
              autoComplete="new-password"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => setOpenPasswordDialog(false)}
              disabled={isChangingPassword}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordSubmit}
              color="primary"
              disabled={isChangingPassword}
              variant="contained"
              sx={{ textTransform: "none", fontWeight: "bold" }}
            >
              {isChangingPassword ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Changing...
                </Box>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ProfilePage;
