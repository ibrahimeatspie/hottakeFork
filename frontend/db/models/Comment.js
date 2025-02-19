import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// the post should contain:
// Title (or post content)
// Timestamp
// agree and disagree
// identification (auto generated)

const CommentSchema = new Schema({
  date: { type: Date, required: true },
  content: { type: String, required: true },
  postID: { type: String, required: true },
  replies: [
    {
      date: Date,
      content: String,
    },
  ],
});

export default mongoose.models.Comment ||
  mongoose.model("Comment", CommentSchema);
