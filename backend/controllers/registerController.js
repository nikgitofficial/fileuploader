const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
};

export const register = async (req, res) => {
  const { email, password } = req.body;

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (!@#$ etc)"
    });
  }

  // continue registration...
};
