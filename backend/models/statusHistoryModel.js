import mongoose from 'mongoose';

const statusHistorySchema = mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Complaint',
    },
    status: {
      type: String,
      enum: ['New', 'In Progress', 'Pending Customer', 'Resolved', 'Closed', 'Reopened'],
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const StatusHistory = mongoose.model('StatusHistory', statusHistorySchema);

export default StatusHistory;
