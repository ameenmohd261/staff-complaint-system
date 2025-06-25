import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Complaint',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    comment: {
      type: String,
      required: true,
    },
    attachments: [
      {
        filename: String,
        originalFilename: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
