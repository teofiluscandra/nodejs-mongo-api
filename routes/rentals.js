const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const {Rental, validate} = require('../models/rental'); 
const {Movie} = require('../models/movie'); 
const {Customer} = require('../models/customer');

router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut'); //descending
  res.send(rentals);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Invalid customer.');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Invalid movie.');

  if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock.');

  let rental = new Rental({ 
    customer: {
      _id: customer._id,
      name: customer.name, 
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    rental = await rental.save();
    movie.numberInStock--;
    await movie.save();
    res.send(rental);
  } catch(err) {
    await session.abortTransaction();
    console.log(err);
    return res.status(500).send('Something error.');
  } finally {
    // ending the session
    session.endSession();
  }
});

router.get('/:id', async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send('The rental with the given ID was not found.');
  res.send(rental);
});

module.exports = router; 