const getAllUsers = async (req, res) => {
  res.send('Getting all the users...')
}

const getSingleUser = async (req, res) => {
  res.send('Getting one user')
}

const showCurrentUser = async (req, res) => {
  res.send('This is the current user')
}

const updateUser = async (req, res) => {
  res.send("We're updating the user...")
}

const updateUserPassword = async (req, res) => {
  res.send('Updaing user password')
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
