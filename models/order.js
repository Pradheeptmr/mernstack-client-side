import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    movie: {
      type: ObjectId,
      ref: "Movie",
    },
    session: {},
    orderedBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);