const express = require('express');
const verifyTokenfromCookies = require('../Middleware/auth')
const {
  handleGetLogin,
  handleGetSignUp,
  handlePostLogin,
  handlePostSignUp,
  getUserDetails,
  // handleUpdateUser,
  logoutUser
} = require('../Controller/user');

const {
  resetPassword,
  verifyOtp,
  sendResetOtp
} = require('../Controller/passwordupdate');

const {
    handleAllTheInvoiceData, handleCreateInvoice, handleUpdateInvoice, handleDeleteInvoice
} = require('../Controller/invoice')

const router = express.Router();

// Authentication routes
router.get('/', verifyTokenfromCookies, handleGetLogin);
router.post('/', handlePostLogin);
router.get('/signup', handleGetSignUp);
router.post('/signup', handlePostSignUp);
router.get('/user', verifyTokenfromCookies, getUserDetails);
// router.patch('/user', verifyTokenfromCookies, handleUpdateUser);
router.get('/logout', logoutUser);

// Password Reset routes
router.post('/sendresetotp', sendResetOtp);
router.post('/verifyotp', verifyOtp);
router.post('/resetpassword', resetPassword);

// CRUD of Invoices

router.get('/invoice', handleAllTheInvoiceData);
router.post('/invoice', handleCreateInvoice);
router.put('/invoice/:id', handleUpdateInvoice);
router.delete('/invoice/:id', handleDeleteInvoice);

// 404 handler
router.use((req, res, next) => {
  res.status(404).json({
    status: false,
    message: "Page not found (404)"
  });
});

module.exports = router;