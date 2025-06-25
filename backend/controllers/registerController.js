

const isStrongPassword = (password) => {
  return password.length > 6 && /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

export const register = async (req, res) => {
  const { email, password } = req.body;

  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: "Password must be >6 chars and include special characters (!@#$ etc)" });
  }

  // continue registration...
};
