const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const pool = require("../config/db");
const {
  createActivityLog,
  createSecurityAlert,
} = require("../utils/auditLogger");

const register = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      await createSecurityAlert(req, {
        alertType: "INVALID_REGISTER_INPUT",
        severity: "Medium",
        description: "Register request rejected because input validation failed.",
      });

      return res.status(400).json({
        status: "error",
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const {
      name,
      email,
      password,
      phone,
      role_id = 3,
    } = req.body;

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      await createSecurityAlert(req, {
        alertType: "REGISTER_DUPLICATE_EMAIL",
        severity: "Low",
        description: `Register attempt using existing email: ${email}`,
      });

      return res.status(409).json({
        status: "error",
        message: "Email already registered.",
      });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      `INSERT INTO users (role_id, name, email, password_hash, phone, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [role_id, name, email, passwordHash, phone || null]
    );

    const newUserId = result.insertId;

    if (parseInt(role_id, 10) === 3) {
      await pool.query(
        `INSERT INTO patient_profiles (user_id)
         VALUES (?)`,
        [newUserId]
      );
    }

    await createActivityLog(req, {
      userId: newUserId,
      activity: "REGISTER_SUCCESS",
      description: `New user registered with email: ${email}`,
      statusCode: 201,
    });

    return res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      data: {
        id: newUserId,
        name,
        email,
        role_id,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error during register.",
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      await createSecurityAlert(req, {
        alertType: "INVALID_LOGIN_INPUT",
        severity: "Medium",
        description: "Login request rejected because input validation failed.",
      });

      return res.status(400).json({
        status: "error",
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const [users] = await pool.query(
      `SELECT 
          users.id,
          users.name,
          users.email,
          users.password_hash,
          users.status,
          roles.role_name
       FROM users
       JOIN roles ON users.role_id = roles.id
       WHERE users.email = ?
       LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      await createSecurityAlert(req, {
        alertType: "LOGIN_FAILED",
        severity: "Medium",
        description: `Failed login attempt. Email not found: ${email}`,
      });

      return res.status(401).json({
        status: "error",
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    if (user.status !== "active") {
      await createSecurityAlert(req, {
        userId: user.id,
        alertType: "LOGIN_BLOCKED_ACCOUNT",
        severity: "High",
        description: `Login attempt from inactive or blocked account: ${email}`,
      });

      return res.status(403).json({
        status: "error",
        message: "Account is not active.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      await createSecurityAlert(req, {
        userId: user.id,
        alertType: "LOGIN_FAILED",
        severity: "Medium",
        description: `Failed login attempt with wrong password: ${email}`,
      });

      return res.status(401).json({
        status: "error",
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role_name: user.role_name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      }
    );

    await pool.query(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id]
    );

    await createActivityLog(req, {
      userId: user.id,
      activity: "LOGIN_SUCCESS",
      description: `User logged in successfully: ${email}`,
      statusCode: 200,
    });

    return res.json({
      status: "success",
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role_name: user.role_name,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error during login.",
    });
  }
};

const me = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT 
          users.id,
          users.name,
          users.email,
          users.phone,
          users.status,
          roles.role_name
       FROM users
       JOIN roles ON users.role_id = roles.id
       WHERE users.id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    return res.json({
      status: "success",
      message: "Authenticated user data retrieved successfully.",
      data: users[0],
    });
  } catch (error) {
    console.error("Me error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
};

module.exports = {
  register,
  login,
  me,
};