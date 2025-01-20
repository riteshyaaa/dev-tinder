const express = require('express');
const router = express.Router();


router.get("/", (req, res) => {
  res.send("App is running on the dashboard.");
});
router.get("/hello", (req, res) => {
    res.send("Hello! App is running on the dashboard.");
  });
  
module.exports = router;
