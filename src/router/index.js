const { Router } = require('express');

const userRouter = require('../modules/user/user.routes');
const taskRouter = require('../modules/task/task.routes');

const router = Router();

router.use('/users', userRouter);

router.use('/tasks', taskRouter);

module.exports = router;
