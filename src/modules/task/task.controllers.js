const Task = require('./task.model');
const User = require('../user/user.model');

const createTask = async (req, res, next) => {
    if (!req.user) {
        return next({
            status: 401,
            message: 'Unauthorized request!'
        });
    }

    try {
        const { task_description, assignedTo } = req.body;

        if (!task_description || !task_description.length) {
            return next({
                status: 400,
                message: 'Task description required!'
            });
        }

        if (!assignedTo || !assignedTo.length) {
            return next({
                status: 400,
                message: 'Assigned to user is required'
            });
        }

        const { _id: assignedToID } = await User.findOne(
            { name: assignedTo },
            { _id: 1 }
        );

        const newTask = await Task.create({
            task_description,
            createdBy: req.user.userID,
            assignedTo: assignedToID,
            createdAT: Date.now(),
            statusLogs: [
                {
                    status: 'CREATED',
                    updatedAt: Date.now(),
                    updatedBy: req.user.userID
                }
            ]
        });

        return res.status(201).json({
            success: true,
            task: newTask
        });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to create task!'
        });
    }
};

const fetchTasksAll = async (req, res, next) => {
    if (!req.user) {
        return next({
            status: 401,
            message: 'Unauthorized request!'
        });
    }

    if (!req.user.role.trim().toUpperCase() === 'ADMIN') {
        return next({
            status: 403,
            message: 'Insufficient permissions!'
        });
    }

    try {
        const tasks = await Task.find({});

        const tasksWithUserDetails = await Promise.all(
            tasks.map(async task => {
                const creator = await User.findById(task.createdBy, {
                    _id: 0,
                    name: 1
                });

                const assignedTo = await User.findById(task.assignedTo, {
                    _id: 0,
                    name: 1
                });

                return {
                    ...task.toJSON(),
                    createdByName: creator.name,
                    assignedToName: assignedTo.name
                };
            })
        );

        return res
            .status(200)
            .json({ success: true, tasks: tasksWithUserDetails });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to fetch tasks!'
        });
    }
};

const fetchTasksCreatedByUser = async (req, res, next) => {
    if (!req.user) {
        return next({
            status: 401,
            message: 'Unauthorized request!'
        });
    }

    try {
        const tasks = await Task.find({ createdBy: req.user.userID });

        const tasksWithAssignedUserName = await Promise.all(
            tasks.map(async task => {
                try {
                    const user = await User.findById(task.assignedTo, {
                        _id: 0,
                        name: 1
                    });

                    return {
                        ...task.toJSON(),
                        assignedToName: user.name
                    };
                } catch (error) {
                    throw error;
                }
            })
        );

        return res.status(200).json({
            success: true,
            tasks: tasksWithAssignedUserName,
            user: req.user
        });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to fetch tasks!'
        });
    }
};

const fetchTasksAssignedToUser = async (req, res, next) => {
    if (!req.user) {
        return next({
            status: 401,
            message: 'Unauthorized request!'
        });
    }

    try {
        const tasks = await Task.find({ assignedTo: req.user.userID });

        const tasksWithCreatedByUserName = await Promise.all(
            tasks.map(async task => {
                try {
                    const user = await User.findById(task.createdBy, {
                        _id: 0,
                        name: 1
                    });

                    return {
                        ...task.toJSON(),
                        createdByName: user.name
                    };
                } catch (error) {
                    throw error;
                }
            })
        );

        return res.status(200).json({
            success: true,
            tasks: tasksWithCreatedByUserName,
            user: req.user
        });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to fetch tasks!'
        });
    }
};

const assignTask = async (req, res, next) => {
    if (!req.user) {
        return next({
            status: 401,
            message: 'Unauthorized request!'
        });
    }

    const { id: toAssignUserID } = req.params;

    if (!toAssignUserID || !toAssignUserID.length) {
        return next({
            status: 400,
            message: 'Assign to user is required'
        });
    }

    const { taskID } = req.body;

    if (!taskID || !taskID.length) {
        return next({
            status: 400,
            message: 'Task ID is required'
        });
    }

    const isCreator = await Task.findOne({
        _id: taskID,
        createdBy: req.user.userID
    });

    if (!isCreator || !req.user.role.trim().toUpperCase() === 'ADMIN') {
        return next({
            status: 403,
            message: 'Only creators or admin can assign tasks to others'
        });
    }

    const isAlreadyAssigned = await Task.findOne({
        _id: taskID,
        assignedTo: toAssignUserID
    });

    if (isAlreadyAssigned) {
        return next({
            status: 400,
            message: 'Task is already assigned to the user!'
        });
    }

    try {
        await Task.findByIdAndUpdate(taskID, {
            assignedTo: toAssignUserID
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to assign task!'
        });
    }
};

const updateTask = async (req, res, next) => {
    if (!req.user) {
        return next({
            status: 401,
            message: 'Unauthorized request!'
        });
    }

    const { id: taskID } = req.params;

    if (!taskID || !taskID.length) {
        return next({
            status: 400,
            message: 'Task ID is required'
        });
    }

    const isCreator = await Task.findOne({
        _id: taskID,
        createdBy: req.user.userID
    });

    if (!isCreator) {
        if (!req.user.role.trim().toUpperCase() === 'ADMIN') {
            return next({
                status: 403,
                message: 'Only creators or admin can update tasks'
            });
        }
    }

    const { updated_description, assignTo, toUpdateStatusLog } = req.body;

    if (updated_description && updated_description.length) {
        try {
            await Task.findByIdAndUpdate(taskID, {
                task_description: updated_description
            });
        } catch (error) {
            return next({
                status: 500,
                message: error.message || 'Failed to update task description!'
            });
        }
    }

    if (assignTo && assignTo.length) {
        // fetch user with the given assign to name
        const { _id: assignToUserID, role: assignToUserRole } =
            await User.findOne({ name: assignTo }, { _id: 1, role: 1 });

        if (!assignToUserID || !assignToUserRole) {
            return next({
                status: 404,
                message: 'No user found with given user details!'
            });
        }

        // check if it is self assignment
        if (req.user.userID === assignToUserID) {
            return next({
                status: 400,
                message: 'You cannot self assign the task!'
            });
        }

        // check if task is being assigned to admin
        if (assignToUserRole.trim().toUpperCase() === 'ADMIN') {
            return next({
                status: 400,
                message: 'You cannot assign the task to an admin!'
            });
        }

        // // check if task is already assigned
        // const isTaskAssigned = await Task.findOne({
        //     assignedTo: assignToUserID
        // });

        // if (isTaskAssigned) {
        //     return next({
        //         status: 400,
        //         message: 'Task is already assigned to the user'
        //     });
        // }

        try {
            await Task.findByIdAndUpdate(taskID, {
                assignTo: assignToUserID
            });
        } catch (error) {
            return next({
                status: 500,
                message: error.message || 'Failed to update task description!'
            });
        }
    }

    if (toUpdateStatusLog && toUpdateStatusLog.length) {
        // fetch the recent status log
        const { statusLogs } = await Task.findById(taskID, {
            _id: 0,
            statusLogs: 1
        });

        if (!statusLogs || !statusLogs.length) {
            return next({
                status: 404,
                message: 'No such task found!'
            });
        }

        const recentStatusLog = statusLogs.pop().status;

        if (recentStatusLog === 'CLOSED') {
            return next({
                status: 400,
                message: 'Closed tasks status logs cannot be updated!'
            });
        }

        const newStatusLog = toUpdateStatusLog.trim().toUpperCase();

        const VALID_LOGS = ['IN PROGRESS', 'CLOSED'];

        // if (newStatusLog !== 'IN PROGRESS' || newStatusLog !== 'CLOSED') {
        if (!VALID_LOGS.includes(newStatusLog)) {
            return next({
                status: 400,
                message: 'Invalid status log!'
            });
        }

        if (newStatusLog === 'IN PROGRESS' && recentStatusLog !== 'CREATED') {
            return next({
                status: 400,
                message: 'You cannot update task to this kind of status'
            });
        }

        if (newStatusLog === 'CLOSED' && recentStatusLog !== 'IN PROGRESS') {
            return next({
                status: 400,
                message: 'You cannot update task to this kind of status'
            });
        }

        try {
            await Task.findByIdAndUpdate(taskID, {
                $addToSet: {
                    statusLogs: {
                        status: newStatusLog,
                        updatedAt: Date.now(),
                        updatedBy: req.user.userID
                    }
                }
            });
        } catch (error) {
            return next({
                status: 500,
                message: error.message || 'Failed to update status log of task!'
            });
        }
    }

    try {
        let taskInfo = await Task.findById(taskID);

        const { name: createdByName } = await User.findById(
            taskInfo.createdBy,
            {
                _id: 0,
                name: 1
            }
        );

        const { name: assignedToName } = await User.findById(
            taskInfo.assignedTo,
            {
                _id: 0,
                name: 1
            }
        );

        const updatedTask = {
            ...taskInfo.toJSON(),
            createdByName,
            assignedToName
        };

        return res.status(200).json({ success: true, task: updatedTask });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to update task!'
        });
    }
};

const deleteTask = async (req, res, next) => {
    if (!req.user) {
        return next({
            status: 401,
            message: 'Unauthorized request!'
        });
    }

    const { id: taskID } = req.params;

    if (!taskID || !taskID.length) {
        return next({
            status: 400,
            message: 'Task ID is required'
        });
    }

    const isCreator = await Task.findOne({
        _id: taskID,
        createdBy: req.user.userID
    });

    if (!isCreator) {
        if (!req.user.role.trim().toUpperCase() === 'ADMIN') {
            return next({
                status: 403,
                message: 'Only creators or admin can delete tasks'
            });
        }
    }

    try {
        await Task.findByIdAndDelete(taskID);

        return res.status(200).json({ success: true });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to delete tasks!'
        });
    }
};

const updateTaskStatusLogs = async (req, res, next) => {
    if (!req.user) {
        return next({
            status: 401,
            message: 'Unauthorized request!'
        });
    }

    const { id: taskID } = req.params;

    if (!taskID || !taskID.length) {
        return next({
            status: 400,
            message: 'Task ID is required'
        });
    }

    const isCreator = await Task.findOne({
        _id: taskID,
        createdBy: req.user.userID
    });

    const isAssignee = await Task.findOne({
        _id: taskID,
        assignedTo: req.user.userID
    });

    if (
        !isCreator ||
        !isAssignee ||
        !req.user.role.trim().toUpperCase() === 'ADMIN'
    ) {
        return next({
            status: 403,
            message:
                'Only creators, assignee user or admin can update status logs of tasks'
        });
    }

    const { updated_status } = req.body;

    if (!updated_status || !updated_status.length) {
        return next({
            status: 400,
            message: 'Updated status is required'
        });
    }

    try {
        await Task.findByIdAndUpdate(taskID, {
            $addToSet: {
                statusLogs: {
                    status: updated_status,
                    updatedAt: Date.now(),
                    updatedBy: req.user.userID
                }
            }
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to update status log of task!'
        });
    }
};

module.exports = {
    createTask,
    fetchTasksAll,
    fetchTasksCreatedByUser,
    fetchTasksAssignedToUser,
    assignTask,
    updateTask,
    deleteTask,
    updateTaskStatusLogs
};
