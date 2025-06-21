/** savedRouteSchema
 * savedRoutes: [
  {
    name: { type: String, required: true },
    distance: { type: Number, required: true },
    coordinates: { type: Array, required: true },
    startPoint: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat]
    },
    endPoint: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    createdAt: { type: Date, default: Date.now }
  }
]
geoJson returned from routeGenerator function
{
  "geojson": {
    "type": "LineString",
    "coordinates": [ [...many points...] ]
  },
  "distance": 5304
}
 */

/************************************UNIT TEST ************************************/
const { default: mongoose } = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server')
const User = require("../models/userModel");
const {addSavedRoute, fetchSavedRoutes, removeSavedRoute } = require('../controllers/routeController');
const { route } = require('../app');

/**********Mocked Data **********/
let mongoServer;

beforeAll(async () => {
  // spin up in-memory DB
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  //clear users after each test to isolate
  await mongoose.connection.db.collection('users').deleteMany({})
})

let user;

beforeEach(async () => {
  user = new User({
    email: 'abc@gmail.com',
    password: 'hashedPW',
    savedRoutes: []
  })
  await user.save();
})

//Add fn
describe('Add Route function with Mocked Data', () => {

  //Able to add a saved route and register on MongoDB
  it('should add a new saved route', async () => {
    const mockedData = {
      name: 'Run on ${now.toISOString()}',
      distance: 5000,
      coordinates: [1, 2],
      startPoint: {
        type: 'Point',
        coordinates: [2,3]
      },
      endPoint: {
        type: 'Point',
        coordinates: [3, 4]
      }
    }

    const newRoute = await addSavedRoute(user._id, mockedData);
    const updatedUser = await User.findById(user._id);

    expect(updatedUser.savedRoutes.length).toBe(1);
    expect(newRoute.name).toBe(mockedData.name);
    expect(updatedUser.savedRoutes[0].distance).toBe(mockedData.distance);
    expect(updatedUser.savedRoutes[0].startPoint.coordinates).toEqual([2,3]);
    expect(updatedUser.savedRoutes[0].endPoint.coordinates).toEqual([3,4]);
  })
  //Reject if MongoDB user already has 5 routes => warning to user
  it('should not add more than 5 saved routes', async () => {
    const mockedData = Array.from({ length: 5 }).map((_, i) => ({
    name: `Route ${i + 1}`,
    distance: 5000,
    coordinates: [1, 2],
    startPoint: { type: 'Point', coordinates: [2, 3] },
    endPoint: { type: 'Point', coordinates: [3, 4] }
  }));

  //save to mongoDB user
  user.savedRoutes = mockedData;
  await user.save();

  const extraRoute = {
    name: 'Extra Route',
    distance: 5000,
    coordinates: [3, 4],
    startPoint: { type: 'Point', coorinates: [4, 5]},
    endPoint: { type: 'Point', coorinates: [5, 6]}
  }

  let error;
  try {
    await addSavedRoute(user._id, extraRoute);
  } catch (err) {
    error = err;
  }

  expect(error).toBeDefined();
  expect(error.message).toBe('Limit of 5 saved routes for free plan');

  const updatedUser = await User.findById(user._id);
  expect(updatedUser.savedRoutes.length).toBe(5) //no added routes
  })
})

//Fetch route fn
describe('Fetch Route Fn with Mocked Data', () => {
  it('should fetch saved routes', async () => {
    const route1 = {
      name: 'Route1',
      distance: 1000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4]},
      endPoint: { type: 'Point', coordinates: [4, 5]}
    }

    const route2 = {
      name: 'Route2',
      distance: 2000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4]},
      endPoint: { type: 'Point', coordinates: [4, 5]}
    }

    await addSavedRoute(user._id, route1);
    await addSavedRoute(user._id, route2);

    const routes = await fetchSavedRoutes(user._id);

    expect(routes.length).toBe(2);
    expect(routes[0].name).toBe('Route1');
    expect(routes[1].name).toBe('Route2');
  })

})

//Delete route fn
describe('Delete Route Fn with Mocked Data', () => {
  //Able to delete route from database
  it('should delete route from database', async () => {
    const route3 = {
      name: 'Route3',
      distance: 3000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4]},
      endPoint: { type: 'Point', coordinates: [4, 5]}
    }


    await addSavedRoute(user._id, route3);

    await removeSavedRoute(user._id, route3.name);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.savedRoutes.length).toBe(0)
  })
  
  //Give warning if route is not in DB in the first place
  it('should handle removing a non-existing route gracefully', async () => {
    const nonExistentRoute = {
      name: 'NonExistentRoute',
      distance: 3000,
      coordinates: [1, 2],
      startPoint: { type: 'Point', coordinates: [3, 4]},
      endPoint: { type: 'Point', coordinates: [4, 5]}
    }

    let error;
    try{
      await removeSavedRoute(user._id, nonExistentRoute.name);
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined;
    expect(error.message).toBe('Route not found');
  })
})

/*********Actual Data ***********/

/************************************INTEGRATION TEST ************************************/
/**********Mocked Data **********/

// Ensure that /api/routes/save, /api/routes and /api/route/:routeId works => e2e w express

