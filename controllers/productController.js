const createProduct = async (req, res) => {
  res.send('Creating the product')
}

const getAllProducts = async (req, res) => {
  res.send('Gettting all products')
}

const getSingleProduct = async (req, res) => {
  res.send('Getting a single product')
}

const updateProduct = async (req, res) => {
  res.send('Updating product')
}

const deleteProduct = async (req, res) => {
  res.send('deleting product')
}

const uploadImage = async (req, res) => {
  res.send('Uploading image')
}

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
}
