const express = require('express');
const router = express.Router();
const historiqueController = require('../controllers/historiqueController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, historiqueController.getAll);
router.get('/utilisateur/:id', authMiddleware, historiqueController.getByUser);

module.exports = router;
