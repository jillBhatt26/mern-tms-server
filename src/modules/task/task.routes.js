const { Router } = require('express');

const authMiddleware = require('../../middleware/auth');

const {
    createTask,
    fetchTasksAll,
    fetchTasksCreatedByUser,
    fetchTasksAssignedToUser,
    assignTask,
    updateTask,
    deleteTask,
    updateTaskStatusLogs
} = require('./task.controllers');

const router = Router();

router.get('/', authMiddleware, fetchTasksAll);

router.post('/', authMiddleware, createTask);

router.put('/:id', authMiddleware, updateTask);

router.delete('/:id', authMiddleware, deleteTask);

router.put('/logs/:id', authMiddleware, updateTaskStatusLogs);

router.put('/assign/user/:id', authMiddleware, assignTask);

router.get('/assigned', authMiddleware, fetchTasksAssignedToUser);

router.get('/created', authMiddleware, fetchTasksCreatedByUser);

module.exports = router;
