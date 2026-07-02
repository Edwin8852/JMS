const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const authMiddleware = require('../../shared/middleware/auth.middleware');
const authorizeRoles = require('../../shared/middleware/role.middleware');

// All user management routes are protected by Super Admin
router.use(authMiddleware);
router.use(authorizeRoles('SUPER_ADMIN'));

router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUser);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
