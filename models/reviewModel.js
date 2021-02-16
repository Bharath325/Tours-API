const mongoose = require('mongoose');
const Tour = require('./tourModel');

const ReviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty']
    },
    rating: {
      type: Number,
      max: 5,
      min: 1
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

ReviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});
// ReviewSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'user',
//     select: 'name photo'
//   }).populate({
//     path: 'tour',
//     select: 'name'
//   });
//   next();
// });

ReviewSchema.statics.calAvgRating = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};
ReviewSchema.post('save', function() {
  this.constructor.calAvgRating(this.tour);
});
ReviewSchema.pre(/^findOneAnd/, async function(next) {
  this.rating = await this.findOne();
  //console.log(this.rating);
  next();
});
ReviewSchema.post(/^findOneAnd/, async function() {
  await this.rating.constructor.calAvgRating(this.rating.tour);
});
const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
