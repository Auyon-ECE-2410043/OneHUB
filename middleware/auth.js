const jwt = require("jsonwebtoken");
const SystemSettings = require("../models/SystemSettings");

async function requireAuth(req, res, next) {
  let token = null;
  const header = req.headers.authorization;
  
  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token; // Fallback for file downloads via browser
  }

  if (!token) {
    return res.status(401).json({ error: "Missing or invalid Authorization token" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check maintenance mode
    const settings = await SystemSettings.findOne();
    if (settings && settings.maintenanceMode && req.user.role !== "admin") {
      return res.status(503).json({ 
        error: "System is under maintenance.", 
        maintenance: true 
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };