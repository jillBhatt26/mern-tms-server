const { Schema, model } = require('mongoose');

// schema definition
const TaskSchema = new Schema({
    task_description: {
        type: String,
        required: [true, 'Task description is required!']
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAT: {
        type: Date,
        required: true,
        default: Date.now()
    },
    statusLogs: [
        {
            status: {
                type: String,
                required: true
            },
            updatedAt: {
                type: Date,
                required: true,
                default: Date.now()
            },
            updatedBy: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        }
    ]
});

const Task = model('Task', TaskSchema);

module.exports = Task;
