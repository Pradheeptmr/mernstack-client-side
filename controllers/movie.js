import Movie from "../models/movie";
import Order from "../models/order";
import fs from "fs";

export const create = async (req, res) => {
  //   console.log("req.fields", req.fields);
  //   console.log("req.files", req.files);
  try {
    let fields = req.fields;
    let files = req.files;

    let movie = new Movie(fields);
    movie.postedBy = req.user._id;
    // handle image
    if (files.image) {
      movie.image.data = fs.readFileSync(files.image.path);
      movie.image.contentType = files.image.type;
    }

    movie.save((err, result) => {
      if (err) {
        console.log("saving hotel err => ", err);
        res.status(400).send("Error saving");
      }
      res.json(result);
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err: err.message,
    });
  }
};

export const movies = async (req, res) => {
  // let all = await Movie.find({ from: { $gte: new Date() } })
  let all = await Movie.find({})
    .limit(24)
    .select("-image.data")
    .populate("postedBy", "_id name")
    .exec();
  // console.log(all);
  res.json(all);
};

export const image = async (req, res) => {
  let movie = await Movie.findById(req.params.movieId).exec();
  if (movie && movie.image && movie.image.data !== null) {
    res.set("Content-Type", movie.image.contentType);
    return res.send(movie.image.data);
  }
};

export const sellerMovie = async (req, res) => {
  let all = await Movie.find({ postedBy: req.user._id })
    .select("-image.data")
    .populate("postedBy", "_id name")
    .exec();
  // console.log(all);
  res.send(all);
};

export const remove = async (req, res) => {
  let removed = await Movie.findByIdAndDelete(req.params.movieId)
    .select("-image.data")
    .exec();
  res.json(removed);
};

export const read = async (req, res) => {
  let movie = await Movie.findById(req.params.movieId)
    .populate("postedBy", "_id name")
    .select("-image.data")
    .exec();
  // console.log("SINGLE Movie", movie);
  res.json(movie);
};

export const update = async (req, res) => {
  try {
    let fields = req.fields;
    let files = req.files;

    let data = { ...fields };

    if (files.image) {
      let image = {};
      image.data = fs.readFileSync(files.image.path);
      image.contentType = files.image.type;

      data.image = image;
    }

    let updated = await Movie.findByIdAndUpdate(req.params.movieId, data, {
      new: true,
    }).select("-image.data");

    res.json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).send("Movie update failed. Try again.");
  }
};

export const userMovieBookings = async (req, res) => {
  const all = await Order.find({ orderedBy: req.user._id })
    .select("session")
    .populate("movie", "-image.data")
    .populate("orderedBy", "_id name")
    .exec();
  res.json(all);
};

export const isAlreadyBooked = async (req, res) => {
  const { movieId } = req.params;
  // find orders of the currently logged in user
  const userOrders = await Order.find({ orderedBy: req.user._id })
    .select("movie")
    .exec();
  // check if hotel id is found in userOrders array
  let ids = [];
  for (let i = 0; i < userOrders.length; i++) {
    ids.push(userOrders[i].movie.toString());
  }
  res.json({
    ok: ids.includes(movieId),
  });
};

export const searchListings = async (req, res) => {
  const { location, date, seat } = req.body;
  // console.log(location, date, bed);
  // console.log(date);
  const fromDate = date.split(",");
  // console.log(fromDate[0]);
  let result = await Hotel.find({
    from: { $gte: new Date(fromDate[0]) },
    location,
  })
    .select("-image.data")
    .exec();
  // console.log("SEARCH LISTINGS", result);
  res.json(result);
};

