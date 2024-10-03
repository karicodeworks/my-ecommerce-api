const register = async (req, res) => {
  res.send('This is register')
}

const login = async (req, res) => {
  res.send('This is login')
}

const logout = async (req, res) => {
  res.send('This is logout')
}

module.exports = {
  register,
  login,
  logout,
}
