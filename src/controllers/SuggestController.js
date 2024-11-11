const Recommendation = require('ml-recommendation');
const recommendation = new Recommendation();

const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'movies.json')));

const processedData = data.map(user => {
  return {
    user: user.user,
    ratings: user.ratings.map(rating => ({
      movie: rating.movie,
      rating: rating.rating
    }))
  };
});

recommendation.train(processedData);

const userRatings = processedData.find(user => user.user === 'user1').ratings;
const recommendations = recommendation.predict(userRatings);

console.log(recommendations);