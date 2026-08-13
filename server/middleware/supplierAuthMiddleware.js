const jwt = require('jsonwebtoken');
const Supplier = require('../models/Supplier');

const protectSupplier = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== 'supplier') {
        return res.status(401).json({ message: 'Not authorized as a supplier' });
      }

      req.supplier = await Supplier.findById(decoded.id).select('-passwordHash');
      next();
    } catch (err) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protectSupplier };