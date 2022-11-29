import expressJwt from "express-jwt";
import Movie from "../models/movie";

// req.user
export const requireSignin = expressJwt({
  // secret, expiryDate
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

export const hotelOwner = async (req, res, next) => {
  let movie = await Movie.findById(req.params.movieId).exec();
  let owner = movie.postedBy._id.toString() === req.user._id.toString();
  if (!owner) {
    return res.status(403).send("Unauthorized");
  }
  next();
};